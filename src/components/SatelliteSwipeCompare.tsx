import React, { useState } from 'react';
import { SATELLITE_SCENARIOS } from '../data/disasterData';
import { Layers, SplitSquareVertical, Info, Eye, Sparkles } from 'lucide-react';

export const SatelliteSwipeCompare: React.FC = () => {
  const [selectedScenario, setSelectedScenario] = useState(SATELLITE_SCENARIOS[0]);
  const [sliderPos, setSliderPos] = useState<number>(50); // percentage

  return (
    <div className="bg-slate-900/95 border border-slate-800 rounded-xl p-4 shadow-2xl font-mono text-slate-200 space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-400">
              <SplitSquareVertical className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-100 flex items-center gap-2">
                Earth Engine SAR Radar Split-Screen Swipe Triage
              </h2>
              <p className="text-[11px] text-slate-400">
                Pre-Event Sentinel-2 Optical vs. Post-Landfall Sentinel-1 C-Band SAR Inundation Mask
              </p>
            </div>
          </div>
        </div>

        {/* Scenario Switcher */}
        <div className="flex items-center gap-1.5 text-xs">
          {SATELLITE_SCENARIOS.map((scen) => (
            <button
              key={scen.id}
              onClick={() => setSelectedScenario(scen)}
              className={`px-3 py-1 rounded transition ${
                selectedScenario.id === scen.id
                  ? 'bg-cyan-600 text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {scen.title}
            </button>
          ))}
        </div>
      </div>

      {/* Main Interactive Swipe Container */}
      <div className="relative w-full h-[420px] sm:h-[480px] rounded-xl overflow-hidden border border-slate-800 select-none bg-slate-950">
        {/* Background Layer: Post-Cyclone SAR Flood Image */}
        <img
          src={selectedScenario.postImageUrl}
          alt="Post-cyclone SAR"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Post-Cyclone Label Stamp */}
        <div className="absolute top-3 right-3 bg-red-950/80 backdrop-blur border border-red-700/60 rounded px-2.5 py-1 text-[10px] text-red-300 font-bold z-10">
          POST-LANDFALL: {selectedScenario.postDate}
        </div>

        {/* Foreground Layer (Clipped): Pre-Cyclone Optical Image */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ width: `${sliderPos}%` }}
        >
          <img
            src={selectedScenario.preImageUrl}
            alt="Pre-cyclone optical"
            className="absolute inset-0 w-full h-full object-cover max-w-none"
            style={{ width: '100%', minWidth: '800px' }}
          />

          {/* Pre-Cyclone Label Stamp */}
          <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur border border-slate-700 rounded px-2.5 py-1 text-[10px] text-cyan-300 font-bold">
            PRE-CYCLONE: {selectedScenario.preDate}
          </div>
        </div>

        {/* Vertical Swipe Divider Handle */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-cyan-400 cursor-ew-resize z-20 shadow-2xl flex items-center justify-center"
          style={{ left: `${sliderPos}%` }}
        >
          <div className="w-8 h-8 rounded-full bg-cyan-400 text-slate-950 font-black text-xs flex items-center justify-center shadow-lg border-2 border-slate-900">
            ↔
          </div>
        </div>

        {/* Invisible Range Input for Drag Control */}
        <input
          type="range"
          min="0"
          max="100"
          value={sliderPos}
          onChange={(e) => setSliderPos(parseFloat(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
          title="Drag horizontally to compare pre and post-cyclone satellite imagery"
        />

        {/* Floating Instruction */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-slate-950/80 backdrop-blur border border-slate-800 rounded-full px-3 py-1 text-[10px] text-slate-300 pointer-events-none z-10 flex items-center gap-1.5">
          <Eye className="w-3.5 h-3.5 text-cyan-400" />
          <span>Drag slider left/right to reveal SAR flood watermark & severed corridors</span>
        </div>
      </div>

      {/* Earth Engine Change Detection Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
          <div className="text-[10px] text-slate-500 uppercase">SAR Water Inundation</div>
          <div className="text-base font-black text-blue-400 mt-0.5">
            +{selectedScenario.inundatedSqKm} sq km
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Reflectance change: -8.4 dB</div>
        </div>

        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
          <div className="text-[10px] text-slate-500 uppercase">Severed Structures</div>
          <div className="text-base font-black text-red-400 mt-0.5">
            {selectedScenario.severedStructuresCount} Breaches
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Bridges, embankments & culverts</div>
        </div>

        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
          <div className="text-[10px] text-slate-500 uppercase">Satellite Mission</div>
          <div className="text-base font-black text-cyan-300 mt-0.5">
            Copernicus Sentinel-1
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Dual-pol VV+VH Synthetic Aperture</div>
        </div>
      </div>

      {/* Contextual Narrative */}
      <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/80 text-xs text-slate-300 leading-relaxed">
        <span className="font-bold text-slate-100 uppercase text-[11px] block mb-1">
          GeoAI Change Detection Insight:
        </span>
        {selectedScenario.description}
      </div>
    </div>
  );
};
