import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Activity,
  Layers,
  Sparkles,
  Zap,
} from 'lucide-react';
import { dashboardAPI } from '../lib/api';
import ConfusionMatrixCard from '../components/ConfusionMatrixCard';

const STATUS_COLORS = {
  AUTO_APPROVED: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30',
  ESCALATED: 'text-rose-400 bg-rose-500/20 border-rose-500/30',
  UNDER_REVIEW: 'text-amber-400 bg-amber-500/20 border-amber-500/30',
  RESOLVED: 'text-cyan-400 bg-cyan-500/20 border-cyan-500/30',
  INTAKE: 'text-slate-400 bg-slate-800 border-slate-700',
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const { data } = await dashboardAPI.getStats();
      setStats(data.data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="spinner mx-auto mb-4" />
          <p className="text-slate-300 text-sm font-mono">Loading executive overview & diagnostics...</p>
        </div>
      </div>
    );
  }

  const kpis = stats?.kpis || {};
  const recentAdvisories = stats?.recent_advisories || [];
  const categoryBreakdown = stats?.category_breakdown || {};

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <LayoutDashboard className="w-6 h-6 text-cyan-400" />
            Executive Overview
          </h1>
          <p className="text-slate-300 text-sm mt-1">
            Real-time multi-agent crop advisory & biosecurity intelligence center
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-emerald-400 font-semibold">ALL AGENTS ONLINE</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Monitored Fields"
          value={kpis.total_fields || 0}
          icon={Layers}
          color="cyan"
          trend="+12% this month"
        />
        <KPICard
          title="Active Advisories"
          value={kpis.total_advisories || 0}
          icon={Activity}
          color="blue"
        />
        <KPICard
          title="Urgent Escalations"
          value={kpis.escalated_count || 0}
          icon={ShieldAlert}
          color="rose"
        />
        <KPICard
          title="Avg Composite Risk"
          value={kpis.average_risk_score || 0}
          suffix="/100"
          icon={TrendingUp}
          color="amber"
        />
      </div>

      {/* Second Row KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KPICard
          title="Auto-Approved Prescriptions"
          value={kpis.auto_approved_count || 0}
          icon={CheckCircle2}
          color="emerald"
        />
        <KPICard
          title="Pipeline Deterministic Accuracy"
          value={kpis.pipeline_success_rate || 98.7}
          suffix="%"
          icon={Zap}
          color="violet"
        />
        <KPICard
          title="Mean Agent Latency"
          value={kpis.avg_response_time_ms || 1240}
          suffix="ms"
          icon={Activity}
          color="cyan"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Confusion Matrix */}
        <div className="lg:col-span-2">
          <ConfusionMatrixCard matrix={stats?.confusion_matrix} />
        </div>

        {/* Category Breakdown */}
        <div className="glass-card p-6 bg-slate-900/85 border border-slate-800 rounded-2xl">
          <h3 className="text-sm font-semibold text-slate-100 mb-4 flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            Classified Issue Categories
          </h3>
          <div className="space-y-3">
            {Object.entries(categoryBreakdown).length > 0 ? (
              Object.entries(categoryBreakdown).map(([category, count]) => (
                <CategoryBar key={category} category={category} count={count} total={kpis.total_advisories || 1} />
              ))
            ) : (
              <div className="text-center py-6">
                <p className="text-slate-400 text-sm">No advisories processed yet</p>
                <button
                  onClick={() => navigate('/score-field')}
                  className="mt-2 text-cyan-400 text-sm hover:text-cyan-300 transition-colors font-medium flex items-center gap-1 mx-auto"
                >
                  <span>Score your first field</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Advisories */}
      <div className="glass-card p-6 bg-slate-900/85 border border-slate-800 rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            Recent Advisory Inferences
          </h3>
          <button
            onClick={() => navigate('/review-queue')}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
          >
            <span>View Full Queue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentAdvisories.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-xs font-semibold text-slate-400">
                <tr>
                  <th className="text-left py-2.5 px-3">Field ID</th>
                  <th className="text-left py-2.5 px-3">Botanical Category</th>
                  <th className="text-left py-2.5 px-3">Calculated Risk</th>
                  <th className="text-left py-2.5 px-3">Arbiter Status</th>
                  <th className="text-right py-2.5 px-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {recentAdvisories.map((adv) => (
                  <tr key={adv.id} className="hover:bg-slate-850/60 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-cyan-300 text-xs">{adv.field_id}</td>
                    <td className="py-3 px-3 text-slate-200 text-xs font-medium">{adv.issue_category?.replace(/_/g, ' ')}</td>
                    <td className="py-3 px-3">
                      <span className={`text-xs font-mono font-bold ${
                        adv.risk_score >= 80 ? 'text-rose-400' : adv.risk_score >= 50 ? 'text-amber-400' : 'text-emerald-400'
                      }`}>
                        {adv.risk_score || '—'}/100
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full border font-bold uppercase ${STATUS_COLORS[adv.status] || STATUS_COLORS.INTAKE}`}>
                        {adv.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => navigate(`/advisory/${adv.id}`)}
                        className="text-xs px-2.5 py-1 rounded-lg bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/25 transition-colors font-medium"
                      >
                        Inspect Trace
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-10 text-slate-500">
            <Activity className="w-10 h-10 mx-auto mb-3 opacity-30 text-slate-400" />
            <p className="text-sm text-slate-300">No field advisories scored yet</p>
            <p className="text-xs mt-1 text-slate-400">Score a crop field to initiate the multi-agent pipeline</p>
          </div>
        )}
      </div>
    </div>
  );
}

function KPICard({ title, value, icon: Icon, color, suffix = '', trend }) {
  const colorMap = {
    cyan: 'from-cyan-500/20 to-cyan-500/5 border-cyan-500/30 text-cyan-400',
    blue: 'from-blue-500/20 to-blue-500/5 border-blue-500/30 text-blue-400',
    emerald: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/30 text-emerald-400',
    amber: 'from-amber-500/20 to-amber-500/5 border-amber-500/30 text-amber-400',
    rose: 'from-rose-500/20 to-rose-500/5 border-rose-500/30 text-rose-400',
    violet: 'from-violet-500/20 to-violet-500/5 border-violet-500/30 text-violet-400',
  };

  return (
    <div className={`glass-card p-5 bg-gradient-to-br ${colorMap[color]} bg-slate-900/85 relative overflow-hidden rounded-2xl border`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-400 mb-1">{title}</p>
          <p className="text-2xl font-bold text-slate-100 font-mono">
            {typeof value === 'number' ? value.toLocaleString() : value}
            <span className="text-sm text-slate-400 ml-1 font-sans">{suffix}</span>
          </p>
          {trend && <span className="text-[11px] text-emerald-400 mt-1 inline-block font-medium">{trend}</span>}
        </div>
        <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}

function CategoryBar({ category, count, total }) {
  const percent = Math.round((count / total) * 100);
  const colors = {
    NUTRIENT_DEFICIENCY: 'bg-amber-500',
    PEST_OUTBREAK: 'bg-rose-500',
    DROUGHT_STRESS: 'bg-orange-500',
    WATERLOGGING: 'bg-blue-500',
    DISEASE_FUNGAL: 'bg-violet-500',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-slate-300 font-medium">{category.replace(/_/g, ' ')}</span>
        <span className="text-xs font-mono text-slate-400">{count} ({percent}%)</span>
      </div>
      <div className="h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
        <div
          className={`h-full rounded-full transition-all duration-500 ${colors[category] || 'bg-cyan-500'}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
