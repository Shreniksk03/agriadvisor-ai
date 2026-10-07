import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Activity, FileText, Pill } from 'lucide-react';
import { advisoryAPI } from '../lib/api';
import AgentReasoningTrace from '../components/AgentReasoningTrace';

const STATUS_COLORS = {
  AUTO_APPROVED: 'text-emerald-400 bg-emerald-950/40 border-emerald-500/30',
  ESCALATED: 'text-rose-400 bg-rose-950/40 border-rose-500/30',
  UNDER_REVIEW: 'text-amber-400 bg-amber-950/40 border-amber-500/30',
  RESOLVED: 'text-blue-400 bg-blue-950/40 border-blue-500/30',
};

export default function AdvisoryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadAdvisory();
  }, [id]);

  const loadAdvisory = async () => {
    setLoading(true);
    try {
      const res = await advisoryAPI.getById(id);
      setData(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load advisory record');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    setUpdating(true);
    try {
      await advisoryAPI.updateStatus(id, { status: newStatus });
      await loadAdvisory();
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="spinner mx-auto mb-4" />
          <p className="text-slate-400 text-xs font-mono">Loading complete agent execution trace...</p>
        </div>
      </div>
    );
  }

  if (error || !data?.advisory) {
    return (
      <div className="bg-[#0d0f12] border border-white/5 rounded-xl p-8 text-center max-w-lg mx-auto mt-12">
        <p className="text-rose-400 font-bold mb-2 font-mono text-sm">Advisory Record Not Found</p>
        <p className="text-slate-400 text-xs mb-6 font-mono">{error || 'The requested advisory record could not be retrieved.'}</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="text-xs px-3 py-1.5 rounded-lg bg-[#12151a] hover:bg-blue-600 text-slate-300 hover:text-white border border-white/5 transition-all font-mono"
        >
          ← Return to Dashboard
        </button>
      </div>
    );
  }

  const { advisory, execution_trace } = data;

  let protocol = null;
  try {
    protocol = typeof advisory.final_protocol === 'string'
      ? JSON.parse(advisory.final_protocol)
      : advisory.final_protocol;
  } catch (e) {
    protocol = null;
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto font-sans">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1.5 mb-2 transition-colors font-mono"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Previous View</span>
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-100 font-mono">
              {advisory.field_id}
            </h1>
            <span className={`text-[10px] px-2.5 py-0.5 rounded border font-mono uppercase font-semibold ${STATUS_COLORS[advisory.status] || STATUS_COLORS.UNDER_REVIEW}`}>
              {advisory.status}
            </span>
          </div>
          <p className="text-slate-500 text-[11px] mt-1 font-mono">
            Recorded {advisory.created_at ? new Date(advisory.created_at).toLocaleString() : 'Recently'} · Ref: {advisory.id}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            disabled={updating}
            onClick={() => handleUpdateStatus('AUTO_APPROVED')}
            className="px-3 py-1.5 rounded-lg bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-900/60 text-xs font-semibold transition-all disabled:opacity-50"
          >
            Approve Protocol
          </button>
          <button
            disabled={updating}
            onClick={() => handleUpdateStatus('ESCALATED')}
            className="px-3 py-1.5 rounded-lg bg-rose-950/60 text-rose-400 border border-rose-500/30 hover:bg-rose-900/60 text-xs font-semibold transition-all disabled:opacity-50"
          >
            Escalate to Human
          </button>
          <button
            disabled={updating}
            onClick={() => handleUpdateStatus('RESOLVED')}
            className="px-3.5 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-500 text-xs font-semibold shadow-[0_0_15px_rgba(37,99,235,0.5)] transition-all disabled:opacity-50 border border-white/10"
          >
            Mark Resolved
          </button>
        </div>
      </div>

      {/* Summary KPI Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#0d0f12] border border-white/5 rounded-xl p-5 flex flex-col justify-between h-28">
          <p className="text-xs tracking-wider text-slate-500 uppercase font-semibold">Classified Agronomic Issue</p>
          <p className="text-lg font-bold text-slate-100 mt-1">
            {advisory.issue_category ? advisory.issue_category.replace(/_/g, ' ') : 'General Agronomy'}
          </p>
        </div>

        <div className="bg-[#0d0f12] border border-white/5 rounded-xl p-5 flex flex-col justify-between h-28">
          <p className="text-xs tracking-wider text-slate-500 uppercase font-semibold">Composite Crop Risk Score</p>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-3xl font-bold font-mono ${
              advisory.risk_score >= 80 ? 'text-rose-400' : advisory.risk_score >= 50 ? 'text-amber-400' : 'text-emerald-400'
            }`}>
              {advisory.risk_score || '—'}/100
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              ({advisory.risk_score >= 80 ? 'Critical' : advisory.risk_score >= 50 ? 'Moderate' : 'Low'})
            </span>
          </div>
        </div>

        <div className="bg-[#0d0f12] border border-white/5 rounded-xl p-5 flex flex-col justify-between h-28">
          <p className="text-xs tracking-wider text-slate-500 uppercase font-semibold">Estimated Intervention Cost</p>
          <p className="text-3xl font-bold text-blue-400 mt-1 font-mono">
            ${protocol?.estimated_cost || 180}
          </p>
        </div>
      </div>

      {/* Farmer Statement */}
      <div className="bg-[#0d0f12] border border-white/5 rounded-xl p-5">
        <h3 className="text-xs tracking-wider text-slate-500 uppercase font-semibold mb-2 flex items-center gap-2">
          <FileText className="w-4 h-4 text-blue-500" />
          Farmer Statement & Sensor Telemetry Notes
        </h3>
        <p className="text-slate-300 text-xs italic bg-[#080a0e] p-3.5 rounded-lg border border-white/5 font-sans leading-relaxed">
          &quot;{advisory.farmer_statement}&quot;
        </p>
      </div>

      {/* Treatment Protocol Prescription Card */}
      {protocol && (
        <div className="bg-[#0d0f12] border border-emerald-500/30 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <span className="p-1 rounded bg-emerald-950/40 text-emerald-400 border border-emerald-500/20">
                <Pill className="w-4 h-4" />
              </span>
              Arbiter Treatment Prescription
            </h3>
            <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/20">
              Verified Scientific Protocol
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-lg bg-[#080a0e] border border-white/5">
              <span className="text-slate-500 block mb-1 font-sans">Recommended Action</span>
              <p className="text-slate-200 font-semibold">{protocol.action}</p>
            </div>
            <div className="p-3.5 rounded-lg bg-[#080a0e] border border-white/5">
              <span className="text-slate-500 block mb-1 font-sans">Chemical Dosage / Spec</span>
              <p className="text-blue-400 font-mono text-xs font-semibold">{protocol.chemical_dosage}</p>
            </div>
            <div className="p-3.5 rounded-lg bg-[#080a0e] border border-white/5">
              <span className="text-slate-500 block mb-1 font-sans">Execution Timeline</span>
              <p className="text-amber-400 font-mono">{protocol.timeline}</p>
            </div>
            <div className="p-3.5 rounded-lg bg-[#080a0e] border border-white/5">
              <span className="text-slate-500 block mb-1 font-sans">Estimated Financial Cost</span>
              <p className="text-emerald-400 font-bold font-mono text-base">${protocol.estimated_cost}</p>
            </div>
          </div>
        </div>
      )}

      {/* Multi-Agent Reasoning Execution Trace */}
      <div className="bg-[#0d0f12] border border-white/5 rounded-xl p-6">
        <h3 className="text-xs tracking-wider text-slate-500 uppercase font-semibold mb-4 flex items-center gap-2">
          <Activity className="w-4 h-4 text-blue-500" />
          Autonomous 3-Agent Pipeline Reasoning Chain
        </h3>
        {execution_trace && execution_trace.length > 0 ? (
          <AgentReasoningTrace executionTrace={execution_trace} />
        ) : (
          <div className="p-6 text-center text-slate-500 text-xs font-mono">
            No step-by-step logs recorded for this legacy advisory
          </div>
        )}
      </div>
    </div>
  );
}
