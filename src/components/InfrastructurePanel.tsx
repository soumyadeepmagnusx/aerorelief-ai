import React, { useState } from 'react';
import { InfrastructureNode, InfrastructureType } from '../types/disaster';
import { 
  Building2, 
  Zap, 
  Shield, 
  Anchor, 
  AlertTriangle, 
  CheckCircle, 
  Fuel, 
  Users, 
  Waves, 
  Navigation, 
  MapPin, 
  Filter 
} from 'lucide-react';

interface InfrastructurePanelProps {
  infrastructure: InfrastructureNode[];
  surgeHeight: number;
  onFocusNode: (node: InfrastructureNode) => void;
  onRouteToNode: (node: InfrastructureNode) => void;
}

export const InfrastructurePanel: React.FC<InfrastructurePanelProps> = ({
  infrastructure,
  surgeHeight,
  onFocusNode,
  onRouteToNode,
}) => {
  const [filterType, setFilterType] = useState<string>('all');

  const filteredNodes = infrastructure.filter((node) => {
    if (filterType === 'all') return true;
    if (filterType === 'critical') {
      const floodDepth = Math.max(0, surgeHeight - node.elevationMeters);
      return floodDepth > 0.1 || node.status === 'critical' || node.status === 'submerged';
    }
    return node.type === filterType;
  });

  return (
    <div className="bg-slate-900/95 border border-slate-800 rounded-xl p-4 shadow-2xl font-mono text-slate-200 space-y-4">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-100 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-amber-400" />
            Critical Grid & Public Health Telemetry Matrix
          </h2>
          <p className="text-[11px] text-slate-400">
            Real-Time Vulnerability Tracking for Medical Centers, 220kV Grid Substations & High-Ground Shelters
          </p>
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-1.5 text-xs">
          <button
            onClick={() => setFilterType('all')}
            className={`px-2.5 py-1 rounded transition ${
              filterType === 'all' ? 'bg-cyan-600 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            All ({infrastructure.length})
          </button>
          <button
            onClick={() => setFilterType('hospital')}
            className={`px-2.5 py-1 rounded transition ${
              filterType === 'hospital' ? 'bg-rose-600 text-white font-bold' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            Hospitals
          </button>
          <button
            onClick={() => setFilterType('substation')}
            className={`px-2.5 py-1 rounded transition ${
              filterType === 'substation' ? 'bg-amber-600 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            Power Grid
          </button>
          <button
            onClick={() => setFilterType('shelter')}
            className={`px-2.5 py-1 rounded transition ${
              filterType === 'shelter' ? 'bg-teal-600 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            Shelters
          </button>
          <button
            onClick={() => setFilterType('critical')}
            className={`px-2.5 py-1 rounded transition ${
              filterType === 'critical' ? 'bg-red-600 text-white font-bold animate-pulse' : 'bg-slate-800 text-red-400 hover:text-red-300'
            }`}
          >
            ⚠️ High Alert
          </button>
        </div>
      </div>

      {/* Infrastructure Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredNodes.map((node) => {
          const floodDepth = Math.max(0, Number((surgeHeight - node.elevationMeters).toFixed(2)));
          const isFlooded = floodDepth > 0.2;
          const isWarning = floodDepth > 0 && !isFlooded;

          return (
            <div
              key={node.id}
              className={`rounded-xl border p-3.5 flex flex-col justify-between transition relative ${
                isFlooded
                  ? 'bg-red-950/20 border-red-500/60 shadow-lg shadow-red-950/40'
                  : isWarning
                  ? 'bg-amber-950/20 border-amber-500/40'
                  : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              {/* Card Header */}
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">
                      {node.type === 'hospital' && '🏥'}
                      {node.type === 'substation' && '⚡'}
                      {node.type === 'shelter' && '🛡️'}
                      {node.type === 'relief_hub' && '🚁'}
                    </span>
                    <div>
                      <h3 className="text-xs font-bold text-slate-100 leading-tight">{node.name}</h3>
                      <div className="text-[10px] text-slate-400 capitalize">{node.type.replace('_', ' ')}</div>
                    </div>
                  </div>

                  <span
                    className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${
                      isFlooded
                        ? 'bg-red-600 text-white animate-pulse'
                        : isWarning
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-emerald-950 border border-emerald-500/50 text-emerald-300'
                    }`}
                  >
                    {isFlooded ? 'SUBMERGED' : isWarning ? 'PERIMETER THREAT' : 'OPERATIONAL'}
                  </span>
                </div>

                {/* Telemetry Stats */}
                <div className="grid grid-cols-2 gap-2 my-2.5 bg-slate-900/80 p-2 rounded text-[11px] border border-slate-800/60">
                  <div>
                    <span className="text-slate-500 block text-[9px]">BASE ELEVATION</span>
                    <span className="font-bold text-cyan-300">+{node.elevationMeters}m MSL</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9px]">WATER INGRESS</span>
                    <span
                      className={`font-bold ${
                        floodDepth > 0 ? 'text-red-400' : 'text-emerald-400'
                      }`}
                    >
                      {floodDepth > 0 ? `+${floodDepth}m Flood` : '0.0m (Dry)'}
                    </span>
                  </div>
                </div>

                {/* Contextual Metrics */}
                <div className="space-y-1 text-[11px] text-slate-300 mb-3">
                  {node.generatorFuelHours !== undefined && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Fuel className="w-3 h-3 text-amber-400" /> Gen Backup:
                      </span>
                      <span
                        className={`font-bold ${
                          node.generatorFuelHours <= 6 ? 'text-red-400 animate-pulse' : 'text-slate-200'
                        }`}
                      >
                        {node.generatorFuelHours} hrs remaining
                      </span>
                    </div>
                  )}

                  {node.capacity && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Users className="w-3 h-3 text-cyan-400" /> Occupancy:
                      </span>
                      <span className="font-bold text-slate-200">
                        {node.occupancy} / {node.capacity} ({Math.round(((node.occupancy || 0) / node.capacity) * 100)}%)
                      </span>
                    </div>
                  )}

                  <div className="text-[10px] text-slate-400 italic pt-1 border-t border-slate-800/80">
                    {node.statusDetails}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                <button
                  onClick={() => onFocusNode(node)}
                  className="flex-1 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs flex items-center justify-center gap-1 transition"
                >
                  <MapPin className="w-3 h-3 text-cyan-400" />
                  <span>Locate</span>
                </button>

                <button
                  onClick={() => onRouteToNode(node)}
                  className="flex-1 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1 transition"
                >
                  <Navigation className="w-3 h-3" />
                  <span>Route</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
