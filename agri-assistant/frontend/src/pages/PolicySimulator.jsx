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
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
            <span className="p-2 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
              <Sliders className="w-6 h-6" />
            </span>
            Yield & Policy Simulator
          </h1>
          <p className="text-slate-300 text-sm mt-1">
            Simulate policy threshold sensitivity, economic net benefit, and automated triage balance
          </p>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 font-medium px-2">Presets:</span>
          <button
            onClick={() => applyPreset('AGGRESSIVE')}
            className="px-2.5 py-1 rounded-lg text-xs bg-slate-950 text-slate-300 hover:text-white border border-slate-800 hover:border-cyan-500/30 transition-all font-medium"
          >
            Aggressive Defense
          </button>
          <button
            onClick={() => applyPreset('BALANCED')}
            className="px-2.5 py-1 rounded-lg text-xs bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/25 transition-all font-medium"
          >
            Balanced
          </button>
          <button
            onClick={() => applyPreset('CONSERVATIVE')}
            className="px-2.5 py-1 rounded-lg text-xs bg-slate-950 text-slate-300 hover:text-white border border-slate-800 hover:border-cyan-500/30 transition-all font-medium"
          >
            Cost Guard
          </button>
        </div>
      </div>

      {/* Control Sliders Card */}
      <div className="glass-card p-6 bg-slate-900/85 border border-slate-800 rounded-2xl">
        <h2 className="text-sm font-semibold text-slate-100 uppercase tracking-wider mb-6 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          Autonomous Arbiter Calibration Controls
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Risk Threshold Slider */}
          <div className="space-y-3 p-4 bg-slate-950 rounded-xl border border-slate-800">
            <div className="flex justify-between items-center">
              <label className="text-xs font-medium text-slate-300">Auto-Approval Risk Cap</label>
              <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Score &lt; {riskThreshold}
              </span>
            </div>
            <input
              type="range"
              min="20"
              max="90"
              step="5"
              value={riskThreshold}
              onChange={(e) => setRiskThreshold(Number(e.target.value))}
              className="w-full accent-cyan-500"
            />
            <p className="text-[11px] text-slate-400">
              Fields scoring below this score are automatically dispatched without human intervention.
            </p>
          </div>

          {/* Auto Intervention Budget */}
          <div className="space-y-3 p-4 bg-slate-950 rounded-xl border border-slate-800">
            <div className="flex justify-between items-center">
              <label className="text-xs font-medium text-slate-300">Auto-Intervention Budget</label>
              <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
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
              className="w-full accent-cyan-500"
            />
            <p className="text-[11px] text-slate-400">
              Maximum expenditure per hectare permitted for automated fertilizer and chemical orders.
            </p>
          </div>

          {/* Escalation Threshold */}
          <div className="space-y-3 p-4 bg-slate-950 rounded-xl border border-slate-800">
            <div className="flex justify-between items-center">
              <label className="text-xs font-medium text-slate-300">Mandatory Escalation Threshold</label>
              <span className="font-mono text-xs font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                Score ≥ {escalationThreshold}
              </span>
            </div>
            <input
              type="range"
              min="60"
              max="95"
              step="5"
              value={escalationThreshold}
              onChange={(e) => setEscalationThreshold(Number(e.target.value))}
              className="w-full accent-rose-500"
            />
            <p className="text-[11px] text-slate-400">
              Fields scoring at or above this score trigger immediate alerts and mandatory agronomist review.
            </p>
          </div>
        </div>
      </div>

      {/* Projected KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border border-emerald-500/30 bg-slate-900/85 rounded-2xl">
          <p className="text-xs text-slate-400 font-medium">Net Projected Benefit</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1 font-mono">
            +${yieldMetrics.net_benefit?.toLocaleString() || 0}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Prevented Loss minus Cost</p>
        </div>

        <div className="glass-card p-5 bg-gradient-to-br from-cyan-500/20 to-cyan-500/5 border border-cyan-500/30 bg-slate-900/85 rounded-2xl">
          <p className="text-xs text-slate-400 font-medium">Yield Optimization Score</p>
          <p className="text-2xl font-bold text-cyan-400 mt-1 font-mono">
            {yieldMetrics.yield_optimization_score || 0}%
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Expected yield preservation</p>
        </div>

        <div className="glass-card p-5 bg-gradient-to-br from-blue-500/20 to-blue-500/5 border border-blue-500/30 bg-slate-900/85 rounded-2xl">
          <p className="text-xs text-slate-400 font-medium">Auto-Approval Rate</p>
          <p className="text-2xl font-bold text-blue-400 mt-1 font-mono">
            {simOverview.auto_approval_rate || 0}%
          </p>
          <p className="text-[11px] text-slate-400 mt-1">{simOverview.auto_approved} automated dispatches</p>
        </div>

        <div className="glass-card p-5 bg-gradient-to-br from-rose-500/20 to-rose-500/5 border border-rose-500/30 bg-slate-900/85 rounded-2xl">
          <p className="text-xs text-slate-400 font-medium">Escalation Rate</p>
          <p className="text-2xl font-bold text-rose-400 mt-1 font-mono">
            {simOverview.escalation_rate || 0}%
          </p>
          <p className="text-[11px] text-slate-400 mt-1">{simOverview.escalated_to_human} agronomist interventions</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Triage Volume Bar Chart */}
        <div className="glass-card p-6 bg-slate-900/85 border border-slate-800 rounded-2xl">
          <h3 className="text-sm font-semibold text-slate-100 mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-cyan-400" />
            Triage Volume by Policy Threshold
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#020617',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    color: '#f8fafc',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {comparisonData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Field Risk Score Scatter / Area Curve */}
        <div className="glass-card p-6 bg-slate-900/85 border border-slate-800 rounded-2xl">
          <h3 className="text-sm font-semibold text-slate-100 mb-4 flex items-center gap-2">
            <LineIcon className="w-4 h-4 text-cyan-400" />
            Field Risk Distribution vs Policy Thresholds
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={distribution}>
                <defs>
                  <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="advisory_index" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} label={{ value: 'Sample Field Index', position: 'insideBottom', offset: -5, fill: '#64748b', fontSize: 10 }} />
                <YAxis stroke="#64748b" domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#020617',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    color: '#f8fafc',
                    fontSize: '12px',
                  }}
                />
                <Area type="monotone" dataKey="risk_score" stroke="#22d3ee" fillOpacity={1} fill="url(#riskGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Sensitivity Assessment Note */}
      <div className="glass-card p-5 border border-cyan-500/30 bg-cyan-500/10 bg-slate-900/85 rounded-2xl">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/15 text-cyan-400 shrink-0 border border-cyan-500/30">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-100">Policy Impact & Recommendation</h4>
            <p className="text-xs text-slate-300 mt-1">
              {simResults?.threshold_impact?.sensitivity_note || 'Simulation calculated optimal parameters for current harvest season.'}
            </p>
            <div className="mt-2 text-[11px] text-slate-400 font-mono">
              Projected chemical cost: ${yieldMetrics.resource_cost_projection || 0} | Prevented damage estimate: ${yieldMetrics.prevented_loss_value || 0}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
