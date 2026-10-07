import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Activity, CheckCircle2, AlertTriangle, Play, Sliders, ToggleLeft, ToggleRight, ArrowRight } from 'lucide-react';
import { advisoryAPI } from '../lib/api';
import AgentReasoningTrace from '../components/AgentReasoningTrace';

const CROP_TYPES = ['Wheat', 'Corn', 'Soybean', 'Rice', 'Cotton', 'Barley', 'Canola'];
const WEATHER_OPTIONS = ['Sunny', 'Heavy Rain', 'Drought', 'Frost', 'High Humidity', 'Hail Threat'];

const PRESETS = {
  BLIGHT_HIGH_RISK: {
    name: '🔴 Critical Late Blight Vector',
    field_id: 'FLD-2026-BLIGHT',
    crop_type: 'Corn',
    soil_ph: 5.2,
    moisture_level_percent: 88,
    nitrogen_ppm: 32,
    farmer_observation: 'Rapid necrotic water-soaked lesions observed on lower leaves with white mycelial growth on undersides after continuous rain',
    weather_forecast: 'Heavy Rain',
    prioritize_bio: true,
    emergency_drainage: true,
    force_local_sim: false,
  },
  DROUGHT_DEFICIT: {
    name: '🟠 Severe Drought & Nitrogen Loss',
    field_id: 'FLD-2026-DROUGHT',
    crop_type: 'Wheat',
    soil_ph: 7.8,
    moisture_level_percent: 18,
    nitrogen_ppm: 25,
    farmer_observation: 'Stunted tillering with severe leaf curling and yellowing from tip backward in dry cracked soil',
    weather_forecast: 'Drought',
    prioritize_bio: false,
    emergency_drainage: false,
    force_local_sim: false,
  },
  OPTIMAL_BASELINE: {
    name: '🟢 Healthy Baseline (Auto-Approve)',
    field_id: 'FLD-2026-BASELINE',
    crop_type: 'Soybean',
    soil_ph: 6.6,
    moisture_level_percent: 52,
    nitrogen_ppm: 95,
    farmer_observation: 'Uniform canopy development, vigorous nodulation, zero visible foliar lesions, standard routine check',
    weather_forecast: 'Sunny',
    prioritize_bio: true,
    emergency_drainage: false,
    force_local_sim: false,
  },
};

