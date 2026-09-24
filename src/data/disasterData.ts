import { 
  InfrastructureNode, 
  RoadSegment, 
  TelemetryData, 
  DamageAssessment, 
  DroneFeedItem,
  PowerGridLine,
  SOSBeacon,
  SatelliteComparisonScenario
} from '../types/disaster';

export const INITIAL_TELEMETRY: TelemetryData = {
  cycloneName: 'AMRIT',
  category: 'Cat 4',
  windSpeedKmh: 195,
  centralPressureHpa: 942,
  surgeHeightMeters: 3.4,
  landfallETA: 'T+02:45 hrs',
  movementVector: 'NNW at 16 km/h',
  affectedPopulation: 1850000,
  goldenHourRemaining: '69h 15m',
};

// Cyclone Eye and Path Coordinates (Approaching landfall from Bay of Bengal)
export const CYCLONE_TRACK: { lat: number; lng: number; time: string; intensity: string }[] = [
  { lat: 18.95, lng: 86.85, time: 'T-06:00 (Past)', intensity: '175 km/h' },
  { lat: 19.35, lng: 86.45, time: 'T-03:00 (Past)', intensity: '185 km/h' },
  { lat: 19.68, lng: 86.12, time: 'LIVE EYE (T-00:00)', intensity: '195 km/h' },
  { lat: 19.98, lng: 85.88, time: 'Landfall Predicted (T+02:45)', intensity: '190 km/h' },
  { lat: 20.32, lng: 85.70, time: 'Inland Dissipation (T+08:00)', intensity: '135 km/h' },
];

export const INITIAL_INFRASTRUCTURE: InfrastructureNode[] = [
  {
    id: 'hosp-1',
    name: 'Puri District Headquarter Hospital',
    type: 'hospital',
    coordinates: [19.815, 85.828],
    elevationMeters: 3.8,
    capacity: 450,
    occupancy: 390,
    generatorFuelHours: 18,
    backupPowerStatus: 'Active - Fuel at 72%',
    status: 'warning',
    statusDetails: 'Perimeter flood barrier active; Basement ICU vulnerable if surge > 3.6m',
    waterDepthMeters: 0,
    contactChannel: 'VHF-14 / SatPhone #082',
  },
  {
    id: 'hosp-2',
    name: 'Konark Emergency Trauma Care',
    type: 'hospital',
    coordinates: [19.889, 86.115],
    elevationMeters: 2.1,
    capacity: 120,
    occupancy: 115,
    generatorFuelHours: 6,
    backupPowerStatus: 'CRITICAL - Water entering generator room',
    status: 'critical',
    statusDetails: 'Surge inundation reaching ground floor; immediate fuel escort required',
    waterDepthMeters: 1.3,
    contactChannel: 'VHF-09 / Ham Radio #VU2XYZ',
  },
  {
    id: 'sub-1',
    name: 'Samang 220kV Grid Substation',
    type: 'substation',
    coordinates: [19.838, 85.854],
    elevationMeters: 4.2,
    status: 'operational',
    statusDetails: 'Grid transformers dry. Supplying power to Puri hospital feeder',
    waterDepthMeters: 0,
    contactChannel: 'OPTCL Supervisory SCADA',
  },
  {
    id: 'sub-2',
    name: 'Chandrabhaga 132kV Coastal Substation',
    type: 'substation',
    coordinates: [19.865, 86.102],
    elevationMeters: 1.8,
    status: 'submerged',
    statusDetails: 'EMERGENCY SHUTDOWN: 1.6m saltwater ingress in switchyard. 45,000 households blacked out',
    waterDepthMeters: 1.6,
    contactChannel: 'OFFLINE - SCADA link severed',
  },
  {
    id: 'shelter-1',
    name: 'Astaranga Multipurpose Cyclone Shelter #12',
    type: 'shelter',
    coordinates: [19.982, 86.265],
    elevationMeters: 6.5,
    capacity: 1500,
    occupancy: 1420,
    status: 'operational',
    statusDetails: 'High ground secure; Food supplies sufficient for 48 hours; medical team on site',
    waterDepthMeters: 0,
    contactChannel: 'ODRRAF SatLink 04',
  },
  {
    id: 'shelter-2',
    name: 'Gop Flood & Relief Center #04',
    type: 'shelter',
    coordinates: [19.998, 86.012],
    elevationMeters: 5.1,
    capacity: 900,
    occupancy: 840,
    status: 'operational',
    statusDetails: 'Operating normally. 4 pregnant women require evacuation transport to District Hospital',
    waterDepthMeters: 0,
    contactChannel: 'VHF-12 District Control',
  },
  {
    id: 'hub-1',
    name: 'Malatipatpur NDRF Tactical Hub & Heli-Pad',
    type: 'relief_hub',
    coordinates: [19.861, 85.845],
    elevationMeters: 8.5,
    capacity: 2500,
    occupancy: 600,
    status: 'operational',
    statusDetails: 'Base Operational: 6 NDRF rubber boats, 12 high-clearance rescue trucks, 4 Mi-17 heli slots ready',
    waterDepthMeters: 0,
    contactChannel: 'NDRF 03 Bn Tactical Comms',
  },
];

