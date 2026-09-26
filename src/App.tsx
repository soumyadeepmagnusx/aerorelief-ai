import React, { useState, useMemo } from 'react';
import { 
  INITIAL_TELEMETRY, 
  INITIAL_INFRASTRUCTURE, 
  ROAD_SEGMENTS 
} from './data/disasterData';
import { GlobalDisasterScenario, GLOBAL_SCENARIOS } from './data/globalScenarios';
import { InfrastructureNode } from './types/disaster';
import { calculateLifelineRoutes } from './services/routingEngine';
import { Header, ActiveTabType } from './components/Header';
import { MapView } from './components/MapView';
import { SurgeControl } from './components/SurgeControl';
import { RoutingPanel } from './components/RoutingPanel';
import { GeminiDamageTriage } from './components/GeminiDamageTriage';
import { InfrastructurePanel } from './components/InfrastructurePanel';
import { SatelliteSwipeCompare } from './components/SatelliteSwipeCompare';
import { GridBlackoutSimulator } from './components/GridBlackoutSimulator';
import { SOSMeshNetwork } from './components/SOSMeshNetwork';
import { VoiceCommander } from './components/VoiceCommander';
import { ElevationCrossSection } from './components/ElevationCrossSection';
import { SatelliteOrbitTracker } from './components/SatelliteOrbitTracker';
import { AutoPilotTourModal } from './components/AutoPilotTourModal';
import { SitrepModal } from './components/SitrepModal';
import { AudioAlertModal } from './components/AudioAlertModal';
import { DataSourceModal } from './components/DataSourceModal';
import { ParametricInsurancePanel } from './components/ParametricInsurancePanel';
import { PredictiveTimelineScrubber } from './components/PredictiveTimelineScrubber';
import { DISASTER_TIMELINE_STEPS } from './data/timelineData';
import { fetchLiveAtmosphericTelemetry } from './services/liveDataService';
import { Navigation, Building2, Sparkles, ExternalLink } from 'lucide-react';
import { sound } from './services/soundFx';

