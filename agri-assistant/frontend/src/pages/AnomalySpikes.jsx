import { useState, useEffect } from 'react';
import { analyticsAPI } from '../lib/api';
import { Activity, AlertTriangle, TrendingUp, Filter, ShieldAlert } from 'lucide-react';
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
  pest_index: { label: 'Pest Density Index', color: '#f43f5e', unit: 'idx' },
  soil_moisture: { label: 'Soil Moisture (%)', color: '#38bdf8', unit: '%' },
  nitrogen_level: { label: 'Nitrogen Level (ppm)', color: '#10b981', unit: 'ppm' },
  yield_projection: { label: 'Yield Projection (%)', color: '#a855f7', unit: '%' },
  temperature_avg: { label: 'Avg Temperature (°C)', color: '#f59e0b', unit: '°C' },
};

export default function AnomalySpikes() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState('pest_index');

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

  // Custom Dot Renderer to distinctly flag Z-score breached coordinates with bright red dots
  const renderAnomalyDot = (metricKey) => (props) => {
    const { cx, cy, payload } = props;
    const zScore = payload?.z_scores?.[metricKey];
    const isBreached = zScore !== undefined && Math.abs(zScore) >= 1.8;

    if (isBreached) {
      return (
        <g key={`dot-anomaly-${metricKey}-${payload.week}`}>
          {/* Outer glowing pulsing ring */}
          <circle cx={cx} cy={cy} r={12} fill="#f43f5e" opacity={0.35} className="animate-ping" />
          {/* Distinct red anomaly marker */}
          <circle cx={cx} cy={cy} r={7} fill="#f43f5e" stroke="#ffffff" strokeWidth={2} />
          <text
            x={cx}
            y={cy - 12}
            textAnchor="middle"
            fill="#f43f5e"
            fontSize="10"
            fontWeight="bold"
            fontFamily="monospace"
          >
            ! {zScore > 0 ? `+${zScore}σ` : `${zScore}σ`}
          </text>
        </g>
      );
    }

    return (
      <circle
        key={`dot-norm-${metricKey}-${payload.week}`}
        cx={cx}
        cy={cy}
        r={3.5}
        fill={METRIC_CONFIG[metricKey]?.color || '#38bdf8'}
        stroke="#0f172a"
        strokeWidth={1.5}
      />
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
            <span className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
              <Activity className="w-6 h-6" />
            </span>
            Agronomic Anomaly Monitor
          </h1>
          <p className="text-slate-300 text-sm mt-1">
            Trailing 10-week telemetry time-series explicitly flagging statistical outlier breaches with red coordinates
          </p>
        </div>

        {/* Metric Selector Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto bg-slate-900 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setSelectedMetric('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedMetric === 'all'
                ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Channels
          </button>
          {Object.entries(METRIC_CONFIG).map(([key, cfg]) => (
            <button
              key={key}
              onClick={() => setSelectedMetric(key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedMetric === key
                  ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/25'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {cfg.label.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Overview Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-4 border border-rose-500/30 bg-rose-500/10">
          <div className="flex items-center justify-between">
            <p className="text-xs text-rose-400 font-medium">Flagged Outlier Coordinates</p>
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
          </div>
          <p className="text-2xl font-bold text-slate-100 mt-1 font-mono">{anomalies.length}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Statistical Z-Score |Z| ≥ 1.8σ</p>
        </div>

        <div className="glass-card p-4 border border-amber-500/30 bg-amber-500/10">
          <p className="text-xs text-amber-400 font-medium">Monitoring Trailing Window</p>
          <p className="text-2xl font-bold text-slate-100 mt-1 font-mono">10 Weeks</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Rolling field telemetry window</p>
        </div>

        <div className="glass-card p-4 border border-cyan-500/30 bg-cyan-500/10">
          <p className="text-xs text-cyan-400 font-medium">Active Telemetry Channels</p>
          <p className="text-2xl font-bold text-slate-100 mt-1 font-mono">5 Parameters</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Pest, Moisture, NPK, Yield, Temp</p>
        </div>
      </div>

      {/* Time-series Chart */}
      <div className="glass-card p-6 bg-slate-900/85 border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            Trailing 10-Week Multi-Parameter Telemetry Chart
          </h3>
          <div className="flex items-center gap-2 text-xs font-mono text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20">
            <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
            <span>Red Dots = Anomaly Threshold Breached (|Z| &ge; 1.8&sigma;)</span>
          </div>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weeks}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="label" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#020617',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  color: '#f8fafc',
                  fontSize: '12px',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />

              {(selectedMetric === 'all' || selectedMetric === 'pest_index') && (
                <Line
                  type="monotone"
                  dataKey="pest_index"
                  name="Pest Density Index"
                  stroke={METRIC_CONFIG.pest_index.color}
                  strokeWidth={2.5}
                  dot={renderAnomalyDot('pest_index')}
                  activeDot={{ r: 8 }}
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
                  activeDot={{ r: 7 }}
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
                  activeDot={{ r: 7 }}
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
      <div className="glass-card p-6 bg-slate-900/85 border border-slate-800">
        <h3 className="text-sm font-semibold text-slate-100 mb-4 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-400" />
          Detected Statistical Spikes & Outlier Coordinates
        </h3>

        {anomalies.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-xs font-semibold text-slate-400">
                <tr>
                  <th className="py-3 px-4">Period</th>
                  <th className="py-3 px-4">Telemetry Parameter</th>
                  <th className="py-3 px-4">Observed Metric</th>
                  <th className="py-3 px-4">Z-Score Deviation</th>
                  <th className="py-3 px-4">Direction</th>
                  <th className="py-3 px-4">Severity Classification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {anomalies.map((anom, idx) => (
                  <tr key={idx} className="hover:bg-slate-850/60 transition-colors">
                    <td className="py-3 px-4 font-mono text-xs text-cyan-300">
                      Week {anom.week} <span className="text-slate-400">({anom.date})</span>
                    </td>
                    <td className="py-3 px-4 text-xs font-semibold text-slate-200">
                      {anom.metric.replace(/_/g, ' ').toUpperCase()}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-xs text-slate-100">
                      {anom.value}
                    </td>
                    <td className="py-3 px-4 font-mono text-xs font-bold text-amber-400">
                      {anom.z_score > 0 ? `+${anom.z_score}` : anom.z_score}σ
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase border ${
                        anom.direction === 'SPIKE'
                          ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                          : 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
                      }`}>
                        {anom.direction === 'SPIKE' ? '▲ High Spike' : '▼ Deep Drop'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase border ${
                        anom.severity === 'CRITICAL'
                          ? 'bg-rose-500/25 text-rose-300 border-rose-500/40'
                          : 'bg-amber-500/25 text-amber-300 border-amber-500/40'
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
          <div className="py-8 text-center text-slate-400 text-xs">
            No statistical anomalies detected beyond the 1.8σ threshold in the active window.
          </div>
        )}
      </div>
    </div>
  );
}
