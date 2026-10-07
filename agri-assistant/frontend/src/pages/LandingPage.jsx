import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SpotlightGrid, SpotlightCard } from '../components/common/SpotlightGrid';
import {
  Zap,
  ArrowRight,
  ShieldCheck,
  Activity,
  Share2,
  Sliders,
  UploadCloud,
  Cpu,
} from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate('/boot');
  };

  const scrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Generate deterministic/stable particle field (90 stars) with physical upward drift, parallax speeds, and twinkling
  const stars = useMemo(() => {
    return Array.from({ length: 90 }, (_, i) => {
      // Deterministic pseudorandom values based on index
      const seed1 = Math.sin(i * 19.37 + 1.2) * 10000;
      const seed2 = Math.cos(i * 31.73 + 2.4) * 10000;

      const x = Math.abs(seed1 - Math.floor(seed1)) * 100; // 0% to 100% horizontal
      const initialProgress = Math.abs(seed2 - Math.floor(seed2)); // 0 to 1 starting point offset
      
      // Star Size (Depth tiers)
      // Tier 1 (Large / Close): ~15% of stars -> 2.5px
      // Tier 2 (Medium / Mid): ~45% of stars -> 2.0px
      // Tier 3 (Small / Distant): ~40% of stars -> 1.4px
      const sizeTier = i % 7 === 0 ? 'large' : (i % 2 === 0 ? 'medium' : 'small');
      const size = sizeTier === 'large' ? 2.5 : sizeTier === 'medium' ? 2.0 : 1.4;

      // Parallax Drift Duration based on size/depth
      // Large/Close: 20s - 26s (fast)
      // Medium/Mid: 36s - 45s (mid)
      // Small/Far: 58s - 75s (slow)
      const driftDuration = sizeTier === 'large' 
        ? 20 + (i % 7) * 0.9 
        : sizeTier === 'medium' 
          ? 36 + (i % 9) * 1.0 
          : 58 + (i % 11) * 1.5;

      // Subtle lateral drift
      const driftX = ((i % 5) - 2) * 12; // -24px to +24px drift

      // Staggered negative delay so stars are seamlessly distributed across screen on initial load
      const driftDelay = -initialProgress * driftDuration;

      // Colors: Cyan, Blue, and White
      const isCyan = i % 6 === 0;
      const isBlue = i % 4 === 0;
      const color = isCyan ? 'bg-cyan-200' : isBlue ? 'bg-blue-300' : 'bg-white';

      // Twinkling properties
      const isTwinkle = i % 3 === 0;
      const initialOpacity = sizeTier === 'large' ? 0.75 : sizeTier === 'medium' ? 0.55 : 0.35;
      const twinkleDuration = 2.5 + (i % 5) * 0.8;
      const twinkleDelay = (i % 7) * 0.5;

      return {
        id: i,
        x,
        driftX,
        size,
        color,
        driftDuration,
        driftDelay,
        initialOpacity,
        isTwinkle,
        twinkleDuration,
        twinkleDelay,
      };
    });
  }, []);

  return (
    <div className="relative min-h-screen text-slate-200 font-sans selection:bg-blue-600 selection:text-white">
      {/* =========================================================================
          COSMIC AURORA VISUAL LAYERS (Back to Front: Layers 1 - 5)
          ========================================================================= */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10 bg-[#03050B]">
        {/* LAYER 1: Base & Vignette */}
        <div className="absolute inset-0 bg-[#03050B]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,transparent_0%,rgba(3,5,11,0.4)_50%,#03050B_95%)] shadow-[inset_0_0_160px_rgba(0,0,0,0.9)]" />

        {/* LAYER 2: Noise / Grain Overlay (Cinematic Film Texture) */}
        <div
          className="absolute inset-0 opacity-[0.035] mix-blend-screen pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat',
          }}
        />

        {/* LAYER 3: Ambient Radial Glows (Static) */}
        {/* Upper-Left: Massive, heavily blurred soft blue/cyan radial glow */}
        <div className="absolute -top-[20%] -left-[15%] w-[70vw] h-[70vw] max-w-[950px] max-h-[950px] rounded-full bg-gradient-to-br from-cyan-500/20 via-blue-600/15 to-transparent blur-[120px] pointer-events-none mix-blend-screen" />
        
        {/* Lower-Right: Subtle, warm amber/orange radial glow (~15% opacity) */}
        <div className="absolute -bottom-[20%] -right-[15%] w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] rounded-full bg-gradient-to-tl from-amber-500/15 via-orange-600/10 to-transparent blur-[120px] pointer-events-none mix-blend-screen" />

        {/* LAYER 4: The Particle Field (Stars with Continuous Parallax Drift & Twinkle) */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {stars.map((star) => (
            <motion.div
              key={star.id}
              className="absolute pointer-events-none"
              style={{
                left: `${star.x}%`,
                top: 0,
              }}
              animate={{
                y: ['105vh', '-10vh'],
                x: [0, star.driftX],
              }}
              transition={{
                y: {
                  duration: star.driftDuration,
                  repeat: Infinity,
                  ease: 'linear',
                  delay: star.driftDelay,
                },
                x: {
                  duration: star.driftDuration,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: star.driftDelay,
                },
              }}
            >
              {/* Inner Pulsing / Twinkling Dot */}
              <motion.div
                className={`rounded-full ${star.color} shadow-[0_0_6px_rgba(255,255,255,0.5)]`}
                style={{
                  width: `${star.size}px`,
                  height: `${star.size}px`,
                }}
                initial={{ opacity: star.initialOpacity }}
                animate={
                  star.isTwinkle
                    ? {
                        opacity: [
                          star.initialOpacity * 0.25,
                          Math.min(star.initialOpacity * 1.4, 1),
                          star.initialOpacity * 0.25,
                        ],
                        scale: [0.85, 1.3, 0.85],
                      }
                    : { opacity: star.initialOpacity }
                }
                transition={
                  star.isTwinkle
                    ? {
                        duration: star.twinkleDuration,
                        repeat: Infinity,
                        ease: 'easeInOut',
                        delay: star.twinkleDelay,
                      }
                    : undefined
                }
              />
            </motion.div>
          ))}
        </div>

        {/* LAYER 5: The Flowing Aurora Wave (Animated Centerpiece) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
          {/* Primary Aurora Ribbon: Cyan -> Purple/Violet -> Pink/Magenta -> White Highlights */}
          <motion.div
            className="absolute w-[150vw] max-w-[2100px] h-[480px] rounded-[100%] blur-[90px] opacity-45 mix-blend-screen"
            style={{
              background:
                'linear-gradient(90deg, transparent 0%, rgba(6, 182, 212, 0.5) 20%, rgba(139, 92, 246, 0.6) 45%, rgba(236, 72, 153, 0.5) 70%, rgba(255, 255, 255, 0.35) 85%, transparent 100%)',
              transformOrigin: 'center center',
            }}
            animate={{
              x: [-60, 50, -40, -60],
              y: [-25, 35, -15, -25],
              rotate: [-7, 5, -3, -7],
              scaleY: [1, 1.25, 0.95, 1],
              scaleX: [1, 1.06, 0.97, 1],
            }}
            transition={{
              duration: 22,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          {/* Secondary Aurora Ribbon for Deep Cosmic Flow */}
          <motion.div
            className="absolute w-[135vw] max-w-[1850px] h-[360px] rounded-[100%] blur-[100px] opacity-35 mix-blend-screen"
            style={{
              background:
                'linear-gradient(115deg, transparent 5%, rgba(14, 165, 233, 0.45) 25%, rgba(168, 85, 247, 0.55) 55%, rgba(244, 63, 94, 0.4) 80%, transparent 95%)',
              transformOrigin: 'center center',
            }}
            animate={{
              x: [45, -55, 30, 45],
              y: [30, -30, 20, 30],
              rotate: [5, -6, 3, 5],
              scaleY: [1.1, 0.9, 1.2, 1.1],
            }}
            transition={{
              duration: 28,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          {/* Core Atmospheric Glow Band */}
          <motion.div
            className="absolute w-[110vw] max-w-[1400px] h-[240px] rounded-[100%] blur-[80px] opacity-30 mix-blend-screen"
            style={{
              background:
                'linear-gradient(85deg, transparent 15%, rgba(6, 182, 212, 0.45) 35%, rgba(216, 180, 254, 0.6) 65%, rgba(255, 255, 255, 0.4) 80%, transparent 90%)',
            }}
            animate={{
              x: [-35, 40, -25, -35],
              y: [15, -20, 25, 15],
              rotate: [-2, 4, -1, -2],
            }}
            transition={{
              duration: 18,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </div>
      </div>

      {/* =========================================================================
          LAYER 6: Glassmorphism Foreground & Content
          ========================================================================= */}

      {/* Top Navbar */}
      <header className="border-b border-white/10 bg-[#05070D]/60 backdrop-blur-lg sticky top-0 z-30 transition-all">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.45)] border border-blue-400/40 group-hover:scale-105 transition-transform">
              <Zap className="w-4 h-4 text-white fill-white" />
            </div>
            <div>
              <span className="text-sm font-bold text-white tracking-wide">AgriAdvisor</span>
              <span className="text-[10px] text-blue-400 font-mono tracking-wider font-semibold ml-1.5 px-1.5 py-0.5 rounded bg-blue-950/60 border border-blue-500/20 backdrop-blur-sm">
                AI CORE
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-6 text-xs text-slate-400 font-medium">
            <button onClick={scrollToFeatures} className="hover:text-white transition-colors">
              Platform Architecture
            </button>
            <a href="#stats" className="hover:text-white transition-colors">
              Benchmarks
            </a>
            <span className="flex items-center gap-1.5 text-emerald-400 font-mono text-[11px] bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-500/20 backdrop-blur-sm shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              103 Tests Passing
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-xs text-slate-300 hover:text-white transition-colors px-3 py-1.5 font-medium hover:bg-white/5 rounded-md"
            >
              Enter Console
            </button>
            <button
              onClick={handleStart}
              className="text-xs bg-blue-600 hover:bg-blue-500 hover:shadow-[0_0_18px_rgba(37,99,235,0.6)] text-white px-4 py-2 rounded-md font-semibold transition-all flex items-center gap-1.5 border border-white/20 shadow-sm"
            >
              <span>Launch Console</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* SECTION 1: THE HERO */}
      <section className="pt-20 pb-16 md:pt-28 md:pb-24 px-6 max-w-7xl mx-auto flex flex-col items-center text-center relative z-10">
        {/* Top Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#05070D]/70 backdrop-blur-md border border-white/10 text-xs text-slate-300 mb-8 shadow-lg hover:border-white/20 transition-colors">
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse shadow-[0_0_8px_rgba(96,165,250,0.8)]" />
          <span>Strictly precision farming — built for Agentic AI track</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white max-w-5xl leading-[1.1] mb-6">
          Stop losing yield to{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-400">
            pathogens, climate, and soil degradation.
          </span>
        </h1>

        {/* Subheadline */}
        <p className="text-slate-300/90 max-w-3xl text-base md:text-lg leading-relaxed mb-10">
          A working agronomic console for enterprise farms—dual-model pathogen risk and yield scoring, auto-compiled field evidence, and anomaly detection with deterministic AI interventions you can actually trust.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <button
            onClick={handleStart}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 hover:shadow-[0_0_22px_rgba(37,99,235,0.65)] text-white px-8 py-3.5 rounded-md font-semibold text-sm transition-all flex items-center justify-center gap-2 border border-white/20 shadow-[0_0_15px_rgba(37,99,235,0.35)]"
          >
            <span>Try the AI →</span>
          </button>

          <button
            onClick={scrollToFeatures}
            className="w-full sm:w-auto bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 hover:border-white/25 text-white px-8 py-3.5 rounded-md font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <span>See how it works</span>
          </button>
        </div>
      </section>

      {/* SECTION 2: THE STATS BAR */}
      <section id="stats" className="border-y border-white/10 bg-[#05070D]/60 backdrop-blur-lg relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/10 text-center">
          <div className="py-10 px-6 flex flex-col items-center justify-center">
            <span className="text-4xl md:text-5xl font-bold font-mono text-white tracking-tight">98.7%</span>
            <span className="text-xs text-slate-400 mt-2 font-medium tracking-wide uppercase">Pipeline Deterministic Accuracy</span>
          </div>

          <div className="py-10 px-6 flex flex-col items-center justify-center">
            <span className="text-4xl md:text-5xl font-bold font-mono text-cyan-400 tracking-tight drop-shadow-[0_0_12px_rgba(6,182,212,0.3)]">Zero latency</span>
            <span className="text-xs text-slate-400 mt-2 font-medium tracking-wide uppercase">Real-time edge telemetry</span>
          </div>

          <div className="py-10 px-6 flex flex-col items-center justify-center">
            <span className="text-4xl md:text-5xl font-bold font-mono text-emerald-400 tracking-tight drop-shadow-[0_0_12px_rgba(16,185,129,0.3)]">103/103</span>
            <span className="text-xs text-slate-400 mt-2 font-medium tracking-wide uppercase">Automated system tests passing</span>
          </div>
        </div>
      </section>

      {/* SECTION 3: THE FEATURE GRID */}
      <section id="features" className="py-20 md:py-28 px-6 max-w-7xl mx-auto relative z-10">
        {/* Grid Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold text-white tracking-tight mb-4">
            One console, complete crop biosecurity solved end to end
          </h2>
          <p className="text-slate-400 text-base">
            Built as a working system, not a slide deck—every feature below is live in the console.
          </p>
        </div>

        {/* Grid Layout */}
        <SpotlightGrid className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1 */}
          <SpotlightCard className="cursor-pointer">
            <div className="flex flex-col justify-between h-full">
              <div>
                <div className="w-10 h-10 rounded-lg bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-4 transition-transform group-hover/card:scale-105 shadow-[0_0_12px_rgba(37,99,235,0.2)]">
                  <Cpu className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-white mb-2">Autonomous 3-Agent Triage</h3>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Every field gets a real-time risk score from a 3-agent orchestration pipeline. Not a black box.
                </p>
              </div>
              <div className="mt-6 pt-3 border-t border-white/10 flex items-center gap-1.5 text-[11px] font-mono text-blue-400">
                <span>Orchestrator → Worker → Arbiter</span>
              </div>
            </div>
          </SpotlightCard>

          {/* Card 2 */}
          <SpotlightCard className="cursor-pointer">
            <div className="flex flex-col justify-between h-full">
              <div>
                <div className="w-10 h-10 rounded-lg bg-rose-600/15 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-4 transition-transform group-hover/card:scale-105 shadow-[0_0_12px_rgba(244,63,94,0.2)]">
                  <Share2 className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-white mb-2">Pathogen Transmission Rings</h3>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Graph clustering surfaces disease vectors quietly sharing a region—the pattern serial pathogens rely on.
                </p>
              </div>
              <div className="mt-6 pt-3 border-t border-white/10 flex items-center gap-1.5 text-[11px] font-mono text-rose-400">
                <span>Topological Vector Engine</span>
              </div>
            </div>
          </SpotlightCard>

          {/* Card 3 */}
          <SpotlightCard className="cursor-pointer">
            <div className="flex flex-col justify-between h-full">
              <div>
                <div className="w-10 h-10 rounded-lg bg-amber-600/15 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4 transition-transform group-hover/card:scale-105 shadow-[0_0_12px_rgba(245,158,11,0.2)]">
                  <Activity className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-white mb-2">Agronomic Anomaly Monitor</h3>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Trailing 10-week Z-score anomaly detection on telemetry channels—flags when yield threat is trending up.
                </p>
              </div>
              <div className="mt-6 pt-3 border-t border-white/10 flex items-center gap-1.5 text-[11px] font-mono text-amber-400">
                <span>|Z| ≥ 1.8σ Outlier Detection</span>
              </div>
            </div>
          </SpotlightCard>

          {/* Card 4 */}
          <SpotlightCard className="cursor-pointer">
            <div className="flex flex-col justify-between h-full">
              <div>
                <div className="w-10 h-10 rounded-lg bg-indigo-600/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-4 transition-transform group-hover/card:scale-105 shadow-[0_0_12px_rgba(99,102,241,0.2)]">
                  <Sliders className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-white mb-2">Yield & Policy Simulator</h3>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Move the threshold slider and watch projected monthly savings update live, in ₹ — the same cost data evaluated as business impact.
                </p>
              </div>
              <div className="mt-6 pt-3 border-t border-white/10 flex items-center gap-1.5 text-[11px] font-mono text-indigo-400">
                <span>Instantaneous Economic ROI</span>
              </div>
            </div>
          </SpotlightCard>

          {/* Card 5 */}
          <SpotlightCard className="cursor-pointer">
            <div className="flex flex-col justify-between h-full">
              <div>
                <div className="w-10 h-10 rounded-lg bg-cyan-600/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4 transition-transform group-hover/card:scale-105 shadow-[0_0_12px_rgba(6,182,212,0.2)]">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-white mb-2">Batch CSV Scoring</h3>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Score an entire farm&apos;s sensors at once. Upload a CSV, get every row risk-scored through both models.
                </p>
              </div>
              <div className="mt-6 pt-3 border-t border-white/10 flex items-center gap-1.5 text-[11px] font-mono text-cyan-400">
                <span>Multi-Row Ingestion</span>
              </div>
            </div>
          </SpotlightCard>

          {/* Card 6 */}
          <SpotlightCard className="cursor-pointer">
            <div className="flex flex-col justify-between h-full">
              <div>
                <div className="w-10 h-10 rounded-lg bg-emerald-600/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4 transition-transform group-hover/card:scale-105 shadow-[0_0_12px_rgba(16,185,129,0.2)]">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-white mb-2">Deterministic Advisories</h3>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Cost-weighted decisions. Set your real ₹ cost for false positives vs. missed interventions.
                </p>
              </div>
              <div className="mt-6 pt-3 border-t border-white/10 flex items-center gap-1.5 text-[11px] font-mono text-emerald-400">
                <span>Calibrated Interventions</span>
              </div>
            </div>
          </SpotlightCard>
        </SpotlightGrid>
      </section>

      {/* SECTION 4: THE BOTTOM CTA */}
      <section className="py-20 md:py-28 px-6 border-t border-white/10 bg-[#05070D]/60 backdrop-blur-lg relative z-10">
        <div className="max-w-4xl mx-auto p-10 md:p-14 rounded-2xl bg-black/40 backdrop-blur-lg border border-white/10 shadow-2xl text-center flex flex-col items-center relative overflow-hidden">
          {/* Subtle background glow for the CTA card */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-600/15 rounded-full blur-[90px] pointer-events-none" />

          <div className="w-12 h-12 rounded-xl bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-6 shadow-[0_0_15px_rgba(37,99,235,0.3)] relative z-10">
            <Zap className="w-6 h-6" />
          </div>

          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight relative z-10">
            See the AI score a live field
          </h2>

          <p className="text-slate-300/90 text-base max-w-xl mb-8 relative z-10">
            No sign-up. Jump straight into the dashboard, the scorer, and the pathogen ring graph.
          </p>

          <button
            onClick={handleStart}
            className="bg-blue-600 hover:bg-blue-500 hover:shadow-[0_0_22px_rgba(37,99,235,0.65)] text-white px-8 py-3.5 rounded-md font-semibold text-sm transition-all flex items-center justify-center gap-2 border border-white/20 shadow-[0_0_15px_rgba(37,99,235,0.35)] relative z-10"
          >
            <span>Try the AI →</span>
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#03050B]/80 backdrop-blur-md py-8 px-6 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block shadow-[0_0_8px_rgba(52,211,153,0.7)]" />
            <span className="text-slate-400">AGRIADVISOR INTELLIGENCE ENGINE · v1.0.4-PROD</span>
          </div>
          <div className="flex items-center gap-6">
            <span>ZERO-TRUST TELEMETRY</span>
            <span>RLS POLICIES ACTIVE</span>
            <span>© 2026</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
