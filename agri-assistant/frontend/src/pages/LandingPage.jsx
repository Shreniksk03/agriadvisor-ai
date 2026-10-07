import { useNavigate } from 'react-router-dom';
import AnimatedBackground from '../components/layout/AnimatedBackground';
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

  return (
    <div className="relative min-h-screen overflow-hidden text-slate-200 font-sans selection:bg-blue-600 selection:text-white">
      {/* Space & Aurora Animated Background (Starfield Canvas + Nebula Orbs) */}
      <AnimatedBackground />

      {/* Top Navbar */}
      <header className="border-b border-white/5 bg-[#0a0c10]/70 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-[0_0_12px_rgba(37,99,235,0.4)] border border-blue-400/30">
              <Zap className="w-4 h-4 text-white fill-white" />
            </div>
            <div>
              <span className="text-sm font-bold text-white tracking-wide">AgriAdvisor</span>
              <span className="text-[10px] text-blue-400 font-mono tracking-wider font-semibold ml-1.5 px-1.5 py-0.5 rounded bg-blue-950/60 border border-blue-500/20">
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
            <span className="flex items-center gap-1.5 text-emerald-400 font-mono text-[11px] bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              103 Tests Passing
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-xs text-slate-400 hover:text-white transition-colors px-3 py-1.5 font-medium"
            >
              Enter Console
            </button>
            <button
              onClick={handleStart}
              className="text-xs bg-blue-600 hover:bg-blue-500 hover:shadow-[0_0_15px_rgba(37,99,235,0.5)] text-white px-4 py-2 rounded-md font-semibold transition-all flex items-center gap-1.5 border border-white/10"
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
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0d0f12]/80 backdrop-blur-sm border border-white/10 text-xs text-slate-300 mb-8 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
          <span>Strictly precision farming — built for Agentic AI track</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white max-w-5xl leading-[1.1] mb-6">
          Stop losing yield to{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">
            pathogens, climate, and soil degradation.
          </span>
        </h1>

        {/* Subheadline */}
        <p className="text-slate-400 max-w-3xl text-base md:text-lg leading-relaxed mb-10">
          A working agronomic console for enterprise farms—dual-model pathogen risk and yield scoring, auto-compiled field evidence, and anomaly detection with deterministic AI interventions you can actually trust.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <button
            onClick={handleStart}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 hover:shadow-[0_0_15px_rgba(37,99,235,0.5)] text-white px-8 py-3.5 rounded-md font-semibold text-sm transition-all flex items-center justify-center gap-2 border border-white/10"
          >
            <span>Try the AI →</span>
          </button>

          <button
            onClick={scrollToFeatures}
            className="w-full sm:w-auto bg-white/5 border border-white/10 hover:bg-white/10 text-white px-8 py-3.5 rounded-md font-semibold text-sm transition-all flex items-center justify-center gap-2"
          >
            <span>See how it works</span>
          </button>
        </div>
      </section>

      {/* SECTION 2: THE STATS BAR */}
      <section id="stats" className="border-y border-slate-800/80 bg-[#080a0e]/60 backdrop-blur-md relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-800 text-center">
          <div className="py-10 px-6 flex flex-col items-center justify-center">
            <span className="text-4xl md:text-5xl font-bold font-mono text-white tracking-tight">98.7%</span>
            <span className="text-xs text-slate-400 mt-2 font-medium tracking-wide uppercase">Pipeline Deterministic Accuracy</span>
          </div>

          <div className="py-10 px-6 flex flex-col items-center justify-center">
            <span className="text-4xl md:text-5xl font-bold font-mono text-blue-400 tracking-tight">Zero latency</span>
            <span className="text-xs text-slate-400 mt-2 font-medium tracking-wide uppercase">Real-time edge telemetry</span>
          </div>

          <div className="py-10 px-6 flex flex-col items-center justify-center">
            <span className="text-4xl md:text-5xl font-bold font-mono text-emerald-400 tracking-tight">103/103</span>
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
                <div className="w-10 h-10 rounded-lg bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4 transition-transform">
                  <Cpu className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-white mb-2">Autonomous 3-Agent Triage</h3>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Every field gets a real-time risk score from a 3-agent orchestration pipeline. Not a black box.
                </p>
              </div>
              <div className="mt-6 pt-3 border-t border-white/5 flex items-center gap-1.5 text-[11px] font-mono text-blue-400">
                <span>Orchestrator → Worker → Arbiter</span>
              </div>
            </div>
          </SpotlightCard>

          {/* Card 2 */}
          <SpotlightCard className="cursor-pointer">
            <div className="flex flex-col justify-between h-full">
              <div>
                <div className="w-10 h-10 rounded-lg bg-rose-600/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-4 transition-transform">
                  <Share2 className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-white mb-2">Pathogen Transmission Rings</h3>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Graph clustering surfaces disease vectors quietly sharing a region—the pattern serial pathogens rely on.
                </p>
              </div>
              <div className="mt-6 pt-3 border-t border-white/5 flex items-center gap-1.5 text-[11px] font-mono text-rose-400">
                <span>Topological Vector Engine</span>
              </div>
            </div>
          </SpotlightCard>

          {/* Card 3 */}
          <SpotlightCard className="cursor-pointer">
            <div className="flex flex-col justify-between h-full">
              <div>
                <div className="w-10 h-10 rounded-lg bg-amber-600/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4 transition-transform">
                  <Activity className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-white mb-2">Agronomic Anomaly Monitor</h3>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Trailing 10-week Z-score anomaly detection on telemetry channels—flags when yield threat is trending up.
                </p>
              </div>
              <div className="mt-6 pt-3 border-t border-white/5 flex items-center gap-1.5 text-[11px] font-mono text-amber-400">
                <span>|Z| ≥ 1.8σ Outlier Detection</span>
              </div>
            </div>
          </SpotlightCard>

          {/* Card 4 */}
          <SpotlightCard className="cursor-pointer">
            <div className="flex flex-col justify-between h-full">
              <div>
                <div className="w-10 h-10 rounded-lg bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4 transition-transform">
                  <Sliders className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-white mb-2">Yield & Policy Simulator</h3>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Move the threshold slider and watch projected monthly savings update live, in ₹ — the same cost data evaluated as business impact.
                </p>
              </div>
              <div className="mt-6 pt-3 border-t border-white/5 flex items-center gap-1.5 text-[11px] font-mono text-indigo-400">
                <span>Instantaneous Economic ROI</span>
              </div>
            </div>
          </SpotlightCard>

          {/* Card 5 */}
          <SpotlightCard className="cursor-pointer">
            <div className="flex flex-col justify-between h-full">
              <div>
                <div className="w-10 h-10 rounded-lg bg-cyan-600/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-4 transition-transform">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-white mb-2">Batch CSV Scoring</h3>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Score an entire farm&apos;s sensors at once. Upload a CSV, get every row risk-scored through both models.
                </p>
              </div>
              <div className="mt-6 pt-3 border-t border-white/5 flex items-center gap-1.5 text-[11px] font-mono text-cyan-400">
                <span>Multi-Row Ingestion</span>
              </div>
            </div>
          </SpotlightCard>

          {/* Card 6 */}
          <SpotlightCard className="cursor-pointer">
            <div className="flex flex-col justify-between h-full">
              <div>
                <div className="w-10 h-10 rounded-lg bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4 transition-transform">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-white mb-2">Deterministic Advisories</h3>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Cost-weighted decisions. Set your real ₹ cost for false positives vs. missed interventions.
                </p>
              </div>
              <div className="mt-6 pt-3 border-t border-white/5 flex items-center gap-1.5 text-[11px] font-mono text-emerald-400">
                <span>Calibrated Interventions</span>
              </div>
            </div>
          </SpotlightCard>
        </SpotlightGrid>
      </section>

      {/* SECTION 4: THE BOTTOM CTA */}
      <section className="py-20 md:py-28 px-6 border-t border-white/5 bg-[#080a0e]/70 backdrop-blur-md relative z-10">
        <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
          <div className="w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-6">
            <Zap className="w-6 h-6" />
          </div>

          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
            See the AI score a live field
          </h2>

          <p className="text-slate-400 text-base max-w-xl mb-8">
            No sign-up. Jump straight into the dashboard, the scorer, and the pathogen ring graph.
          </p>

          <button
            onClick={handleStart}
            className="bg-blue-600 hover:bg-blue-500 hover:shadow-[0_0_15px_rgba(37,99,235,0.5)] text-white px-8 py-3.5 rounded-md font-semibold text-sm transition-all flex items-center justify-center gap-2 border border-white/10"
          >
            <span>Try the AI →</span>
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-[#050505]/90 backdrop-blur-sm py-8 px-6 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
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

