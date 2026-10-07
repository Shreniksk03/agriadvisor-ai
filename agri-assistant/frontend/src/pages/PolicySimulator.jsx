import { useState, useEffect } from 'react';
import { Sliders, TrendingUp, DollarSign, ShieldAlert, CheckCircle2, Zap, Sparkles, BarChart3, LineChart as LineIcon } from 'lucide-react';
import { policyAPI } from '../lib/api';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from 'recharts';

export default function PolicySimulator() {
  const [riskThreshold, setRiskThreshold] = useState(65);
  const [autoInterventionLimit, setAutoInterventionLimit] = useState(500);
  const [escalationThreshold, setEscalationThreshold] = useState(80);
  const [loading, setLoading] = useState(false);
  const [simResults, setSimResults] = useState(null);

  useEffect(() => {
    runSimulation();
  }, [riskThreshold, autoInterventionLimit, escalationThreshold]);

  const runSimulation = async () => {
    setLoading(true);
    try {
      const { data } = await policyAPI.simulate({
        risk_threshold: Number(riskThreshold),
        auto_intervention_limit: Number(autoInterventionLimit),
        escalation_threshold: Number(escalationThreshold),
      });
      setSimResults(data.data);
    } catch (err) {
      console.error('Failed to simulate policy:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyPreset = (preset) => {
    if (preset === 'AGGRESSIVE') {
      setRiskThreshold(40);
      setAutoInterventionLimit(800);
      setEscalationThreshold(70);
    } else if (preset === 'BALANCED') {
      setRiskThreshold(65);
      setAutoInterventionLimit(500);
      setEscalationThreshold(80);
    } else if (preset === 'CONSERVATIVE') {
      setRiskThreshold(80);
      setAutoInterventionLimit(250);
      setEscalationThreshold(85);
    }
  };

  const yieldMetrics = simResults?.yield_metrics || {};
  const simOverview = simResults?.simulation_results || {};
  const distribution = simResults?.distribution || [];

  const comparisonData = [
    { name: 'Auto-Approved', count: simOverview.auto_approved || 0, fill: '#10b981' },
    { name: 'Under Review', count: simOverview.under_review || 0, fill: '#f59e0b' },
    { name: 'Escalated', count: simOverview.escalated_to_human || 0, fill: '#f43f5e' },
  ];

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Sliders className="w-5 h-5 text-blue-500" />
            Yield & Policy Simulator
          </h1>
          <p className="text-slate-400 text-xs mt-0.5">
            Calibrate autonomous threshold sensitivities and economic risk-reward distributions
          </p>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center gap-2 bg-[#0d0f12] p-1.5 rounded-lg border border-white/5 font-mono text-xs">
          <span className="text-slate-500 px-2 uppercase text-[10px]">Presets:</span>
          <button
            onClick={() => applyPreset('AGGRESSIVE')}
            className="px-2.5 py-1 rounded bg-[#12151a] text-slate-300 hover:text-white hover:bg-blue-600 transition-all border border-white/5"
          >
            Aggressive
          </button>
          <button
            onClick={() => applyPreset('BALANCED')}
            className="px-2.5 py-1 rounded bg-blue-600/20 text-blue-400 border border-blue-500/30 hover:bg-blue-600 hover:text-white transition-all font-semibold"
          >
            Balanced
          </button>
          <button
            onClick={() => applyPreset('CONSERVATIVE')}
            className="px-2.5 py-1 rounded bg-[#12151a] text-slate-300 hover:text-white hover:bg-blue-600 transition-all border border-white/5"
          >
            Cost Guard
          </button>
        </div>
      </div>

      {/* Control Sliders Card */}
      <div className="bg-[#0d0f12] border border-white/5 rounded-xl p-6">
        <h2 className="text-xs tracking-wider text-slate-500 uppercase font-semibold mb-6 flex items-center gap-2">
          <Zap className="w-4 h-4 text-blue-500" />
          Autonomous Arbiter Calibration Sliders
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Risk Threshold Slider */}
          <div className="space-y-3 p-4 bg-[#080a0e] rounded-lg border border-white/5">
            <div className="flex justify-between items-center">
              <label className="text-xs text-slate-300 font-medium">Auto-Approval Risk Cap</label>
              <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/20">
                &lt; {riskThreshold}
              </span>
            </div>
            <input
              type="range"
              min="20"
              max="90"
              step="5"
              value={riskThreshold}
              onChange={(e) => setRiskThreshold(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <p className="text-[11px] text-slate-500">
              Score threshold for automated protocol dispatch without human sign-off.
            </p>
          </div>

          {/* Auto Intervention Budget */}
          <div className="space-y-3 p-4 bg-[#080a0e] rounded-lg border border-white/5">
            <div className="flex justify-between items-center">
              <label className="text-xs text-slate-300 font-medium">Auto-Intervention Budget</label>
              <span className="font-mono text-xs font-bold text-blue-400 bg-blue-950/40 px-2 py-0.5 rounded border border-blue-500/20">
                ${autoInterventionLimit}/ha
              </span>
            </div>
            <input
              type="range"
              min="100"
              max="2000"
              step="50"
              value={autoInterventionLimit}
              onChange={(e) => setAutoInterventionLimit(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <p className="text-[11px] text-slate-500">
              Maximum financial expenditure permitted per hectare for automated chemical/fertilizer orders.
            </p>
          </div>

          {/* Escalation Threshold */}
          <div className="space-y-3 p-4 bg-[#080a0e] rounded-lg border border-white/5">
            <div className="flex justify-between items-center">
              <label className="text-xs text-slate-300 font-medium">Escalation Threshold</label>
              <span className="font-mono text-xs font-bold text-rose-400 bg-rose-950/40 px-2 py-0.5 rounded border border-rose-500/20">
                ≥ {escalationThreshold}
              </span>
            </div>
            <input
              type="range"
              min="60"
              max="95"
              step="5"
              value={escalationThreshold}
              onChange={(e) => setEscalationThreshold(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
            />
            <p className="text-[11px] text-slate-500">
              Score threshold triggering mandatory human agronomist review.
            </p>
          </div>
        </div>
      </div>

      {/* Projected KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0d0f12] border border-white/5 rounded-xl p-5 flex flex-col justify-between h-32">
          <p className="text-xs tracking-wider text-slate-500 uppercase font-semibold">Net Economic Benefit</p>
          <p className="text-3xl font-bold text-emerald-400 font-mono">
            +${yieldMetrics.net_benefit?.toLocaleString() || 0}
          </p>
          <p className="text-[10px] text-slate-500 font-mono">Prevented Loss − Cost</p>
        </div>

        <div className="bg-[#0d0f12] border border-white/5 rounded-xl p-5 flex flex-col justify-between h-32">
          <p className="text-xs tracking-wider text-slate-500 uppercase font-semibold">Optimization Score</p>
          <p className="text-3xl font-bold text-blue-400 font-mono">
            {yieldMetrics.yield_optimization_score || 0}%
          </p>
          <p className="text-[10px] text-slate-500 font-mono">Yield Preservation</p>
        </div>

        <div className="bg-[#0d0f12] border border-white/5 rounded-xl p-5 flex flex-col justify-between h-32">
          <p className="text-xs tracking-wider text-slate-500 uppercase font-semibold">Auto-Approval Rate</p>
          <p className="text-3xl font-bold text-slate-100 font-mono">
            {simOverview.auto_approval_rate || 0}%
          </p>
          <p className="text-[10px] text-slate-500 font-mono">{simOverview.auto_approved} Dispatches</p>
        </div>

        <div className="bg-[#0d0f12] border border-white/5 rounded-xl p-5 flex flex-col justify-between h-32">
          <p className="text-xs tracking-wider text-slate-500 uppercase font-semibold">Escalation Rate</p>
          <p className="text-3xl font-bold text-rose-400 font-mono">
            {simOverview.escalation_rate || 0}%
          </p>
          <p className="text-[10px] text-slate-500 font-mono">{simOverview.escalated_to_human} Human Reviews</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Triage Volume Bar Chart */}
        <div className="bg-[#0d0f12] border border-white/5 rounded-xl p-6">
          <h3 className="text-xs tracking-wider text-slate-500 uppercase font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-500" />
            Triage Volume Breakdown
          </h3>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2430" />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }} />
                <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0a0c10',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: '#f1f5f9',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                  }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {comparisonData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Field Risk Distribution Area */}
        <div className="bg-[#0d0f12] border border-white/5 rounded-xl p-6">
          <h3 className="text-xs tracking-wider text-slate-500 uppercase font-semibold mb-4 flex items-center gap-2">
            <LineIcon className="w-4 h-4 text-blue-500" />
            Risk Distribution vs Thresholds
          </h3>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={distribution}>
                <defs>
                  <linearGradient id="blueRiskGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.7} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2430" />
                <XAxis dataKey="advisory_index" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }} />
                <YAxis stroke="#64748b" domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0a0c10',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: '#f1f5f9',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                  }}
                />
                <Area type="monotone" dataKey="risk_score" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#blueRiskGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Sensitivity Assessment Note */}
      <div className="bg-[#0d0f12] border border-white/5 rounded-xl p-5 flex items-start gap-3">
        <div className="p-2 rounded-lg bg-blue-600/10 text-blue-400 shrink-0 border border-blue-500/20">
          <Zap className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider font-sans">Policy Calibration Summary</h4>
          <p className="text-xs text-slate-400 mt-1 font-sans leading-relaxed">
            {simResults?.threshold_impact?.sensitivity_note || 'Simulation parameters balanced for maximum harvest yield preservation.'}
          </p>
          <div className="mt-2 text-[11px] text-slate-500 font-mono">
            Chemical Expenditure: ${yieldMetrics.resource_cost_projection || 0} | Prevented Damage: ${yieldMetrics.prevented_loss_value || 0}
          </div>
        </div>
      </div>
    </div>
  );
}
