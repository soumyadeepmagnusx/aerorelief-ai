import React, { useState } from 'react';
import { RouteOption, InfrastructureNode } from '../types/disaster';
import { 
  Navigation, 
  AlertTriangle, 
  CheckCircle2, 
  Truck, 
  ShieldCheck, 
  MapPin, 
  ArrowRight, 
  Compass, 
  Play, 
  Fuel, 
  Activity 
} from 'lucide-react';

interface RoutingPanelProps {
  activeRoute: RouteOption;
  alternativeRoute?: RouteOption;
  isDirectSevered: boolean;
  recommendation: string;
  destinationNode: InfrastructureNode | null;
  onSelectAlternative: () => void;
  surgeHeight: number;
}

export const RoutingPanel: React.FC<RoutingPanelProps> = ({
  activeRoute,
  alternativeRoute,
  isDirectSevered,
  recommendation,
  destinationNode,
  onSelectAlternative,
  surgeHeight,
}) => {
  const [isSimulatingDispatch, setIsSimulatingDispatch] = useState(false);
  const [dispatchStep, setDispatchStep] = useState(0);

  const handleSimulateDispatch = () => {
    setIsSimulatingDispatch(true);
    setDispatchStep(1);

    const timer1 = setTimeout(() => setDispatchStep(2), 1500);
    const timer2 = setTimeout(() => setDispatchStep(3), 3200);
    const timer3 = setTimeout(() => {
      setDispatchStep(4);
      setTimeout(() => setIsSimulatingDispatch(false), 2500);
    }, 5000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  };

  return (
    <div className="bg-slate-900/95 border border-slate-800 rounded-xl p-4 shadow-2xl space-y-4 text-slate-200 font-mono">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
            <Navigation className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2 uppercase tracking-wider">
              Autonomous Dynamic Lifeline Corridor
            </h2>
            <p className="text-[11px] text-slate-400">
              Graph Pathfinding with Real-time Terrain Elevation & Water Surge Clearance
            </p>
          </div>
        </div>

        <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300">
          A* Flood-Penalized Graph
        </span>
      </div>

      {/* Target Mission Briefing */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-950/70 p-3 rounded-lg border border-slate-800/80 text-xs">
        <div className="space-y-1">
          <div className="text-[10px] text-slate-500 uppercase flex items-center gap-1">
            <MapPin className="w-3 h-3 text-cyan-400" /> Origin Staging Base
          </div>
          <div className="font-bold text-slate-200">Malatipatpur NDRF Tactical Hub</div>
          <div className="text-[11px] text-slate-400">Coordinates: 19.861° N, 85.845° E (Elev: +8.5m)</div>
        </div>

        <div className="space-y-1">
          <div className="text-[10px] text-slate-500 uppercase flex items-center gap-1">
            <MapPin className="w-3 h-3 text-rose-400" /> Target Disaster Node
          </div>
          <div className="font-bold text-rose-300">
            {destinationNode ? destinationNode.name : 'Konark Emergency Trauma Care'}
          </div>
          <div className="text-[11px] text-slate-400">
            Required Payload: 250kVA Mobile Diesel GenSet & ICU Resupply
          </div>
        </div>
      </div>

      {/* AI Recommendation Alert */}
      <div className={`p-3 rounded-lg border text-xs flex items-start gap-2.5 ${
        isDirectSevered
          ? 'bg-amber-950/40 border-amber-500/50 text-amber-200'
          : 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
      }`}>
        {isDirectSevered ? (
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        ) : (
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        )}
        <div className="space-y-1">
          <span className="font-bold uppercase tracking-wider text-[11px]">
            {isDirectSevered ? 'AUTONOMOUS BYPASS ENGAGED' : 'DIRECT ARTERIAL PASSABLE'}
          </span>
          <p className="text-[11px] leading-relaxed text-slate-300">{recommendation}</p>
        </div>
      </div>

      {/* Route Cards Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Active Selected Route */}
        <div className="bg-slate-950 border-2 border-cyan-500/80 rounded-lg p-3.5 shadow-lg relative">
          <span className="absolute -top-2.5 right-3 bg-cyan-600 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded uppercase">
            ACTIVE RESCUE CORRIDOR
          </span>

          <h3 className="text-xs font-bold text-cyan-300 mb-2">{activeRoute.name}</h3>

          <div className="grid grid-cols-3 gap-2 text-center text-xs mb-3 font-mono">
            <div className="bg-slate-900 p-1.5 rounded border border-slate-800">
              <div className="text-[9px] text-slate-500">Distance</div>
              <div className="font-bold text-slate-200">{activeRoute.distanceKm} km</div>
            </div>
            <div className="bg-slate-900 p-1.5 rounded border border-slate-800">
              <div className="text-[9px] text-slate-500">Est. Transit</div>
              <div className="font-bold text-cyan-300">{activeRoute.estimatedMinutes} mins</div>
            </div>
            <div className="bg-slate-900 p-1.5 rounded border border-slate-800">
              <div className="text-[9px] text-slate-500">Min. Elevation</div>
              <div className="font-bold text-emerald-400">+{activeRoute.minElevationMeters}m MSL</div>
            </div>
          </div>

          <div className="text-[11px] space-y-1.5 mb-3">
            <div className="flex items-center gap-1.5 text-slate-300">
              <Truck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>Vehicles: {activeRoute.recommendedVehicles}</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Water Clearance: Safe (+{(activeRoute.minElevationMeters - surgeHeight).toFixed(1)}m above surge)</span>
            </div>
          </div>

          {/* Turn-by-Turn Waypoints */}
          <div className="space-y-1 pt-2 border-t border-slate-800/80">
            <div className="text-[10px] text-slate-500 uppercase font-bold">Tactical Waypoints:</div>
            {activeRoute.waypoints.map((wp, i) => (
              <div key={i} className="text-[10px] text-slate-400 flex items-start gap-1.5">
                <span className="text-cyan-400 font-bold shrink-0">{i + 1}.</span>
                <span>{wp}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Alternative / Blocked Route */}
        {alternativeRoute && (
          <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3.5 opacity-85">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-slate-400">{alternativeRoute.name}</h3>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                alternativeRoute.isPassable ? 'bg-emerald-950 text-emerald-400' : 'bg-red-950 border border-red-800 text-red-400'
              }`}>
                {alternativeRoute.isPassable ? 'VIABLE ALTERNATIVE' : 'SEVERED / BLOCKED'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs mb-3 font-mono">
              <div className="bg-slate-900 p-1.5 rounded border border-slate-800">
                <div className="text-[9px] text-slate-500">Distance</div>
                <div className="font-bold text-slate-400">{alternativeRoute.distanceKm} km</div>
              </div>
              <div className="bg-slate-900 p-1.5 rounded border border-slate-800">
                <div className="text-[9px] text-slate-500">Water Depth</div>
                <div className="font-bold text-red-400">+{alternativeRoute.maxFloodDepthMeters}m</div>
              </div>
              <div className="bg-slate-900 p-1.5 rounded border border-slate-800">
                <div className="text-[9px] text-slate-500">Base Elev.</div>
                <div className="font-bold text-slate-400">+{alternativeRoute.minElevationMeters}m</div>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 space-y-1 mb-3">
              <div>Risk Assessment: {alternativeRoute.severedSegmentNames.join(', ') || 'Low hazard'}</div>
              <div>Status: {alternativeRoute.recommendedVehicles}</div>
            </div>

            <button
              onClick={onSelectAlternative}
              className="w-full text-xs font-mono py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
            >
              Switch Map Focus to This Route
            </button>
          </div>
        )}
      </div>

      {/* Convoy Dispatch Simulator */}
      <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-slate-200">NDRF Golden-Hour Convoy Execution</span>
          </div>

          <button
            onClick={handleSimulateDispatch}
            disabled={isSimulatingDispatch || !activeRoute.isPassable}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold font-mono transition ${
              isSimulatingDispatch
                ? 'bg-cyan-900/50 text-cyan-400 cursor-wait'
                : 'bg-emerald-600 hover:bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-600/20'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            <span>{isSimulatingDispatch ? 'Convoy En Route...' : 'Simulate Convoy Dispatch'}</span>
          </button>
        </div>

        {/* Dispatch Progress Steps */}
        {isSimulatingDispatch && (
          <div className="space-y-2 pt-2 border-t border-slate-800/80">
            <div className="flex items-center justify-between text-[11px] text-cyan-300">
              <span>Mission Phase {dispatchStep} of 4:</span>
              <span>
                {dispatchStep === 1 && 'Deploying 3-truck convoy from Malatipatpur'}
                {dispatchStep === 2 && 'Traversing NH-316 high ridge flyover (Clear dry asphalt)'}
                {dispatchStep === 3 && 'Crossing Gop auxiliary checkpoint with local police escort'}
                {dispatchStep === 4 && 'Convoy arrived at Konark Hospital northern gate! Generator connected.'}
              </span>
            </div>

            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full transition-all duration-700"
                style={{ width: `${dispatchStep * 25}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
