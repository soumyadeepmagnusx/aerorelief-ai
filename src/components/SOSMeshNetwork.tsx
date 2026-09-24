import React, { useState } from 'react';
import { SOS_BEACONS } from '../data/disasterData';
import { SOSBeacon } from '../types/disaster';
import { Radio, Users, Waves, PackageCheck, Send, CheckCircle2, ShieldAlert, Navigation } from 'lucide-react';

export const SOSMeshNetwork: React.FC = () => {
  const [beacons, setBeacons] = useState<SOSBeacon[]>(SOS_BEACONS);
  const [activeDroneDelivery, setActiveDroneDelivery] = useState<string | null>(null);

  const handleDispatchDrone = (beaconId: string, payloadType: string) => {
    setActiveDroneDelivery(beaconId);

    setTimeout(() => {
      setBeacons((prev) =>
        prev.map((b) =>
          b.id === beaconId
            ? { ...b, isResolved: true, dronePayloadAssigned: payloadType }
            : b
        )
      );
      setActiveDroneDelivery(null);
    }, 2800);
  };

  const totalMarooned = beacons.reduce((sum, b) => (!b.isResolved ? sum + b.personsCount : sum), 0);

  return (
    <div className="bg-slate-900/95 border border-slate-800 rounded-xl p-4 shadow-2xl font-mono text-slate-200 space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-400">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-100 flex items-center gap-2">
                Resilient Offline Citizen LoRa SOS Mesh Network
              </h2>
              <p className="text-[11px] text-slate-400">
                Direct-to-Satellite & P2P Mesh Beacon Ingestion with Autonomous Drone Payload Air-Drops
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-2.5 py-1 rounded bg-slate-950 border border-slate-700 text-slate-300">
            Active Distresses: <span className="text-rose-400 font-bold">{beacons.filter((b) => !b.isResolved).length}</span>
          </span>
          <span className="px-2.5 py-1 rounded bg-slate-950 border border-slate-700 text-slate-300">
            Marooned Citizens: <span className="text-amber-400 font-bold">{totalMarooned}</span>
          </span>
        </div>
      </div>

      {/* SOS Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {beacons.map((beacon) => (
          <div
            key={beacon.id}
            className={`p-3.5 rounded-xl border flex flex-col justify-between transition ${
              beacon.isResolved
                ? 'bg-slate-950/40 border-emerald-500/40 opacity-75'
                : 'bg-rose-950/20 border-rose-500/60 shadow-lg shadow-rose-950/30'
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h3 className="text-xs font-bold text-slate-100">{beacon.senderName}</h3>
                  <div className="text-[10px] text-slate-400">{beacon.locationName}</div>
                </div>

                <span
                  className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded ${
                    beacon.isResolved
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50'
                      : 'bg-red-600 text-white animate-pulse'
                  }`}
                >
                  {beacon.isResolved ? 'PAYLOAD DELIVERED' : 'CRITICAL SOS'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 my-2 bg-slate-900/80 p-2 rounded text-[11px] border border-slate-800">
                <div className="flex items-center gap-1.5 text-slate-300">
                  <Users className="w-3.5 h-3.5 text-amber-400" />
                  <span>{beacon.personsCount} Persons Trapped</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-300">
                  <Waves className="w-3.5 h-3.5 text-blue-400" />
                  <span>+{beacon.waterDepthMeters}m Surge</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-300 leading-relaxed mb-3">
                "{beacon.situation}"
              </p>

              <div className="text-[10px] text-slate-500 mb-3">
                Beacon Protocol: {beacon.timestamp} • Lat: {beacon.coordinates[0]}°, Lng: {beacon.coordinates[1]}°
              </div>
            </div>

            {/* Drone Dispatch Action */}
            <div className="pt-2 border-t border-slate-800">
              {beacon.isResolved ? (
                <div className="text-[11px] text-emerald-400 flex items-center gap-1.5 font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Air-Drop Complete: {beacon.dronePayloadAssigned}</span>
                </div>
              ) : (
                <button
                  onClick={() =>
                    handleDispatchDrone(
                      beacon.id,
                      beacon.id === 'sos-02' ? 'Insulin & Saline IV Kit' : 'Hypothermia Rations & Sat-Beacon'
                    )
                  }
                  disabled={activeDroneDelivery === beacon.id}
                  className={`w-full py-2 rounded text-xs font-bold font-mono transition flex items-center justify-center gap-2 ${
                    activeDroneDelivery === beacon.id
                      ? 'bg-cyan-900/60 text-cyan-300 cursor-wait'
                      : 'bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-slate-950 shadow-lg shadow-rose-600/20'
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>
                    {activeDroneDelivery === beacon.id
                      ? 'SkyLifter-02 Dropping Payload...'
                      : 'Dispatch Autonomous Drone Air-Drop'}
                  </span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