export const ROAD_SEGMENTS: RoadSegment[] = [
  {
    id: 'road-marine-drive',
    name: 'Puri-Konark Marine Drive Coastal Corridor',
    baseElevationMeters: 1.4,
    lengthKm: 34.2,
    isSevered: true,
    waterDepthMeters: 2.0,
    speedLimitKmh: 0,
    coordinates: [
      [19.815, 85.835],
      [19.830, 85.890],
      [19.845, 85.960],
      [19.860, 86.040],
      [19.880, 86.095],
      [19.889, 86.115],
    ],
  },
  {
    id: 'road-nh-316',
    name: 'NH-316 National Highway Arterial (Puri - Pipili)',
    baseElevationMeters: 6.2,
    lengthKm: 38.5,
    isSevered: false,
    waterDepthMeters: 0,
    speedLimitKmh: 50,
    coordinates: [
      [19.815, 85.828],
      [19.861, 85.845],
      [19.920, 85.840],
      [19.980, 85.830],
      [20.080, 85.820],
    ],
  },
  {
    id: 'road-gop-konark',
    name: 'SH-13 Gop to Konark Inland Relief Road',
    baseElevationMeters: 4.2,
    lengthKm: 19.8,
    isSevered: false,
    waterDepthMeters: 0,
    speedLimitKmh: 40,
    coordinates: [
      [19.998, 86.012],
      [19.960, 86.045],
      [19.925, 86.080],
      [19.889, 86.115],
    ],
  },
  {
    id: 'road-pipili-gop',
    name: 'Pipili - Nimapada - Gop High Ridge Bypass',
    baseElevationMeters: 7.8,
    lengthKm: 26.4,
    isSevered: false,
    waterDepthMeters: 0,
    speedLimitKmh: 55,
    coordinates: [
      [19.980, 85.830],
      [19.990, 85.910],
      [19.998, 86.012],
    ],
  },
];

export const POWER_GRID_LINES: PowerGridLine[] = [
  {
    id: 'grid-line-1',
    name: '220kV Samang-Puri DHH Feeder',
    voltageKv: 220,
    fromNodeId: 'sub-1',
    toNodeId: 'hosp-1',
    isEnergized: true,
    currentLoadMw: 14.2,
    maxCapacityMw: 40.0,
    path: [
      [19.838, 85.854],
      [19.825, 85.840],
      [19.815, 85.828],
    ],
  },
  {
    id: 'grid-line-2',
    name: '132kV Samang-Chandrabhaga Intertie',
    voltageKv: 132,
    fromNodeId: 'sub-1',
    toNodeId: 'sub-2',
    isEnergized: false,
    currentLoadMw: 0,
    maxCapacityMw: 60.0,
    failureReason: 'Cascading Trip: Chandrabhaga 132kV switchyard submerged under 1.6m surge.',
    path: [
      [19.838, 85.854],
      [19.845, 85.930],
      [19.855, 86.020],
      [19.865, 86.102],
    ],
  },
  {
    id: 'grid-line-3',
    name: '33kV Chandrabhaga-Konark Trauma Center Feeder',
    voltageKv: 33,
    fromNodeId: 'sub-2',
    toNodeId: 'hosp-2',
    isEnergized: false,
    currentLoadMw: 0,
    maxCapacityMw: 12.0,
    failureReason: 'Upstream Substation Submerged; Hospital forced into Emergency Island Generator mode.',
    path: [
      [19.865, 86.102],
      [19.878, 86.110],
      [19.889, 86.115],
    ],
  },
  {
    id: 'grid-line-4',
    name: '33kV Gop-Astaranga Shelter Feeder',
    voltageKv: 33,
    fromNodeId: 'shelter-2',
    toNodeId: 'shelter-1',
    isEnergized: true,
    currentLoadMw: 2.8,
    maxCapacityMw: 10.0,
    path: [
      [19.998, 86.012],
      [19.990, 86.130],
      [19.982, 86.265],
    ],
  },
];

