import { useState, useEffect } from 'react';
import { analyticsAPI } from '../lib/api';
import { Activity, TrendingUp, ShieldAlert } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const METRIC_CONFIG = {
  pest_index: { label: 'Pest Density Index', color: '#3b82f6', unit: 'idx' },
  soil_moisture: { label: 'Soil Moisture (%)', color: '#06b6d4', unit: '%' },
  nitrogen_level: { label: 'Nitrogen Level (ppm)', color: '#10b981', unit: 'ppm' },
  yield_projection: { label: 'Yield Projection (%)', color: '#8b5cf6', unit: '%' },
  temperature_avg: { label: 'Avg Temperature (°C)', color: '#f59e0b', unit: '°C' },
};

export default function AnomalySpikes() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState('all');

  useEffect(() => {
    loadAnomalyData();
  }, []);

  const loadAnomalyData = async () => {
    setLoading(true);
    try {
      const { data: res } = await analyticsAPI.anomalySpikes();
      setData(res.data);
    } catch (err) {
      console.error('Failed to load anomaly data:', err);
    } finally {
      setLoading(false);
    }
  };

  const weeks = data?.weeks || [];
  const anomalies = data?.anomalies || [];

  // Custom Dot Renderer to explicitly flag Z-score breached coordinates with distinct glowing red dots (r=4 fill="#ef4444")
  const renderAnomalyDot = (metricKey) => (props) => {
    const { cx, cy, payload } = props;
    const zScore = payload?.z_scores?.[metricKey];
    const isBreached = zScore !== undefined && Math.abs(zScore) >= 1.8;

    if (isBreached) {
      return (
        <g key={`dot-anomaly-${metricKey}-${payload.week}`}>
          {/* Subtle outer glow */}
          <circle cx={cx} cy={cy} r={8} fill="#ef4444" opacity={0.25} className="animate-ping" />
          {/* Required glowing red dot: r=4 fill="#ef4444" */}
          <circle cx={cx} cy={cy} r={4} fill="#ef4444" stroke="#ffffff" strokeWidth={1.5} />
          <text
            x={cx}
            y={cy - 9}
            textAnchor="middle"
            fill="#ef4444"
            fontSize="9"
            fontWeight="bold"
            fontFamily="monospace"
          >
            {zScore > 0 ? `+${zScore}σ` : `${zScore}σ`}
          </text>
        </g>
      );
    }

    return (
      <circle
        key={`dot-norm-${metricKey}-${payload.week}`}
        cx={cx}
        cy={cy}
        r={2.5}
        fill={METRIC_CONFIG[metricKey]?.color || '#3b82f6'}
        stroke="#0d0f12"
        strokeWidth={1}
      />
    );
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-500" />
            Agronomic Anomaly Monitor
          </h1>
          <p className="text-slate-400 text-xs mt-0.5">
            Trailing 10-week telemetry time-series explicitly flagging statistical outlier breaches with red coordinates
          </p>
        </div>

        {/* Metric Selector Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto bg-[#0d0f12] p-1.5 rounded-lg border border-white/5 font-mono text-xs">
          <button
            onClick={() => setSelectedMetric('all')}
            className={`px-2.5 py-1 rounded transition-all ${
              selectedMetric === 'all'
                ? 'bg-blue-600 text-white font-semibold shadow-[0_0_12px_rgba(37,99,235,0.4)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Channels
          </button>
          {Object.entries(METRIC_CONFIG).map(([key, cfg]) => (
            <button
              key={key}
              onClick={() => setSelectedMetric(key)}
              className={`px-2.5 py-1 rounded transition-all ${
                selectedMetric === key
                  ? 'bg-blue-600 text-white font-semibold shadow-[0_0_12px_rgba(37,99,235,0.4)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {cfg.label.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Overview Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#0d0f12] border border-white/5 rounded-xl p-5 flex flex-col justify-between h-28">
          <div className="flex items-center justify-between">
            <p className="text-xs tracking-wider text-slate-500 uppercase font-semibold">Flagged Outlier Coordinates</p>
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          </div>
          <p className="text-3xl font-bold text-rose-400 font-mono">{anomalies.length}</p>
          <p className="text-[10px] text-slate-500 font-mono">Statistical Z-Score |Z| ≥ 1.8σ</p>
        </div>

        <div className="bg-[#0d0f12] border border-white/5 rounded-xl p-5 flex flex-col justify-between h-28">
          <p className="text-xs tracking-wider text-slate-500 uppercase font-semibold">Monitoring Trailing Window</p>
          <p className="text-3xl font-bold text-slate-100 font-mono">10 Weeks</p>
          <p className="text-[10px] text-slate-500 font-mono">Rolling multi-parameter field telemetry</p>
        </div>

        <div className="bg-[#0d0f12] border border-white/5 rounded-xl p-5 flex flex-col justify-between h-28">
          <p className="text-xs tracking-wider text-slate-500 uppercase font-semibold">Active Telemetry Channels</p>
          <p className="text-3xl font-bold text-blue-400 font-mono">5 Channels</p>
          <p className="text-[10px] text-slate-500 font-mono">Pest, Moisture, NPK, Yield, Temp</p>
        </div>
      </div>

      {/* Time-series Chart */}
      <div className="bg-[#0d0f12] border border-white/5 rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <h3 className="text-xs tracking-wider text-slate-500 uppercase font-semibold flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-500" />
            Trailing 10-Week Multi-Parameter Telemetry Monitor
          </h3>
          <div className="flex items-center gap-2 text-[11px] font-mono text-rose-400 bg-rose-950/40 px-2.5 py-1 rounded border border-rose-500/20">
            <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
            <span>Red Dots = Anomaly Threshold Breached (|Z| &ge; 1.8&sigma;)</span>
          </div>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weeks}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2430" />
              <XAxis dataKey="label" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }} />
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
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px', fontFamily: 'monospace' }} />

              {(selectedMetric === 'all' || selectedMetric === 'pest_index') && (
                <Line
                  type="monotone"
                  dataKey="pest_index"
                  name="Pest Density Index"
                  stroke={METRIC_CONFIG.pest_index.color}
                  strokeWidth={2.5}
                  dot={renderAnomalyDot('pest_index')}
                  activeDot={{ r: 6 }}
                />
              )}
              {(selectedMetric === 'all' || selectedMetric === 'soil_moisture') && (
                <Line
                  type="monotone"
                  dataKey="soil_moisture"
                  name="Soil Moisture (%)"
                  stroke={METRIC_CONFIG.soil_moisture.color}
                  strokeWidth={2}
                  dot={renderAnomalyDot('soil_moisture')}
                  activeDot={{ r: 5 }}
                />
              )}
              {(selectedMetric === 'all' || selectedMetric === 'nitrogen_level') && (
                <Line
                  type="monotone"
                  dataKey="nitrogen_level"
                  name="Nitrogen (ppm)"
                  stroke={METRIC_CONFIG.nitrogen_level.color}
                  strokeWidth={2}
                  dot={renderAnomalyDot('nitrogen_level')}
                  activeDot={{ r: 5 }}
                />
              )}
              {(selectedMetric === 'all' || selectedMetric === 'yield_projection') && (
                <Line
                  type="monotone"
                  dataKey="yield_projection"
                  name="Yield Projection (%)"
                  stroke={METRIC_CONFIG.yield_projection.color}
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={renderAnomalyDot('yield_projection')}
                />
              )}
              {(selectedMetric === 'all' || selectedMetric === 'temperature_avg') && (
                <Line
                  type="monotone"
                  dataKey="temperature_avg"
                  name="Temperature (°C)"
                  stroke={METRIC_CONFIG.temperature_avg.color}
                  strokeWidth={2}
                  dot={renderAnomalyDot('temperature_avg')}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Anomalies Detected Table */}
      <div className="bg-[#0d0f12] border border-white/5 rounded-xl p-6">
        <h3 className="text-xs tracking-wider text-slate-500 uppercase font-semibold mb-4 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-500" />
          Detected Statistical Spikes & Outlier Coordinates
        </h3>

        {anomalies.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#080a0e] border-b border-white/5 text-slate-500 font-mono uppercase">
                <tr>
                  <th className="py-2.5 px-3">Period</th>
                  <th className="py-2.5 px-3">Telemetry Parameter</th>
                  <th className="py-2.5 px-3">Observed Metric</th>
                  <th className="py-2.5 px-3">Z-Score Deviation</th>
                  <th className="py-2.5 px-3">Direction</th>
                  <th className="py-2.5 px-3">Severity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {anomalies.map((anom, idx) => (
                  <tr key={idx} className="hover:bg-[#12151b] transition-colors">
                    <td className="py-3 px-3 font-mono text-xs text-blue-400">
                      Week {anom.week} <span className="text-slate-500">({anom.date})</span>
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-200">
                      {anom.metric.replace(/_/g, ' ').toUpperCase()}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-slate-100">
                      {anom.value}
                    </td>
                    <td className="py-3 px-3 font-mono text-xs font-bold text-rose-400">
                      {anom.z_score > 0 ? `+${anom.z_score}` : anom.z_score}σ
                    </td>
                    <td className="py-3 px-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold uppercase border ${
                        anom.direction === 'SPIKE'
                          ? 'bg-rose-950/40 text-rose-400 border-rose-500/30'
                          : 'bg-blue-950/40 text-blue-400 border-blue-500/30'
                      }`}>
                        {anom.direction === 'SPIKE' ? '▲ High Spike' : '▼ Deep Drop'}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold uppercase border ${
                        anom.severity === 'CRITICAL'
                          ? 'bg-rose-950/40 text-rose-300 border-rose-500/40'
                          : 'bg-amber-950/40 text-amber-300 border-amber-500/40'
                      }`}>
                        {anom.severity}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-slate-500 text-xs font-mono">
            No statistical anomalies detected beyond the 1.8σ threshold in the active window.
          </div>
        )}
      </div>
    </div>
  );
}
