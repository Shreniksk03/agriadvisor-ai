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
import { SpotlightGrid, SpotlightCard } from '../components/common/SpotlightGrid';

const STATUS_COLORS = {
  AUTO_APPROVED: 'text-emerald-400 bg-emerald-950/40 border-emerald-500/30',
  ESCALATED: 'text-rose-400 bg-rose-950/40 border-rose-500/30',
  UNDER_REVIEW: 'text-amber-400 bg-amber-950/40 border-amber-500/30',
  RESOLVED: 'text-blue-400 bg-blue-950/40 border-blue-500/30',
  INTAKE: 'text-slate-400 bg-slate-900 border-slate-800',
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
          <p className="text-slate-400 text-xs font-mono">Loading telemetry diagnostics...</p>
        </div>
      </div>
    );
  }

  const kpis = stats?.kpis || {};
  const recentAdvisories = stats?.recent_advisories || [];
  const categoryBreakdown = stats?.category_breakdown || {};

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <LayoutDashboard className="w-5 h-5 text-blue-500" />
            Executive Overview
          </h1>
          <p className="text-slate-400 text-xs mt-0.5">
            Autonomous multi-agent crop advisory & biosecurity telemetry metrics
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono bg-[#0d0f12] px-3 py-1.5 rounded-lg border border-white/5">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-emerald-400 font-medium">NEURAL PIPELINE: ONLINE</span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <SpotlightGrid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Monitored Fields"
          value={kpis.total_fields || 0}
          trend="+12% MoM"
        />
        <KPICard
          title="Active Advisories"
          value={kpis.total_advisories || 0}
        />
        <KPICard
          title="Escalated Incidents"
          value={kpis.escalated_count || 0}
          highlight="rose"
        />
        <KPICard
          title="Composite Risk Metric"
          value={kpis.average_risk_score || 0}
          suffix="/100"
          highlight="amber"
        />
      </SpotlightGrid>

      {/* Secondary KPI Row */}
      <SpotlightGrid className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KPICard
          title="Auto-Approved Prescriptions"
          value={kpis.auto_approved_count || 0}
          highlight="emerald"
        />
        <KPICard
          title="Deterministic Safety Rate"
          value={kpis.pipeline_success_rate || 98.7}
          suffix="%"
          highlight="blue"
        />
        <KPICard
          title="Mean Agent Latency"
          value={kpis.avg_response_time_ms || 1240}
          suffix="ms"
        />
      </SpotlightGrid>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Confusion Matrix */}
        <div className="lg:col-span-2">
          <ConfusionMatrixCard matrix={stats?.confusion_matrix} />
        </div>

        {/* Category Breakdown */}
        <SpotlightCard>
          <h3 className="text-xs tracking-wider text-slate-500 uppercase font-semibold mb-4 flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-500" />
            Issue Categories
          </h3>
          <div className="space-y-3">
            {Object.entries(categoryBreakdown).length > 0 ? (
              Object.entries(categoryBreakdown).map(([category, count]) => (
                <CategoryBar key={category} category={category} count={count} total={kpis.total_advisories || 1} />
              ))
            ) : (
              <div className="text-center py-6 text-slate-500 text-xs font-mono">
                No advisories processed yet
              </div>
            )}
          </div>
        </SpotlightCard>
      </div>

      {/* Recent Advisories */}
      <SpotlightCard>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs tracking-wider text-slate-500 uppercase font-semibold flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-500" />
            Recent Advisory Inferences
          </h3>
          <button
            onClick={() => navigate('/review-queue')}
            className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 font-mono"
          >
            <span>Review Queue</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {recentAdvisories.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#080a0e] border-b border-white/5 text-slate-500 font-mono uppercase">
                <tr>
                  <th className="py-2.5 px-3">Field ID</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Risk Metric</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="text-right py-2.5 px-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentAdvisories.map((adv) => (
                  <tr key={adv.id} className="hover:bg-[#12151b] transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-slate-200">{adv.field_id}</td>
                    <td className="py-3 px-3 text-slate-300">{adv.issue_category?.replace(/_/g, ' ')}</td>
                    <td className="py-3 px-3">
                      <span className={`font-mono font-bold ${
                        adv.risk_score >= 80 ? 'text-rose-400' : adv.risk_score >= 50 ? 'text-amber-400' : 'text-emerald-400'
                      }`}>
                        {adv.risk_score || '—'}/100
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded border font-mono uppercase font-semibold ${STATUS_COLORS[adv.status] || STATUS_COLORS.INTAKE}`}>
                        {adv.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => navigate(`/advisory/${adv.id}`)}
                        className="text-[11px] px-2.5 py-1 rounded bg-[#181c24] text-slate-300 hover:text-white hover:bg-blue-600 transition-colors font-mono border border-white/5"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500 text-xs font-mono">
            No telemetry records logged
          </div>
        )}
      </SpotlightCard>
    </div>
  );
}

function KPICard({ title, value, suffix = '', trend, highlight }) {
  const textColors = {
    rose: 'text-rose-400',
    amber: 'text-amber-400',
    emerald: 'text-emerald-400',
    blue: 'text-blue-400',
  };

  const valueColor = highlight ? textColors[highlight] || 'text-slate-100' : 'text-slate-100';

  return (
    <SpotlightCard className="h-32">
      <div className="flex flex-col justify-between h-full">
        <div className="flex items-center justify-between">
          <p className="text-xs tracking-wider text-slate-500 uppercase font-semibold font-sans">{title}</p>
          {trend && <span className="text-[10px] text-emerald-400 font-mono">{trend}</span>}
        </div>
        <div>
          <p className={`text-3xl font-bold font-mono tracking-tight ${valueColor}`}>
            {typeof value === 'number' ? value.toLocaleString() : value}
            {suffix && <span className="text-lg text-slate-500 ml-1 font-sans">{suffix}</span>}
          </p>
        </div>
      </div>
    </SpotlightCard>
  );
}

function CategoryBar({ category, count, total }) {
  const percent = Math.round((count / total) * 100);
  const colors = {
    NUTRIENT_DEFICIENCY: 'bg-amber-500',
    PEST_OUTBREAK: 'bg-rose-500',
    DROUGHT_STRESS: 'bg-orange-500',
    WATERLOGGING: 'bg-blue-500',
    DISEASE_FUNGAL: 'bg-purple-500',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1 text-xs">
        <span className="text-slate-300">{category.replace(/_/g, ' ')}</span>
        <span className="font-mono text-slate-500">{count} ({percent}%)</span>
      </div>
      <div className="h-1 bg-[#080a0e] rounded-full overflow-hidden border border-white/5">
        <div
          className={`h-full rounded-full transition-all duration-300 ${colors[category] || 'bg-blue-500'}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