export const SOS_BEACONS: SOSBeacon[] = [
  {
    id: 'sos-01',
    senderName: 'Ramesh Pradhan & Group',
    locationName: 'Beladala Fishing Hamlet (Km 18 Marine Drive)',
    coordinates: [19.835, 85.912],
    timestamp: '8 mins ago (LoRa Mesh Beacon)',
    personsCount: 7,
    waterDepthMeters: 2.2,
    situation: 'Marooned on concrete roof. 2 children with hypothermia. Ground level completely washed out.',
    urgency: 'CRITICAL_IMMEDIATE',
    isResolved: false,
  },
  {
    id: 'sos-02',
    senderName: 'Dr. Anita Das (Konark Clinic)',
    locationName: 'Konark Old Town Lowlands',
    coordinates: [19.882, 86.118],
    timestamp: '19 mins ago (Satellite SOS)',
    personsCount: 14,
    waterDepthMeters: 1.5,
    situation: 'Elderly patients require dry insulin storage & saline IV kits. Battery power exhausted.',
    urgency: 'CRITICAL_IMMEDIATE',
    isResolved: false,
  },
  {
    id: 'sos-03',
    senderName: 'Sub-Inspector Mohanty',
    locationName: 'Ramchandi River Delta Bridgehead',
    coordinates: [19.855, 86.025],
    timestamp: '32 mins ago (Civil Defense VHF)',
    personsCount: 5,
    waterDepthMeters: 1.8,
    situation: 'Police jeep stranded on approach embankment. All passengers safe on high bridge abutment.',
    urgency: 'HIGH_PRIORITY',
    isResolved: false,
  },
];

export const SATELLITE_SCENARIOS: SatelliteComparisonScenario[] = [
  {
    id: 'sat-scen-1',
    title: 'Chandrabhaga Coastal Corridor & Marine Drive',
    location: 'Bay of Bengal Coast (Puri - Konark Sector)',
    preImageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    postImageUrl: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=1200&q=80',
    preDate: 'Sentinel-2 Optical (T-7 Days Pre-Cyclone)',
    postDate: 'Sentinel-1 SAR Radar (T-2 Hours Post-Landfall)',
    inundatedSqKm: 68.4,
    severedStructuresCount: 14,
    description: 'Direct comparison shows full breach of coastal sandbars, flooding of 132kV switchyard, and complete severance of 34km coastal highway.',
  },
  {
    id: 'sat-scen-2',
    title: 'Devi River Estuary & Astaranga Lowlands',
    location: 'Astaranga Delta & Mangrove Belt',
    preImageUrl: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80',
    postImageUrl: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=1200&q=80',
    preDate: 'Landsat-9 Optical (T-10 Days Pre-Event)',
    postDate: 'Sentinel-1 C-Band SAR (Live Radar Inundation)',
    inundatedSqKm: 92.1,
    severedStructuresCount: 22,
    description: 'Saline water surge penetrating 4.5km inland along the river meander. Agriculture paddy fields transformed into high-reflectance standing water.',
  },
];

