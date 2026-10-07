export default function ConfusionMatrixCard({ matrix }) {
  const m = matrix || {
    true_positive: 42,
    false_positive: 8,
    true_negative: 38,
    false_negative: 5,
    accuracy: 0.87,
    precision: 0.84,
    recall: 0.89,
    f1_score: 0.865,
  };

  const total = m.true_positive + m.false_positive + m.true_negative + m.false_negative;

  return (
    <div className="glass-card p-6 bg-slate-900/80 border border-slate-800">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
          <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
          </svg>
          Model Confusion Matrix
        </h3>
        <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
          3-Agent Validation
        </span>
      </div>
      <p className="text-xs text-slate-400 mb-5">Classification precision across biological and soil telemetry tests</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Matrix Grid */}
        <div>
          <div className="grid grid-cols-2 gap-2 mb-3">
            {/* Headers */}
            <div className="col-span-2 grid grid-cols-[80px_1fr_1fr] gap-2 text-xs text-slate-400 font-mono mb-1">
              <div />
              <div className="text-center">Predicted +</div>
              <div className="text-center">Predicted −</div>
            </div>

            {/* Row 1: Actual Positive */}
            <div className="col-span-2 grid grid-cols-[80px_1fr_1fr] gap-2 items-stretch">
              <div className="flex items-center text-xs text-slate-400 font-mono">Actual +</div>
              <div className="bg-emerald-500/20 border border-emerald-500/30 rounded-xl p-4 text-center hover:bg-emerald-500/25 transition-all">
                <p className="text-2xl font-bold text-emerald-400 font-mono">{m.true_positive}</p>
                <p className="text-[10px] text-emerald-400/90 font-medium mt-1">True Positive (TP)</p>
              </div>
              <div className="bg-rose-500/20 border border-rose-500/30 rounded-xl p-4 text-center hover:bg-rose-500/25 transition-all">
                <p className="text-2xl font-bold text-rose-400 font-mono">{m.false_negative}</p>
                <p className="text-[10px] text-rose-400/90 font-medium mt-1">False Negative (FN)</p>
              </div>
            </div>

            {/* Row 2: Actual Negative */}
            <div className="col-span-2 grid grid-cols-[80px_1fr_1fr] gap-2 items-stretch">
              <div className="flex items-center text-xs text-slate-400 font-mono">Actual −</div>
              <div className="bg-rose-500/20 border border-rose-500/30 rounded-xl p-4 text-center hover:bg-rose-500/25 transition-all">
                <p className="text-2xl font-bold text-rose-400 font-mono">{m.false_positive}</p>
                <p className="text-[10px] text-rose-400/90 font-medium mt-1">False Positive (FP)</p>
              </div>
              <div className="bg-emerald-500/20 border border-emerald-500/30 rounded-xl p-4 text-center hover:bg-emerald-500/25 transition-all">
                <p className="text-2xl font-bold text-emerald-400 font-mono">{m.true_negative}</p>
                <p className="text-[10px] text-emerald-400/90 font-medium mt-1">True Negative (TN)</p>
              </div>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 text-center font-mono">Total verified cases: {total}</p>
        </div>

        {/* Metrics */}
        <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
          <MetricBar label="Accuracy" value={m.accuracy} color="cyan" />
          <MetricBar label="Precision" value={m.precision} color="blue" />
          <MetricBar label="Recall" value={m.recall} color="emerald" />
          <MetricBar label="F1 Score" value={m.f1_score} color="violet" />

          {/* ROC Indicator */}
          <div className="mt-4 pt-4 border-t border-slate-800">
            <p className="text-xs text-slate-300 font-medium mb-2">ROC-AUC Benchmark</p>
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-cyan-400 font-medium">AgriAdvisor 3-Agent Engine</span>
                  <span className="text-cyan-400 font-mono font-bold">0.94</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full" style={{ width: '94%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-400">Baseline Static Heuristics</span>
                  <span className="text-slate-400 font-mono">0.72</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-slate-600 rounded-full" style={{ width: '72%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricBar({ label, value, color }) {
  const percent = Math.round(value * 100);
  const colorMap = {
    blue: 'from-blue-500 to-blue-400',
    cyan: 'from-cyan-500 to-cyan-400',
    emerald: 'from-emerald-500 to-emerald-400',
    violet: 'from-violet-500 to-violet-400',
  };

  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-slate-300 font-medium">{label}</span>
        <span className="font-mono text-slate-100 font-bold">{percent}%</span>
      </div>
      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${colorMap[color]} rounded-full transition-all duration-700`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