export default function ScoreField() {
  const [form, setForm] = useState({
    field_id: 'FLD-2026-' + Math.floor(100 + Math.random() * 900),
    crop_type: 'Wheat',
    soil_ph: 6.4,
    moisture_level_percent: 42,
    nitrogen_ppm: 65,
    farmer_observation: 'Moderate yellowing on lower leaves during warm weather',
    weather_forecast: 'Sunny',
    prioritize_bio: true,
    emergency_drainage: false,
    force_local_sim: false,
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const applyPreset = (presetKey) => {
    const preset = PRESETS[presetKey];
    if (preset) {
      setForm((prev) => ({
        ...prev,
        ...preset,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setResult(null);

    try {
      const payload = {
        field_id: form.field_id,
        crop_type: form.crop_type,
        soil_ph: parseFloat(form.soil_ph),
        moisture_level_percent: parseInt(form.moisture_level_percent, 10),
        nitrogen_ppm: parseInt(form.nitrogen_ppm, 10),
        farmer_observation: form.farmer_observation || 'Standard telemetry verification',
        weather_forecast: form.weather_forecast,
      };

      const { data } = await advisoryAPI.scoreSingle(payload);
      setResult(data.data);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.details?.[0]?.message || 'Failed to score field.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
            <span className="p-2 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
              <Sparkles className="w-6 h-6" />
            </span>
            Score a Crop Field
          </h1>
          <p className="text-slate-300 text-sm mt-1">
            Submit multi-channel field telemetry for real-time 3-agent autonomous diagnosis and prescription
          </p>
        </div>

        {/* Quick Scenario Sandbox Presets */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Quick Presets:</span>
          {Object.entries(PRESETS).map(([key, p]) => (
            <button
              key={key}
              type="button"
              onClick={() => applyPreset(key)}
              className="px-2.5 py-1 rounded-lg text-xs bg-slate-900 text-slate-300 hover:text-white border border-slate-800 hover:border-cyan-500/40 transition-all font-medium"
            >
              {p.name.split(' ')[0]} {p.crop_type}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Input Form */}
        <div className="glass-card p-6 bg-slate-900/85 border border-slate-800 space-y-5">
          <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            Field Telemetry Sandbox Controls
          </h2>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Field Identifier</label>
                <input
                  type="text"
                  value={form.field_id}
                  onChange={(e) => handleChange('field_id', e.target.value)}
                  required
                  className="w-full text-xs font-mono bg-slate-950 border-slate-800 text-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Target Crop</label>
                <select
                  value={form.crop_type}
                  onChange={(e) => handleChange('crop_type', e.target.value)}
                  className="w-full text-xs bg-slate-950 border-slate-800 text-slate-200 rounded-xl"
                >
                  {CROP_TYPES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Metric Sliders & Inputs */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[11px] text-slate-400 font-medium">Soil pH</span>
                  <span className="font-mono text-xs font-bold text-cyan-400">{form.soil_ph}</span>
                </div>
                <input
                  type="number"
                  step="0.1"
                  min="3.5"
                  max="9.5"
                  value={form.soil_ph}
                  onChange={(e) => handleChange('soil_ph', e.target.value)}
                  className="w-full text-xs bg-slate-900 border-slate-800 font-mono py-1 px-2"
                />
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[11px] text-slate-400 font-medium">Moisture</span>
                  <span className="font-mono text-xs font-bold text-cyan-400">{form.moisture_level_percent}%</span>
                </div>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={form.moisture_level_percent}
                  onChange={(e) => handleChange('moisture_level_percent', e.target.value)}
                  className="w-full text-xs bg-slate-900 border-slate-800 font-mono py-1 px-2"
                />
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[11px] text-slate-400 font-medium">Nitrogen</span>
                  <span className="font-mono text-xs font-bold text-cyan-400">{form.nitrogen_ppm} ppm</span>
                </div>
                <input
                  type="number"
                  min="0"
                  max="300"
                  value={form.nitrogen_ppm}
                  onChange={(e) => handleChange('nitrogen_ppm', e.target.value)}
                  className="w-full text-xs bg-slate-900 border-slate-800 font-mono py-1 px-2"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Weather Forecast</label>
              <select
                value={form.weather_forecast}
                onChange={(e) => handleChange('weather_forecast', e.target.value)}
                className="w-full text-xs bg-slate-950 border-slate-800 text-slate-200 rounded-xl"
              >
                {WEATHER_OPTIONS.map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Farmer Observations & Symptoms</label>
              <textarea
                rows={3}
                value={form.farmer_observation}
                onChange={(e) => handleChange('farmer_observation', e.target.value)}
                placeholder="Describe leaf discoloration, wilting, lesions, or sensor irregularities..."
                className="w-full text-xs bg-slate-950 border-slate-800 text-slate-200 rounded-xl p-3"
              />
            </div>

            {/* Toggle Checkboxes for Frictionless Sandbox Testing */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer hover:bg-slate-900/60 transition-colors">
                <span className="text-xs text-slate-300">Prioritize Biological / Organic Protocols</span>
                <input
                  type="checkbox"
                  checked={form.prioritize_bio}
                  onChange={(e) => handleChange('prioritize_bio', e.target.checked)}
                  className="w-4 h-4 accent-cyan-500 rounded"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer hover:bg-slate-900/60 transition-colors">
                <span className="text-xs text-slate-300">Flag Immediate Subsurface Drainage Need</span>
                <input
                  type="checkbox"
                  checked={form.emergency_drainage}
                  onChange={(e) => handleChange('emergency_drainage', e.target.checked)}
                  className="w-4 h-4 accent-cyan-500 rounded"
                />
              </label>
            </div>

            {/* Primary Neon CTA Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 rounded-xl font-bold text-white text-sm bg-gradient-to-r from-cyan-500 via-blue-600 to-cyan-500 hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 border border-cyan-400/40"
            >
              {loading ? (
                <>
                  <div className="spinner w-5 h-5 border-2" />
                  <span>Orchestrating 3-Agent AI Pipeline...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>Execute Autonomous AI Scoring</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Results & Trace Display */}
        <div className="space-y-4">
          {result ? (
            <div className="space-y-4 animate-fade-in">
              {/* Verdict Banner */}
              <div className="glass-card p-6 bg-slate-900/90 border border-cyan-500/30 rounded-2xl shadow-xl">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono font-bold text-cyan-400">
                    DIAGNOSIS COMPLETE: {result.advisory?.field_id}
                  </span>
                  <span
                    className={`text-xs px-3 py-1 rounded-full font-bold uppercase border ${
                      result.pipeline_summary?.status === 'AUTO_APPROVED'
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                        : result.pipeline_summary?.status === 'ESCALATED'
                        ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                        : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                    }`}
                  >
                    {result.pipeline_summary?.status || 'UNDER_REVIEW'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-[11px] text-slate-400 block">Classified Issue</span>
                    <p className="text-sm font-bold text-slate-100 mt-0.5">
                      {result.pipeline_summary?.issue_classification?.replace(/_/g, ' ')}
                    </p>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-[11px] text-slate-400 block">Crop Risk Score</span>
                    <p
                      className={`text-sm font-bold font-mono mt-0.5 ${
                        result.pipeline_summary?.risk_score >= 80 ? 'text-rose-400' : 'text-amber-400'
                      }`}
                    >
                      {result.pipeline_summary?.risk_score}/100
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/advisory/${result.advisory?.id}`)}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 border border-slate-700 transition-colors"
                >
                  <span>Open Deep Advisory Trace Record</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Step-by-Step Reasoning Trace */}
              <div className="glass-card p-6 bg-slate-900/85 border border-slate-800 rounded-2xl">
                <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  Live 3-Agent Pipeline Execution Chain
                </h3>
                <AgentReasoningTrace executionTrace={result.execution_trace} />
              </div>
            </div>
          ) : (
            <div className="glass-card p-12 text-center bg-slate-900/80 border border-slate-800 rounded-2xl flex flex-col items-center justify-center h-full min-h-[400px]">
              <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-4">
                <Sparkles className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-100 mb-1">Awaiting Telemetry Submission</h3>
              <p className="text-xs text-slate-400 max-w-sm">
                Use the sandbox controls or select a preset to watch the multi-agent pipeline execute live.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
