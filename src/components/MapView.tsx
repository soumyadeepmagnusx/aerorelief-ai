import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { InfrastructureNode, RoadSegment, RouteOption, PowerGridLine, SOSBeacon } from '../types/disaster';
import { CYCLONE_TRACK, POWER_GRID_LINES, SOS_BEACONS, RAINFALL_PATHWAYS, COMPOUND_FLOOD_HOTSPOTS } from '../data/disasterData';
import { WindVortexCanvas } from './WindVortexCanvas';
import { Layers, Compass, ZoomIn, ZoomOut, Wind, Zap, Radio, Droplets, AlertOctagon } from 'lucide-react';

interface MapViewProps {
  infrastructure: InfrastructureNode[];
  roads: RoadSegment[];
  surgeHeight: number;
  activeRoute: RouteOption | null;
  selectedDestination: InfrastructureNode | null;
  onSelectNode: (node: InfrastructureNode) => void;
  onNavigateToNode: (node: InfrastructureNode) => void;
  cycloneEyeCoordinates?: [number, number];
}

export const MapView: React.FC<MapViewProps> = ({
  infrastructure,
  roads,
  surgeHeight,
  activeRoute,
  selectedDestination,
  onSelectNode,
  onNavigateToNode,
  cycloneEyeCoordinates,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layersRef = useRef<{
    tileLayer: L.TileLayer | null;
    inundationLayer: L.LayerGroup | null;
    cycloneLayer: L.LayerGroup | null;
    roadsLayer: L.LayerGroup | null;
    gridLayer: L.LayerGroup | null;
    sosLayer: L.LayerGroup | null;
    infraLayer: L.LayerGroup | null;
    routeLayer: L.LayerGroup | null;
    rainfallLayer: L.LayerGroup | null;
  }>({
    tileLayer: null,
    inundationLayer: null,
    cycloneLayer: null,
    roadsLayer: null,
    gridLayer: null,
    sosLayer: null,
    infraLayer: null,
    routeLayer: null,
    rainfallLayer: null,
  });

  const [mapMode, setMapMode] = useState<'satellite' | 'tactical-dark'>('satellite');
  const [sarRadarOverlay, setSarRadarOverlay] = useState<boolean>(true);
  const [showWindVortex, setShowWindVortex] = useState<boolean>(true);
  const [showGridLines, setShowGridLines] = useState<boolean>(true);
  const [showSOSBeacons, setShowSOSBeacons] = useState<boolean>(true);
  const [showRainfallPathways, setShowRainfallPathways] = useState<boolean>(true);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [19.865, 86.02],
      zoom: 11,
      zoomControl: false,
      attributionControl: false,
    });

    const inundationGroup = L.layerGroup().addTo(map);
    const roadsGroup = L.layerGroup().addTo(map);
    const gridGroup = L.layerGroup().addTo(map);
    const sosGroup = L.layerGroup().addTo(map);
    const cycloneGroup = L.layerGroup().addTo(map);
    const routeGroup = L.layerGroup().addTo(map);
    const infraGroup = L.layerGroup().addTo(map);
    const rainfallGroup = L.layerGroup().addTo(map);

    layersRef.current.inundationLayer = inundationGroup;
    layersRef.current.roadsLayer = roadsGroup;
    layersRef.current.gridLayer = gridGroup;
    layersRef.current.sosLayer = sosGroup;
    layersRef.current.cycloneLayer = cycloneGroup;
    layersRef.current.routeLayer = routeGroup;
    layersRef.current.infraLayer = infraGroup;
    layersRef.current.rainfallLayer = rainfallGroup;

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Base Tile Layer
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (layersRef.current.tileLayer) {
      map.removeLayer(layersRef.current.tileLayer);
    }

    let url = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    let maxZoom = 18;

    if (mapMode === 'tactical-dark') {
      url = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
      maxZoom = 19;
    }

    const newTileLayer = L.tileLayer(url, {
      maxZoom,
      subdomains: 'abcd',
    }).addTo(map);

    layersRef.current.tileLayer = newTileLayer;
  }, [mapMode]);

  // Render Cyclone Path, Eye, and Wind Field
  useEffect(() => {
    const group = layersRef.current.cycloneLayer;
    if (!group) return;
    group.clearLayers();

    const trackPoints: L.LatLngExpression[] = CYCLONE_TRACK.map((p) => [p.lat, p.lng]);
    L.polyline(trackPoints, {
      color: '#f43f5e',
      weight: 3,
      dashArray: '6, 8',
      opacity: 0.8,
    }).addTo(group);

    const conePolygon: [number, number][] = [
      [18.90, 86.70],
      [19.20, 86.20],
      [19.68, 85.80],
      [20.10, 85.50],
      [20.40, 85.90],
      [19.90, 86.40],
      [19.40, 86.80],
    ];
    L.polygon(conePolygon, {
      color: '#fb7185',
      fillColor: '#f43f5e',
      fillOpacity: 0.12,
      weight: 1,
      dashArray: '4, 4',
    }).addTo(group);

    const liveEye = cycloneEyeCoordinates 
      ? { lat: cycloneEyeCoordinates[0], lng: cycloneEyeCoordinates[1] }
      : CYCLONE_TRACK[2];

    const eyeIcon = L.divIcon({
      className: 'cyclone-eye-icon',
      html: `
        <div class="relative flex items-center justify-center w-12 h-12">
          <div class="absolute inset-0 rounded-full border-2 border-red-500 animate-ping opacity-75"></div>
          <div class="absolute inset-2 rounded-full border border-amber-400 animate-spin"></div>
          <div class="w-8 h-8 rounded-full bg-red-600/90 flex items-center justify-center text-white text-[10px] font-black shadow-lg shadow-red-600/50">
            🌀 EYE
          </div>
        </div>
      `,
      iconSize: [48, 48],
      iconAnchor: [24, 24],
    });

    const eyeMarker = L.marker([liveEye.lat, liveEye.lng], { icon: eyeIcon }).addTo(group);
    eyeMarker.bindPopup(`
      <div class="p-2 font-mono text-xs text-slate-100">
        <div class="font-bold text-red-400 text-sm mb-1">CYCLONE AMRIT - EYE POSITION</div>
        <div>Coordinates: ${liveEye.lat.toFixed(2)}°N, ${liveEye.lng.toFixed(2)}°E</div>
        <div>Offshore Status: ${liveEye.lat > 19.80 ? 'Inland / Coastal Crossing' : 'Approaching from Sea'}</div>
        <div class="mt-1 text-[10px] text-amber-300">Gale Radius: 45 km Core</div>
      </div>
    `);

    L.circle([liveEye.lat, liveEye.lng], {
      radius: 45000,
      color: '#f97316',
      fillColor: '#f97316',
      fillOpacity: 0.08,
      weight: 1.5,
    }).addTo(group);
  }, [cycloneEyeCoordinates]);

  // Render Dynamic Inundation based on surgeHeight
  useEffect(() => {
    const group = layersRef.current.inundationLayer;
    if (!group) return;
    group.clearLayers();

    if (surgeHeight <= 0.2) return;

    const surgeFactor = surgeHeight / 5.0;
    const inlandOffset = surgeFactor * 0.045;

    const coastalInundationPoly: [number, number][] = [
      [19.78, 85.78],
      [19.80 + inlandOffset * 0.5, 85.82 + inlandOffset * 0.2],
      [19.82 + inlandOffset * 0.9, 85.88 + inlandOffset * 0.3],
      [19.84 + inlandOffset * 1.2, 85.96 + inlandOffset * 0.4],
      [19.86 + inlandOffset * 1.4, 86.04 + inlandOffset * 0.5],
      [19.88 + inlandOffset * 1.6, 86.12 + inlandOffset * 0.6],
      [19.92 + inlandOffset * 1.8, 86.20 + inlandOffset * 0.7],
      [19.98 + inlandOffset * 2.2, 86.28 + inlandOffset * 0.8],
      [20.02, 86.35],
      [19.95, 86.36],
      [19.86, 86.15],
      [19.80, 85.90],
      [19.76, 85.80],
    ];

    const opacity = Math.min(0.65, 0.2 + surgeFactor * 0.45);
    const floodColor = surgeHeight > 3.0 ? '#0284c7' : '#06b6d4';

    L.polygon(coastalInundationPoly, {
      color: '#38bdf8',
      fillColor: floodColor,
      fillOpacity: opacity,
      weight: 1.5,
      dashArray: sarRadarOverlay ? '3, 5' : undefined,
    }).addTo(group);
  }, [surgeHeight, sarRadarOverlay]);

  // Render Roads
  useEffect(() => {
    const group = layersRef.current.roadsLayer;
    if (!group) return;
    group.clearLayers();

    roads.forEach((road) => {
      const floodDepth = Math.max(0, surgeHeight - road.baseElevationMeters);
      const isSevered = floodDepth > 0.3;

      if (isSevered) {
        L.polyline(road.coordinates, {
          color: '#ef4444',
          weight: 6,
          opacity: 0.9,
          dashArray: '8, 8',
        }).addTo(group);

        const midIdx = Math.floor(road.coordinates.length / 2);
        const midPoint = road.coordinates[midIdx];

        const hazardIcon = L.divIcon({
          className: 'hazard-icon',
          html: `
            <div class="flex items-center justify-center w-6 h-6 rounded-full bg-red-600 text-white font-bold text-[10px] border border-white shadow-lg animate-pulse">
              ⛔
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        const marker = L.marker(midPoint, { icon: hazardIcon }).addTo(group);
        marker.bindPopup(`
          <div class="p-2 font-mono text-xs text-slate-100">
            <div class="font-bold text-red-400">${road.name}</div>
            <div class="text-red-300 font-bold mt-1">STATUS: SEVERED / SUBMERGED</div>
            <div>Water Depth: ${floodDepth.toFixed(1)}m</div>
            <div>Base Elevation: ${road.baseElevationMeters}m</div>
          </div>
        `);
      } else {
        L.polyline(road.coordinates, {
          color: '#10b981',
          weight: 4,
          opacity: 0.7,
        }).addTo(group);
      }
    });
  }, [roads, surgeHeight]);

  // Render Power Grid Lines Overlay
  useEffect(() => {
    const group = layersRef.current.gridLayer;
    if (!group) return;
    group.clearLayers();

    if (!showGridLines) return;

    POWER_GRID_LINES.forEach((line) => {
      const isTripped = !line.isEnergized || (line.id === 'grid-line-2' && surgeHeight > 2.0);

      L.polyline(line.path, {
        color: isTripped ? '#ef4444' : '#fbbf24',
        weight: 3,
        opacity: 0.85,
        dashArray: isTripped ? '4, 6' : undefined,
      }).addTo(group);
    });
  }, [showGridLines, surgeHeight]);

  // Render Citizen SOS Beacons Overlay
  useEffect(() => {
    const group = layersRef.current.sosLayer;
    if (!group) return;
    group.clearLayers();

    if (!showSOSBeacons) return;

    SOS_BEACONS.forEach((sos) => {
      const sosIcon = L.divIcon({
        className: 'sos-marker',
        html: `
          <div class="relative flex items-center justify-center cursor-pointer">
            <div class="absolute -inset-1 rounded-full bg-rose-500 animate-ping opacity-75"></div>
            <div class="w-7 h-7 rounded-full bg-red-600 text-white flex items-center justify-center text-[10px] font-black border border-white shadow-xl">
              SOS
            </div>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker(sos.coordinates, { icon: sosIcon }).addTo(group);
      marker.bindPopup(`
        <div class="p-2 font-mono text-xs text-slate-100 min-w-[200px]">
          <div class="font-bold text-red-400 text-sm mb-1">${sos.senderName}</div>
          <div class="text-slate-300 text-[11px] mb-1">${sos.locationName}</div>
          <div class="bg-red-950/60 p-1.5 rounded border border-red-800 text-[10px] text-red-200 mb-1.5">
            ${sos.situation}
          </div>
          <div class="text-[10px] text-amber-300 font-bold">Trapped: ${sos.personsCount} citizens • Water: +${sos.waterDepthMeters}m</div>
        </div>
      `);
    });
  }, [showSOSBeacons]);

  // Render Pluvial Rainfall Pathways & Compound Flood Vectors
  useEffect(() => {
    const group = layersRef.current.rainfallLayer;
    if (!group) return;
    group.clearLayers();

    if (!showRainfallPathways) return;

    // Render Riverine Flow Vectors
    RAINFALL_PATHWAYS.forEach((pathway) => {
      // Glow back-line
      L.polyline(pathway.coordinates, {
        color: '#0284c7',
        weight: 9,
        opacity: 0.45,
      }).addTo(group);

      // Foreground dashed flow line
      const flowLine = L.polyline(pathway.coordinates, {
        color: '#38bdf8',
        weight: 4,
        opacity: 0.9,
        dashArray: '8, 10',
      }).addTo(group);

      flowLine.bindPopup(`
        <div class="p-2 font-mono text-xs text-slate-100 min-w-[210px]">
          <div class="flex items-center gap-1.5 border-b border-cyan-700/50 pb-1 mb-1">
            <span class="text-cyan-400 font-bold text-sm">🌊 ${pathway.name}</span>
          </div>
          <div class="space-y-1 text-[11px] text-slate-300">
            <div>River System: <strong class="text-slate-100">${pathway.riverSystem}</strong></div>
            <div>Upstream Pluvial Rainfall: <strong class="text-cyan-300">${pathway.precipitationMm} mm</strong></div>
            <div>Runoff Discharge: <strong class="text-blue-300">${pathway.flowRateCusecs.toLocaleString()} cusecs</strong></div>
            <div>Flow Vector: <span class="text-slate-400 text-[10px]">${pathway.flowDirection}</span></div>
          </div>
          <div class="mt-2 p-1.5 rounded bg-blue-950/70 border border-blue-600/40 text-[10px] text-blue-200">
            <strong>Compound Hazard:</strong> High pluvial runoff converging directly toward coastal tidal lock.
          </div>
        </div>
      `);
    });

    // Render Compound Flood Choke Points
    COMPOUND_FLOOD_HOTSPOTS.forEach((choke) => {
      const chokeIcon = L.divIcon({
        className: 'choke-marker',
        html: `
          <div class="relative flex items-center justify-center cursor-pointer">
            <div class="absolute -inset-1.5 rounded-full bg-blue-500 animate-ping opacity-60"></div>
            <div class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-800 text-white flex items-center justify-center text-xs font-black border-2 border-cyan-300 shadow-2xl">
              🌊
            </div>
            <div class="absolute -bottom-1 -right-1 bg-amber-500 text-slate-950 font-black text-[8px] px-1 rounded-full border border-slate-950">
              LOCK
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker(choke.coordinates, { icon: chokeIcon }).addTo(group);
      marker.bindPopup(`
        <div class="p-2.5 font-mono text-xs text-slate-100 min-w-[230px]">
          <div class="flex items-center justify-between border-b border-blue-700/60 pb-1 mb-1.5">
            <span class="font-bold text-cyan-300 text-sm">${choke.name}</span>
            <span class="px-1.5 py-0.5 rounded text-[8px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase">
              ${choke.type}
            </span>
          </div>

          <div class="space-y-1 text-[11px] text-slate-300 bg-slate-950/80 p-2 rounded-lg border border-white/[0.06]">
            <div class="flex justify-between">
              <span class="text-slate-400">Storm Surge Ingress:</span>
              <span class="font-bold text-rose-400">+${choke.surgeBackflowM}m</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Pluvial Rain Ponding:</span>
              <span class="font-bold text-cyan-300">+${choke.pluvialAccumulationM}m</span>
            </div>
            <div class="flex justify-between border-t border-white/[0.06] pt-1">
              <span class="text-slate-300 font-bold">Compound Flood Depth:</span>
              <span class="font-black text-amber-300">+${choke.compoundDepthM}m</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Marooned Settlements:</span>
              <span class="font-bold text-red-400">${choke.maroonedVillages} Villages</span>
            </div>
          </div>

          <div class="mt-2 p-1.5 rounded bg-blue-950/80 border border-blue-500/40 text-[10px] text-blue-200 leading-relaxed">
            ${choke.tacticalAction}
          </div>
        </div>
      `);
    });
  }, [showRainfallPathways, surgeHeight]);

  // Render Infrastructure Nodes
  useEffect(() => {
    const group = layersRef.current.infraLayer;
    if (!group) return;
    group.clearLayers();

    infrastructure.forEach((node) => {
      const floodDepth = Math.max(0, surgeHeight - node.elevationMeters);
      const isSubmerged = floodDepth > 0.2;
      const isWarning = floodDepth > 0 && !isSubmerged;

      let badgeColor = 'bg-emerald-600';
      let iconSymbol = '🏢';

      if (node.type === 'hospital') {
        iconSymbol = '🏥';
        badgeColor = isSubmerged ? 'bg-red-600 animate-ping' : isWarning ? 'bg-amber-600' : 'bg-rose-600';
      } else if (node.type === 'substation') {
        iconSymbol = '⚡';
        badgeColor = isSubmerged ? 'bg-red-800' : 'bg-amber-500';
      } else if (node.type === 'shelter') {
        iconSymbol = '🛡️';
        badgeColor = 'bg-teal-600';
      } else if (node.type === 'relief_hub') {
        iconSymbol = '🚁';
        badgeColor = 'bg-blue-600';
      }

      const isSelected = selectedDestination?.id === node.id;

      const iconHtml = `
        <div class="relative flex items-center justify-center cursor-pointer group">
          ${isSelected ? '<div class="absolute -inset-2 rounded-full border-2 border-cyan-400 animate-spin"></div>' : ''}
          <div class="w-8 h-8 rounded-full ${badgeColor} text-white flex items-center justify-center text-xs font-bold shadow-lg border-2 ${
            isSelected ? 'border-cyan-300 scale-110' : 'border-slate-900'
          } transition-transform">
            ${iconSymbol}
          </div>
          ${isSubmerged ? '<div class="absolute -bottom-1 -right-1 bg-red-600 text-[8px] font-black px-1 rounded text-white uppercase">FLOOD</div>' : ''}
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'infra-icon',
        html: iconHtml,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker(node.coordinates, { icon: customIcon }).addTo(group);

      marker.on('click', () => {
        onSelectNode(node);
      });

      marker.bindPopup(`
        <div class="p-2 font-mono text-xs text-slate-100 min-w-[200px]">
          <div class="flex items-center justify-between border-b border-slate-700 pb-1 mb-1">
            <span class="font-bold text-slate-100 text-sm">${node.name}</span>
            <span class="px-1.5 py-0.5 rounded text-[9px] uppercase font-bold ${
              isSubmerged ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-300'
            }">${isSubmerged ? 'SUBMERGED' : node.status}</span>
          </div>

          <div class="space-y-0.5 text-[11px] text-slate-300">
            <div>Elevation: <span class="font-bold text-cyan-300">${node.elevationMeters}m</span></div>
            <div>Water Depth: <span class="font-bold ${floodDepth > 0 ? 'text-red-400' : 'text-emerald-400'}">${floodDepth.toFixed(1)}m</span></div>
            ${node.capacity ? `<div>Capacity: ${node.occupancy}/${node.capacity} occupants</div>` : ''}
            ${node.generatorFuelHours ? `<div>Backup Fuel: <span class="font-bold text-amber-300">${node.generatorFuelHours} hrs remaining</span></div>` : ''}
          </div>

          <div class="mt-2 text-[10px] text-slate-400 italic">${node.statusDetails}</div>
        </div>
      `);
    });
  }, [infrastructure, surgeHeight, selectedDestination, onSelectNode]);

  // Render Active Route
  useEffect(() => {
    const group = layersRef.current.routeLayer;
    if (!group) return;
    group.clearLayers();

    if (!activeRoute) return;

    L.polyline(activeRoute.path, {
      color: activeRoute.isPassable ? '#06b6d4' : '#ef4444',
      weight: 8,
      opacity: 0.5,
    }).addTo(group);

    L.polyline(activeRoute.path, {
      color: activeRoute.isPassable ? '#ffffff' : '#f87171',
      weight: 3,
      opacity: 0.9,
    }).addTo(group);

    const startPt = activeRoute.path[0];
    const endPt = activeRoute.path[activeRoute.path.length - 1];

    const startIcon = L.divIcon({
      className: 'start-marker',
      html: '<div class="w-6 h-6 rounded-full bg-cyan-500 border-2 border-white flex items-center justify-center text-slate-950 font-black text-[10px]">A</div>',
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });
    L.marker(startPt, { icon: startIcon }).addTo(group);

    const endIcon = L.divIcon({
      className: 'end-marker',
      html: '<div class="w-6 h-6 rounded-full bg-rose-500 border-2 border-white flex items-center justify-center text-white font-black text-[10px]">B</div>',
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });
    L.marker(endPt, { icon: endIcon }).addTo(group);
  }, [activeRoute]);

  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();
  const handleResetView = () => mapInstanceRef.current?.setView([19.865, 86.02], 11);

  return (
    <div className="relative w-full h-full min-h-[500px] rounded-xl overflow-hidden border border-slate-800 shadow-2xl">
      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Cyclonic Wind Streamlines Particle Overlay */}
      <WindVortexCanvas
        windSpeedKmh={195}
        isActive={showWindVortex}
        onToggle={() => setShowWindVortex(!showWindVortex)}
      />

      {/* Floating Tactical Overlay Controls (Top Right) */}
      <div className="absolute top-3 right-3 z-30 flex flex-col space-y-2">
        {/* Layer Mode Switcher */}
        <div className="bg-slate-900/90 backdrop-blur border border-slate-800 rounded-lg p-1 shadow-xl flex flex-col space-y-1">
          <button
            onClick={() => setMapMode(mapMode === 'satellite' ? 'tactical-dark' : 'satellite')}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono rounded bg-slate-800/80 hover:bg-slate-700 text-slate-200 transition"
          >
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>{mapMode === 'satellite' ? 'Satellite View' : 'Tactical Dark'}</span>
          </button>

          <button
            onClick={() => setShowWindVortex(!showWindVortex)}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono rounded transition ${
              showWindVortex
                ? 'bg-purple-600/30 border border-purple-500/50 text-purple-300'
                : 'bg-slate-800/80 text-slate-400 hover:bg-slate-700'
            }`}
          >
            <Wind className="w-3.5 h-3.5" />
            <span>Wind Streamlines</span>
          </button>

          <button
            onClick={() => setShowGridLines(!showGridLines)}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono rounded transition ${
              showGridLines
                ? 'bg-amber-600/30 border border-amber-500/50 text-amber-300'
                : 'bg-slate-800/80 text-slate-400 hover:bg-slate-700'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Power Grid SCADA</span>
          </button>

          <button
            onClick={() => setShowSOSBeacons(!showSOSBeacons)}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono rounded transition ${
              showSOSBeacons
                ? 'bg-rose-600/30 border border-rose-500/50 text-rose-300'
                : 'bg-slate-800/80 text-slate-400 hover:bg-slate-700'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Citizen SOS Beacons</span>
          </button>

          <button
            onClick={() => setShowRainfallPathways(!showRainfallPathways)}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono rounded transition ${
              showRainfallPathways
                ? 'bg-blue-600/30 border border-blue-500/50 text-blue-300'
                : 'bg-slate-800/80 text-slate-400 hover:bg-slate-700'
            }`}
          >
            <Droplets className="w-3.5 h-3.5" />
            <span>Pluvial Runoff Pathways</span>
          </button>
        </div>

        {/* Zoom & Compass Controls */}
        <div className="bg-slate-900/90 backdrop-blur border border-slate-800 rounded-lg p-1 shadow-xl flex flex-col space-y-1">
          <button onClick={handleZoomIn} className="p-1.5 rounded hover:bg-slate-800 text-slate-300 transition">
            <ZoomIn className="w-4 h-4" />
          </button>
          <button onClick={handleZoomOut} className="p-1.5 rounded hover:bg-slate-800 text-slate-300 transition">
            <ZoomOut className="w-4 h-4" />
          </button>
          <button onClick={handleResetView} className="p-1.5 rounded hover:bg-slate-800 text-cyan-400 transition">
            <Compass className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Floating Map Legend (Bottom Left) */}
      <div className="absolute bottom-3 left-3 z-30 bg-slate-950/90 backdrop-blur border border-slate-800/90 rounded-lg p-2.5 shadow-2xl text-[11px] font-mono text-slate-300 max-w-xs pointer-events-auto">
        <div className="font-bold text-slate-100 mb-1.5 flex items-center justify-between border-b border-slate-800 pb-1">
          <span>GEOTWIN 3D OVERLAYS</span>
          <span className="text-[9px] text-cyan-400">GEE / ISRO LIVE</span>
        </div>

        <div className="grid grid-cols-2 gap-x-3 gap-y-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            <span>District Hospital</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span>220kV Substation</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-500"></span>
            <span>Cyclone Shelter</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
            <span>NDRF Tactical Hub</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping"></span>
            <span>Citizen SOS Ping</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-amber-400"></span>
            <span>220kV Grid Line</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-blue-400 border-b border-dashed border-cyan-300"></span>
            <span>Pluvial Runoff (280mm)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 border border-cyan-300"></span>
            <span>Tidal Lock Choke</span>
          </div>
        </div>

        <div className="mt-2 pt-1 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
          <span>Surge Cutoff: +{surgeHeight.toFixed(1)}m</span>
          <span className="text-cyan-300">Click any marker to inspect</span>
        </div>
      </div>
    </div>
  );
};
