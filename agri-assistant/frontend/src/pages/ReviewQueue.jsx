import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ShieldCheck, CheckCircle2, RefreshCw, Search, X } from 'lucide-react';
import { reviewAPI, advisoryAPI } from '../lib/api';

const STATUS_BADGES = {
  ESCALATED: 'bg-rose-950/40 text-rose-400 border-rose-500/30',
  UNDER_REVIEW: 'bg-amber-950/40 text-amber-400 border-amber-500/30',
  AUTO_APPROVED: 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30',
  RESOLVED: 'bg-blue-950/40 text-blue-400 border-blue-500/30',
};

export default function ReviewQueue() {
  const [advisories, setAdvisories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAdvisory, setSelectedAdvisory] = useState(null);
  const [reviewNote, setReviewNote] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadQueue();
  }, []);

  const loadQueue = async () => {
    setLoading(true);
    try {
      const [queueRes, allRes] = await Promise.all([
        reviewAPI.getQueue(),
        advisoryAPI.getAll(),
      ]);
      const combined = allRes.data?.data || queueRes.data?.data || [];
      setAdvisories(combined);
    } catch (err) {
      console.error('Failed to load review queue:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    setActionLoading(true);
    try {
      await advisoryAPI.updateStatus(id, {
        status: newStatus,
        notes: reviewNote,
      });
      setSuccessMessage(`Advisory successfully updated to ${newStatus}`);
      setTimeout(() => setSuccessMessage(''), 3000);
      setSelectedAdvisory(null);
      setReviewNote('');
      await loadQueue();
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const filteredAdvisories = advisories.filter((adv) => {
    const matchesFilter =
      filter === 'ALL'
        ? true
        : filter === 'ESCALATED'
        ? adv.status === 'ESCALATED' || adv.risk_score >= 80
        : filter === 'UNDER_REVIEW'
        ? adv.status === 'UNDER_REVIEW'
        : filter === 'RESOLVED'
        ? adv.status === 'RESOLVED'
        : true;

    const matchesSearch =
      (adv.field_id && adv.field_id.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (adv.issue_category && adv.issue_category.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (adv.farmer_statement && adv.farmer_statement.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesFilter && matchesSearch;
  });

  const escalatedCount = advisories.filter((a) => a.status === 'ESCALATED' || a.risk_score >= 80).length;
  const underReviewCount = advisories.filter((a) => a.status === 'UNDER_REVIEW').length;
  const resolvedCount = advisories.filter((a) => a.status === 'RESOLVED').length;

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-500" />
            Agronomist Review Queue
          </h1>
          <p className="text-slate-400 text-xs mt-0.5">
            Human-in-the-loop triage center for high-risk crop anomalies and automated escalations
          </p>
        </div>
        <button
          onClick={loadQueue}
          disabled={loading}
          className="text-xs px-3 py-1.5 rounded-lg bg-[#12151a] hover:bg-blue-600 text-slate-300 hover:text-white border border-white/5 transition-all flex items-center gap-1.5 font-mono"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Success Banner */}
      {successMessage && (
        <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-fade-in font-mono">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div
          onClick={() => setFilter('ALL')}
          className={`bg-[#0d0f12] border rounded-xl p-4 cursor-pointer transition-all ${
            filter === 'ALL' ? 'border-blue-500 bg-blue-950/20' : 'border-white/5 hover:border-white/10'
          }`}
        >
          <p className="text-xs tracking-wider text-slate-500 uppercase font-semibold">Total Entries</p>
          <p className="text-2xl font-bold text-slate-100 mt-1 font-mono">{advisories.length}</p>
          <p className="text-[10px] text-slate-500 font-mono mt-0.5">All telemetry records</p>
        </div>

        <div
          onClick={() => setFilter('ESCALATED')}
          className={`bg-[#0d0f12] border rounded-xl p-4 cursor-pointer transition-all ${
            filter === 'ESCALATED' ? 'border-rose-500 bg-rose-950/20' : 'border-white/5 hover:border-white/10'
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs tracking-wider text-rose-400 uppercase font-semibold">Urgent Escalations</p>
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          </div>
          <p className="text-2xl font-bold text-rose-400 mt-1 font-mono">{escalatedCount}</p>
          <p className="text-[10px] text-slate-500 font-mono mt-0.5">Score ≥ 80 or Flagged</p>
        </div>

        <div
          onClick={() => setFilter('UNDER_REVIEW')}
          className={`bg-[#0d0f12] border rounded-xl p-4 cursor-pointer transition-all ${
            filter === 'UNDER_REVIEW' ? 'border-amber-500 bg-amber-950/20' : 'border-white/5 hover:border-white/10'
          }`}
        >
          <p className="text-xs tracking-wider text-amber-400 uppercase font-semibold">Under Review</p>
          <p className="text-2xl font-bold text-amber-400 mt-1 font-mono">{underReviewCount}</p>
          <p className="text-[10px] text-slate-500 font-mono mt-0.5">Awaiting decision</p>
        </div>

        <div
          onClick={() => setFilter('RESOLVED')}
          className={`bg-[#0d0f12] border rounded-xl p-4 cursor-pointer transition-all ${
            filter === 'RESOLVED' ? 'border-blue-500 bg-blue-950/20' : 'border-white/5 hover:border-white/10'
          }`}
        >
          <p className="text-xs tracking-wider text-blue-400 uppercase font-semibold">Resolved / Approved</p>
          <p className="text-2xl font-bold text-blue-400 mt-1 font-mono">{resolvedCount}</p>
          <p className="text-[10px] text-slate-500 font-mono mt-0.5">Protocol executed</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#0d0f12] border border-white/5 rounded-xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search field ID, crop, symptoms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 text-xs bg-[#080a0e] border border-slate-800 text-slate-200 rounded-lg py-2"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto font-mono text-xs">
          {['ALL', 'ESCALATED', 'UNDER_REVIEW', 'RESOLVED'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2.5 py-1 rounded transition-all ${
                filter === f
                  ? 'bg-blue-600 text-white font-semibold shadow-[0_0_12px_rgba(37,99,235,0.4)]'
                  : 'bg-[#080a0e] text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              {f.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Advisories Table / Clean Empty State */}
      <div className="bg-[#0d0f12] border border-white/5 rounded-xl overflow-hidden">
        {loading ? (
          <div className="text-center py-16">
            <div className="spinner mx-auto mb-3" />
            <p className="text-slate-400 text-xs font-mono">Loading agronomist review queue...</p>
          </div>
        ) : filteredAdvisories.length === 0 ? (
          /* Exact requirement: centered container with lock icon and exact text */
          <div className="text-center py-20 text-slate-500 flex flex-col items-center justify-center p-6">
            <Lock className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-200">Queue is clear - nothing pending review</p>
            <p className="text-xs text-slate-500 mt-1 font-mono">All field telemetry and AI prescriptions are fully processed</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#080a0e] border-b border-white/5 text-slate-500 font-mono uppercase">
                <tr>
                  <th className="py-2.5 px-3">Field ID</th>
                  <th className="py-2.5 px-3">Classification</th>
                  <th className="py-2.5 px-3">Risk Metric</th>
                  <th className="py-2.5 px-3">Farmer Statement</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredAdvisories.map((adv) => {
                  return (
                    <tr
                      key={adv.id}
                      className="hover:bg-[#12151b] transition-colors group cursor-pointer"
                      onClick={() => setSelectedAdvisory(adv)}
                    >
                      <td className="py-3 px-3">
                        <div className="font-mono font-bold text-slate-200 group-hover:text-blue-400">
                          {adv.field_id}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {adv.created_at ? new Date(adv.created_at).toLocaleDateString() : 'Recent'}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="inline-flex items-center gap-1.5 font-medium text-slate-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                          {adv.issue_category ? adv.issue_category.replace(/_/g, ' ') : 'General Agronomy'}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-12 bg-[#080a0e] rounded-full h-1.5 overflow-hidden border border-white/5">
                            <div
                              className={`h-full rounded-full ${
                                adv.risk_score >= 80 ? 'bg-rose-500' : adv.risk_score >= 50 ? 'bg-amber-500' : 'bg-emerald-500'
                              }`}
                              style={{ width: `${Math.min(100, adv.risk_score || 20)}%` }}
                            />
                          </div>
                          <span className={`font-mono font-bold ${
                            adv.risk_score >= 80 ? 'text-rose-400' : adv.risk_score >= 50 ? 'text-amber-400' : 'text-emerald-400'
                          }`}>
                            {adv.risk_score || 0}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3 max-w-xs">
                        <p className="text-slate-400 truncate text-[11px]" title={adv.farmer_statement}>
                          {adv.farmer_statement || 'Standard telemetry batch processing'}
                        </p>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded border font-semibold ${STATUS_BADGES[adv.status] || STATUS_BADGES.UNDER_REVIEW}`}>
                          {adv.status || 'UNDER_REVIEW'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => setSelectedAdvisory(adv)}
                            className="text-[11px] px-2.5 py-1 rounded bg-[#181c24] text-slate-300 hover:text-white hover:bg-blue-600 transition-colors font-mono border border-white/5"
                          >
                            Review
                          </button>
                          <button
                            onClick={() => navigate(`/advisory/${adv.id}`)}
                            className="text-[11px] px-2 py-1 rounded bg-[#12151a] text-slate-400 hover:text-slate-200 transition-colors font-mono border border-white/5"
                            title="View full agent reasoning trace"
                          >
                            Trace →
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Action Modal for Agronomist Review */}
      {selectedAdvisory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in font-sans">
          <div className="bg-[#0d0f12] border border-white/10 rounded-xl max-w-2xl w-full p-6 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-white/5 pb-4">
              <div>
                <span className="text-[10px] font-mono text-blue-400 font-bold uppercase">FIELD: {selectedAdvisory.field_id}</span>
                <h3 className="text-base font-bold text-slate-100 mt-0.5">
                  Agronomic Triage & Decision Arbiter
                </h3>
              </div>
              <button
                onClick={() => setSelectedAdvisory(null)}
                className="text-slate-400 hover:text-white p-1 rounded hover:bg-white/5 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-[#080a0e] p-3.5 rounded-lg border border-white/5">
              <div>
                <span className="text-slate-500 font-sans">Issue Category:</span>
                <p className="text-slate-200 font-semibold mt-0.5">{selectedAdvisory.issue_category?.replace(/_/g, ' ')}</p>
              </div>
              <div>
                <span className="text-slate-500 font-sans">Calculated Risk Score:</span>
                <p className={`font-bold mt-0.5 font-mono ${selectedAdvisory.risk_score >= 80 ? 'text-rose-400' : 'text-amber-400'}`}>
                  {selectedAdvisory.risk_score}/100
                </p>
              </div>
              <div className="col-span-2">
                <span className="text-slate-500 font-sans">Farmer Observation / Telemetry:</span>
                <p className="text-slate-300 mt-0.5 italic text-[11px]">&quot;{selectedAdvisory.farmer_statement}&quot;</p>
              </div>
            </div>

            {/* Protocol Breakdown */}
            <div>
              <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5 font-mono">
                Proposed Agent Treatment Protocol
              </label>
              <div className="p-3 bg-[#080a0e] rounded-lg border border-white/5 text-xs space-y-1 text-slate-300 font-mono">
                {(() => {
                  try {
                    const parsed = typeof selectedAdvisory.final_protocol === 'string'
                      ? JSON.parse(selectedAdvisory.final_protocol)
                      : selectedAdvisory.final_protocol;
                    return (
                      <>
                        <p><strong className="text-blue-400">Action:</strong> {parsed?.action || 'Diagnostic survey'}</p>
                        <p><strong className="text-blue-400">Dosage:</strong> {parsed?.chemical_dosage || 'Standard NPK formula'}</p>
                        <p><strong className="text-blue-400">Timeline:</strong> {parsed?.timeline || 'Immediate'}</p>
                        <p><strong className="text-blue-400">Est. Cost:</strong> ${parsed?.estimated_cost || 180}</p>
                      </>
                    );
                  } catch (e) {
                    return <p>{selectedAdvisory.final_protocol || 'Standard intervention plan'}</p>;
                  }
                })()}
              </div>
            </div>

            {/* Agronomist Notes */}
            <div>
              <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5 font-mono">
                Agronomist Review Notes & Calibration
              </label>
              <textarea
                rows={3}
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                placeholder="Add agronomic findings, dosage corrections, or field inspection instructions..."
                className="w-full text-xs bg-[#080a0e] border border-slate-800 text-slate-200 rounded-lg p-3"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/5">
              <button
                type="button"
                onClick={() => navigate(`/advisory/${selectedAdvisory.id}`)}
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-mono"
              >
                Inspect Full Agent Reasoning Trace →
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => handleUpdateStatus(selectedAdvisory.id, 'RESOLVED')}
                  className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-[0_0_15px_rgba(37,99,235,0.5)] disabled:opacity-50 transition-all"
                >
                  {actionLoading ? 'Saving...' : 'Resolve & Dispatch'}
                </button>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => handleUpdateStatus(selectedAdvisory.id, 'AUTO_APPROVED')}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-950/60 text-emerald-400 hover:bg-emerald-900/60 border border-emerald-500/30 text-xs font-semibold disabled:opacity-50 transition-all"
                >
                  Approve Protocol
                </button>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => handleUpdateStatus(selectedAdvisory.id, 'ESCALATED')}
                  className="px-3.5 py-1.5 rounded-lg bg-rose-950/60 text-rose-400 hover:bg-rose-900/60 border border-rose-500/30 text-xs font-semibold disabled:opacity-50 transition-all"
                >
                  Escalate Alert
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
