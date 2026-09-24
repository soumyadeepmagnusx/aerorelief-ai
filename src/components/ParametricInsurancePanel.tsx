import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Banknote, 
  AlertTriangle, 
  CheckCircle2, 
  Send, 
  Copy, 
  Clock, 
  Users, 
  Building2, 
  Zap, 
  Layers, 
  FileText, 
  Flame, 
  Anchor, 
  Sparkles,
  ArrowRight,
  TrendingUp,
  Download,
  Terminal,
  Radio,
  Volume2,
  VolumeX,
  Database,
  Lock,
  GitBranch,
  BarChart3,
  ExternalLink,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { sound } from '../services/soundFx';

interface ParametricInsurancePanelProps {
  surgeHeight: number;
  windSpeedKmh: number;
  inundatedAreaSqKm: number;
  affectedPopulation: number;
}

interface ShelterNode {
  id: string;
  name: string;
  location: string;
  elevationM: number;
  capacity: number;
  currentOccupancy: number;
  status: 'Critical' | 'Near Capacity' | 'Accepting' | 'Primary Redirect';
  coordinates: [number, number];
}

const SHELTERS: ShelterNode[] = [
  {
    id: 'sh-1',
    name: 'Astaranga Multipurpose Cyclone Shelter',
    location: 'Astaranga Coastal Sector',
    elevationM: 4.8,
    capacity: 3500,
    currentOccupancy: 3290,
    status: 'Critical',
    coordinates: [19.98, 86.26],
  },
  {
    id: 'sh-2',
    name: 'Konark Jawahar Navodaya Shelter',
    location: 'Konark Inland Perimeter',
    elevationM: 6.2,
    capacity: 2800,
    currentOccupancy: 2460,
    status: 'Near Capacity',
    coordinates: [19.89, 86.11],
  },
  {
    id: 'sh-3',
    name: 'Gop High-Ridge Multipurpose Complex',
    location: 'Gop Arterial Junction',
    elevationM: 11.5,
    capacity: 5000,
    currentOccupancy: 3800,
    status: 'Accepting',
    coordinates: [19.99, 86.01],
  },
  {
    id: 'sh-4',
    name: 'Nimapada Community Safe Haven',
    location: 'Nimapada High Ground (+15m MSL)',
    elevationM: 15.2,
    capacity: 4200,
    currentOccupancy: 2100,
    status: 'Primary Redirect',
    coordinates: [20.06, 85.95],
  },
];