export const SAMPLE_DAMAGE_ASSESSMENTS: DamageAssessment[] = [
  {
    id: 'dmg-01',
    title: 'Submerged 132kV Chandrabhaga Substation Switchyard',
    locationName: 'Chandrabhaga Coast (19.865° N, 86.102° E)',
    coordinates: [19.865, 86.102],
    imageUrl: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80',
    timestamp: '10 mins ago (Drone Sentinel Alpha-4)',
    damageGrade: 'P1 - Catastrophic',
    floodDepthEst: '1.6m saltwater submergence',
    structuralFailurePct: 82,
    casualtyRisk: 'Extremely High',
    observations: [
      'Two 40MVA power transformers submerged above oil level indicator.',
      'High risk of catastrophic dielectric explosion if re-energized without flush.',
      'Debris and uprooted casuarina trees trapped against high-voltage switchgear gantries.',
    ],
    recommendedAction: 'Immediate lock-out/tag-out; deploy amphibious generator sets to Konark Hospital via inland route.',
    requiredUnits: ['NDRF Electrical Squad', 'De-watering High-Volume Pumps (x4)', 'Amphibious ARV'],
  },
  {
    id: 'dmg-02',
    title: 'Severed Culvert & Bridge Washout on Marine Drive',
    locationName: 'Marine Drive Km 22 (19.845° N, 85.960° E)',
    coordinates: [19.845, 85.960],
    imageUrl: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=800&q=80',
    timestamp: '25 mins ago (Sentinel-1 SAR Radar Match)',
    damageGrade: 'P1 - Catastrophic',
    floodDepthEst: '2.4m tidal surge breach',
    structuralFailurePct: 95,
    casualtyRisk: 'Extremely High',
    observations: [
      '40-meter bridge span sheared off by tidal storm surge and floating fishing trawler impact.',
      'Lifeline highway completely severed; 3 civil vehicles marooned on isolated asphalt spit.',
      'Current flow velocity estimated at 3.8 m/s, making rubber boat crossing dangerous without safety cables.',
    ],
    recommendedAction: 'Mark corridor as HARD-SEVERED on defense network. Redirect all relief convoys via Pipili-Nimapada-Gop High Ridge.',
    requiredUnits: ['Indian Army Bailey Bridge Unit', 'Coast Guard Chetak Air-Drop', 'Heavy Winch Crane'],
  },
  {
    id: 'dmg-03',
    title: 'Konark Emergency Trauma Care - Perimeter Water Ingress',
    locationName: 'Konark Urban Center (19.889° N, 86.115° E)',
    coordinates: [19.889, 86.115],
    imageUrl: 'https://images.unsplash.com/photo-1584824486509-112e4181ff6b?auto=format&fit=crop&w=800&q=80',
    timestamp: '40 mins ago (Ground Medical VHF)',
    damageGrade: 'P2 - Moderate',
    floodDepthEst: '1.2m at ground level',
    structuralFailurePct: 45,
    casualtyRisk: 'Extremely High',
    observations: [
      'Basement oxygen storage tank valve manifold at risk of saltwater corrosion and pressure freeze.',
      'Emergency diesel generator submerged; facility running on 6 hours remaining secondary battery bank.',
      '115 in-patients including 8 neonatal incubators trapped on upper floors.',
    ],
    recommendedAction: 'Immediate dispatch of 250kVA truck-mounted generator via Gop corridor + 2,000L diesel fuel delivery.',
    requiredUnits: ['NDRF Medical Triage Unit', 'High-Clearance Fuel Tanker', 'Portable Oxygen Concentrators (x15)'],
  },
  {
    id: 'dmg-04',
    title: 'Astaranga Mangrove Embankment Breach & Village Inundation',
    locationName: 'Astaranga Estuary (19.982° N, 86.265° E)',
    coordinates: [19.982, 86.265],
    imageUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80',
    timestamp: '1 hr ago (Air Force Recon)',
    damageGrade: 'P2 - Moderate',
    floodDepthEst: '1.8m saline water spread',
    structuralFailurePct: 60,
    casualtyRisk: 'Moderate',
    observations: [
      'Earthen saline embankment breached at 3 locations along Devi River mouth.',
      'Cyclone Shelter #12 remains isolated on high mound with 1,420 evacuees safely housed.',
      'Access roads flooded, requiring Gemini-assisted drone payload airdrops for baby food and chlorine tablets.',
    ],
    recommendedAction: 'Establish drone supply corridor from Malatipatpur Hub; schedule morning low-tide geotechnical geo-bag plugging.',
    requiredUnits: ['Logistics Heavy Lift Drone (x3)', 'Water Purification Units', 'Emergency Rations (2,000 packets)'],
  },
];

export const ACTIVE_DRONES: DroneFeedItem[] = [
  {
    id: 'drone-alpha-1',
    name: 'Falcon-SAR 01',
    area: 'Marine Drive Coastal Sector',
    batteryPct: 78,
    altitudeM: 120,
    previewUrl: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=400&q=80',
    status: 'Surveillance Active',
  },
  {
    id: 'drone-alpha-2',
    name: 'Sentinel-Gemini 04',
    area: 'Konark Grid & Trauma Center',
    batteryPct: 92,
    altitudeM: 85,
    previewUrl: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?auto=format&fit=crop&w=400&q=80',
    status: 'Surveillance Active',
  },
  {
    id: 'drone-alpha-3',
    name: 'SkyLifter Payload-02',
    area: 'Astaranga Estuary Relief Drop',
    batteryPct: 41,
    altitudeM: 60,
    previewUrl: 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=400&q=80',
    status: 'Returning to Base',
  },
];

