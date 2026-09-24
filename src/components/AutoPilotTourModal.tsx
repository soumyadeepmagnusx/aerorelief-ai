import React, { useState } from 'react';
import { Play, ArrowRight, ArrowLeft, X, Sparkles, CheckCircle2, ShieldAlert } from 'lucide-react';
import { ActiveTabType } from './Header';
import { sound } from '../services/soundFx';

interface AutoPilotTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSetTab: (tab: ActiveTabType) => void;
  onSetSurge: (surge: number) => void;
}

export const AutoPilotTourModal: React.FC<AutoPilotTourModalProps> = ({
  isOpen,
  onClose,
  onSetTab,
  onSetSurge,
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const tourSteps = [
    {
      title: 'Step 1: 4D Digital Twin & Predictive Landfall Scrubber',
      tab: 'map' as ActiveTabType,
      action: () => onSetSurge(3.4),
      talkingPoint:
        'When Super Cyclone AMRIT strikes, commanders cannot afford to guess. Using our 4D Predictive Timeline Scrubber below the map, watch as the cyclone eye glides across the Bay of Bengal, surge water rises from 0.8m to 4.4m, and Marine Drive is severed under 2.0m of seawater.',
      highlight: 'Notice the dynamic cyclone eye track movement, 4D temporal slider, and wind vortex streamlines.',
    },
    {
      title: 'Step 2: Autonomous Lifeline Routing Engine',
      tab: 'routing' as ActiveTabType,
      action: () => {},
      talkingPoint:
        'Instead of sending emergency convoys down a submerged highway where ambulances will drown, our flood-penalized graph pathfinder automatically re-routes rescue convoys through the Pipili-Gop High Ridge at +7.8m elevation—guaranteeing 100% dry, safe passage.',
      highlight: 'Compares direct severed arterial vs high-ridge bypass with turn-by-turn NDRF waypoints.',
    },
    {
      title: 'Step 3: Google Gemini 2.5 Flash Damage AI & xBD Benchmarks',
      tab: 'triage' as ActiveTabType,
      action: () => {},
      talkingPoint:
        'In 850 milliseconds, Google Gemini 2.5 Flash performs zero-shot structural inspection—evaluating rooftop shear, estimating ground floodlines, and outputting structured JSON rescue orders. Validated against the xBD satellite dataset with 86.1% macro F1.',
      highlight: 'Zero-shot multimodal damage classification, xBD confusion matrix drawer, and tactical commander copilot.',
    },
    {
      title: 'Step 4: Sentinel-1 SAR Split-Screen Swipe Triage',
      tab: 'satellite' as ActiveTabType,
      action: () => {},
      talkingPoint:
        'Dual-pane radar change detection allows commanders to drag between pre-event optical imagery and post-landfall Sentinel-1 C-Band SAR radar. It automatically calculates 68.4 sq km of inundated delta and 14 severed structures.',
      highlight: 'Interactive swipe handle revealing open water backscatter reflection.',
    },
    {
      title: 'Step 5: Cascading SCADA Blackout & Citizen SOS',
      tab: 'grid' as ActiveTabType,
      action: () => {},
      talkingPoint:
        'When the coastal 132kV switchyard floods, SCADA circuits trip, cutting power to 48,000 citizens and forcing hospitals into emergency Island Mode. Simultaneously, our LoRa mesh ingests rooftop citizen SOS pings, dispatching autonomous heavy-lift payload drones.',
      highlight: 'Cascading power grid failure simulation and rooftop drone air-drop dispatch.',
    },
  ];

  const handleNext = () => {
    sound.click();
    if (currentStep < tourSteps.length - 1) {
      const nextIdx = currentStep + 1;
      setCurrentStep(nextIdx);
      onSetTab(tourSteps[nextIdx].tab);
      tourSteps[nextIdx].action();
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    sound.click();
    if (currentStep > 0) {
      const prevIdx = currentStep - 1;
      setCurrentStep(prevIdx);
      onSetTab(tourSteps[prevIdx].tab);
      tourSteps[prevIdx].action();
    }
  };

  const step = tourSteps[currentStep];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <div className="glass-panel border border-cyan-500/40 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden font-mono text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-slate-950/80 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-md bg-cyan-500/20 text-cyan-400">
              <Play className="w-4 h-4 fill-cyan-400" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
                Executive Hackathon Pitch Tour (Step {currentStep + 1} of {tourSteps.length})
              </h2>
              <p className="text-[10px] text-slate-400">Guided Presentation for Global Evaluation</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-slate-800 text-slate-400 transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-3.5 text-xs">
          <div className="flex items-center justify-between text-cyan-300 font-bold border-b border-white/[0.06] pb-2">
            <span>{step.title}</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30 text-cyan-300">
              Active Module: {step.tab.toUpperCase()}
            </span>
          </div>

          <div className="p-3.5 bg-slate-950/70 rounded-xl border border-white/[0.06] leading-relaxed text-slate-200 text-[11px]">
            <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
              What to Say to the Judges:
            </span>
            "{step.talkingPoint}"
          </div>

          <div className="p-2.5 bg-cyan-950/30 rounded-xl border border-cyan-500/20 text-[10px] text-cyan-200 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span><strong>Demo Highlight:</strong> {step.highlight}</span>
          </div>

          {/* Progress dots */}
          <div className="flex justify-center gap-1.5 pt-2">
            {tourSteps.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === currentStep ? 'w-8 bg-cyan-400' : 'w-2 bg-slate-700'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 bg-slate-950/80 border-t border-white/[0.08]">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition disabled:opacity-40"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>

          <button
            onClick={handleNext}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs transition shadow-md shadow-cyan-500/20"
          >
            <span>{currentStep === tourSteps.length - 1 ? 'Complete Pitch' : 'Next Step'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