export const ParametricInsurancePanel: React.FC<ParametricInsurancePanelProps> = ({
  surgeHeight,
  windSpeedKmh,
  inundatedAreaSqKm,
  affectedPopulation,
}) => {
  // Parametric Trigger Statuses
  const isWindTriggerMet = windSpeedKmh >= 185;
  const isSurgeTriggerMet = surgeHeight >= 3.0;
  const isInundationTriggerMet = inundatedAreaSqKm >= 50;
  const isRainfallTriggerMet = true; // 280mm upstream pluvial runoff

  const triggersBreachedCount = [
    isWindTriggerMet,
    isSurgeTriggerMet,
    isInundationTriggerMet,
    isRainfallTriggerMet,
  ].filter(Boolean).length;

  const [isEscrowDisbursed, setIsEscrowDisbursed] = useState<boolean>(false);
  const [txHash, setTxHash] = useState<string>('');
  const [isDisbursing, setIsDisbursing] = useState<boolean>(false);
  const [copiedAdvisory, setCopiedAdvisory] = useState<boolean>(false);
  const [showOracleLedger, setShowOracleLedger] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // Stop TTS on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const playRadioChirp = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1760, audioCtx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.13);
    } catch {
      sound.alert();
    }
  };

  const handleSpeakAdvisory = () => {
    if (!('speechSynthesis' in window)) {
      alert("Tactical Voice Radio Synthesizer requires Web Speech API support.");
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    playRadioChirp();

    const rawText = getAdvisoryText();
    const speechText = rawText
      .replace(/[\[\]]/g, ' ')
      .replace(/[#*_-]/g, ' ')
      .replace(/₹/g, 'Rupees ')
      .replace(/km\/h/g, ' kilometers per hour ')
      .replace(/MSL/g, 'Mean Sea Level')
      .replace(/DDMA/g, 'District Disaster Management Authority')
      .replace(/NDRF/g, 'National Disaster Response Force')
      .replace(/ODRAF/g, 'Odisha Disaster Rapid Action Force')
      .replace(/\+/g, 'plus ');

    const utterance = new SpeechSynthesisUtterance(speechText);
    utterance.rate = 1.05;
    utterance.pitch = 0.95;

    const voices = window.speechSynthesis.getVoices();
    if (selectedLanguage === 'OD') {
      const odiaVoice = voices.find(v => v.lang.includes('or') || v.lang.includes('hi') || v.lang.includes('IN'));
      if (odiaVoice) utterance.voice = odiaVoice;
    } else {
      const inVoice = voices.find(v => v.lang.includes('en-IN') || v.lang.includes('en-GB') || v.name.includes('India'));
      if (inVoice) utterance.voice = inVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  // Advisory Generator State
  const [selectedLanguage, setSelectedLanguage] = useState<'EN' | 'OD'>('EN');
  const [selectedAudience, setSelectedAudience] = useState<'collector' | 'municipal' | 'ndrf' | 'citizens'>('collector');

  const handleExecuteDrawdown = () => {
    sound.click();
    setIsDisbursing(true);
    setTimeout(() => {
      setIsDisbursing(false);
      setIsEscrowDisbursed(true);
      setTxHash('0x9d4e8b3f1c7a2054e8912ba4d70c91e523f6687a4192b0c48e89f41b2c3d4e5f');
      sound.alert();
    }, 1200);
  };

  const getAdvisoryText = () => {
    if (selectedLanguage === 'OD') {
      switch (selectedAudience) {
        case 'collector':
          return `[ଅତ୍ୟନ୍ତ ଜରୁରୀ ବିପର୍ଯ୍ୟୟ ନିର୍ଦ୍ଦେଶନାମା - ପୁରୀ ଜିଲ୍ଲାପାଳ]
ତାରିଖ: T-04:00 ଘଣ୍ଟା (ଲ୍ୟାଣ୍ଡଫଲ୍ ପୂର୍ବରୁ)
ସୁପର ସାଇକ୍ଲୋନ ଅମୃତ: ପବନର ବେଗ ${windSpeedKmh} କିମି/ଘଣ୍ଟା, ଜୁଆର ଉଚ୍ଚତା +${surgeHeight.toFixed(1)} ମିଟର।
ପାରାମେଟ୍ରିକ୍ ବୀମା ଫଣ୍ଡ ₹୨୫ କୋଟି ଜିଲ୍ଲା ବିପର୍ଯ୍ୟୟ ପରିଚାଳନା ପାଣ୍ଠିକୁ ଜମା ହୋଇଛି।
ନିର୍ଦ୍ଦେଶ:
୧. ଅସ୍ତରଙ୍ଗ ଏବଂ କୋଣାର୍କ ଉପକୂଳରୁ ତୁରନ୍ତ ସମସ୍ତ ଲୋକଙ୍କୁ ନିମାପଡ଼ା ଏବଂ ଗୋପ ଉଚ୍ଚ ଆଶ୍ରୟସ୍ଥଳୀକୁ ସ୍ଥାନାନ୍ତର କରନ୍ତୁ।
୨. ସାମଙ୍ଗ ୨୨୦କେଭି ବିଦ୍ୟୁତ୍ ଗ୍ରୀଡ୍ ବନ୍ଦ ରଖନ୍ତୁ।
୩. କୁଶଭଦ୍ରା ନଦୀ ବନ୍ଧରେ ୧୨,୦୦୦ ବାଲି ବସ୍ତା ମୁତୟନ କରନ୍ତୁ।`;
        case 'municipal':
          return `[ପୌରପାଳିକା ଏବଂ ନଗର ଉନ୍ନୟନ ଚେତାବନୀ - କୋଣାର୍କ ଓ ପୁରୀ]
ଜୁଆର ଏବଂ ପ୍ରବଳ ବର୍ଷା ଯୋଗୁଁ ସମୁଦ୍ର କୂଳିଆ ରାସ୍ତା ସମ୍ପୂର୍ଣ୍ଣ ଜଳମଗ୍ନ।
୧. ତଳିଆ ଅଞ୍ଚଳରେ ଡ୍ରେନେଜ୍ ଗେଟ୍ ଏବଂ ସ୍ଲୁଇସ୍ ଗେଟ୍ ବନ୍ଦ କରନ୍ତୁ ଯାହାଦ୍ୱାରା ସମୁଦ୍ର ପାଣି ପଶିବ ନାହିଁ।
୨. ଜରୁରୀକାଳୀନ ଜଳ ବିଶୋଧନ ଗାଡି ଗୋପ ବାଇପାସ୍ ଦେଇ ପହଞ୍ଚାନ୍ତୁ।`;
        default:
          return `[ସତର୍କ ସୂଚନା: ସୁପର ବାତ୍ୟା ଅମୃତ]
ଆସନ୍ତା ୪ ଘଣ୍ଟା ମଧ୍ୟରେ ସ୍ଥଳଭାଗ ଛୁଇଁବ। ସମୁଦ୍ର ତଟବର୍ତ୍ତୀ ଲୋକେ ତୁରନ୍ତ ନିକଟସ୍ଥ ପକ୍କା ବାତ୍ୟା ଆଶ୍ରୟସ୍ଥଳୀକୁ ଚାଲିଯାଆନ୍ତୁ। ବିଦ୍ୟୁତ ଖୁଣ୍ଟ ଓ ତାର ଠାରୁ ଦୂରେଇ ରୁହନ୍ତୁ।`;
      }
    }

    switch (selectedAudience) {
      case 'collector':
        return `[HIGH-PRIORITY ANTICIPATORY DISASTER DIRECTIVE: DISTRICT COLLECTOR & DM PURI]
TIMELINESS: T-04:00 HOURS PRE-LANDFALL
THREAT PARAMETERS: Sustained Wind: ${windSpeedKmh} km/h (Cat 4+), Storm Surge: +${surgeHeight.toFixed(1)}m MSL.
PARAMETRIC LIQUIDITY TRIGGER: Activated. ₹25.00 Crore transferred to Puri DDMA Emergency Escrow (Tx: ${txHash || 'PENDING_AUTHORIZATION'}).

OPERATIONAL DIRECTIVES:
1. EVACUATION: Astaranga shelter is saturated (94%). Divert all bus convoys from Sector 4 to Nimapada Safe Haven via Pipili-Gop High Ridge Corridor.
2. INFRASTRUCTURE PRE-EMPTION: Execute controlled shutdown of Samang 220kV transmission feeder at T-01:30 to prevent transformer arc explosion.
3. COMPOUND DRAINAGE: Kushabhadra river mouth tidal-locked by +${surgeHeight.toFixed(1)}m surge. Pre-position 12,000 geotextile sandbags along Km 14.2 embankment.
4. MEDICAL CONTINUITY: Deliver 250kVA mobile diesel generators to Konark Emergency Trauma Care upper floor.`;
      case 'municipal':
        return `[MUNICIPAL COMMISSIONER DIRECTIVE: PURI & KONARK URBAN BODIES]
SURGE INGRESS ALERT: Forecasted seawater ingress 1.8km inland.
1. Clear all stormwater culvert grates along NH-316 to avoid pluvial pooling.
2. Mobilize OSRTC 78-bus evacuation fleet to coastal slums (Pentakota & Chandrabhaga).
3. Fuel cell protection: Elevate diesel stocks at all municipal water pumping stations.`;
      case 'ndrf':
        return `[TACTICAL DEPLOYMENT ORDER: NDRF 03 BN & ODRAF FIRST RESPONDERS]
1. Stage 18 Inflatable Rescue Boats (IRBs) at Gop Arterial Bridgehead.
2. Prohibit all vehicular movements on Marine Drive; strictly enforce reroute along Gop-Nimapada bypass.
3. Pre-position satellite satphones (Inmarsat/Iridium) across 4 coastal command posts.`;
      case 'citizens':
        return `[PUBLIC SAFETY ALERT: SUPER CYCLONE AMRIT - IMMEDIATE EVACUATION ORDER]
A Category 4 Super Cyclone will make landfall in under 4 hours. 
- DO NOT remain in thatched or low-lying houses near the sea.
- Move immediately to your nearest designated Cyclone Shelter.
- Potable water and cooked meals are pre-positioned at Gop and Nimapada shelters.
- Emergency Helpline: 1077 (Puri Control Room) / 112 (Disaster Response).`;
    }
  };

  const handleCopyAdvisory = () => {
    sound.click();
    navigator.clipboard.writeText(getAdvisoryText());
    setCopiedAdvisory(true);
    setTimeout(() => setCopiedAdvisory(false), 2000);
  };

  return (
    <div className="space-y-5 font-mono text-slate-200">
      {/* Top Banner */}
      <div className="glass-panel rounded-2xl p-5 shadow-2xl flex flex-wrap items-center justify-between gap-4 border border-emerald-500/30 bg-gradient-to-r from-emerald-950/30 via-slate-900/70 to-cyan-950/30">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 shadow-md shadow-emerald-500/10">
              <ShieldCheck className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-slate-100 uppercase tracking-wider">
                  Anticipatory Action & Parametric Insurance Liquidity
                </h2>
                <span className="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/50">
                  Pre-Landfall Protocol
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Shifting Disaster Response from Post-Disaster Recovery to Pre-Landfall Evacuation & Automated Parametric Capital
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-emerald-500/40 text-emerald-300 font-bold">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Pre-Landfall Window: T-04:00 hrs</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-cyan-500/40 text-cyan-300 font-bold">
            <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
            <span>Triggers Breached: {triggersBreachedCount} / 4</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Parametric Insurance & Evacuation Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Parametric Insurance Smart Trigger (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="glass-panel rounded-2xl p-5 shadow-2xl border border-white/[0.08] space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-2">
                <Banknote className="w-5 h-5 text-emerald-400" />
                <h3 className="text-xs sm:text-sm font-bold text-slate-100 uppercase">
                  Parametric Climate Catastrophe Smart Trigger
                </h3>
              </div>
              <span className="text-[10px] text-slate-400">
                Policy: NDMA-APAC-CAT-SWAP-2026
              </span>
            </div>

            <p className="text-[11px] text-slate-300 leading-relaxed">
              Traditional disaster relief requires 45–90 days of bureaucratic damage assessment surveys before funds arrive.
              Our <strong>Parametric Smart Trigger</strong> utilizes real-time Google Earth Engine SAR radar and meteorological feeds.
              When physical severity indices breach pre-agreed scientific thresholds, emergency capital is released <strong>instantly before landfall</strong>.
            </p>

            {/* Threshold Verification Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Trigger 1: Wind Speed */}
              <div className={`p-3 rounded-xl border transition ${
                isWindTriggerMet
                  ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-200'
                  : 'bg-slate-950/60 border-white/[0.06] text-slate-400'
              }`}>
                <div className="flex items-center justify-between text-[10px] uppercase font-bold">
                  <span>1. Sustained Wind Index</span>
                  <span className={isWindTriggerMet ? 'text-emerald-400' : 'text-slate-500'}>
                    {isWindTriggerMet ? '✓ TRIGGER BREACHED' : 'NOMINAL'}
                  </span>
                </div>
                <div className="text-lg font-black mt-1 text-slate-100">{windSpeedKmh} km/h</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Threshold: ≥ 185 km/h (Category 3/4)</div>
              </div>

              {/* Trigger 2: Storm Surge */}
              <div className={`p-3 rounded-xl border transition ${
                isSurgeTriggerMet
                  ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-200'
                  : 'bg-slate-950/60 border-white/[0.06] text-slate-400'
              }`}>
                <div className="flex items-center justify-between text-[10px] uppercase font-bold">
                  <span>2. Coastal Surge Height</span>
                  <span className={isSurgeTriggerMet ? 'text-emerald-400' : 'text-slate-500'}>
                    {isSurgeTriggerMet ? '✓ TRIGGER BREACHED' : 'NOMINAL'}
                  </span>
                </div>
                <div className="text-lg font-black mt-1 text-slate-100">+{surgeHeight.toFixed(1)}m MSL</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Threshold: ≥ 3.0m Tidal Inundation</div>
              </div>

              {/* Trigger 3: Earth Engine SAR Inundation */}
              <div className={`p-3 rounded-xl border transition ${
                isInundationTriggerMet
                  ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-200'
                  : 'bg-slate-950/60 border-white/[0.06] text-slate-400'
              }`}>
                <div className="flex items-center justify-between text-[10px] uppercase font-bold">
                  <span>3. GEE SAR Inundation Area</span>
                  <span className={isInundationTriggerMet ? 'text-emerald-400' : 'text-slate-500'}>
                    {isInundationTriggerMet ? '✓ TRIGGER BREACHED' : 'NOMINAL'}
                  </span>
                </div>
                <div className="text-lg font-black mt-1 text-slate-100">{inundatedAreaSqKm.toFixed(1)} sq km</div>
                <div className="text-[10px] text-slate-400 mt-0.5">GEE Sentinel-1 C-Band SAR Threshold: ≥ 50 sq km</div>
              </div>

              {/* Trigger 4: Pluvial Runoff */}
              <div className={`p-3 rounded-xl border transition ${
                isRainfallTriggerMet
                  ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-200'
                  : 'bg-slate-950/60 border-white/[0.06] text-slate-400'
              }`}>
                <div className="flex items-center justify-between text-[10px] uppercase font-bold">
                  <span>4. Pluvial Upstream Rainfall</span>
                  <span className={isRainfallTriggerMet ? 'text-emerald-400' : 'text-slate-500'}>
                    {isRainfallTriggerMet ? '✓ TRIGGER BREACHED' : 'NOMINAL'}
                  </span>
                </div>
                <div className="text-lg font-black mt-1 text-slate-100">280 mm / 24h</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Threshold: ≥ 250 mm (Compound River Surge)</div>
              </div>
            </div>

            {/* Escrow Liquidity Disbursement Card */}
            <div className="p-4 rounded-xl bg-slate-950/90 border border-emerald-500/40 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Instant Escrow Payout Allocation:</span>
                  <div className="text-2xl font-black text-emerald-400">
                    ₹25,00,00,000 <span className="text-xs text-slate-400 font-normal">INR (₹25 Crore / ~$3.0M USD)</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Beneficiary:</span>
                  <div className="text-xs font-bold text-slate-200">Puri DDMA Emergency Treasury</div>
                </div>
              </div>

              {isEscrowDisbursed ? (
                <div className="space-y-2 bg-emerald-950/40 p-3 rounded-lg border border-emerald-500/50 text-xs">
                  <div className="flex items-center gap-2 text-emerald-300 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>PRE-LANDFALL LIQUIDITY DISBURSED TO DISTRICT MAGISTRATE</span>
                  </div>
                  <div className="text-[10px] text-slate-300 break-all font-mono">
                    <span className="text-slate-400 font-bold">Smart Contract Tx: </span>
                    {txHash}
                  </div>
                  <div className="text-[10px] text-emerald-400 font-bold">
                    ⚡ Released T-04:00 pre-landfall for bus charters, diesel generators, mobile water filtration, and sandbag stockpiling.
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleExecuteDrawdown}
                  disabled={isDisbursing || triggersBreachedCount < 3}
                  className={`w-full py-3 rounded-xl font-black text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-lg ${
                    triggersBreachedCount >= 3
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-emerald-500/25 animate-pulse cursor-pointer'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/[0.04]'
                  }`}
                >
                  <Banknote className="w-4 h-4" />
                  <span>
                    {isDisbursing
                      ? 'Validating Multi-Sensor Oracles & Releasing Escrow...'
                      : 'Authorize Pre-Landfall Parametric Liquidity Drawdown (₹25 Cr)'}
                  </span>
                </button>
              )}
            </div>

            {/* Decentralized Climate Oracle Proof-of-Reserve Drawer */}
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-white/[0.08] space-y-2.5">
              <button
                onClick={() => {
                  sound.click();
                  setShowOracleLedger(!showOracleLedger);
                }}
                className="w-full flex items-center justify-between text-left text-xs font-bold text-slate-200 hover:text-white transition"
              >
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-400" />
                  <span>Decentralized Climate Oracle Network & Merkle Proof Ledger</span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    4/4 BFT Consensus
                  </span>
                </div>
                {showOracleLedger ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </button>

              {showOracleLedger && (
                <div className="space-y-2 pt-2 border-t border-white/[0.06] text-[10px] animate-fadeIn">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300">
                    <div className="p-2 rounded-lg bg-slate-900/90 border border-white/[0.04] space-y-1">
                      <div className="flex items-center justify-between font-bold text-emerald-300">
                        <span>Node 1: IMD Marine Buoy #23014</span>
                        <span className="text-emerald-400">✓ Signed</span>
                      </div>
                      <div className="text-slate-400 text-[9px]">
                        Payload: Wind 188 km/h, Surge +3.4m | Ed25519: <span className="font-mono text-slate-300">0x9f1a...ed25</span>
                      </div>
                    </div>

                    <div className="p-2 rounded-lg bg-slate-900/90 border border-white/[0.04] space-y-1">
                      <div className="flex items-center justify-between font-bold text-emerald-300">
                        <span>Node 2: ESA Copernicus Sentinel-1 C-SAR</span>
                        <span className="text-emerald-400">✓ Signed</span>
                      </div>
                      <div className="text-slate-400 text-[9px]">
                        Payload: σ⁰ &lt; -14dB, Inundation 54.2 km² | Sig: <span className="font-mono text-slate-300">0x4b7c...0892</span>
                      </div>
                    </div>

                    <div className="p-2 rounded-lg bg-slate-900/90 border border-white/[0.04] space-y-1">
                      <div className="flex items-center justify-between font-bold text-emerald-300">
                        <span>Node 3: NASA GPM IMERG Precipitation</span>
                        <span className="text-emerald-400">✓ Signed</span>
                      </div>
                      <div className="text-slate-400 text-[9px]">
                        Payload: 282mm / 24h upstream run-off | Sig: <span className="font-mono text-slate-300">0x228e...991a</span>
                      </div>
                    </div>

                    <div className="p-2 rounded-lg bg-slate-900/90 border border-white/[0.04] space-y-1">
                      <div className="flex items-center justify-between font-bold text-emerald-300">
                        <span>Node 4: OSDMA Coastal Gauge (Konark)</span>
                        <span className="text-emerald-400">✓ Signed</span>
                      </div>
                      <div className="text-slate-400 text-[9px]">
                        Payload: Tidal head +3.38m MSL | Sig: <span className="font-mono text-slate-300">0xaa01...55df</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-900 border border-emerald-500/30 font-mono space-y-1 text-[9px]">
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Smart Contract Vault:</span>
                      <span className="text-cyan-300">0x7a3F09C2d4B29E11e4f9D8c12aE78546b30198Cd (ERC-4626)</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Merkle State Root:</span>
                      <span className="text-slate-300">0xd892a7e283f5b7218...91cb42</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Settlement Latency:</span>
                      <span className="text-emerald-400 font-bold">&lt; 840ms (Automated Pre-landfall Execution)</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Pre-Landfall Infrastructure Hardening Directives */}
            <div className="space-y-2 pt-2 border-t border-white/[0.08]">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-300 uppercase">
                <Flame className="w-4 h-4 text-amber-400" />
                <span>Pre-Landfall Infrastructure Hardening Directives</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11px]">
                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-amber-500/30">
                  <div className="font-bold text-amber-300 flex items-center gap-1.5 mb-1">
                    <Zap className="w-3.5 h-3.5" />
                    <span>Grid Substations</span>
                  </div>
                  <p className="text-slate-300 text-[10px] leading-relaxed">
                    Pre-emptively de-energize Samang 220kV feeder at T-01:30 to avoid transformer explosion from saltwater spray.
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-amber-500/30">
                  <div className="font-bold text-amber-300 flex items-center gap-1.5 mb-1">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Hospital Fuel Cells</span>
                  </div>
                  <p className="text-slate-300 text-[10px] leading-relaxed">
                    Stage 250kVA elevated generator at Konark Trauma Care. Seal subterranean diesel valves against 1.8m surge ingress.
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-amber-500/30">
                  <div className="font-bold text-amber-300 flex items-center gap-1.5 mb-1">
                    <Anchor className="w-3.5 h-3.5" />
                    <span>River Embankments</span>
                  </div>
                  <p className="text-slate-300 text-[10px] leading-relaxed">
                    Deploy 12,000 geotextile sandbags on Kushabhadra River km 14.2 bend before high tide locks downstream river discharge.
                  </p>
                </div>
              </div>
            </div>

            {/* Compound Pluvial Discharge Hydrograph (Tidal Lock Analysis) */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-cyan-500/30 space-y-3 pt-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-bold text-slate-100 uppercase tracking-wide">
                    Compound Pluvial Discharge Hydrograph • Tidal Lock Convergence
                  </span>
                </div>
                <span className="text-[10px] font-bold text-rose-400 bg-rose-950/60 border border-rose-500/40 px-2 py-0.5 rounded">
                  Tidal Lock Window: T-02:00 to T+04:00
                </span>
              </div>

              <p className="text-[11px] text-slate-300 leading-relaxed">
                Kushabhadra River basin discharge (<strong>42,000 cusecs</strong> from 280mm pluvial rainfall) converges with the 
                <strong> +3.4m MSL</strong> coastal storm surge. Marine head exceeds the river bed gradient (0.002%), reducing gravity drainage to <strong>0%</strong> and causing severe backwater submersion of Gop & Ramachandi.
              </p>

              {/* SVG Chart */}
              <div className="relative bg-slate-900/90 rounded-xl p-3 border border-white/[0.06] overflow-hidden">
                <svg viewBox="0 0 520 180" className="w-full h-44 sm:h-48 text-xs select-none">
                  <defs>
                    <linearGradient id="dischargeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
                    </linearGradient>
                    <linearGradient id="surgeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Grid Lines */}
                  <line x1="50" y1="30" x2="490" y2="30" stroke="#334155" strokeDasharray="3 3" strokeWidth="0.8" />
                  <line x1="50" y1="70" x2="490" y2="70" stroke="#334155" strokeDasharray="3 3" strokeWidth="0.8" />
                  <line x1="50" y1="110" x2="490" y2="110" stroke="#334155" strokeDasharray="3 3" strokeWidth="0.8" />
                  <line x1="50" y1="150" x2="490" y2="150" stroke="#475569" strokeWidth="1.2" />

                  {/* Tidal Lock Shaded Region: Between T-02h (x=200) and T+04h (x=410) */}
                  <rect x="200" y="20" width="210" height="130" fill="rgba(244, 63, 94, 0.12)" stroke="rgba(244, 63, 94, 0.4)" strokeDasharray="4 2" />
                  <text x="305" y="32" fill="#fda4af" fontSize="9" fontWeight="bold" textAnchor="middle">
                    ⚠️ TIDAL LOCK ZONE (ZERO GRAVITY OUTFLOW)
                  </text>

                  {/* River Discharge Area & Path */}
                  <path
                    d="M 50,150 L 50,135 Q 120,110 190,65 T 270,35 T 340,55 T 410,95 T 490,135 L 490,150 Z"
                    fill="url(#dischargeGrad)"
                  />
                  <path
                    d="M 50,135 Q 120,110 190,65 T 270,35 T 340,55 T 410,95 T 490,135"
                    fill="none"
                    stroke="#06b6d4"
                    strokeWidth="2.5"
                  />

                  {/* Coastal Surge Area & Path */}
                  <path
                    d="M 50,150 L 50,145 Q 120,135 190,95 T 270,40 T 340,68 T 410,115 T 490,145 L 490,150 Z"
                    fill="url(#surgeGrad)"
                  />
                  <path
                    d="M 50,145 Q 120,135 190,95 T 270,40 T 340,68 T 410,115 T 490,145"
                    fill="none"
                    stroke="#f43f5e"
                    strokeWidth="2.5"
                  />

                  {/* Key Markers */}
                  <circle cx="270" cy="35" r="4" fill="#06b6d4" stroke="#fff" strokeWidth="1.5" />
                  <text x="270" y="25" fill="#67e8f9" fontSize="9" fontWeight="bold" textAnchor="middle">
                    42,000 cfs
                  </text>

                  <circle cx="270" cy="40" r="4" fill="#f43f5e" stroke="#fff" strokeWidth="1.5" />
                  <text x="270" y="52" fill="#fda4af" fontSize="9" fontWeight="bold" textAnchor="middle">
                    +3.4m Surge
                  </text>

                  {/* Landfall Vertical Axis */}
                  <line x1="270" y1="20" x2="270" y2="150" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3 2" />
                  <text x="270" y="165" fill="#fbbf24" fontSize="9" fontWeight="bold" textAnchor="middle">
                    LANDFALL (T-00:00)
                  </text>

                  {/* X Axis Timestamps */}
                  <text x="50" y="165" fill="#94a3b8" fontSize="8" textAnchor="middle">T-06:00</text>
                  <text x="125" y="165" fill="#94a3b8" fontSize="8" textAnchor="middle">T-04:00</text>
                  <text x="200" y="165" fill="#94a3b8" fontSize="8" textAnchor="middle">T-02:00</text>
                  <text x="340" y="165" fill="#94a3b8" fontSize="8" textAnchor="middle">T+02:00</text>
                  <text x="410" y="165" fill="#94a3b8" fontSize="8" textAnchor="middle">T+04:00</text>
                  <text x="490" y="165" fill="#94a3b8" fontSize="8" textAnchor="middle">T+06:00</text>

                  {/* Y Axis Left (Discharge) */}
                  <text x="46" y="32" fill="#06b6d4" fontSize="8" textAnchor="end">50k cfs</text>
                  <text x="46" y="72" fill="#06b6d4" fontSize="8" textAnchor="end">35k cfs</text>
                  <text x="46" y="112" fill="#06b6d4" fontSize="8" textAnchor="end">20k cfs</text>

                  {/* Y Axis Right (Surge) */}
                  <text x="495" y="32" fill="#f43f5e" fontSize="8" textAnchor="start">+4.0m</text>
                  <text x="495" y="72" fill="#f43f5e" fontSize="8" textAnchor="start">+2.5m</text>
                  <text x="495" y="112" fill="#f43f5e" fontSize="8" textAnchor="start">+1.0m</text>
                </svg>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-[10px] border-t border-white/[0.06]">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                      <span className="text-slate-300">Upstream River Discharge (Cusecs)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                      <span className="text-slate-300">Marine Surge Head (Meters MSL)</span>
                    </div>
                  </div>
                  <div className="text-rose-300 font-bold">
                    Backwater Head: +1.6m above River Invert
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[10px]">
                <div className="p-2 rounded-lg bg-slate-900 border border-white/[0.06]">
                  <div className="text-slate-400">Peak Upstream Flow</div>
                  <div className="text-xs font-bold text-cyan-300 mt-0.5">42,000 cusecs</div>
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-white/[0.06]">
                  <div className="text-slate-400">Estuary Tidal Head</div>
                  <div className="text-xs font-bold text-rose-300 mt-0.5">+3.4 m MSL</div>
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-white/[0.06]">
                  <div className="text-slate-400">Gravity Drainage</div>
                  <div className="text-xs font-bold text-rose-400 mt-0.5">0.0% (Reversed)</div>
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-white/[0.06]">
                  <div className="text-slate-400">Submerged Backwater</div>
                  <div className="text-xs font-bold text-amber-300 mt-0.5">8.4 sq km</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Pre-Landfall Evacuation & Advisory Dispatch (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Evacuation Shelter Saturation Matrix */}
          <div className="glass-panel rounded-2xl p-5 shadow-2xl border border-white/[0.08] space-y-3.5">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-cyan-400" />
                <h3 className="text-xs sm:text-sm font-bold text-slate-100 uppercase">
                  Pre-Landfall Evacuation Matrix
                </h3>
              </div>
              <span className="text-[10px] text-cyan-300 font-bold bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/40">
                14,200 Evacuated
              </span>
            </div>

            <div className="space-y-2 text-xs">
              {SHELTERS.map((sh) => {
                const occupancyPct = Math.round((sh.currentOccupancy / sh.capacity) * 100);
                const isCritical = occupancyPct >= 90;
                const isAccepting = occupancyPct < 80;

                return (
                  <div
                    key={sh.id}
                    className="p-3 rounded-xl bg-slate-950/70 border border-white/[0.06] space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-slate-200 text-xs truncate max-w-[210px]">
                        {sh.name}
                      </div>
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase ${
                        isCritical
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : isAccepting
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}>
                        {sh.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>Elev: +{sh.elevationM}m MSL</span>
                      <span>Occupancy: {sh.currentOccupancy.toLocaleString()} / {sh.capacity.toLocaleString()} ({occupancyPct}%)</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isCritical ? 'bg-rose-500' : isAccepting ? 'bg-emerald-500' : 'bg-amber-500'
                        }`}
                        style={{ width: `${occupancyPct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-[10px] text-cyan-200 leading-relaxed">
              <strong>Fleet Action:</strong> 78 OSRTC evacuation buses deployed along Pipili-Nimapada corridor to relieve saturated Astaranga shelter before landfall.
            </div>
          </div>

          {/* Bilingual Early-Warning Advisory Dispatch Generator */}
          <div className="glass-panel rounded-2xl p-5 shadow-2xl border border-white/[0.08] space-y-3.5">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-2">
                <Send className="w-5 h-5 text-purple-400" />
                <h3 className="text-xs sm:text-sm font-bold text-slate-100 uppercase">
                  Automated Early-Warning Advisory Dispatch
                </h3>
              </div>

              {/* Language Selector */}
              <div className="flex items-center rounded-lg bg-slate-800/80 p-0.5 border border-white/[0.08] text-[10px]">
                <button
                  onClick={() => {
                    sound.click();
                    setSelectedLanguage('EN');
                  }}
                  className={`px-2 py-0.5 rounded font-bold transition ${
                    selectedLanguage === 'EN' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400'
                  }`}
                >
                  EN
                </button>
                <button
                  onClick={() => {
                    sound.click();
                    setSelectedLanguage('OD');
                  }}
                  className={`px-2 py-0.5 rounded font-bold transition ${
                    selectedLanguage === 'OD' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400'
                  }`}
                >
                  ଓଡ଼ିଆ
                </button>
              </div>
            </div>

            {/* Audience Chips */}
            <div className="flex flex-wrap gap-1 text-[10px]">
              <button
                onClick={() => {
                  sound.click();
                  setSelectedAudience('collector');
                }}
                className={`px-2.5 py-1 rounded-lg transition font-bold ${
                  selectedAudience === 'collector'
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                District Collector (DM)
              </button>
              <button
                onClick={() => {
                  sound.click();
                  setSelectedAudience('municipal');
                }}
                className={`px-2.5 py-1 rounded-lg transition font-bold ${
                  selectedAudience === 'municipal'
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                Municipal Comm.
              </button>
              <button
                onClick={() => {
                  sound.click();
                  setSelectedAudience('ndrf');
                }}
                className={`px-2.5 py-1 rounded-lg transition font-bold ${
                  selectedAudience === 'ndrf'
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                NDRF / ODRAF
              </button>
              <button
                onClick={() => {
                  sound.click();
                  setSelectedAudience('citizens');
                }}
                className={`px-2.5 py-1 rounded-lg transition font-bold ${
                  selectedAudience === 'citizens'
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                Public Broadcast
              </button>
            </div>

            {/* Generated Advisory Box */}
            <div className="relative">
              <textarea
                readOnly
                value={getAdvisoryText()}
                rows={7}
                className="w-full bg-slate-950/90 border border-white/[0.08] rounded-xl p-3 text-[10px] text-slate-200 leading-relaxed font-mono resize-none focus:outline-none focus:border-purple-500"
              />
              <button
                onClick={handleCopyAdvisory}
                className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-cyan-300 text-[10px] font-bold border border-white/[0.08] transition shadow"
              >
                <Copy className="w-3 h-3" />
                <span>{copiedAdvisory ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>

            {/* Tactical Civil Defense Voice Radio Synthesizer */}
            <div className="p-3 rounded-xl bg-slate-950/80 border border-purple-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-purple-300">
                  <Radio className={`w-3.5 h-3.5 ${isSpeaking ? 'animate-pulse text-purple-400' : 'text-purple-400'}`} />
                  <span>Tactical Voice Radio Synthesizer</span>
                </div>
                <span className="text-[9px] font-mono text-purple-400 bg-purple-950/60 px-1.5 py-0.5 rounded border border-purple-500/30">
                  VHF 156.800 MHz (CH 16)
                </span>
              </div>

              {/* Active Voice Waveform Visualizer */}
              {isSpeaking && (
                <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-purple-950/40 border border-purple-500/40 animate-fadeIn">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping mr-1" />
                    <span className="text-[9px] font-bold text-rose-300 uppercase">
                      ON AIR • BROADCASTING DISPATCH
                    </span>
                  </div>
                  <div className="flex items-center gap-0.5 h-4">
                    <span className="w-1 bg-purple-400 rounded-full animate-bounce h-3" style={{ animationDelay: '0ms' }} />
                    <span className="w-1 bg-cyan-400 rounded-full animate-bounce h-4" style={{ animationDelay: '150ms' }} />
                    <span className="w-1 bg-emerald-400 rounded-full animate-bounce h-2" style={{ animationDelay: '300ms' }} />
                    <span className="w-1 bg-purple-400 rounded-full animate-bounce h-4" style={{ animationDelay: '75ms' }} />
                    <span className="w-1 bg-cyan-400 rounded-full animate-bounce h-3" style={{ animationDelay: '225ms' }} />
                    <span className="w-1 bg-rose-400 rounded-full animate-bounce h-4" style={{ animationDelay: '120ms' }} />
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={handleSpeakAdvisory}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow ${
                    isSpeaking
                      ? 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse'
                      : 'bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/40'
                  }`}
                >
                  {isSpeaking ? (
                    <>
                      <VolumeX className="w-3.5 h-3.5" />
                      <span>Silence Voice Broadcast</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>🎙️ Broadcast Voice Radio Dispatch (TTS)</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="flex gap-2 text-xs">
              <button
                onClick={() => {
                  sound.alert();
                  alert(`Broadcast successfully dispatched to OASIS Common Alerting Protocol (CAP v1.2) gateway & State Emergency Operations Centre (SEOC)!`);
                }}
                className="flex-1 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-md shadow-purple-600/20"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Push Broadcast via CAP v1.2</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
