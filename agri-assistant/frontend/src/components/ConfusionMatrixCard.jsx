import SpotlightCard from './common/SpotlightCard';

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
    <SpotlightCard className="font-sans">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-xs tracking-wider text-slate-500 uppercase font-semibold">
          Model Confusion Matrix & Transparency
        </h3>
        <span className="text-[10px] font-mono text-blue-400 bg-blue-950/40 px-2 py-0.5 rounded border border-blue-500/20 font-semibold">
          3-Agent Validation
        </span>
      </div>
      <p className="text-xs text-slate-400 mb-5">Classification precision across multi-vector soil & biological tests</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Stark Matrix Grid */}
        <div>
          <div className="grid grid-cols-2 gap-2 mb-3">
            {/* Headers */}
            <div className="col-span-2 grid grid-cols-[80px_1fr_1fr] gap-2 text-[11px] text-slate-500 font-mono mb-1">
              <div />
              <div className="text-center font-bold">PRED +</div>
              <div className="text-center font-bold">PRED −</div>
            </div>

            {/* Row 1: Actual Positive */}
            <div className="col-span-2 grid grid-cols-[80px_1fr_1fr] gap-2 items-stretch">
              <div className="flex items-center text-[11px] text-slate-500 font-mono font-bold">ACTUAL +</div>
              <div className="bg-emerald-900/30 border border-emerald-500/30 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-emerald-400 font-mono">{m.true_positive}</p>
                <p className="text-[10px] text-emerald-400/80 font-mono mt-1 uppercase">True Positive</p>
              </div>
              <div className="bg-rose-900/30 border border-rose-500/30 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-rose-400 font-mono">{m.false_negative}</p>
                <p className="text-[10px] text-rose-400/80 font-mono mt-1 uppercase">False Negative</p>
              </div>
            </div>

            {/* Row 2: Actual Negative */}
            <div className="col-span-2 grid grid-cols-[80px_1fr_1fr] gap-2 items-stretch">
              <div className="flex items-center text-[11px] text-slate-500 font-mono font-bold">ACTUAL −</div>
              <div className="bg-rose-900/30 border border-rose-500/30 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-rose-400 font-mono">{m.false_positive}</p>
                <p className="text-[10px] text-rose-400/80 font-mono mt-1 uppercase">False Positive</p>
              </div>
              <div className="bg-emerald-900/30 border border-emerald-500/30 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-emerald-400 font-mono">{m.true_negative}</p>
                <p className="text-[10px] text-emerald-400/80 font-mono mt-1 uppercase">True Negative</p>
              </div>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 text-center font-mono">Sample Size: {total} Records</p>
        </div>

        {/* Metrics List */}
        <div className="space-y-3 bg-[#080a0e] p-4 rounded-lg border border-white/5 font-mono">
          <MetricBar label="ACCURACY" value={m.accuracy} color="blue" />
          <MetricBar label="PRECISION" value={m.precision} color="cyan" />
          <MetricBar label="RECALL" value={m.recall} color="emerald" />
          <MetricBar label="F1_SCORE" value={m.f1_score} color="violet" />

          {/* ROC-AUC Indicator */}
          <div className="mt-4 pt-4 border-t border-white/5">
            <p className="text-[10px] uppercase text-slate-500 tracking-wider mb-2 font-sans font-semibold">ROC-AUC Benchmark</p>
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-blue-400 font-sans font-medium">AgriAdvisor 3-Agent Engine</span>
                  <span className="text-blue-400 font-bold">0.94</span>
                </div>
                <div className="h-1.5 bg-[#12151a] rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: '94%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-500 font-sans">Baseline Static Heuristics</span>
                  <span className="text-slate-500 font-bold">0.72</span>
                </div>
                <div className="h-1.5 bg-[#12151a] rounded-full overflow-hidden">
                  <div className="h-full bg-slate-700 rounded-full" style={{ width: '72%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SpotlightCard>
  );
}

function MetricBar({ label, value, color }) {
  const percent = Math.round(value * 100);
  const colorMap = {
    blue: 'bg-blue-600',
    cyan: 'bg-cyan-500',
    emerald: 'bg-emerald-500',
    violet: 'bg-purple-600',
  };

  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-slate-400">{label}</span>
        <span className="text-slate-200 font-bold">{value.toFixed(3)} ({percent}%)</span>
      </div>
      <div className="h-1.5 bg-[#12151a] rounded-full overflow-hidden border border-white/5">
        <div
          className={`h-full ${colorMap[color] || 'bg-blue-600'} rounded-full transition-all duration-500`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
