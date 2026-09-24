import React, { useState } from 'react';
import { TelemetryData } from '../types/disaster';
import { GlobalDisasterScenario, GLOBAL_SCENARIOS } from '../data/globalScenarios';
import { sound } from '../services/soundFx';
import { 
  ShieldAlert, 
  Wind, 
  Gauge, 
  Waves, 
  Users, 
  Clock, 
  Radio, 
  FileText, 
  Volume2, 
  VolumeX, 
  Key, 
  SplitSquareVertical, 
  Zap, 
  Activity, 
  Navigation, 
  Eye, 
  Building2,
  Globe,
  Play,
  ChevronDown,
  Database,
  ShieldCheck,
  Banknote
} from 'lucide-react';

export type ActiveTabType = 'map' | 'anticipatory' | 'routing' | 'triage' | 'infrastructure' | 'satellite' | 'grid' | 'sos';

interface HeaderProps {
  telemetry: TelemetryData;
  activeSurge: number;
  onOpenSitrep: () => void;
  onOpenAudioAlert: () => void;
  onOpenTour: () => void;
  isAudioMuted: boolean;
  onToggleAudioMute: () => void;
  activeTab: ActiveTabType;
  setActiveTab: (tab: ActiveTabType) => void;
  apiKey: string;
  setApiKey: (key: string) => void;
  activeScenario: GlobalDisasterScenario;
  onSelectScenario: (scen: GlobalDisasterScenario) => void;
  isOfflineMode: boolean;
  onToggleOfflineMode: () => void;
  isLiveApiActive: boolean;
  onToggleLiveApi: () => void;
  onOpenDataSourceModal: () => void;
  isTelemetryLive: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  telemetry,
  activeSurge,
  onOpenSitrep,
  onOpenAudioAlert,
  onOpenTour,
  isAudioMuted,
  onToggleAudioMute,
  activeTab,
  setActiveTab,
  apiKey,
  setApiKey,
  activeScenario,
  onSelectScenario,
  isOfflineMode,
  onToggleOfflineMode,
  isLiveApiActive,
  onToggleLiveApi,
  onOpenDataSourceModal,
  isTelemetryLive,
}) => {
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [showScenarioMenu, setShowScenarioMenu] = useState(false);

  const handleTabClick = (tab: ActiveTabType) => {
    sound.tabSwitch();
    setActiveTab(tab);
  };

  return (
    <header className="glass-panel border-b border-white/[0.08] text-white select-none sticky top-0 z-50 shadow-2xl backdrop-blur-2xl">
      {/* Top Incident Command Banner */}
      <div className="flex flex-wrap items-center justify-between px-4 sm:px-6 py-2 border-b border-white/[0.06] bg-gradient-to-r from-red-950/30 via-slate-900/60 to-cyan-950/30">
        <div className="flex items-center space-x-3.5">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-red-500/20 to-rose-600/10 border border-red-500/40 shadow-lg shadow-red-500/10">
            <ShieldAlert className="w-5 h-5 text-red-400 animate-pulse" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center space-x-2.5">
              <h1 className="text-base sm:text-lg font-black tracking-wider text-slate-100 flex items-center gap-1.5 font-mono">
                AERORELIEF <span className="text-cyan-400 font-extrabold drop-shadow-[0_0_12px_rgba(6,182,212,0.6)]">GEOTWIN 3D</span>
              </h1>
              <span className="px-2 py-0.5 text-[9px] font-extrabold tracking-widest uppercase bg-red-500/20 border border-red-500/60 text-red-400 rounded-md shadow-sm">
                DEFCON 2 • CRISIS OPS
              </span>

              {/* Global Scenario Selector Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowScenarioMenu(!showScenarioMenu)}
                  className="flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-bold rounded-md bg-slate-800/80 hover:bg-slate-700 border border-white/[0.1] text-cyan-300 transition"
                  title="Switch Global Disaster Theaters"
                >
                  <Globe className="w-3 h-3 text-cyan-400" />
                  <span>{activeScenario.name}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {showScenarioMenu && (
                  <div className="absolute left-0 mt-2 w-72 bg-slate-900/95 backdrop-blur-xl border border-slate-700 p-2 rounded-xl shadow-2xl z-50 text-xs">
                    <p className="text-[10px] text-slate-400 uppercase font-bold px-2 py-1">
                      Select Planetary Disaster Theater:
                    </p>
                    {GLOBAL_SCENARIOS.map((scen) => (
                      <button
                        key={scen.id}
                        onClick={() => {
                          onSelectScenario(scen);
                          setShowScenarioMenu(false);
                          sound.click();
                        }}
                        className={`w-full text-left p-2 rounded-lg transition text-xs font-mono mb-1 ${
                          activeScenario.id === scen.id
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                            : 'text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <div className="font-bold flex items-center justify-between">
                          <span>{scen.name}</span>
                          <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-red-950 text-red-400">
                            {scen.category}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400">{scen.badge}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <p className="text-[11px] text-slate-400 font-mono tracking-tight">
              {activeScenario.theater}
            </p>
          </div>
        </div>

        {/* Action Controls & Tour */}
        <div className="flex flex-wrap items-center space-x-2 mt-2 sm:mt-0">
          {/* Data & Model Governance Button */}
          <button
            onClick={() => {
              sound.click();
              onOpenDataSourceModal();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold font-mono rounded-lg bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-500/50 text-cyan-300 transition shadow-sm"
            title="Inspect Data Provenance, AI Models & Benchmark Validation"
          >
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            <span>Data & Models</span>
          </button>

          {/* Venue Demo-Safe Mode Toggle */}
          <button
            onClick={() => {
              sound.click();
              onToggleOfflineMode();
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono rounded-lg border transition ${
              isOfflineMode
                ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 font-bold'
                : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:border-slate-500'
            }`}
            title="Toggle zero-network offline mode for conference pitch safety"
          >
            <ShieldCheck className={`w-3.5 h-3.5 ${isOfflineMode ? 'text-amber-400' : 'text-slate-400'}`} />
            <span>{isOfflineMode ? 'Safe Mode: ON' : 'Network Active'}</span>
          </button>

          {/* Live External Weather API Toggle */}
          <button
            onClick={() => {
              sound.click();
              onToggleLiveApi();
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono rounded-lg border transition ${
              isLiveApiActive
                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 font-bold'
                : 'bg-slate-800/80 border-slate-700 text-slate-400'
            }`}
            title="Switch between live Open-Meteo REST API and calibrated historical disaster baseline"
          >
            <span className={`w-2 h-2 rounded-full ${isLiveApiActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`}></span>
            <span>{isLiveApiActive ? 'Live Meteo' : 'Disaster Sim'}</span>
          </button>

          {/* Auto-Pilot Pitch Tour Button */}
          <button
            onClick={() => {
              sound.click();
              onOpenTour();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold font-mono rounded-lg bg-gradient-to-r from-purple-600/30 to-cyan-600/30 hover:from-purple-600/40 hover:to-cyan-600/40 border border-cyan-400/50 text-cyan-200 transition shadow-lg shadow-cyan-500/10 animate-pulse"
            title="Start automated 5-step hackathon pitch tour"
          >
            <Play className="w-3.5 h-3.5 fill-cyan-400 text-cyan-400" />
            <span>Pitch Tour</span>
          </button>

          <div className="relative">
            <button
              onClick={() => setShowKeyInput(!showKeyInput)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-300 transition hover:border-cyan-500/50"
              title="Configure API Gateway key"
            >
              <Key className="w-3.5 h-3.5 text-cyan-400" />
              <span>{apiKey ? 'Gemini: Connected' : 'Gemini Key'}</span>
            </button>
            {showKeyInput && (
              <div className="absolute right-0 mt-2 w-72 bg-slate-900/95 backdrop-blur-xl border border-slate-700 p-3.5 rounded-xl shadow-2xl z-50 text-xs">
                <p className="text-slate-200 mb-1 font-bold">Google Gemini 3.7 Flash Key</p>
                <p className="text-[11px] text-slate-400 mb-2.5 leading-relaxed">
                  Enter key for live Gemini 3.7 Flash multimodal inference or leave empty for calibrated xBD benchmark model.
                </p>
                <input
                  type="password"
                  placeholder="AIzaSy..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-400 font-mono mb-2.5"
                />
                <button
                  onClick={() => setShowKeyInput(false)}
                  className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold py-1.5 rounded-lg transition"
                >
                  Save Key
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => {
              sound.alert();
              onOpenAudioAlert();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold font-mono rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 transition"
          >
            <Radio className="w-3.5 h-3.5 animate-pulse text-amber-400" />
            <span className="hidden md:inline">Public Siren</span>
          </button>

          <button
            onClick={() => {
              sound.click();
              onToggleAudioMute();
            }}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 transition"
            title={isAudioMuted ? 'Unmute' : 'Mute'}
          >
            {isAudioMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>

          <button
            onClick={() => {
              sound.click();
              onOpenSitrep();
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold font-mono rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 transition shadow-lg shadow-cyan-500/20"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>SITREP-04</span>
          </button>
        </div>
      </div>

      {/* Telemetry HUD Bar with Transparent Data Provenance */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 px-4 sm:px-6 py-2 text-xs font-mono bg-slate-950/60 border-b border-white/[0.04] text-slate-300">
        <div className="flex items-center space-x-2 border-r border-white/[0.06] pr-2">
          <div className="p-1 rounded bg-cyan-500/10 text-cyan-400">
            <Wind className="w-3.5 h-3.5 shrink-0" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Sustained Wind</span>
              <span className={`text-[8px] px-1 py-0.2 rounded font-bold ${
                isTelemetryLive
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : 'bg-purple-500/20 text-purple-300'
              }`}>
                {isTelemetryLive ? 'LIVE' : 'SIM'}
              </span>
            </div>
            <div className="font-bold text-cyan-300">{telemetry.windSpeedKmh} km/h</div>
          </div>
        </div>

        <div className="flex items-center space-x-2 border-r border-white/[0.06] pr-2">
          <div className="p-1 rounded bg-amber-500/10 text-amber-400">
            <Gauge className="w-3.5 h-3.5 shrink-0" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Barometric Core</span>
              <span className={`text-[8px] px-1 py-0.2 rounded font-bold ${
                isTelemetryLive
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : 'bg-amber-500/20 text-amber-300'
              }`}>
                {isTelemetryLive ? 'OPEN-METEO' : 'IMD FANI'}
              </span>
            </div>
            <div className="font-bold text-amber-300">{telemetry.centralPressureHpa} hPa</div>
          </div>
        </div>

        <div className="flex items-center space-x-2 border-r border-white/[0.06] pr-2">
          <div className="p-1 rounded bg-blue-500/10 text-blue-400">
            <Waves className="w-3.5 h-3.5 shrink-0" />
          </div>
          <div>
            <div className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Active Surge</div>
            <div className="font-bold text-blue-300">+{activeSurge.toFixed(1)}m Tidal</div>
          </div>
        </div>

        <div className="flex items-center space-x-2 border-r border-white/[0.06] pr-2">
          <div className="p-1 rounded bg-red-500/10 text-red-400">
            <Users className="w-3.5 h-3.5 shrink-0" />
          </div>
          <div>
            <div className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Red-Zone Inhabitants</div>
            <div className="font-bold text-red-300">{(telemetry.affectedPopulation).toLocaleString()}</div>
          </div>
        </div>

        <div className="flex items-center space-x-2 border-r border-white/[0.06] pr-2">
          <div className="p-1 rounded bg-purple-500/10 text-purple-400">
            <Clock className="w-3.5 h-3.5 shrink-0" />
          </div>
          <div>
            <div className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Golden Window</div>
            <div className="font-bold text-purple-300">{telemetry.goldenHourRemaining}</div>
          </div>
        </div>

        <div className="flex items-center space-x-2 pr-2">
          <div className="p-1 rounded bg-emerald-500/10 text-emerald-400">
            <Radio className="w-3.5 h-3.5 shrink-0" />
          </div>
          <div>
            <div className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Landfall ETA</div>
            <div className="font-bold text-emerald-300">{telemetry.landfallETA}</div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs with Glowing Active Pill */}
      <div className="flex items-center space-x-1 px-4 sm:px-6 bg-slate-900/40 border-b border-white/[0.06] text-xs font-semibold overflow-x-auto py-1">
        <button
          onClick={() => handleTabClick('map')}
          className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap font-mono ${
            activeTab === 'map'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/10'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
          <span>3D Digital Twin</span>
        </button>

        <button
          onClick={() => handleTabClick('anticipatory')}
          className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap font-mono ${
            activeTab === 'anticipatory'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm shadow-emerald-500/10'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Anticipatory & Parametric Liquidity</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-0.5"></span>
        </button>

        <button
          onClick={() => handleTabClick('routing')}
          className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap font-mono ${
            activeTab === 'routing'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm shadow-emerald-500/10'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Navigation className="w-3.5 h-3.5 text-emerald-400" />
          <span>Lifeline Routing</span>
        </button>

        <button
          onClick={() => handleTabClick('triage')}
          className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap font-mono ${
            activeTab === 'triage'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm shadow-purple-500/10'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Eye className="w-3.5 h-3.5 text-purple-400" />
          <span>Gemini Damage AI</span>
        </button>

        <button
          onClick={() => handleTabClick('satellite')}
          className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap font-mono ${
            activeTab === 'satellite'
              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow-sm shadow-blue-500/10'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <SplitSquareVertical className="w-3.5 h-3.5 text-blue-400" />
          <span>SAR Swipe Triage</span>
        </button>

        <button
          onClick={() => handleTabClick('grid')}
          className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap font-mono ${
            activeTab === 'grid'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm shadow-amber-500/10'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>Grid SCADA Outages</span>
        </button>

        <button
          onClick={() => handleTabClick('sos')}
          className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap font-mono ${
            activeTab === 'sos'
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm shadow-rose-500/10'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
          <span>Citizen SOS Mesh</span>
        </button>

        <button
          onClick={() => handleTabClick('infrastructure')}
          className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap font-mono ${
            activeTab === 'infrastructure'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm shadow-amber-500/10'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Building2 className="w-3.5 h-3.5 text-amber-400" />
          <span>Hospitals & Substations</span>
        </button>
      </div>
    </header>
  );
};
