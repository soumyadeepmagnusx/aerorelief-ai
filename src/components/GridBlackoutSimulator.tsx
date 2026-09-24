import React, { useState } from 'react';
import { POWER_GRID_LINES } from '../data/disasterData';
import { PowerGridLine, InfrastructureNode } from '../types/disaster';
import { Zap, AlertOctagon, CheckCircle2, ShieldAlert, Activity, ArrowRight, BatteryCharging, RefreshCw } from 'lucide-react';

interface GridBlackoutSimulatorProps {
  infrastructure: InfrastructureNode[];
  surgeHeight: number;
}

export const GridBlackoutSimulator: React.FC<GridBlackoutSimulatorProps> = ({
  infrastructure,
  surgeHeight,
}) => {
  const [gridLines, setGridLines] = useState<PowerGridLine[]>(POWER_GRID_LINES);
  const [isSimulatingCascade, setIsSimulatingCascade] = useState(false);
  const [cascadeStep, setCascadeStep] = useState(0);

  const handleTriggerCascade = () => {
    setIsSimulatingCascade(true);
    setCascadeStep(1);

    setTimeout(() => {
      setCascadeStep(2);
      setGridLines((lines) =>
        lines.map((l) =>
          l.id === 'grid-line-2' ? { ...l, isEnergized: false, currentLoadMw: 0 } : l
        )
      );
    }, 1200);

    setTimeout(() => {
      setCascadeStep(3);
      setGridLines((lines) =>
        lines.map((l) =>
          l.id === 'grid-line-3' ? { ...l, isEnergized: false, currentLoadMw: 0 } : l
        )
      );
    }, 2500);

    setTimeout(() => {
      setCascadeStep(4);
      setIsSimulatingCascade(false);
    }, 3800);
  };

  const handleResetGrid = () => {
    setGridLines(POWER_GRID_LINES);
    setCascadeStep(0);
  };

  const energizedCount = gridLines.filter((l) => l.isEnergized).length;
  const trippedCount = gridLines.filter((l) => !l.isEnergized).length;

  return (
    <div className="bg-slate-900/95 border border-slate-800 rounded-xl p-4 shadow-2xl font-mono text-slate-200 space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400">
              <Zap className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-100 flex items-center gap-2">
                Cascading Grid Blackout & Telecom Failure Simulator
              </h2>
              <p className="text-[11px] text-slate-400">
                Supervisory SCADA Grid Topology & Critical Hospital Island Mode Emulation
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetGrid}
            className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition"
          >
            Reset SCADA
          </button>
          <button
            onClick={handleTriggerCascade}
            disabled={isSimulatingCascade}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition shadow-lg shadow-red-600/20 disabled:opacity-50"
          >
            <AlertOctagon className="w-4 h-4" />
            <span>Simulate Salt-Surge Grid Trip</span>
          </button>
        </div>
      </div>

      {/* Grid Status Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
        <div className="bg-slate-950 p-2 rounded border border-slate-800">
          <div className="text-[10px] text-slate-500">Energized Feeders</div>
          <div className="font-bold text-emerald-400 text-sm mt-0.5">{energizedCount} Online</div>
        </div>
        <div className="bg-slate-950 p-2 rounded border border-slate-800">
          <div className="text-[10px] text-slate-500">Tripped Circuits</div>
          <div className="font-bold text-red-400 text-sm mt-0.5">{trippedCount} Offline</div>
        </div>
        <div className="bg-slate-950 p-2 rounded border border-slate-800">
          <div className="text-[10px] text-slate-500">Blackout Estimate</div>
          <div className="font-bold text-amber-400 text-sm mt-0.5">~48,500 Citizens</div>
        </div>
        <div className="bg-slate-950 p-2 rounded border border-slate-800">
          <div className="text-[10px] text-slate-500">Hospital ICU Mode</div>
          <div className="font-bold text-rose-400 text-sm mt-0.5">Island GenSet (6h)</div>
        </div>
      </div>

      {/* Live Grid Topology Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {gridLines.map((line) => (
          <div
            key={line.id}
            className={`p-3.5 rounded-lg border transition ${
              line.isEnergized
                ? 'bg-slate-950/80 border-slate-800'
                : 'bg-red-950/20 border-red-500/50 shadow-lg shadow-red-950/30'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${line.isEnergized ? 'bg-emerald-400 animate-ping' : 'bg-red-500'}`} />
                <h3 className="text-xs font-bold text-slate-200">{line.name}</h3>
              </div>
              <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                line.isEnergized ? 'bg-emerald-950 text-emerald-300' : 'bg-red-950 text-red-400 border border-red-800'
              }`}>
                {line.isEnergized ? 'ENERGIZED' : 'CIRCUIT TRIPPED'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-[11px] my-2 bg-slate-900/60 p-1.5 rounded">
              <div>
                <span className="text-slate-500 text-[9px] block">VOLTAGE</span>
                <span className="font-bold text-cyan-300">{line.voltageKv} kV</span>
              </div>
              <div>
                <span className="text-slate-500 text-[9px] block">ACTIVE LOAD</span>
                <span className={`font-bold ${line.isEnergized ? 'text-amber-300' : 'text-slate-500'}`}>
                  {line.currentLoadMw} MW
                </span>
              </div>
              <div>
                <span className="text-slate-500 text-[9px] block">RATED CAPACITY</span>
                <span className="font-bold text-slate-300">{line.maxCapacityMw} MW</span>
              </div>
            </div>

            {line.failureReason && (
              <div className="text-[10px] text-red-300 bg-red-950/30 p-2 rounded border border-red-900/40 mt-2">
                ⚠️ {line.failureReason}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Hospital Islanding Alert */}
      <div className="bg-amber-950/30 border border-amber-500/40 p-3 rounded-lg text-xs flex items-start gap-2.5">
        <BatteryCharging className="w-5 h-5 text-amber-400 shrink-0 mt-0.5 animate-pulse" />
        <div className="space-y-1">
          <span className="font-bold text-amber-300 uppercase text-[11px]">
            Konark Emergency Trauma Care: Island Mode Active
          </span>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            Main 33kV grid feed severed due to saltwater inundation at Chandrabhaga substation switchyard.
            Facility is running on secondary 200kVA diesel generator with <strong>6 hours remaining fuel capacity</strong>.
            NDRF dynamic fuel convoy dispatch has been flagged with Priority P1.
          </p>
        </div>
      </div>
    </div>
  );
};
