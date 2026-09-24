import React, { useState } from 'react';
import { Mic, Radio, Sparkles } from 'lucide-react';

interface VoiceCommanderProps {
  onSetSurge: (surge: number) => void;
  onSetTab: (tab: any) => void;
  onTriggerSiren: () => void;
  onOpenSitrep: () => void;
}

export const VoiceCommander: React.FC<VoiceCommanderProps> = ({
  onSetSurge,
  onSetTab,
  onTriggerSiren,
  onOpenSitrep,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [feedback, setFeedback] = useState('Standby for tactical voice directive...');

  const speakResponse = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utt = new SpeechSynthesisUtterance(text);
      utt.rate = 1.0;
      utt.pitch = 1.0;
      window.speechSynthesis.speak(utt);
    }
  };

  const executeCommand = (cmd: string) => {
    const lower = cmd.toLowerCase();

    if (lower.includes('surge') || lower.includes('water')) {
      if (lower.includes('four') || lower.includes('4')) {
        onSetSurge(4.0);
        setFeedback('Acknowledged: Setting storm surge level to +4.0 meters.');
        speakResponse('Storm surge adjusted to four point zero meters. High-ground ridge bypass engaged.');
      } else if (lower.includes('two') || lower.includes('2')) {
        onSetSurge(2.0);
        setFeedback('Acknowledged: Setting storm surge level to +2.0 meters.');
        speakResponse('Storm surge adjusted to two meters.');
      } else if (lower.includes('five') || lower.includes('5')) {
        onSetSurge(4.8);
        setFeedback('Maximum Cat-5 Inundation: +4.8 meters surge engaged.');
        speakResponse('Critical alert. Catastrophic five meter surge simulated.');
      } else {
        onSetSurge(3.4);
        setFeedback('Storm surge set to baseline Cat-4 landfall (+3.4m).');
        speakResponse('Surge reset to Cat four baseline.');
      }
      onSetTab('map');
      return;
    }

    if (lower.includes('route') || lower.includes('bypass') || lower.includes('convoy') || lower.includes('lifeline')) {
      onSetTab('routing');
      setFeedback('Navigating to Autonomous Lifeline Routing Engine.');
      speakResponse('Displaying high-ridge lifeline routing corridor.');
      return;
    }

    if (lower.includes('drone') || lower.includes('damage') || lower.includes('triage') || lower.includes('inspect')) {
      onSetTab('triage');
      setFeedback('Navigating to Autonomous Damage Triage Engine.');
      speakResponse('Opening aerial drone recon inspection.');
      return;
    }

    if (lower.includes('grid') || lower.includes('power') || lower.includes('blackout') || lower.includes('substation')) {
      onSetTab('grid');
      setFeedback('Navigating to Cascading Grid Blackout Simulator.');
      speakResponse('Displaying supervisory power grid telemetry.');
      return;
    }

    if (lower.includes('satellite') || lower.includes('swipe') || lower.includes('sar') || lower.includes('compare')) {
      onSetTab('satellite');
      setFeedback('Navigating to Sentinel SAR Split-Screen Swipe Triage.');
      speakResponse('Opening Sentinel-1 SAR change detection swipe.');
      return;
    }

    if (lower.includes('sos') || lower.includes('mesh') || lower.includes('trapped') || lower.includes('beacon')) {
      onSetTab('sos');
      setFeedback('Navigating to Citizen LoRa SOS Mesh Network.');
      speakResponse('Showing active rooftop citizen SOS beacons.');
      return;
    }

    if (lower.includes('siren') || lower.includes('alarm')) {
      onTriggerSiren();
      setFeedback('Civil defense warning siren triggered.');
      speakResponse('Sounding civil defense alarm.');
      return;
    }

    if (lower.includes('sitrep') || lower.includes('report') || lower.includes('minister')) {
      onOpenSitrep();
      setFeedback('Generating official NDMA Disaster SITREP.');
      speakResponse('Generating certified disaster situation report.');
      return;
    }

    setFeedback(`Tactical command not recognized: "${cmd}". Try: "Simulate 4 meter surge", "Show route", or "Open satellite".`);
  };

  const toggleListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      executeCommand('Simulate 4 meter surge');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setFeedback('Listening for tactical voice order...');
      };

      recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        setTranscript(text);
        executeCommand(text);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
        setFeedback('Mic ready. Click quick action chips below.');
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (e) {
      setIsListening(false);
      executeCommand('Simulate 4 meter surge');
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-3.5 shadow-2xl font-mono text-xs border border-white/[0.08]">
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-2.5 mb-2.5">
        <div className="flex items-center gap-2 font-bold text-slate-100">
          <div className="p-1 rounded-md bg-cyan-500/20 text-cyan-400">
            <Radio className="w-3.5 h-3.5" />
          </div>
          <span>Hands-Free Voice Tactical Ops</span>
        </div>

        <button
          onClick={toggleListening}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-bold transition-all shadow-md ${
            isListening
              ? 'bg-red-600 text-white animate-pulse shadow-red-500/30'
              : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/20'
          }`}
          title="Click to speak live disaster command"
        >
          <Mic className="w-3.5 h-3.5" />
          <span>{isListening ? 'Listening...' : 'Voice Order'}</span>
        </button>
      </div>

      <div className="p-2.5 rounded-xl bg-slate-950/70 border border-white/[0.06] text-[11px] text-cyan-300 min-h-[40px] flex items-center shadow-inner">
        {feedback}
      </div>

      {/* Quick Clickable Spoken Directive Chips */}
      <div className="flex gap-1.5 overflow-x-auto pt-2.5 text-[10px]">
        <button
          onClick={() => executeCommand('Simulate 4 meter surge')}
          className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-white/[0.06] whitespace-nowrap transition"
        >
          🗣️ "Simulate 4m surge"
        </button>
        <button
          onClick={() => executeCommand('Show routing')}
          className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-white/[0.06] whitespace-nowrap transition"
        >
          🗣️ "Reroute convoy"
        </button>
        <button
          onClick={() => executeCommand('Show satellite')}
          className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-white/[0.06] whitespace-nowrap transition"
        >
          🗣️ "SAR swipe compare"
        </button>
        <button
          onClick={() => executeCommand('Show grid')}
          className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-white/[0.06] whitespace-nowrap transition"
        >
          🗣️ "Grid blackout"
        </button>
      </div>
    </div>
  );
};
