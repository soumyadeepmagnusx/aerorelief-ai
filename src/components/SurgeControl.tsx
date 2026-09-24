import React from 'react';
import { Waves, AlertTriangle, Droplets, Zap } from 'lucide-react';

interface SurgeControlProps {
  surgeHeight: number;
  setSurgeHeight: (h: number) => void;
  inundatedAreaSqKm: number;
  severedRoadsKm: number;
  offlineSubstationsCount: number;
}

export const SurgeControl: React.FC<SurgeControlProps> = ({
  surgeHeight,
  setSurgeHeight,
  inundatedAreaSqKm,
  severedRoadsKm,
  offlineSubstationsCount,
}) => {
  const presets = [
    { label: 'Spring Tide', val: 0.6, desc: 'Normal Coast' },
    { label: 'Cat 2 Warning', val: 1.8, desc: 'Lowland Ingress' },
    { label: 'Cat 4 Landfall', val: 3.4, desc: 'Critical Surge' },
    { label: 'Cat 5 Surge', val: 4.8, desc: 'Max Submergence' },
  ];

  // Track gradient based on height
  const getSliderTrackGradient = () => {
    const pct = (surgeHeight / 5.0) * 100;
    if (surgeHeight > 3.0) {
      return `linear-gradient(to right, #06b6d4 0%, #f59e0b 50%, #f43f5e ${pct}%, #1e293b ${pct}%, #1e293b 100%)`;
    }
    return `linear-gradient(to right, #06b6d4 0%, #38bdf8 ${pct}%, #1e293b ${pct}%, #1e293b 100%)`;
  };

  return (
    <div className="glass-panel rounded-2xl p-4 shadow-2xl text-slate-200 border border-white/[0.08]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-500/20 border border-blue-500/40 text-blue-400 shadow-md shadow-blue-500/10">
            <Waves className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-100 flex items-center gap-1.5 font-mono">
              Hydrodynamic Surge Physics Simulator
            </h3>
            <p className="text-[10px] text-slate-400 font-mono">
              Coupled Tidal & Atmospheric Inundation Engine
            </p>
          </div>
        </div>

        <div className="text-right font-mono">
          <span className="text-[11px] text-slate-400">Peak Surge: </span>
          <span className={`text-lg font-black tracking-tight ${
            surgeHeight > 3.0 ? 'text-red-400 drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]' : surgeHeight > 1.5 ? 'text-amber-400' : 'text-cyan-400'
          }`}>
            +{surgeHeight.toFixed(1)}m
          </span>
        </div>
      </div>

      {/* Main Interactive Slider */}
      <div className="space-y-1.5 mb-3.5">
        <input
          type="range"
          min="0.0"
          max="5.0"
          step="0.1"
          value={surgeHeight}
          onChange={(e) => setSurgeHeight(parseFloat(e.target.value))}
          style={{ background: getSliderTrackGradient() }}
          className="w-full h-3 rounded-lg appearance-none cursor-pointer transition-all border border-white/[0.08]"
        />

        <div className="flex justify-between text-[9px] font-mono text-slate-400 font-semibold px-0.5">
          <span>0.0m (Tide Baseline)</span>
          <span>1.5m (Highway Margin)</span>
          <span>3.0m (Grid Breach)</span>
          <span>5.0m (Max Surge)</span>
        </div>
      </div>

      {/* Quick Scenario Preset Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mb-3.5">
        {presets.map((p) => {
          const isSelected = Math.abs(surgeHeight - p.val) < 0.15;
          return (
            <button
              key={p.label}
              onClick={() => setSurgeHeight(p.val)}
              className={`px-2.5 py-1.5 rounded-xl text-left border transition-all text-[11px] font-mono ${
                isSelected
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-md shadow-cyan-500/10'
                  : 'bg-slate-950/60 border-white/[0.06] hover:border-slate-600 text-slate-300'
              }`}
            >
              <div className="font-bold text-[11px]">{p.label}</div>
              <div className="text-[9px] text-slate-400 truncate mt-0.5">{p.desc}</div>
            </button>
          );
        })}
      </div>

      {/* Real-time Dynamic Impact Counters */}
      <div className="grid grid-cols-3 gap-2 pt-2.5 border-t border-white/[0.06] text-center font-mono">
        <div className="bg-slate-950/60 p-2 rounded-xl border border-white/[0.06]">
          <div className="text-[9px] text-slate-400 flex items-center justify-center gap-1 font-semibold uppercase">
            <Droplets className="w-3 h-3 text-blue-400" /> Inundated Land
          </div>
          <div className="text-xs font-black text-blue-300 mt-1">
            {inundatedAreaSqKm.toFixed(1)} km²
          </div>
        </div>

        <div className="bg-slate-950/60 p-2 rounded-xl border border-white/[0.06]">
          <div className="text-[9px] text-slate-400 flex items-center justify-center gap-1 font-semibold uppercase">
            <AlertTriangle className="w-3 h-3 text-red-400" /> Submerged Roads
          </div>
          <div className="text-xs font-black text-red-400 mt-1">
            {severedRoadsKm.toFixed(1)} km Cut
          </div>
        </div>

        <div className="bg-slate-950/60 p-2 rounded-xl border border-white/[0.06]">
          <div className="text-[9px] text-slate-400 flex items-center justify-center gap-1 font-semibold uppercase">
            <Zap className="w-3 h-3 text-amber-400" /> Tripped Grid
          </div>
          <div className="text-xs font-black text-amber-300 mt-1">
            {offlineSubstationsCount} Substations
          </div>
        </div>
      </div>
    </div>
  );
};
