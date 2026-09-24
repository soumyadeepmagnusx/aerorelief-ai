import React, { useState } from 'react';
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
  Terminal
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