export interface RainfallPathway {
  id: string;
  name: string;
  riverSystem: string;
  coordinates: [number, number][];
  flowRateCusecs: number;
  precipitationMm: number;
  flowDirection: string;
  riskLevel: 'Extreme' | 'High' | 'Moderate';
}

export interface CompoundFloodHotspot {
  id: string;
  name: string;
  coordinates: [number, number];
  type: 'Tidal Lock Estuary' | 'Culvert Bottleneck' | 'Embankment Overtopping';
  surgeBackflowM: number;
  pluvialAccumulationM: number;
  compoundDepthM: number;
  maroonedVillages: number;
  tacticalAction: string;
}

export const RAINFALL_PATHWAYS: RainfallPathway[] = [
  {
    id: 'rf-path-1',
    name: 'Kushabhadra River Pluvial Pathway',
    riverSystem: 'Mahanadi Delta - Kushabhadra Branch',
    flowRateCusecs: 42000,
    precipitationMm: 280,
    flowDirection: 'North-West to South-East towards Ramachandi Mouth',
    riskLevel: 'Extreme',
    coordinates: [
      [20.08, 85.92],
      [20.04, 85.96],
      [19.99, 86.01],
      [19.94, 86.04],
      [19.89, 86.05],
      [19.865, 86.062],
    ],
  },
  {
    id: 'rf-path-2',
    name: 'Bhargavi River Drainage Corridor',
    riverSystem: 'Bhargavi Coastal Drainage System',
    flowRateCusecs: 34000,
    precipitationMm: 260,
    flowDirection: 'North-West towards Balukhand & Mangala River',
    riskLevel: 'High',
    coordinates: [
      [20.10, 85.83],
      [20.02, 85.84],
      [19.94, 85.85],
      [19.88, 85.86],
      [19.832, 85.864],
    ],
  },
  {
    id: 'rf-path-3',
    name: 'Kadua Estuary Runoff Creek',
    riverSystem: 'Kadua Inter-Tidal Stream',
    flowRateCusecs: 16000,
    precipitationMm: 240,
    flowDirection: 'Inland Runoff towards Astaranga Coast',
    riskLevel: 'High',
    coordinates: [
      [20.04, 86.15],
      [20.01, 86.20],
      [19.98, 86.24],
      [19.96, 86.27],
    ],
  },
];

export const COMPOUND_FLOOD_HOTSPOTS: CompoundFloodHotspot[] = [
  {
    id: 'cp-1',
    name: 'Ramachandi Tidal Lock Estuary',
    coordinates: [19.865, 86.062],
    type: 'Tidal Lock Estuary',
    surgeBackflowM: 3.4,
    pluvialAccumulationM: 1.8,
    compoundDepthM: 2.8,
    maroonedVillages: 14,
    tacticalAction: 'Severe compound blockage: 3.4m storm surge prevents 42,000 cusecs Kushabhadra outflow. Pre-position 12 Inflatable Rescue Boats (IRBs).',
  },
  {
    id: 'cp-2',
    name: 'Gop Culvert Bridge Bottleneck (Km 18.2)',
    coordinates: [19.988, 86.014],
    type: 'Culvert Bottleneck',
    surgeBackflowM: 1.2,
    pluvialAccumulationM: 1.9,
    compoundDepthM: 1.6,
    maroonedVillages: 6,
    tacticalAction: 'Culvert capacity exceeded by 240%. Geotextile sandbagging underway to prevent arterial road washout.',
  },
  {
    id: 'cp-3',
    name: 'Balukhand Creek Saline Ingress Point',
    coordinates: [19.832, 85.864],
    type: 'Embankment Overtopping',
    surgeBackflowM: 2.9,
    pluvialAccumulationM: 1.1,
    compoundDepthM: 2.2,
    maroonedVillages: 9,
    tacticalAction: 'Seawater backflowing into agricultural freshwater canals; close sluice gate #04 immediately.',
  },
];
