import React from 'react';
import { TelemetryData, InfrastructureNode, RoadSegment } from '../types/disaster';
import { X, Copy, Printer, Check, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface SitrepModalProps {
  isOpen: boolean;
  onClose: () => void;
  telemetry: TelemetryData;
  surgeHeight: number;
  infrastructure: InfrastructureNode[];
  roads: RoadSegment[];
}

export const SitrepModal: React.FC<SitrepModalProps> = ({
  isOpen,
  onClose,
  telemetry,
  surgeHeight,
  infrastructure,
  roads,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const severedRoads = roads.filter((r) => surgeHeight - r.baseElevationMeters > 0.3);
  const floodedHospitals = infrastructure.filter(
    (n) => n.type === 'hospital' && surgeHeight - n.elevationMeters > 0.1
  );
  const floodedSubstations = infrastructure.filter(
    (n) => n.type === 'substation' && surgeHeight - n.elevationMeters > 0.1
  );

  const timestamp = new Date().toUTCString();

  const handleCopy = () => {
    const sitrepText = `
================================================================================
NATIONAL DISASTER MANAGEMENT AUTHORITY (NDMA) & OSDMA CRISIS OPS
EMERGENCY SITUATION REPORT (SITREP-04) - GOLDEN HOUR WINDOW
EVENT: SEVERE CYCLONIC STORM "${telemetry.cycloneName}" (${telemetry.category})
TIMESTAMP: ${timestamp}
================================================================================

1. METEOROLOGICAL TELEMETRY
- Max Sustained Winds: ${telemetry.windSpeedKmh} km/h (Gusts up to 220 km/h)
- Central Barometric Pressure: ${telemetry.centralPressureHpa} hPa
- Active Tidal Storm Surge: +${surgeHeight.toFixed(1)}m Peak Tidal Inundation
- Movement Vector: ${telemetry.movementVector}
- Landfall ETA: ${telemetry.landfallETA}

2. HUMANITARIAN & GEOSPATIAL IMPACT
- Red-Zone Inundated Population: ${(telemetry.affectedPopulation).toLocaleString()} citizens
- Severed Lifeline Road Corridors: ${severedRoads.length} (${severedRoads.map((r) => r.name).join(', ')})
- Marine Drive Corridor Status: HARD-SEVERED (Submerged by ${(surgeHeight - 1.4).toFixed(1)}m saltwater)
- Recommended Transit Corridor: Autonomous High-Ridge Bypass via NH-316 / Pipili-Gop

3. CRITICAL INFRASTRUCTURE STATUS
- Grid Substations Offline: ${floodedSubstations.length} (${floodedSubstations.map((s) => s.name).join(', ')})
- Blackout Exposure: ~45,000 households disconnected for safety
- Medical Facilities at Risk: ${floodedHospitals.length} (${floodedHospitals.map((h) => h.name).join(', ')})
- Konark Emergency Trauma Care: GenSet backup critical (<6 hrs fuel remaining)

4. TACTICAL DIRECTIVES & ASSET DEPLOYMENT
- NDRF 03 Bn Malatipatpur Hub: 42 teams deployed, 18 IRBs deployed
- Autonomous Lifeline Routing: Engaged for fuel tanker and medical resupply convoys
- Autonomous Drone Swarm: Sentinel SAR Recon active across Puri-Konark sector
- Aerial Airdrop Priority: Devi River Estuary / Astaranga Cyclone Shelter #12

Report Certified by: AeroRelief Automated Crisis Incident Command
================================================================================
    `;

    navigator.clipboard.writeText(sitrepText.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="glass-panel border border-white/[0.1] rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden font-mono text-slate-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 bg-slate-950/80 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-red-500/20 border border-red-500/40">
              <ShieldAlert className="w-5 h-5 text-red-400 animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                Official Incident Situation Report (SITREP-04)
              </h2>
              <p className="text-[10px] text-slate-400">National Disaster Command Dispatch Protocol</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto text-xs">
          <div className="bg-slate-950/60 border border-white/[0.06] p-3 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 uppercase block font-semibold">INCIDENT IDENTIFIER</span>
              <span className="text-sm font-black text-red-400">CYCLONE AMRIT // DEFCON 2 DISASTER</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase block font-semibold">TIMESTAMP</span>
              <span className="text-slate-300 font-bold">{timestamp}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
            <div className="bg-slate-950/70 p-2.5 rounded-xl border border-white/[0.06]">
              <div className="text-[9px] text-slate-400 uppercase font-semibold">Peak Winds</div>
              <div className="font-bold text-cyan-400 text-base mt-0.5">{telemetry.windSpeedKmh} km/h</div>
            </div>
            <div className="bg-slate-950/70 p-2.5 rounded-xl border border-white/[0.06]">
              <div className="text-[9px] text-slate-400 uppercase font-semibold">Active Surge</div>
              <div className="font-bold text-blue-400 text-base mt-0.5">+{surgeHeight.toFixed(1)}m</div>
            </div>
            <div className="bg-slate-950/70 p-2.5 rounded-xl border border-white/[0.06]">
              <div className="text-[9px] text-slate-400 uppercase font-semibold">Severed Roads</div>
              <div className="font-bold text-red-400 text-base mt-0.5">{severedRoads.length} Arterials</div>
            </div>
            <div className="bg-slate-950/70 p-2.5 rounded-xl border border-white/[0.06]">
              <div className="text-[9px] text-slate-400 uppercase font-semibold">Threatened Facilities</div>
              <div className="font-bold text-amber-400 text-base mt-0.5">{floodedHospitals.length} Centers</div>
            </div>
          </div>

          <div className="space-y-3 bg-slate-950/50 p-4 rounded-xl border border-white/[0.06] leading-relaxed text-slate-300">
            <div>
              <h4 className="font-bold text-slate-100 uppercase text-[11px] mb-1">
                1. Executive Geospatial Summary:
              </h4>
              <p>
                Severe Cyclonic Storm AMRIT is situated approximately 42km offshore moving NNW towards the Puri-Konark
                coastal belt. Active hydrodynamic surge modeling calculates +{surgeHeight.toFixed(1)}m water elevation,
                inundating low-lying agricultural estuaries and severing the critical Puri-Konark Marine Drive.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-slate-100 uppercase text-[11px] mb-1">
                2. Autonomous Lifeline Rerouting Status:
              </h4>
              <p>
                Direct coastal route is rendered non-viable due to a 2.4m culvert washout at Km 22. All emergency medical
                convoys and heavy fuel tenders have been redirected through the Pipili-Nimapada-Gop High Ridge Corridor
                (+6.5m elevation margin, zero flood ingress).
              </p>
            </div>

            <div>
              <h4 className="font-bold text-slate-100 uppercase text-[11px] mb-1">
                3. Critical Life-Support Priority:
              </h4>
              <p>
                Konark Emergency Trauma Care generator room has been breached. Facility possesses approximately 6 hours
                of secondary battery backup. Mobile 250kVA generator dispatch underway with police escort.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between p-4 bg-slate-950/80 border-t border-white/[0.08]">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Certified by Automated Crisis Incident Command</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied' : 'Copy Text'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition shadow-md shadow-cyan-500/20"
            >
              <Printer className="w-4 h-4" />
              <span>Print Bulletin</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
