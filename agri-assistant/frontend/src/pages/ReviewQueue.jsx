import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ShieldCheck, CheckCircle2, AlertTriangle, RefreshCw, Search, ArrowRight, Eye, Check, X } from 'lucide-react';
import { reviewAPI, advisoryAPI } from '../lib/api';

const STATUS_BADGES = {
  ESCALATED: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
  UNDER_REVIEW: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  AUTO_APPROVED: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  RESOLVED: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
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
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
            <span className="p-2 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400">
              <ShieldCheck className="w-6 h-6" />
            </span>
            Agronomist Review Queue
          </h1>
          <p className="text-slate-300 text-sm mt-1">
            Human-in-the-loop triage center for high-risk crop anomalies and automated escalations
          </p>
        </div>
        <button
          onClick={loadQueue}
          disabled={loading}
          className="btn-secondary text-xs px-4 py-2 flex items-center gap-2 self-start sm:self-auto bg-slate-900 border-slate-700 text-slate-300 hover:text-white"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Queue
        </button>
      </div>

      {/* Success Banner */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-sm flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          {successMessage}
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div
          onClick={() => setFilter('ALL')}
          className={`glass-card p-4 cursor-pointer transition-all bg-slate-900/80 border border-slate-800 ${filter === 'ALL' ? 'ring-2 ring-cyan-500/50 bg-cyan-500/10' : 'hover:bg-slate-850'}`}
        >
          <p className="text-xs text-slate-400 font-medium">Total Entries</p>
          <p className="text-2xl font-bold text-slate-100 mt-1 font-mono">{advisories.length}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">All telemetry records</p>
        </div>

        <div
          onClick={() => setFilter('ESCALATED')}
          className={`glass-card p-4 cursor-pointer transition-all bg-slate-900/80 border border-slate-800 ${filter === 'ESCALATED' ? 'ring-2 ring-rose-500/50 bg-rose-500/10' : 'hover:bg-slate-850'}`}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs text-rose-400 font-medium">Urgent Escalations</p>
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          </div>
          <p className="text-2xl font-bold text-rose-400 mt-1 font-mono">{escalatedCount}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Score ≥ 80 or Flagged</p>
        </div>

        <div
          onClick={() => setFilter('UNDER_REVIEW')}
          className={`glass-card p-4 cursor-pointer transition-all bg-slate-900/80 border border-slate-800 ${filter === 'UNDER_REVIEW' ? 'ring-2 ring-amber-500/50 bg-amber-500/10' : 'hover:bg-slate-850'}`}
        >
          <p className="text-xs text-amber-400 font-medium">Under Review</p>
          <p className="text-2xl font-bold text-amber-400 mt-1 font-mono">{underReviewCount}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Awaiting decision</p>
        </div>

        <div
          onClick={() => setFilter('RESOLVED')}
          className={`glass-card p-4 cursor-pointer transition-all bg-slate-900/80 border border-slate-800 ${filter === 'RESOLVED' ? 'ring-2 ring-cyan-500/50 bg-cyan-500/10' : 'hover:bg-slate-850'}`}
        >
          <p className="text-xs text-cyan-400 font-medium">Resolved / Approved</p>
          <p className="text-2xl font-bold text-cyan-400 mt-1 font-mono">{resolvedCount}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Protocol executed</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card p-4 flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-900/80 border border-slate-800">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search field ID, crop, symptoms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 text-xs bg-slate-950 border-slate-800 text-slate-200"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
          {['ALL', 'ESCALATED', 'UNDER_REVIEW', 'RESOLVED'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filter === f
                  ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/25'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {f.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Advisories Table / Empty State */}
      <div className="glass-card overflow-hidden bg-slate-900/80 border border-slate-800">
        {loading ? (
          <div className="text-center py-16">
            <div className="spinner mx-auto mb-3" />
            <p className="text-slate-300 text-sm">Loading agronomist queue...</p>
          </div>
        ) : filteredAdvisories.length === 0 ? (
          <div className="text-center py-20 text-slate-500 flex flex-col items-center justify-center">
            <Lock className="w-12 h-12 text-slate-500 mx-auto mb-3" />
            <p className="text-base font-semibold text-slate-200">Queue is clear - nothing pending review</p>
            <p className="text-xs text-slate-400 mt-1">All field telemetry and AI prescriptions are fully processed</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-xs font-semibold text-slate-400">
                <tr>
                  <th className="py-3 px-4">Field ID</th>
                  <th className="py-3 px-4">Agronomic Classification</th>
                  <th className="py-3 px-4">Risk Metric</th>
                  <th className="py-3 px-4">Farmer Statement</th>
                  <th className="py-3 px-4">Current Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredAdvisories.map((adv) => {
                  return (
                    <tr
                      key={adv.id}
                      className="hover:bg-slate-850/60 transition-colors group cursor-pointer"
                      onClick={() => setSelectedAdvisory(adv)}
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-xs text-cyan-300 group-hover:text-cyan-200">
                          {adv.field_id}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {adv.created_at ? new Date(adv.created_at).toLocaleDateString() : 'Recent'}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                          {adv.issue_category ? adv.issue_category.replace(/_/g, ' ') : 'General Agronomy'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-12 bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                            <div
                              className={`h-full rounded-full ${
                                adv.risk_score >= 80 ? 'bg-rose-500' : adv.risk_score >= 50 ? 'bg-amber-500' : 'bg-emerald-500'
                              }`}
                              style={{ width: `${Math.min(100, adv.risk_score || 20)}%` }}
                            />
                          </div>
                          <span className={`text-xs font-mono font-bold ${
                            adv.risk_score >= 80 ? 'text-rose-400' : adv.risk_score >= 50 ? 'text-amber-400' : 'text-emerald-400'
                          }`}>
                            {adv.risk_score || 0}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 max-w-xs">
                        <p className="text-xs text-slate-300 truncate" title={adv.farmer_statement}>
                          {adv.farmer_statement || 'Standard telemetry batch processing'}
                        </p>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full border font-semibold ${STATUS_BADGES[adv.status] || STATUS_BADGES.UNDER_REVIEW}`}>
                          {adv.status || 'UNDER_REVIEW'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => setSelectedAdvisory(adv)}
                            className="text-xs px-2.5 py-1 rounded bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/25 transition-colors"
                          >
                            Review
                          </button>
                          <button
                            onClick={() => navigate(`/advisory/${adv.id}`)}
                            className="text-xs px-2.5 py-1 rounded bg-slate-800 text-slate-300 hover:text-white transition-colors"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
          <div className="glass-card max-w-2xl w-full p-6 space-y-5 bg-slate-900 border border-slate-700 shadow-2xl relative max-h-[90vh] overflow-y-auto rounded-2xl">
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-mono text-cyan-400 font-bold">FIELD ID: {selectedAdvisory.field_id}</span>
                <h3 className="text-lg font-bold text-slate-100 mt-1">
                  Agronomic Triage & Decision Arbiter
                </h3>
              </div>
              <button
                onClick={() => setSelectedAdvisory(null)}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div>
                <span className="text-slate-400">Issue Category:</span>
                <p className="text-slate-100 font-semibold mt-0.5">{selectedAdvisory.issue_category?.replace(/_/g, ' ')}</p>
              </div>
              <div>
                <span className="text-slate-400">Calculated Risk Score:</span>
                <p className={`font-bold mt-0.5 font-mono ${selectedAdvisory.risk_score >= 80 ? 'text-rose-400' : 'text-amber-400'}`}>
                  {selectedAdvisory.risk_score}/100
                </p>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400">Farmer Observation / Telemetry:</span>
                <p className="text-slate-200 mt-0.5 italic">&quot;{selectedAdvisory.farmer_statement}&quot;</p>
              </div>
            </div>

            {/* Protocol breakdown */}
            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2">
                Proposed Agent Treatment Protocol
              </label>
              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1.5 text-slate-300">
                {(() => {
                  try {
                    const parsed = typeof selectedAdvisory.final_protocol === 'string'
                      ? JSON.parse(selectedAdvisory.final_protocol)
                      : selectedAdvisory.final_protocol;
                    return (
                      <>
                        <p><strong className="text-cyan-400">Action:</strong> {parsed?.action || 'Diagnostic survey'}</p>
                        <p><strong className="text-cyan-400">Dosage:</strong> {parsed?.chemical_dosage || 'Standard NPK formula'}</p>
                        <p><strong className="text-cyan-400">Timeline:</strong> {parsed?.timeline || 'Immediate'}</p>
                        <p><strong className="text-cyan-400">Est. Cost:</strong> ${parsed?.estimated_cost || 180}</p>
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
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2">
                Agronomist Review Notes & Calibration
              </label>
              <textarea
                rows={3}
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                placeholder="Add agronomic findings, dosage corrections, or field inspection instructions..."
                className="w-full text-xs bg-slate-950 border-slate-800 text-slate-200 rounded-xl p-3"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => navigate(`/advisory/${selectedAdvisory.id}`)}
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold"
              >
                Inspect Full Agent Reasoning Trace →
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => handleUpdateStatus(selectedAdvisory.id, 'RESOLVED')}
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-lg shadow-cyan-500/25 disabled:opacity-50"
                >
                  {actionLoading ? 'Saving...' : 'Resolve & Dispatch'}
                </button>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => handleUpdateStatus(selectedAdvisory.id, 'AUTO_APPROVED')}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-500/25 disabled:opacity-50"
                >
                  Approve Protocol
                </button>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => handleUpdateStatus(selectedAdvisory.id, 'ESCALATED')}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-500/25 disabled:opacity-50"
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
