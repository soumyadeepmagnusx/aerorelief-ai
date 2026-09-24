import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  RotateCcw, 
  Clock, 
  Wind, 
  Gauge, 
  Waves, 
  ShieldAlert, 
  Zap,
  Activity,
  Layers,
  ChevronRight
} from 'lucide-react';
import { DisasterTimelineStep, DISASTER_TIMELINE_STEPS } from '../data/timelineData';
import { sound } from '../services/soundFx';

interface PredictiveTimelineScrubberProps {
  currentStepIndex: number;
  onSelectStepIndex: (index: number) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  playbackSpeed: number;
  onChangeSpeed: (speed: number) => void;
}

export const PredictiveTimelineScrubber: React.FC<PredictiveTimelineScrubberProps> = ({
  currentStepIndex,
  onSelectStepIndex,
  isPlaying,
  onTogglePlay,
  playbackSpeed,
  onChangeSpeed,
}) => {
  const currentStep = DISASTER_TIMELINE_STEPS[currentStepIndex] || DISASTER_TIMELINE_STEPS[2];

  const handlePrev = () => {
    sound.click();
    if (currentStepIndex > 0) {
      onSelectStepIndex(currentStepIndex - 1);
    }
  };

  const handleNext = () => {
    sound.click();
    if (currentStepIndex < DISASTER_TIMELINE_STEPS.length - 1) {
      onSelectStepIndex(currentStepIndex + 1);
    }
  };

  const handleStepClick = (index: number) => {
    sound.click();
    if (index === 3) sound.alert(); // Landfall step
    onSelectStepIndex(index);
  };

  const speedOptions = [1, 2, 4];

  return (
    <div className="glass-panel rounded-2xl p-4 sm:p-5 shadow-2xl font-mono text-slate-200 border border-cyan-500/30 bg-gradient-to-r from-slate-950 via-slate-900/90 to-cyan-950/20 space-y-4">
      
      {/* Top Header & Playback Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 shadow-lg shadow-cyan-500/10">
            <Clock className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-100 flex items-center gap-2">
                4D Predictive Landfall Timeline Scrubber
              </h3>
              <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border ${currentStep.badgeColor}`}>
                {currentStep.phaseBadge}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Temporal 60-Hour Disaster Progression • Dynamic Eye Motion, Surge Waves & Power Blackouts
            </p>
          </div>
        </div>

        {/* Playback Button Group */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Reset to baseline T-02:00 */}
          <button
            onClick={() => handleStepClick(2)}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-cyan-300 border border-white/[0.06] transition"
            title="Reset to T-02:00 Pre-Landfall Baseline"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Prev Keyframe */}
          <button
            onClick={handlePrev}
            disabled={currentStepIndex === 0}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-white/[0.06] transition disabled:opacity-40"
            title="Previous 6-Hour Keyframe"
          >
            <SkipBack className="w-3.5 h-3.5" />
          </button>

          {/* Play/Pause Button */}
          <button
            onClick={onTogglePlay}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-black text-xs transition shadow-lg ${
              isPlaying
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20 animate-pulse'
                : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/20'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-slate-950" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-slate-950" />
                <span>Auto-Simulate</span>
              </>
            )}
          </button>

          {/* Next Keyframe */}
          <button
            onClick={handleNext}
            disabled={currentStepIndex === DISASTER_TIMELINE_STEPS.length - 1}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-white/[0.06] transition disabled:opacity-40"
            title="Next 6-Hour Keyframe"
          >
            <SkipForward className="w-3.5 h-3.5" />
          </button>

          {/* Speed Toggle */}
          <div className="flex rounded-xl bg-slate-950/80 p-0.5 border border-white/[0.08] text-[10px]">
            {speedOptions.map((s) => (
              <button
                key={s}
                onClick={() => {
                  sound.click();
                  onChangeSpeed(s);
                }}
                className={`px-2 py-1 rounded-lg font-bold transition ${
                  playbackSpeed === s
                    ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Interactive Timeline Track with Keyframe Nodes */}
      <div className="space-y-2 pt-1">
        <div className="relative">
          {/* Background Connecting Line */}
          <div className="absolute top-1/2 left-0 right-0 h-1 -translate-y-1/2 bg-slate-800 rounded-full z-0"></div>

          {/* Progress Glowing Fill */}
          <div
            className="absolute top-1/2 left-0 h-1 -translate-y-1/2 bg-gradient-to-r from-cyan-500 via-amber-500 to-red-500 rounded-full z-0 transition-all duration-500"
            style={{
              width: `${(currentStepIndex / (DISASTER_TIMELINE_STEPS.length - 1)) * 100}%`,
            }}
          ></div>

          {/* Step Markers */}
          <div className="relative z-10 flex justify-between items-center">
            {DISASTER_TIMELINE_STEPS.map((step, idx) => {
              const isSelected = currentStepIndex === idx;
              const isPast = idx <= currentStepIndex;

              return (
                <button
                  key={step.id}
                  onClick={() => handleStepClick(idx)}
                  className="group flex flex-col items-center focus:outline-none transition-transform hover:scale-110"
                >
                  {/* Node Circle */}
                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${
                      isSelected
                        ? 'bg-cyan-400 text-slate-950 ring-4 ring-cyan-500/30 scale-125 shadow-lg shadow-cyan-400/40'
                        : isPast
                        ? 'bg-slate-900 border-2 border-cyan-400 text-cyan-300'
                        : 'bg-slate-900 border-2 border-slate-700 text-slate-500'
                    }`}
                  >
                    {step.timeOffsetHours === 0 ? '💥' : `${step.timeOffsetHours > 0 ? '+' : ''}${step.timeOffsetHours}h`}
                  </div>

                  {/* Label */}
                  <span
                    className={`mt-2 text-[9px] sm:text-[10px] font-bold tracking-tight text-center transition-colors ${
                      isSelected
                        ? 'text-cyan-300 font-extrabold'
                        : isPast
                        ? 'text-slate-300'
                        : 'text-slate-600'
                    }`}
                  >
                    {step.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Synchronized Temporal Metrics Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 pt-1 text-xs">
        <div className="p-2.5 rounded-xl bg-slate-950/80 border border-white/[0.06]">
          <div className="text-[9px] text-slate-400 uppercase font-semibold flex items-center gap-1">
            <Wind className="w-3 h-3 text-cyan-400" /> Eyewall Wind
          </div>
          <div className="text-sm font-black text-cyan-300 mt-0.5">{currentStep.windSpeedKmh} km/h</div>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-950/80 border border-white/[0.06]">
          <div className="text-[9px] text-slate-400 uppercase font-semibold flex items-center gap-1">
            <Gauge className="w-3 h-3 text-amber-400" /> Barometric Core
          </div>
          <div className="text-sm font-black text-amber-300 mt-0.5">{currentStep.pressureHpa} hPa</div>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-950/80 border border-white/[0.06]">
          <div className="text-[9px] text-slate-400 uppercase font-semibold flex items-center gap-1">
            <Waves className="w-3 h-3 text-blue-400" /> Storm Surge Height
          </div>
          <div className="text-sm font-black text-blue-300 mt-0.5">+{currentStep.surgeHeightMeters}m MSL</div>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-950/80 border border-white/[0.06]">
          <div className="text-[9px] text-slate-400 uppercase font-semibold flex items-center gap-1">
            <ShieldAlert className="w-3 h-3 text-red-400" /> Severed Corridors
          </div>
          <div className="text-sm font-black text-red-400 mt-0.5">
            {currentStep.severedRoadIds.length} Arterials
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-950/80 border border-white/[0.06]">
          <div className="text-[9px] text-slate-400 uppercase font-semibold flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-400" /> Substation Outages
          </div>
          <div className="text-sm font-black text-amber-400 mt-0.5">
            {currentStep.offlineSubstationIds.length} Stations
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-950/80 border border-white/[0.06]">
          <div className="text-[9px] text-slate-400 uppercase font-semibold flex items-center gap-1">
            <Activity className="w-3 h-3 text-purple-400" /> Eye Coordinates
          </div>
          <div className="text-[11px] font-black text-purple-300 mt-0.5 font-mono truncate">
            {currentStep.eyeCoordinates[0].toFixed(2)}°N, {currentStep.eyeCoordinates[1].toFixed(2)}°E
          </div>
        </div>
      </div>

      {/* Dynamic Tactical Directive Strip */}
      <div className="p-3 rounded-xl bg-slate-950/90 border border-white/[0.08] flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-start gap-2.5 max-w-4xl">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping mt-1.5 shrink-0"></div>
          <div>
            <div className="font-bold text-slate-100 flex items-center gap-2">
              <span>Phase: {currentStep.phaseTitle}</span>
              <span className="text-[10px] text-cyan-400">({currentStep.label})</span>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
              {currentStep.tacticalDirective}
            </p>
            <p className="text-[10px] text-emerald-400 font-bold mt-1">
              Directive: {currentStep.recommendedAction}
            </p>
          </div>
        </div>

        <div className="text-right shrink-0">
          <span className="text-[10px] text-slate-400 uppercase block font-semibold">Population at Risk</span>
          <span className="text-sm font-black text-red-300">
            {currentStep.affectedPopulation.toLocaleString()}
          </span>
        </div>
      </div>

    </div>
  );
};
