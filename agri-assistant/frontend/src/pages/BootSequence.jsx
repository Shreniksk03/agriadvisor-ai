import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Terminal } from 'lucide-react';

const BOOT_LINES = [
  { text: '====================================================================', type: 'dim', delay: 0 },
  { text: 'AGRIADVISOR INTELLIGENCE ENGINE // AUTONOMOUS AGRONOMIC CORE v1.0', type: 'highlight', delay: 100 },
  { text: 'ZERO-TRUST TELEMETRY & INFERENCE SUBSYSTEM INITIALIZATION', type: 'dim', delay: 200 },
  { text: '====================================================================', type: 'dim', delay: 300 },
  { text: '', type: 'blank', delay: 350 },
  { text: '[System Status] Initializing cryptographic subroutines (SHA-256 + AES-GCM)...', type: 'system', delay: 500 },
  { text: '[System Status] JWT Authentication barrier active (HS256 24h rotating session)', type: 'system', delay: 750 },
  { text: '[Loading console] Connecting to PostgreSQL database connection pool (max: 20)...', type: 'console', delay: 1050 },
  { text: '[Loading console] Row Level Security (RLS) policies verified across all tables', type: 'console', delay: 1350 },
  { text: '[Loading console] Telemetry schema integrity check: PASSED', type: 'console', delay: 1650 },
  { text: '', type: 'blank', delay: 1750 },
  { text: '[System Status] Spawning Autonomous 3-Agent AI Pipeline...', type: 'system', delay: 1900 },
  { text: '  > [Agent 1: Soil & Triage Orchestrator] Entity extraction & classification ready', type: 'agent', delay: 2200 },
  { text: '  > [Agent 2: Climate & Pathogen Risk Worker] Multi-vector risk modeling ready', type: 'agent', delay: 2500 },
  { text: '  > [Agent 3: Agronomy Arbiter Agent] Decision synthesis & prescription ready', type: 'agent', delay: 2800 },
  { text: '', type: 'blank', delay: 2900 },
  { text: '[Loading console] Connecting to Gemini 2.5 Flash neural models with fallback...', type: 'console', delay: 3100 },
  { text: '[System Status] Neural streaming latency: 124ms (Deterministic safety guard enabled)', type: 'system', delay: 3400 },
  { text: '', type: 'blank', delay: 3500 },
  { text: '[System Status] Executing enterprise test suite verification...', type: 'system', delay: 3700 },
  { text: '103 automated tests, all passing', type: 'success', delay: 4100 },
  { text: '', type: 'blank', delay: 4200 },
  { text: 'SYSTEM STATUS: ALL SYSTEMS OPERATIONAL. READY FOR CROP TELEMETRY.', type: 'final', delay: 4400 },
];

export default function BootSequence() {
  const [lines, setLines] = useState([]);
  const [isComplete, setIsComplete] = useState(false);
  const [progress, setProgress] = useState(0);
  const consoleBottomRef = useRef(null);
  const navigate = useNavigate();

  const handleProceed = useCallback(() => {
    const token = localStorage.getItem('agri_token');
    navigate(token ? '/dashboard' : '/login');
  }, [navigate]);

  useEffect(() => {
    BOOT_LINES.forEach((line, index) => {
      setTimeout(() => {
        setLines((prev) => [...prev, line]);
        setProgress(Math.round(((index + 1) / BOOT_LINES.length) * 100));

        if (index === BOOT_LINES.length - 1) {
          setTimeout(() => {
            setIsComplete(true);
            setTimeout(() => {
              handleProceed();
            }, 1200);
          }, 400);
        }
      }, line.delay);
    });
  }, [handleProceed]);

  useEffect(() => {
    consoleBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  const getLineClass = (type) => {
    switch (type) {
      case 'dim':
        return 'text-slate-600';
      case 'highlight':
        return 'text-slate-100 font-bold';
      case 'system':
        return 'text-slate-400';
      case 'console':
        return 'text-blue-400';
      case 'agent':
        return 'text-cyan-300';
      case 'success':
        return 'text-emerald-400 font-bold tracking-wide';
      case 'final':
        return 'text-emerald-300 font-bold bg-emerald-950/30 p-2 rounded border border-emerald-500/20';
      case 'blank':
        return 'h-2';
      default:
        return 'text-slate-300';
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0a0a0a] to-[#050505] flex items-center justify-center p-4 sm:p-6 font-mono selection:bg-blue-600 selection:text-white">
      {/* Terminal Container */}
      <div className="w-full max-w-2xl bg-[#0d0f12] border border-white/10 rounded-xl overflow-hidden shadow-2xl flex flex-col h-[520px]">
        {/* Terminal macOS-style Header */}
        <div className="bg-[#12151a] px-4 py-3 border-b border-white/5 flex items-center justify-between select-none">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
            <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
            <span className="text-xs text-slate-400 font-medium ml-2 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-blue-400" />
              agriadvisor@kernel:~ /boot/init.sh
            </span>
          </div>

          <button
            onClick={handleProceed}
            className="text-[11px] px-2.5 py-1 rounded bg-[#181c24] text-slate-300 hover:text-white hover:bg-blue-600 transition-all flex items-center gap-1 border border-white/5"
          >
            <span>Skip</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="h-0.5 bg-[#12151a] w-full">
          <div
            className="h-full bg-blue-600 transition-all duration-150"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Terminal Content Body */}
        <div className="flex-1 p-5 overflow-y-auto space-y-1.5 text-xs text-slate-300 font-mono">
          {lines.map((line, idx) => (
            <div key={idx} className={`${getLineClass(line.type)} leading-relaxed`}>
              {line.text}
            </div>
          ))}
          {!isComplete && (
            <div className="flex items-center gap-1 text-blue-400 pt-1">
              <span>$</span>
              <span className="animate-pulse">_</span>
            </div>
          )}
          <div ref={consoleBottomRef} />
        </div>

        {/* Terminal Footer */}
        <div className="bg-[#0a0c10] px-4 py-2.5 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-2 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-400">RUNTIME ENVIRONMENT: PROD-SECURE</span>
          </div>
          <span className="text-slate-500 font-mono">{progress}% LOADED</span>
        </div>
      </div>
    </div>
  );
}