export function App() {
  const [activeScenario, setActiveScenario] = useState<GlobalDisasterScenario>(GLOBAL_SCENARIOS[0]);
  const [telemetry, setTelemetry] = useState(INITIAL_TELEMETRY);
  const [surgeHeight, setSurgeHeight] = useState<number>(3.4);
  const [infrastructure] = useState<InfrastructureNode[]>(INITIAL_INFRASTRUCTURE);
  const [selectedDestination, setSelectedDestination] = useState<InfrastructureNode | null>(
    INITIAL_INFRASTRUCTURE[1] // Default: Konark Emergency Trauma Care
  );
  const [activeTab, setActiveTab] = useState<ActiveTabType>('map');
  const [isSitrepOpen, setIsSitrepOpen] = useState(false);
  const [isAudioAlertOpen, setIsAudioAlertOpen] = useState(false);
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [isDataSourceModalOpen, setIsDataSourceModalOpen] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [apiKey, setApiKey] = useState<string>('');

  // Live Data & Offline Defense Modes
  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(false);
  const [isLiveApiActive, setIsLiveApiActive] = useState<boolean>(true);
  const [isTelemetryLive, setIsTelemetryLive] = useState<boolean>(false);

  // 4D Predictive Disaster Timeline State
  const [timelineStepIndex, setTimelineStepIndex] = useState<number>(2); // Default T-02:00 Pre-landfall
  const [isTimelinePlaying, setIsTimelinePlaying] = useState<boolean>(false);
  const [timelineSpeed, setTimelineSpeed] = useState<number>(1);

  // Synchronize 4D Timeline playback
  React.useEffect(() => {
    if (!isTimelinePlaying) return;

    const intervalTime = Math.round(3000 / timelineSpeed);
    const timer = setInterval(() => {
      setTimelineStepIndex((prev) => {
        const next = prev + 1;
        if (next >= DISASTER_TIMELINE_STEPS.length) {
          setIsTimelinePlaying(false);
          return prev;
        }
        const step = DISASTER_TIMELINE_STEPS[next];
        if (step) {
          setSurgeHeight(step.surgeHeightMeters);
          setTelemetry((curr) => ({
            ...curr,
            windSpeedKmh: step.windSpeedKmh,
            centralPressureHpa: step.pressureHpa,
            surgeHeightMeters: step.surgeHeightMeters,
            landfallETA: step.label,
            affectedPopulation: step.affectedPopulation,
          }));
        }
        return next;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isTimelinePlaying, timelineSpeed]);

  const handleSelectTimelineStep = (idx: number) => {
    setTimelineStepIndex(idx);
    const step = DISASTER_TIMELINE_STEPS[idx];
    if (step) {
      setSurgeHeight(step.surgeHeightMeters);
      setTelemetry((prev) => ({
        ...prev,
        windSpeedKmh: step.windSpeedKmh,
        centralPressureHpa: step.pressureHpa,
        surgeHeightMeters: step.surgeHeightMeters,
        landfallETA: step.label,
        affectedPopulation: step.affectedPopulation,
      }));
    }
  };

  const currentTimelineStep = DISASTER_TIMELINE_STEPS[timelineStepIndex] || DISASTER_TIMELINE_STEPS[2];

  // Live Meteorological Sync with Graceful Fallback
  React.useEffect(() => {
    if (isOfflineMode || !isLiveApiActive) {
      setIsTelemetryLive(false);
      setTelemetry((prev) => ({
        ...prev,
        windSpeedKmh: activeScenario.windSpeedKmh,
        centralPressureHpa: activeScenario.pressureHpa,
      }));
      return;
    }

    let isMounted = true;
    const fetchLive = async () => {
      try {
        const atmo = await fetchLiveAtmosphericTelemetry(
          activeScenario.centerCoordinates[0],
          activeScenario.centerCoordinates[1],
          activeScenario.pressureHpa,
          activeScenario.windSpeedKmh
        );

        if (isMounted) {
          if (atmo.isLive) {
            setTelemetry((prev) => ({
              ...prev,
              windSpeedKmh: atmo.windSpeedKmh,
              centralPressureHpa: atmo.surfacePressureHpa,
            }));
            setIsTelemetryLive(true);
          } else {
            setIsTelemetryLive(false);
          }
        }
      } catch (err) {
        if (isMounted) setIsTelemetryLive(false);
      }
    };

    fetchLive();
    return () => {
      isMounted = false;
    };
  }, [activeScenario, isLiveApiActive, isOfflineMode]);

  const handleSelectScenario = (scen: GlobalDisasterScenario) => {
    setActiveScenario(scen);
    setSurgeHeight(scen.defaultSurgeM);
    setTelemetry({
      ...telemetry,
      cycloneName: scen.name.replace('Super ', '').split(' ')[1] || scen.name,
      category: scen.category,
      windSpeedKmh: scen.windSpeedKmh,
      centralPressureHpa: scen.pressureHpa,
      surgeHeightMeters: scen.defaultSurgeM,
      landfallETA: scen.landfallETA,
      affectedPopulation: scen.affectedPopulation,
    });
  };

  // Dynamically calculate dynamic road states based on surgeHeight
  const updatedRoads = useMemo(() => {
    return ROAD_SEGMENTS.map((road) => {
      const floodDepth = Math.max(0, Number((surgeHeight - road.baseElevationMeters).toFixed(2)));
      return {
        ...road,
        isSevered: floodDepth > 0.3,
        waterDepthMeters: floodDepth,
      };
    });
  }, [surgeHeight]);

  // Dynamically calculate route options based on surgeHeight
  const routingResult = useMemo(() => {
    return calculateLifelineRoutes({
      originId: 'hub-1',
      destinationId: selectedDestination ? selectedDestination.id : 'hosp-2',
      surgeHeightMeters: surgeHeight,
    });
  }, [surgeHeight, selectedDestination]);

  // Dynamic impact metrics
  const inundatedAreaSqKm = useMemo(() => 14.5 + surgeHeight * 19.8, [surgeHeight]);

  const severedRoadsKm = useMemo(() => {
    return updatedRoads
      .filter((r) => r.isSevered)
      .reduce((sum, r) => sum + r.lengthKm, 0);
  }, [updatedRoads]);

  const offlineSubstationsCount = useMemo(() => {
    return infrastructure.filter(
      (n) => n.type === 'substation' && surgeHeight - n.elevationMeters > 0.2
    ).length;
  }, [infrastructure, surgeHeight]);

  const handleSelectNode = (node: InfrastructureNode) => {
    sound.click();
    setSelectedDestination(node);
  };

  const handleNavigateToNode = (node: InfrastructureNode) => {
    sound.tabSwitch();
    setSelectedDestination(node);
    setActiveTab('routing');
  };

  return (
    <div className="min-h-screen bg-[#06080d] text-slate-100 flex flex-col font-sans select-none">
      {/* Tactical Top Header */}
      <Header
        telemetry={telemetry}
        activeSurge={surgeHeight}
        onOpenSitrep={() => setIsSitrepOpen(true)}
        onOpenAudioAlert={() => setIsAudioAlertOpen(true)}
        onOpenTour={() => setIsTourOpen(true)}
        isAudioMuted={isAudioMuted}
        onToggleAudioMute={() => {
          sound.enabled = isAudioMuted;
          setIsAudioMuted(!isAudioMuted);
        }}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        apiKey={apiKey}
        setApiKey={setApiKey}
        activeScenario={activeScenario}
        onSelectScenario={handleSelectScenario}
        isOfflineMode={isOfflineMode}
        onToggleOfflineMode={() => {
          setIsOfflineMode(!isOfflineMode);
          if (!isOfflineMode) {
            setIsLiveApiActive(false);
          }
        }}
        isLiveApiActive={isLiveApiActive}
        onToggleLiveApi={() => {
          if (isOfflineMode) setIsOfflineMode(false);
          setIsLiveApiActive(!isLiveApiActive);
        }}
        onOpenDataSourceModal={() => setIsDataSourceModalOpen(true)}
        isTelemetryLive={isTelemetryLive}
      />

      {/* Main Workspace Body */}
      <main className="flex-1 p-3.5 sm:p-5 max-w-[1850px] w-full mx-auto space-y-4">
        {activeTab === 'map' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-[620px]">
              {/* Map Canvas (8 cols on large screens) */}
              <div className="lg:col-span-8 h-[620px] flex flex-col">
                <MapView
                  infrastructure={infrastructure}
                  roads={updatedRoads}
                  surgeHeight={surgeHeight}
                  activeRoute={routingResult.activeRoute}
                  selectedDestination={selectedDestination}
                  onSelectNode={handleSelectNode}
                  onNavigateToNode={handleNavigateToNode}
                  cycloneEyeCoordinates={currentTimelineStep.eyeCoordinates}
                />
              </div>

              {/* Right Tactical Dock (4 cols) */}
              <div className="lg:col-span-4 flex flex-col space-y-3.5">
                {/* Hands-Free Voice Tactical Ops */}
                <VoiceCommander
                  onSetSurge={(val) => setSurgeHeight(val)}
                  onSetTab={(tab) => setActiveTab(tab)}
                  onTriggerSiren={() => setIsAudioAlertOpen(true)}
                  onOpenSitrep={() => setIsSitrepOpen(true)}
                />

                {/* Surge Physics Slider */}
                <SurgeControl
                  surgeHeight={surgeHeight}
                  setSurgeHeight={setSurgeHeight}
                  inundatedAreaSqKm={inundatedAreaSqKm}
                  severedRoadsKm={severedRoadsKm}
                  offlineSubstationsCount={offlineSubstationsCount}
                />

                {/* Dynamic Lifeline Route Snapshot */}
                <div className="glass-panel rounded-2xl p-4 shadow-xl font-mono text-xs border border-white/[0.08]">
                  <div className="flex items-center justify-between border-b border-white/[0.08] pb-2.5 mb-2.5">
                    <div className="flex items-center gap-2 font-bold text-slate-100">
                      <Navigation className="w-4 h-4 text-cyan-400" />
                      <span>Active Lifeline Route Corridor</span>
                    </div>
                    <button
                      onClick={() => {
                        sound.click();
                        setActiveTab('routing');
                      }}
                      className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-bold transition"
                    >
                      <span>Inspect</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="space-y-2 text-[11px]">
                    <div className="text-slate-200 font-bold">{routingResult.activeRoute.name}</div>
                    <div className="flex justify-between text-slate-400 bg-slate-950/60 p-2 rounded-xl border border-white/[0.04]">
                      <span>Distance: <strong className="text-slate-200">{routingResult.activeRoute.distanceKm} km</strong></span>
                      <span className="text-cyan-300 font-black">Est. {routingResult.activeRoute.estimatedMinutes} mins</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950/80 border border-white/[0.06] text-[10px] text-slate-300 leading-relaxed">
                      {routingResult.recommendation}
                    </div>
                  </div>
                </div>

                {/* Target Node Quick Inspection */}
                {selectedDestination && (
                  <div className="glass-panel rounded-2xl p-4 shadow-xl font-mono text-xs border border-white/[0.08]">
                    <div className="flex items-center justify-between border-b border-white/[0.08] pb-2.5 mb-2.5">
                      <div className="flex items-center gap-2 font-bold text-rose-300">
                        <Building2 className="w-4 h-4 text-rose-400" />
                        <span className="truncate">{selectedDestination.name}</span>
                      </div>
                      <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded-md bg-slate-800 border border-white/[0.08] text-slate-300">
                        {selectedDestination.type}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-[11px] text-slate-300 bg-slate-950/60 p-2.5 rounded-xl border border-white/[0.04]">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Ground Elevation:</span>
                        <span className="font-bold text-cyan-300">+{selectedDestination.elevationMeters}m MSL</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Water Surge Ingress:</span>
                        <span className={`font-bold ${
                          surgeHeight > selectedDestination.elevationMeters ? 'text-red-400' : 'text-emerald-400'
                        }`}>
                          {surgeHeight > selectedDestination.elevationMeters
                            ? `+${(surgeHeight - selectedDestination.elevationMeters).toFixed(1)}m Breach`
                            : '0.0m (Dry)'}
                        </span>
                      </div>
                      {selectedDestination.generatorFuelHours && (
                        <div className="flex justify-between">
                          <span className="text-slate-400">Backup Generator:</span>
                          <span className="font-bold text-amber-300">{selectedDestination.generatorFuelHours} hrs remaining</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => {
                          sound.click();
                          setActiveTab('triage');
                        }}
                        className="flex-1 py-2 rounded-xl bg-purple-600/25 hover:bg-purple-600/35 border border-purple-500/40 text-purple-200 text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Recon Drone</span>
                      </button>

                      <button
                        onClick={() => {
                          sound.click();
                          setActiveTab('routing');
                        }}
                        className="flex-1 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs transition flex items-center justify-center gap-1.5 shadow-md shadow-cyan-500/20"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        <span>Route Convoy</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 4D Predictive Disaster Timeline Scrubber (60-Hour Temporal Sim) */}
            <PredictiveTimelineScrubber
              currentStepIndex={timelineStepIndex}
              onSelectStepIndex={handleSelectTimelineStep}
              isPlaying={isTimelinePlaying}
              onTogglePlay={() => setIsTimelinePlaying(!isTimelinePlaying)}
              playbackSpeed={timelineSpeed}
              onChangeSpeed={(s) => setTimelineSpeed(s)}
            />

            {/* Bottom Geospatial Digital Twin Section: Elevation Profile + Satellite Orbit Tracker */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-7">
                <ElevationCrossSection surgeHeight={surgeHeight} />
              </div>
              <div className="lg:col-span-5">
                <SatelliteOrbitTracker />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'anticipatory' && (
          <div className="max-w-6xl mx-auto">
            <ParametricInsurancePanel
              surgeHeight={surgeHeight}
              windSpeedKmh={telemetry.windSpeedKmh}
              inundatedAreaSqKm={inundatedAreaSqKm}
              affectedPopulation={telemetry.affectedPopulation}
            />
          </div>
        )}

        {activeTab === 'routing' && (
          <div className="max-w-5xl mx-auto">
            <RoutingPanel
              activeRoute={routingResult.activeRoute}
              alternativeRoute={routingResult.alternativeRoute}
              isDirectSevered={routingResult.isDirectSevered}
              recommendation={routingResult.recommendation}
              destinationNode={selectedDestination}
              onSelectAlternative={() => {
                sound.click();
                setActiveTab('map');
              }}
              surgeHeight={surgeHeight}
            />
          </div>
        )}

        {activeTab === 'triage' && (
          <div className="max-w-6xl mx-auto">
            <GeminiDamageTriage
              apiKey={apiKey}
              surgeHeight={surgeHeight}
              severedRoadsCount={updatedRoads.filter((r) => r.isSevered).length}
            />
          </div>
        )}

        {activeTab === 'satellite' && (
          <div className="max-w-6xl mx-auto">
            <SatelliteSwipeCompare />
          </div>
        )}

        {activeTab === 'grid' && (
          <div className="max-w-6xl mx-auto">
            <GridBlackoutSimulator
              infrastructure={infrastructure}
              surgeHeight={surgeHeight}
            />
          </div>
        )}

        {activeTab === 'sos' && (
          <div className="max-w-6xl mx-auto">
            <SOSMeshNetwork />
          </div>
        )}

        {activeTab === 'infrastructure' && (
          <div className="max-w-6xl mx-auto">
            <InfrastructurePanel
              infrastructure={infrastructure}
              surgeHeight={surgeHeight}
              onFocusNode={(node) => {
                handleSelectNode(node);
                setActiveTab('map');
              }}
              onRouteToNode={handleNavigateToNode}
            />
          </div>
        )}
      </main>

      {/* Guided Hackathon Pitch Tour Walkthrough Modal */}
      <AutoPilotTourModal
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
        onSetTab={(tab) => setActiveTab(tab)}
        onSetSurge={(val) => setSurgeHeight(val)}
      />

      {/* Floating Sitrep & Audio Modals */}
      <SitrepModal
        isOpen={isSitrepOpen}
        onClose={() => setIsSitrepOpen(false)}
        telemetry={telemetry}
        surgeHeight={surgeHeight}
        infrastructure={infrastructure}
        roads={updatedRoads}
      />

      <AudioAlertModal
        isOpen={isAudioAlertOpen}
        onClose={() => setIsAudioAlertOpen(false)}
        surgeHeight={surgeHeight}
      />

      {/* Transparent Data & Model Governance Modal */}
      <DataSourceModal
        isOpen={isDataSourceModalOpen}
        onClose={() => setIsDataSourceModalOpen(false)}
        isOfflineMode={isOfflineMode}
        onToggleOfflineMode={() => {
          setIsOfflineMode(!isOfflineMode);
          if (!isOfflineMode) setIsLiveApiActive(false);
        }}
        isLiveApiActive={isLiveApiActive}
        onToggleLiveApi={() => {
          if (isOfflineMode) setIsOfflineMode(false);
          setIsLiveApiActive(!isLiveApiActive);
        }}
      />
    </div>
  );
}

export default App;
