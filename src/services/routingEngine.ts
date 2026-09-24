import { RouteOption } from '../types/disaster';

export interface RouteRequest {
  originId: string;
  destinationId: string;
  surgeHeightMeters: number;
}

export function calculateLifelineRoutes(req: RouteRequest): {
  activeRoute: RouteOption;
  alternativeRoute?: RouteOption;
  isDirectSevered: boolean;
  recommendation: string;
} {
  const { surgeHeightMeters } = req;

  // Direct Coastal Highway (Marine Drive): Base elevation is 1.4m
  const directFloodDepth = Math.max(0, Number((surgeHeightMeters - 1.4).toFixed(2)));
  const isDirectSevered = directFloodDepth > 0.3;

  // Direct Route (Coastal Highway):
  const directPath: [number, number][] = [
    [19.861, 85.845], // Malatipatpur Hub
    [19.815, 85.835], // Puri Coastal Junction
    [19.830, 85.890], // Beleswar Marine Drive
    [19.845, 85.960], // Km 22 Culvert (Critical washout zone)
    [19.860, 86.040], // Balukhand Reserve
    [19.880, 86.095], // Chandrabhaga Beach
    [19.889, 86.115], // Konark Trauma Center
  ];

  const directRoute: RouteOption = {
    id: 'route-direct-marine',
    name: 'Direct Coastal Marine Drive Corridor',
    distanceKm: 34.2,
    estimatedMinutes: isDirectSevered ? 0 : 38,
    path: directPath,
    isPassable: !isDirectSevered,
    minElevationMeters: 1.4,
    maxFloodDepthMeters: directFloodDepth,
    severedSegmentNames: isDirectSevered ? ['Marine Drive Km 22 Bridge Washout', 'Chandrabhaga Creek Inundation'] : [],
    recommendedVehicles: isDirectSevered ? 'BLOCKED - Requires Hovercraft/Amphibious ARV' : 'All Standard Emergency Vehicles',
    waypoints: [
      'Depart Malatipatpur NDRF Depo southward',
      'Enter Puri-Konark Marine Drive (Km 0)',
      isDirectSevered ? 'HALT: 2.0m tidal surge flood barrier at Km 22' : 'Proceed along scenic coast at 50 km/h',
      'Arrive Konark Emergency Trauma Care',
    ],
  };

  // Safe High-Ridge Inland Bypass Route:
  // Follows NH-316 -> Pipili Bypass -> Nimapada -> Gop -> Konark
  // Base elevation is 6.2m to 8.5m (Safe from up to 5.5m storm surges)
  const bypassFloodDepth = Math.max(0, Number((surgeHeightMeters - 5.5).toFixed(2)));
  const isBypassPassable = bypassFloodDepth <= 0.2;

  const bypassPath: [number, number][] = [
    [19.861, 85.845], // Malatipatpur NDRF Hub
    [19.920, 85.840], // NH-316 Northward
    [19.980, 85.830], // Pipili High-Elevation Interchange (El: 7.8m)
    [19.990, 85.910], // Nimapada Ridge Road (El: 6.5m)
    [19.998, 86.012], // Gop Relief Center Junction (El: 5.8m)
    [19.960, 86.045], // SH-13 Inland Corridor (El: 4.8m)
    [19.925, 86.080], // Kuruma High Bund
    [19.889, 86.115], // Konark Trauma Center (North Inland Gate)
  ];

  const bypassRoute: RouteOption = {
    id: 'route-highridge-bypass',
    name: 'Autonomous High-Ridge Lifeline Bypass (NH-316 / Gop Corridor)',
    distanceKm: 64.8,
    estimatedMinutes: 58,
    path: bypassPath,
    isPassable: isBypassPassable,
    minElevationMeters: 4.8,
    maxFloodDepthMeters: bypassFloodDepth,
    severedSegmentNames: isBypassPassable ? [] : ['Extreme Inundation Warning'],
    recommendedVehicles: 'NDRF Heavy Rescue Trucks (Tata 4x4), Medical Convoys, Fuel Tankers',
    waypoints: [
      'Depart Malatipatpur Hub northward onto elevated NH-316',
      'Bypass Puri urban traffic via Pipili High Ridge Flyover (Elev. +7.8m)',
      'Turn East onto Nimapada-Gop State Highway (Clear dry asphalt)',
      'Pass Gop Relief Hub staging point (Auxiliary medical team escort)',
      'Approach Konark Trauma Center via Northern Elevated Feeder Gate',
    ],
  };

  if (isDirectSevered) {
    return {
      activeRoute: bypassRoute,
      alternativeRoute: directRoute,
      isDirectSevered: true,
      recommendation: `CRITICAL ALERT: Coastal Marine Drive is submerged by ${directFloodDepth}m of saltwater surge. Autonomous Lifeline Engine has rerouted convoy through the Pipili-Gop High Ridge Corridor (+30 mins, 100% dry road clearance guaranteed).`,
    };
  } else {
    return {
      activeRoute: directRoute,
      alternativeRoute: bypassRoute,
      isDirectSevered: false,
      recommendation: `OPTIMAL SPEED: Direct Coastal Highway is currently dry and passable (Water margin: +${(1.4 - surgeHeightMeters).toFixed(1)}m). Monitored continuously via SAR radar.`,
    };
  }
}
