import React, { useState, useEffect } from 'react';
import { Satellite, Radio, Compass, Orbit, Activity, ShieldCheck } from 'lucide-react';

export const SatelliteOrbitTracker: React.FC = () => {
  const [secondsRemaining, setSecondsRemaining] = useState(864); // ~14 mins 24s countdown
  const [activeSat, setActiveSat] = useState<'sentinel-1a' | 'landsat-9' | 'terra-modis'>('sentinel-1a');

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 1200));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`;
  };

  const satellites = [
    {
      id: 'sentinel-1a' as const,
      name: 'Sentinel-1A (ESA/Copernicus)',
      sensor: 'C-Band Synthetic Aperture Radar (SAR)',
      altitude: '693 km Sun-Synchronous',
      inclination: '98.18°',
      swathWidth: '250 km Interferometric Wide',
      downlink: 'X-Band 280 Mbps Active',
      status: 'Target Acquisition in Progress',
      color: 'text-cyan-400',
    },
    {
      id: 'landsat-9' as const,
      name: 'Landsat-9 (NASA/USGS)',
      sensor: 'OLI-2 & TIRS-2 Optical & Thermal',
      altitude: '705 km Polar Orbit',
      inclination: '98.2°',
      swathWidth: '185 km Multi-Spectral',
      downlink: 'Direct Broadcast to Ground Stations',
      status: 'Cloud Penetration Mode Active',
      color: 'text-amber-400',
    },
    {
      id: 'terra-modis' as const,
      name: 'Terra-MODIS (NASA EOS)',
      sensor: '36-Band Moderate Resolution Spectro',
      altitude: '705 km Circular',
      inclination: '98.2°',
      swathWidth: '2,330 km Continental Scan',
      downlink: 'Real-time IMD Cyclone Eye Tracking',
      status: 'Full Hemispheric Vortex Scan',
      color: 'text-purple-400',
    },
  ];

  const current = satellites.find((s) => s.id === activeSat) || satellites[0];

  return (
    <div className="glass-panel rounded-2xl p-4 shadow-2xl font-mono text-slate-200 border border-white/[0.08]">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.08] pb-2.5 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
            <Satellite className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-100 flex items-center gap-2">
              Planetary Earth Observation Orbit Tracker
            </h3>
            <p className="text-[10px] text-slate-400">
              Copernicus & NASA SAR Radar Ground-Swath Telemetry
            </p>
          </div>
        </div>

        {/* Satellite Tabs */}
        <div className="flex items-center gap-1">
          {satellites.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveSat(s.id)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                activeSat === s.id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'bg-slate-950/60 text-slate-400 border border-white/[0.06] hover:text-slate-200'
              }`}
            >
              {s.name.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Orbit Status Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
        <div className="bg-slate-950/70 p-2.5 rounded-xl border border-white/[0.06]">
          <div className="text-[9px] text-slate-400 uppercase font-semibold">Next Disaster Swath</div>
          <div className="text-sm font-black text-cyan-300 mt-0.5 tracking-tight">
            {formatCountdown(secondsRemaining)}
          </div>
        </div>

        <div className="bg-slate-950/70 p-2.5 rounded-xl border border-white/[0.06]">
          <div className="text-[9px] text-slate-400 uppercase font-semibold">Orbit Altitude</div>
          <div className="text-sm font-black text-slate-200 mt-0.5 tracking-tight">
            {current.altitude.split(' ')[0]}
          </div>
        </div>

        <div className="bg-slate-950/70 p-2.5 rounded-xl border border-white/[0.06]">
          <div className="text-[9px] text-slate-400 uppercase font-semibold">Swath Footprint</div>
          <div className="text-sm font-black text-emerald-400 mt-0.5 tracking-tight">
            {current.swathWidth.split(' ')[0]}
          </div>
        </div>

        <div className="bg-slate-950/70 p-2.5 rounded-xl border border-white/[0.06]">
          <div className="text-[9px] text-slate-400 uppercase font-semibold">Downlink Status</div>
          <div className="text-sm font-black text-amber-300 mt-0.5 tracking-tight truncate">
            Active 280 Mbps
          </div>
        </div>
      </div>

      <div className="p-2.5 bg-slate-950/50 rounded-xl border border-white/[0.06] flex items-center justify-between text-[11px]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span className="text-slate-300 font-bold">{current.name}:</span>
          <span className="text-slate-400">{current.sensor}</span>
        </div>
        <span className="text-cyan-400 text-[10px] font-bold">{current.status}</span>
      </div>

      {/* Orbital Ephemeris Attribution Footer */}
      <div className="mt-2.5 pt-2 border-t border-white/[0.04] flex items-center justify-between text-[9px] text-slate-500 font-mono">
        <span>Orbital Ephemeris: SGP4 Analytical Propagation (NORAD #39634 Sentinel-1A • 98.6m Orbit Period)</span>
        <span className="text-cyan-400/80">Ground Track Overpass: Sector {activeSat.toUpperCase()}</span>
      </div>
    </div>
  );
};
