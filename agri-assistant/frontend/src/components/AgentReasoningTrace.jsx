import { Clock } from 'lucide-react';
import JsonSyntaxHighlighter from './common/JsonSyntaxHighlighter';

const AGENT_CONFIG = {
  'Soil & Triage Orchestrator': {
    phase: 'Phase 1',
    description: 'Entity extraction & classification',
    color: 'blue',
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
  blue: {
    border: 'border-blue-500/30',
    bg: 'bg-blue-950/40',
    text: 'text-blue-400',
    dot: 'bg-blue-400',
  },
  amber: {
    border: 'border-amber-500/30',
    bg: 'bg-amber-950/40',
    text: 'text-amber-400',
    dot: 'bg-amber-400',
  },
  emerald: {
    border: 'border-emerald-500/30',
    bg: 'bg-emerald-950/40',
    text: 'text-emerald-400',
    dot: 'bg-emerald-400',
  },
};

export default function AgentReasoningTrace({ trace, executionTrace }) {
  const logs = trace || executionTrace || [];
  if (!logs || logs.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-px before:bg-white/10">
        {logs.map((log, idx) => {
          const config = AGENT_CONFIG[log.agent_name] || {
            phase: `Phase ${idx + 1}`,
            description: 'Autonomous worker execution',
            color: 'blue',
          };
          const colors = COLOR_MAP[config.color] || COLOR_MAP.blue;

          return (
            <div key={idx} className="relative group">
              {/* Step Indicator Dot */}
              <div
                className={`absolute -left-6 top-2 w-5 h-5 rounded-full ${colors.bg} border ${colors.border} flex items-center justify-center`}
              >
                <div className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
              </div>

              {/* Log Card */}
              <div className="p-4 rounded-xl bg-[#080a0e] border border-white/5 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${colors.bg} ${colors.text} ${colors.border}`}>
                      {config.phase}
                    </span>
                    <h4 className="text-xs font-bold text-slate-100 font-sans">{log.agent_name}</h4>
                  </div>
                  {log.duration_ms && (
                    <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {log.duration_ms}ms
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {log.thought_process}
                </p>

                {log.agent_output && (
                  <div className="mt-3 pt-2 border-t border-white/5">
                    <span className="text-[10px] font-mono uppercase text-slate-500 block mb-1">
                      Structured Schema Output
                    </span>
                    <JsonSyntaxHighlighter
                      data={log.agent_output}
                      title={`${log.agent_name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_output.json`}
                    />
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
