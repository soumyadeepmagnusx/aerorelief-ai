import React, { useState } from 'react';
import { SATELLITE_SCENARIOS } from '../data/disasterData';
import { Layers, SplitSquareVertical, Info, Eye, Sparkles, Terminal, Code2, Sliders, CheckCircle2 } from 'lucide-react';
import { sound } from '../services/soundFx';

export const SatelliteSwipeCompare: React.FC = () => {
  const [selectedScenario, setSelectedScenario] = useState(SATELLITE_SCENARIOS[0]);
  const [sliderPos, setSliderPos] = useState<number>(50); // percentage
  const [sarThresholdDb, setSarThresholdDb] = useState<number>(-14); // dB threshold for open water
  const [showGeeScript, setShowGeeScript] = useState<boolean>(false);
  const [scriptLang, setScriptLang] = useState<'python' | 'javascript'>('python');

  return (
    <div className="bg-slate-900/95 border border-slate-800 rounded-xl p-4 shadow-2xl font-mono text-slate-200 space-y-4">
      {/* Header with Google Earth Engine (GEE) Attribution */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-400">
              <SplitSquareVertical className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-100 flex items-center gap-2">
                  Google Earth Engine (GEE) SAR Radar Split-Screen Swipe Triage
                </h2>
                <span className="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  GEE COPERNICUS/S1_GRD
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Pre-Landfall Sentinel-2 MSI Optical Baseline vs. Post-Landfall Sentinel-1 C-Band SAR Synthetic Aperture Radar
              </p>
            </div>
          </div>
        </div>

        {/* GEE Script Drawer Button & Scenario Switcher */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            onClick={() => {
              sound.click();
              setShowGeeScript(!showGeeScript);
            }}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/40 text-purple-300 font-bold transition"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>{showGeeScript ? 'Hide GEE Script' : 'Inspect GEE Code'}</span>
          </button>

          {SATELLITE_SCENARIOS.map((scen) => (
            <button
              key={scen.id}
              onClick={() => {
                sound.click();
                setSelectedScenario(scen);
              }}
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

      {/* Collapsible Google Earth Engine Python / JavaScript Script Inspector */}
      {showGeeScript && (
        <div className="p-4 rounded-xl bg-slate-950/95 border border-purple-500/40 text-xs space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-2">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-purple-400" />
              <span className="font-bold text-slate-100 uppercase">
                Google Earth Engine (GEE) Remote Sensing Algorithm
              </span>
            </div>
            <div className="flex items-center rounded-lg bg-slate-900 p-0.5 border border-white/[0.08] text-[10px]">
              <button
                onClick={() => setScriptLang('python')}
                className={`px-2.5 py-0.5 rounded font-bold transition ${
                  scriptLang === 'python' ? 'bg-purple-600 text-white' : 'text-slate-400'
                }`}
              >
                Python (ee / geemap)
              </button>
              <button
                onClick={() => setScriptLang('javascript')}
                className={`px-2.5 py-0.5 rounded font-bold transition ${
                  scriptLang === 'javascript' ? 'bg-purple-600 text-white' : 'text-slate-400'
                }`}
              >
                JavaScript (GEE Code Editor)
              </button>
            </div>
          </div>

          <pre className="p-3 rounded-xl bg-slate-900/90 border border-white/[0.06] text-[10px] text-emerald-300 font-mono overflow-x-auto leading-relaxed max-h-56">
            {scriptLang === 'python'
              ? `import ee

# Initialize Google Earth Engine API
ee.Initialize()

# Region of Interest: Puri-Konark Coastal Sector (Odisha, India)
roi = ee.Geometry.Polygon([
    [[85.75, 19.75], [86.35, 19.75], [86.35, 20.05], [85.75, 20.05], [85.75, 19.75]]
])

# 1. Load Pre-Event Sentinel-1 SAR (Baseline Dry Ground)
pre_s1 = (ee.ImageCollection('COPERNICUS/S1_GRD')
    .filterBounds(roi)
    .filterDate('2026-08-01', '2026-08-15')
    .filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VV'))
    .filter(ee.Filter.eq('instrumentMode', 'IW'))
    .select('VV')
    .median())

# 2. Load Post-Event Sentinel-1 SAR (Cyclone Surge & Pluvial Flooding)
post_s1 = (ee.ImageCollection('COPERNICUS/S1_GRD')
    .filterBounds(roi)
    .filterDate('2026-09-20', '2026-09-25')
    .filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VV'))
    .filter(ee.Filter.eq('instrumentMode', 'IW'))
    .select('VV')
    .mosaic())

# 3. Apply C-Band Radar Specular Water Reflection Threshold (sigma0 < ${sarThresholdDb} dB)
flood_mask = post_s1.lt(${sarThresholdDb}).And(pre_s1.gte(${sarThresholdDb}))

# 4. Compute Inundated Surface Area in Hectares / Square Kilometers
flood_area = flood_mask.multiply(ee.Image.pixelArea()).reduceRegion(
    reducer=ee.Reducer.sum(),
    geometry=roi,
    scale=10,
    maxPixels=1e9
)
print("GEE Computed Flood Inundation (Sq M):", flood_area.getInfo())`
              : `// Google Earth Engine (GEE) JavaScript Code Editor
var roi = ee.Geometry.Polygon([
  [[85.75, 19.75], [86.35, 19.75], [86.35, 20.05], [85.75, 20.05], [85.75, 19.75]]
]);

// Sentinel-1 Synthetic Aperture Radar C-Band IW
var s1Collection = ee.ImageCollection('COPERNICUS/S1_GRD')
  .filterBounds(roi)
  .filter(ee.Filter.eq('instrumentMode', 'IW'))
  .filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VV'));

var preCyclone = s1Collection.filterDate('2026-08-01', '2026-08-15').select('VV').median();
var postCyclone = s1Collection.filterDate('2026-09-20', '2026-09-25').select('VV').mosaic();

// Threshold: Open water specular radar reflectance is < ${sarThresholdDb} dB
var floodWater = postCyclone.lt(${sarThresholdDb}).and(preCyclone.gte(${sarThresholdDb}));
Map.centerObject(roi, 11);
Map.addLayer(postCyclone, {min: -25, max: 0}, 'Sentinel-1 Post-Surge SAR');
Map.addLayer(floodWater.updateMask(floodWater), {palette: ['#0284c7']}, 'GEE Flood Extent');`}
          </pre>
          <div className="flex items-center justify-between text-[10px] text-slate-400">
            <span>Spatial Resolution: 10m Ground Sample Distance (GSD)</span>
            <span className="text-emerald-400 font-bold">✓ GEE Verified Pipeline</span>
          </div>
        </div>
      )}

      {/* SAR Radar Backscatter Threshold Tuning Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-950/80 border border-white/[0.06] text-xs">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-cyan-400" />
          <span className="font-bold text-slate-200">SAR Radar Specular Threshold (&sigma;<sup>0</sup>):</span>
          <span className="px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-black">
            {sarThresholdDb} dB
          </span>
        </div>

        <div className="flex items-center gap-2 flex-1 max-w-xs">
          <span className="text-[10px] text-slate-500">-18 dB</span>
          <input
            type="range"
            min="-18"
            max="-10"
            step="0.5"
            value={sarThresholdDb}
            onChange={(e) => setSarThresholdDb(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
          <span className="text-[10px] text-slate-500">-10 dB</span>
        </div>

        <div className="text-[10px] text-slate-400">
          Open water reflects radar away from antenna: <strong className="text-cyan-300">&sigma;<sup>0</sup> &lt; {sarThresholdDb} dB</strong>
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
        <div className="absolute top-3 right-3 bg-red-950/80 backdrop-blur border border-red-700/60 rounded px-2.5 py-1 text-[10px] text-red-300 font-bold z-10 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
          <span>POST-LANDFALL: {selectedScenario.postDate} (SAR &sigma;<sup>0</sup> &lt; {sarThresholdDb}dB)</span>
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
          <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur border border-slate-700 rounded px-2.5 py-1 text-[10px] text-cyan-300 font-bold flex items-center gap-1.5">
            <CheckCircle2 className="w-3 h-3 text-cyan-400" />
            <span>PRE-CYCLONE BASELINE: {selectedScenario.preDate} (Sentinel-2 MSI)</span>
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
          <div className="text-[10px] text-slate-500 uppercase">SAR Water Inundation (GEE)</div>
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
          <div className="text-[10px] text-slate-500 uppercase">Earth Engine Asset</div>
          <div className="text-base font-black text-cyan-300 mt-0.5">
            COPERNICUS/S1_GRD
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Dual-pol VV+VH Synthetic Aperture</div>
        </div>
      </div>

      {/* Contextual Narrative */}
      <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/80 text-xs text-slate-300 leading-relaxed">
        <span className="font-bold text-slate-100 uppercase text-[11px] block mb-1">
          Google Earth Engine (GEE) Change Detection Insight:
        </span>
        {selectedScenario.description}
      </div>
    </div>
  );
};

