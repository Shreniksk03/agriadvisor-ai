import { CheckCircle2, ChevronRight, Activity, Clock, ShieldCheck, Zap } from 'lucide-react';

const AGENT_CONFIG = {
  'Soil & Triage Orchestrator': {
    phase: 'Phase 1',
    description: 'Entity extraction & classification',
    color: 'cyan',
  },
  'Climate & Pathogen Risk Worker': {
    phase: 'Phase 2',
    description: 'Weather & pathogen risk modeling',
    color: 'amber',
  },
  'Agronomy Arbiter': {
    phase: 'Phase 3',
    description: 'Decision synthesis & protocol generation',
    color: 'emerald',
  },
  'Agronomy Arbiter Agent': {
    phase: 'Phase 3',
    description: 'Decision synthesis & protocol generation',
    color: 'emerald',
  },
};

const COLOR_MAP = {
  cyan: {
    border: 'border-cyan-500/30',
    bg: 'bg-cyan-500/10',
    text: 'text-cyan-400',
    dot: 'bg-cyan-400',
    line: 'from-cyan-500 to-cyan-500/0',
  },
  amber: {
    border: 'border-amber-500/30',
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    dot: 'bg-amber-400',
    line: 'from-amber-500 to-amber-500/0',
  },
  emerald: {
    border: 'border-emerald-500/30',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    dot: 'bg-emerald-400',
    line: 'from-emerald-500 to-emerald-500/0',
  },
};

export default function AgentReasoningTrace({ trace, executionTrace }) {
  const logs = trace || executionTrace || [];
  if (!logs || logs.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-800">
        {logs.map((log, idx) => {
          const config = AGENT_CONFIG[log.agent_name] || {
            phase: `Phase ${idx + 1}`,
            description: 'Autonomous worker execution',
            color: 'cyan',
          };
          const colors = COLOR_MAP[config.color] || COLOR_MAP.cyan;

          return (
            <div key={idx} className="relative group">
              {/* Step indicator dot */}
              <div
                className={`absolute -left-6 top-1.5 w-5 h-5 rounded-full ${colors.bg} border ${colors.border} flex items-center justify-center`}
              >
                <div className={`w-2 h-2 rounded-full ${colors.dot}`} />
              </div>

              {/* Log Card */}
              <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800/80 hover:border-slate-700 transition-all space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${colors.bg} ${colors.text} ${colors.border}`}>
                      {config.phase}
                    </span>
                    <h4 className="text-xs font-bold text-slate-100">{log.agent_name}</h4>
                  </div>
                  {log.duration_ms && (
                    <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {log.duration_ms}ms
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {log.thought_process}
                </p>

                {log.agent_output && (
                  <div className="mt-2 pt-2 border-t border-slate-800/60">
                    <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                      Structured Schema Output
                    </span>
                    <pre className="text-[11px] font-mono text-cyan-300 bg-slate-900/90 p-2.5 rounded-lg overflow-x-auto border border-slate-800">
                      {typeof log.agent_output === 'object'
                        ? JSON.stringify(log.agent_output, null, 2)
                        : log.agent_output}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
