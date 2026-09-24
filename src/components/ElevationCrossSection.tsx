import React from 'react';
import { Waves, Mountain, ShieldCheck, AlertTriangle, ArrowUpRight } from 'lucide-react';

interface ElevationCrossSectionProps {
  surgeHeight: number;
}

export const ElevationCrossSection: React.FC<ElevationCrossSectionProps> = ({ surgeHeight }) => {
  // Coordinates mapping on 600x200 SVG canvas:
  // Sea level = Y: 150 (Elevation 0.0m)
  // Scale: 1 meter = 15 pixels vertically
  const seaLevelY = 150;
  const waterY = seaLevelY - surgeHeight * 15;

  // Elevations:
  // 1. Shoreline: 0.5m -> Y: 150 - 0.5*15 = 142.5
  // 2. Coastal Highway: 1.4m -> Y: 150 - 1.4*15 = 129
  // 3. Lagoon/Estuary: 0.8m -> Y: 150 - 0.8*15 = 138
  // 4. District Hospital: 3.8m -> Y: 150 - 3.8*15 = 93
  // 5. High Ridge Bypass: 7.8m -> Y: 150 - 7.8*15 = 33

  const isHighwaySubmerged = surgeHeight > 1.4;
  const isHospitalThreatened = surgeHeight > 3.6;

  return (
    <div className="glass-panel rounded-2xl p-4 shadow-2xl font-mono text-slate-200 border border-white/[0.08]">
      <div className="flex items-center justify-between mb-3 border-b border-white/[0.08] pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
            <Mountain className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-100 flex items-center gap-2">
              Terrain Elevation Digital Twin Cross-Section
            </h3>
            <p className="text-[10px] text-slate-400">
              Topographic Inundation Profile vs. Lifeline Road Viability
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[10px]">
          <span className="flex items-center gap-1 text-cyan-300">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span> Water Level: +{surgeHeight.toFixed(1)}m
          </span>
        </div>
      </div>

      {/* SVG Digital Twin Elevation Canvas */}
      <div className="relative w-full h-[190px] bg-gradient-to-b from-slate-950/80 via-slate-900/60 to-slate-950/90 rounded-xl overflow-hidden border border-white/[0.06] p-2">
        <svg viewBox="0 0 700 180" className="w-full h-full overflow-visible">
          <defs>
            {/* Terrain Gradient */}
            <linearGradient id="terrainGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#0a0f1d" />
            </linearGradient>

            {/* Water Gradient */}
            <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.75" />
              <stop offset="50%" stopColor="#0284c7" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#0369a1" stopOpacity="0.95" />
            </linearGradient>
          </defs>

          {/* Background Grid Lines */}
          <line x1="0" y1="150" x2="700" y2="150" stroke="#334155" strokeDasharray="3 3" strokeWidth="1" />
          <text x="5" y="146" fill="#64748b" fontSize="9" fontFamily="monospace">0.0m MSL (Mean Sea Level)</text>

          <line x1="0" y1="93" x2="700" y2="93" stroke="#334155" strokeDasharray="2 4" strokeWidth="0.8" />
          <text x="5" y="89" fill="#64748b" fontSize="9" fontFamily="monospace">+3.8m (Hospital ICU Datum)</text>

          <line x1="0" y1="33" x2="700" y2="33" stroke="#334155" strokeDasharray="2 4" strokeWidth="0.8" />
          <text x="5" y="29" fill="#10b981" fontSize="9" fontFamily="monospace">+7.8m (High Ridge Safe Horizon)</text>

          {/* Terrain Solid Fill Polygon */}
          <path
            d="
              M 0 160
              L 120 155
              L 180 142
              L 260 129
              L 330 138
              L 440 93
              L 540 85
              L 630 33
              L 700 25
              L 700 180
              L 0 180
              Z
            "
            fill="url(#terrainGrad)"
            stroke="#475569"
            strokeWidth="1.5"
          />

          {/* Dynamic Water Surge Fill */}
          <path
            d={`
              M 0 ${Math.min(180, waterY)}
              L 380 ${Math.min(180, waterY)}
              L 380 180
              L 0 180
              Z
            `}
            fill="url(#waterGrad)"
          />

          {/* Animated Water Surface Wave Line */}
          <line
            x1="0"
            y1={waterY}
            x2="380"
            y2={waterY}
            stroke="#38bdf8"
            strokeWidth="2.5"
            strokeDasharray="6 3"
          />

          {/* Node 1: Coastal Highway Marker */}
          <circle cx="260" cy="129" r="4" fill={isHighwaySubmerged ? '#ef4444' : '#10b981'} />
          <line x1="260" y1="129" x2="260" y2="165" stroke="#64748b" strokeWidth="1" strokeDasharray="2 2" />
          <text x="210" y="175" fill={isHighwaySubmerged ? '#f87171' : '#94a3b8'} fontSize="9" fontWeight="bold">
            Marine Drive (+1.4m)
          </text>
          {isHighwaySubmerged && (
            <text x="215" y="118" fill="#ef4444" fontSize="9" fontWeight="bold">
              ⚠️ SUBMERGED (-{(surgeHeight - 1.4).toFixed(1)}m)
            </text>
          )}

          {/* Node 2: District Hospital Marker */}
          <circle cx="440" cy="93" r="5" fill={isHospitalThreatened ? '#f59e0b' : '#38bdf8'} />
          <line x1="440" y1="93" x2="440" y2="165" stroke="#64748b" strokeWidth="1" strokeDasharray="2 2" />
          <text x="400" y="175" fill="#e2e8f0" fontSize="9" fontWeight="bold">
            District Hospital (+3.8m)
          </text>
          {isHospitalThreatened && (
            <text x="410" y="78" fill="#f59e0b" fontSize="8" fontWeight="bold">
              ⚡ WATER AT BASEMENT
            </text>
          )}

          {/* Node 3: High Ridge Lifeline Bypass Marker */}
          <circle cx="630" cy="33" r="6" fill="#10b981" stroke="#34d399" strokeWidth="2" />
          <line x1="630" y1="33" x2="630" y2="165" stroke="#10b981" strokeWidth="1" strokeDasharray="2 2" />
          <text x="560" y="175" fill="#34d399" fontSize="9" fontWeight="bold">
            High Ridge Bypass (+7.8m)
          </text>
          <text x="575" y="24" fill="#34d399" fontSize="9" fontWeight="bold">
            🛡️ 100% DRY CORRIDOR
          </text>
        </svg>
      </div>

      {/* Real-time Engineering Insight Footer */}
      <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-300">
        <div className="flex items-center gap-1.5">
          {isHighwaySubmerged ? (
            <span className="text-red-400 font-bold flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" /> Marine Drive is {((surgeHeight - 1.4)).toFixed(1)}m underwater. Standard vehicles stalled.
            </span>
          ) : (
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Coastal Highway passable with safe margin.
            </span>
          )}
        </div>

        <div className="text-[10px] text-slate-400">
          Ridge Clearance Margin: <strong className="text-emerald-400">+{Math.max(0, 7.8 - surgeHeight).toFixed(1)}m</strong> Above Storm Surge
        </div>
      </div>
    </div>
  );
};
