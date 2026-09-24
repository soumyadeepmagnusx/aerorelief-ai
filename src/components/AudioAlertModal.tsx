import React, { useState, useEffect, useRef } from 'react';
import { X, Radio, Volume2, VolumeX, AlertTriangle, Play, Square, Globe } from 'lucide-react';

interface AudioAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  surgeHeight: number;
}

export const AudioAlertModal: React.FC<AudioAlertModalProps> = ({
  isOpen,
  onClose,
  surgeHeight,
}) => {
  const [isPlayingSiren, setIsPlayingSiren] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'hi' | 'or' | 'bn'>('en');
  const [isSpeaking, setIsSpeaking] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const intervalRef = useRef<number | null>(null);

  if (!isOpen) return null;

  const alerts = {
    en: `Emergency Alert. Severe Cyclone AMRIT Category 4 making landfall. Tidal storm surge expected at ${surgeHeight.toFixed(1)} meters. Marine Drive is submerged. All residents in coastal lowlands must evacuate to high-ground multipurpose shelters immediately.`,
    hi: `आपातकालीन चेतावनी। अत्यंत गंभीर चक्रवाती तूफान अमृत श्रेणी चार तट से टकरा रहा है। ज्वारीय तूफान का स्तर ${surgeHeight.toFixed(1)} मीटर तक पहुंचने की आशंका है। सभी तटीय निवासी तुरंत बहुउद्देशीय चक्रवात आश्रय में चले जाएं।`,
    or: `ଜରୁରୀକାଳୀନ ସତର୍କତା। ମହାବାତ୍ୟା ଅମୃତ ଲ୍ୟାଣ୍ଡଫଲ୍ କରୁଛି। ସମୁଦ୍ର ଜୁଆର ${surgeHeight.toFixed(1)} ମିଟର ଉଚ୍ଚତାକୁ ବୃଦ୍ଧି ପାଇଛି। ସମସ୍ତ ଉପକୂଳବାସୀ ତୁରନ୍ତ ନିକଟସ୍ଥ ବାତ୍ୟା ଆଶ୍ରୟସ୍ଥଳୀକୁ ଯାଆନ୍ତୁ।`,
    bn: `জরুরি সতর্কবার্তা। অত্যন্ত তীব্র ঘূর্ণিঝড় অমৃত উপকূলে আঘাত হানছে। জলোচ্ছ্বাসের উচ্চতা ${surgeHeight.toFixed(1)} মিটার অতিক্রম করতে পারে। উপকূলবর্তী সকল অধিবাসীকে অবিলম্বে নিরাপদ আশ্রয়কেন্দ্রে যাওয়ার নির্দেশ দেওয়া হচ্ছে।`,
  };

  const startSiren = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      gain.gain.value = 0.15; // Safe comfortable volume

      osc.connect(gain);
      gain.connect(ctx.destination);

      let high = false;
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.start();

      const interval = window.setInterval(() => {
        high = !high;
        if (osc) {
          osc.frequency.setValueAtTime(high ? 900 : 500, ctx.currentTime);
        }
      }, 500);

      audioCtxRef.current = ctx;
      oscRef.current = osc;
      gainRef.current = gain;
      intervalRef.current = interval;
      setIsPlayingSiren(true);
    } catch (e) {
      console.warn('Audio context initialization error:', e);
    }
  };

  const stopSiren = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (oscRef.current) {
      try {
        oscRef.current.stop();
        oscRef.current.disconnect();
      } catch (e) {}
      oscRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
    setIsPlayingSiren(false);
  };

  const handleSpeakBroadcast = () => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis not supported in this browser.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const text = alerts[selectedLanguage];
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    if (selectedLanguage === 'hi') utterance.lang = 'hi-IN';
    else if (selectedLanguage === 'bn') utterance.lang = 'bn-IN';
    else utterance.lang = 'en-IN';

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleClose = () => {
    stopSiren();
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setIsSpeaking(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-lg shadow-2xl overflow-hidden font-mono text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-amber-500 animate-pulse" />
            <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
              Emergency Public Siren & Audio Alert
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          {/* Civil Defense Siren Control */}
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 flex items-center justify-between">
            <div className="space-y-1">
              <span className="font-bold text-slate-200 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-400" /> Civil Defense Warning Siren
              </span>
              <p className="text-[10px] text-slate-400">
                Synthesized 500Hz/900Hz Dual-Tone Emergency Siren
              </p>
            </div>

            <button
              onClick={isPlayingSiren ? stopSiren : startSiren}
              className={`flex items-center gap-1.5 px-3 py-2 rounded font-bold transition text-xs ${
                isPlayingSiren
                  ? 'bg-red-600 text-white animate-pulse'
                  : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
              }`}
            >
              {isPlayingSiren ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isPlayingSiren ? 'Silence Siren' : 'Test Siren'}</span>
            </button>
          </div>

          {/* Multilingual Speech Broadcast */}
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-200 flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-cyan-400" /> Multilingual Citizen Radio Broadcast
              </span>
              <span className="text-[10px] text-slate-500 font-bold uppercase">TTS Engine</span>
            </div>

            {/* Language Selector */}
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { id: 'en', label: 'English' },
                { id: 'hi', label: 'Hindi' },
                { id: 'or', label: 'Odia' },
                { id: 'bn', label: 'Bengali' },
              ].map((lang) => (
                <button
                  key={lang.id}
                  onClick={() => setSelectedLanguage(lang.id as any)}
                  className={`py-1.5 rounded text-center transition font-bold text-xs ${
                    selectedLanguage === lang.id
                      ? 'bg-cyan-600 text-slate-950'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>

            {/* Script Preview */}
            <div className="p-3 bg-slate-900 rounded border border-slate-800 text-[11px] text-slate-300 leading-relaxed italic">
              "{alerts[selectedLanguage]}"
            </div>

            <button
              onClick={handleSpeakBroadcast}
              className={`w-full py-2 rounded font-bold text-xs flex items-center justify-center gap-2 transition ${
                isSpeaking
                  ? 'bg-rose-600 text-white animate-pulse'
                  : 'bg-cyan-600 hover:bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-600/20'
              }`}
            >
              <Volume2 className="w-4 h-4" />
              <span>{isSpeaking ? 'Stop Voice Broadcast' : 'Transmit Live Voice Alert'}</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 text-right">
          <button
            onClick={handleClose}
            className="px-4 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
