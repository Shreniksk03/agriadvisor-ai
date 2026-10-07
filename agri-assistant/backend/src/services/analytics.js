import db from '../config/database.js';

/**
 * Generate pathogen ring data for network graph visualization
 * Models shared disease vectors between fields and pathogen types
 */
export async function generatePathogenRingData() {
  const advisories = await db.select('advisories', {}, { order: { column: 'created_at', ascending: false } });

  // Predefined pathogen network for rich visualization
  const pathogenNodes = [
    { id: 'blight_001', label: 'Late Blight', type: 'pathogen', severity: 'HIGH', color: '#ef4444' },
    { id: 'rust_001', label: 'Wheat Rust', type: 'pathogen', severity: 'CRITICAL', color: '#f97316' },
    { id: 'aphid_001', label: 'Aphid Colony', type: 'pest', severity: 'MODERATE', color: '#eab308' },
    { id: 'fusarium_001', label: 'Fusarium Wilt', type: 'pathogen', severity: 'HIGH', color: '#dc2626' },
    { id: 'botrytis_001', label: 'Botrytis (Gray Mold)', type: 'pathogen', severity: 'MODERATE', color: '#a855f7' },
    { id: 'nematode_001', label: 'Root-Knot Nematode', type: 'pest', severity: 'HIGH', color: '#f43f5e' },
    { id: 'mildew_001', label: 'Powdery Mildew', type: 'pathogen', severity: 'LOW', color: '#6366f1' },
  ];

  const fieldNodes = [
    { id: 'FLD-2026-001', label: 'Green Valley (Wheat)', type: 'field', crop: 'Wheat', color: '#22c55e' },
    { id: 'FLD-2026-002', label: 'Sunrise Acres (Corn)', type: 'field', crop: 'Corn', color: '#3b82f6' },
    { id: 'FLD-2026-003', label: 'River Bend (Soybean)', type: 'field', crop: 'Soybean', color: '#14b8a6' },
    { id: 'FLD-2026-004', label: 'Prairie Wind (Rice)', type: 'field', crop: 'Rice', color: '#f59e0b' },
    { id: 'FLD-2026-005', label: 'Cotton Ridge (Cotton)', type: 'field', crop: 'Cotton', color: '#8b5cf6' },
  ];

  // Generate links based on real advisories + enriched sample data
  const links = [
    { source: 'FLD-2026-001', target: 'rust_001', strength: 0.85, label: 'Active infection' },
    { source: 'FLD-2026-001', target: 'aphid_001', strength: 0.45, label: 'Minor presence' },
    { source: 'FLD-2026-002', target: 'blight_001', strength: 0.72, label: 'Spreading' },
    { source: 'FLD-2026-002', target: 'fusarium_001', strength: 0.60, label: 'Soil contamination' },
    { source: 'FLD-2026-003', target: 'nematode_001', strength: 0.90, label: 'Root damage observed' },
    { source: 'FLD-2026-003', target: 'aphid_001', strength: 0.55, label: 'Moderate colony' },
    { source: 'FLD-2026-004', target: 'blight_001', strength: 0.80, label: 'High humidity vector' },
    { source: 'FLD-2026-004', target: 'botrytis_001', strength: 0.65, label: 'Grain contamination' },
    { source: 'FLD-2026-005', target: 'mildew_001', strength: 0.50, label: 'Early detection' },
    { source: 'FLD-2026-005', target: 'fusarium_001', strength: 0.70, label: 'Soil transmission' },
    { source: 'blight_001', target: 'fusarium_001', strength: 0.35, label: 'Co-infection vector' },
    { source: 'rust_001', target: 'mildew_001', strength: 0.25, label: 'Environmental correlation' },
  ];

  // Add links from real advisories
  advisories.forEach((adv) => {
    if (adv.issue_category === 'DISEASE_FUNGAL' || adv.issue_category === 'PEST_OUTBREAK') {
      const existingField = fieldNodes.find((n) => n.id === adv.field_id);
      if (!existingField) {
        fieldNodes.push({
          id: adv.field_id,
          label: `${adv.field_id} (${adv.issue_category})`,
          type: 'field',
          crop: 'Unknown',
          color: '#94a3b8',
        });
      }
      const targetPathogen = adv.issue_category === 'DISEASE_FUNGAL' ? 'blight_001' : 'aphid_001';
      links.push({
        source: adv.field_id,
        target: targetPathogen,
        strength: (adv.risk_score || 50) / 100,
        label: `Risk: ${adv.risk_score || 'N/A'}`,
      });
    }
  });

  return {
    nodes: [...fieldNodes, ...pathogenNodes],
    links,
    metadata: {
      total_fields: fieldNodes.length,
      total_pathogens: pathogenNodes.length,
      total_connections: links.length,
      generated_at: new Date().toISOString(),
    },
  };
}

/**
 * Generate anomaly spike data for time-series visualization
 * 10-week trailing window with Z-score anomaly detection
 */
export async function generateAnomalySpikeData() {
  const now = new Date();
  const weeks = [];

  // Generate 10 weeks of data with realistic patterns
  const baseValues = {
    soil_moisture: [42, 45, 38, 55, 60, 48, 35, 52, 44, 41],
    nitrogen_level: [85, 78, 72, 80, 88, 75, 62, 70, 82, 77],
    pest_index: [12, 15, 18, 14, 22, 45, 16, 13, 19, 14],
    yield_projection: [88, 86, 84, 87, 82, 71, 85, 83, 86, 84],
    temperature_avg: [24, 25, 26, 23, 28, 32, 25, 24, 23, 22],
  };

  for (let i = 0; i < 10; i++) {
    const weekDate = new Date(now);
    weekDate.setDate(weekDate.getDate() - (9 - i) * 7);

    weeks.push({
      week: i + 1,
      date: weekDate.toISOString().split('T')[0],
      label: `W${i + 1}`,
      soil_moisture: baseValues.soil_moisture[i] + (Math.random() * 4 - 2),
      nitrogen_level: baseValues.nitrogen_level[i] + (Math.random() * 6 - 3),
      pest_index: baseValues.pest_index[i] + (Math.random() * 3 - 1),
      yield_projection: baseValues.yield_projection[i] + (Math.random() * 3 - 1.5),
      temperature_avg: baseValues.temperature_avg[i] + (Math.random() * 2 - 1),
    });
  }

  // Calculate Z-scores for anomaly detection
  const metrics = ['soil_moisture', 'nitrogen_level', 'pest_index', 'yield_projection', 'temperature_avg'];
  const anomalies = [];

  metrics.forEach((metric) => {
    const values = weeks.map((w) => w[metric]);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const stdDev = Math.sqrt(values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length);
    const threshold = 1.8; // Z-score threshold

    weeks.forEach((week, idx) => {
      const zScore = stdDev > 0 ? (week[metric] - mean) / stdDev : 0;
      if (!week.z_scores) week.z_scores = {};
      week.z_scores[metric] = Math.round(zScore * 100) / 100;

      if (Math.abs(zScore) > threshold) {
        anomalies.push({
          week: week.week,
          date: week.date,
          metric,
          value: Math.round(week[metric] * 100) / 100,
          z_score: Math.round(zScore * 100) / 100,
          direction: zScore > 0 ? 'SPIKE' : 'DROP',
          severity: Math.abs(zScore) > 2.5 ? 'CRITICAL' : 'WARNING',
        });
      }
    });
  });

  return {
    weeks: weeks.map((w) => ({
      ...w,
      soil_moisture: Math.round(w.soil_moisture * 100) / 100,
      nitrogen_level: Math.round(w.nitrogen_level * 100) / 100,
      pest_index: Math.round(w.pest_index * 100) / 100,
      yield_projection: Math.round(w.yield_projection * 100) / 100,
      temperature_avg: Math.round(w.temperature_avg * 100) / 100,
    })),
    anomalies,
    z_score_threshold: 1.8,
    metadata: {
      window_weeks: 10,
      metrics_tracked: metrics,
      total_anomalies: anomalies.length,
      generated_at: new Date().toISOString(),
    },
  };
}

/**
 * Run policy simulation with configurable thresholds
 */
export async function runPolicySimulation(params) {
  const { risk_threshold, auto_intervention_limit, escalation_threshold } = params;

  const advisories = await db.select('advisories', {});

  // Calculate metrics based on thresholds
  const totalAdvisories = advisories.length || 15; // Use sample size if no real data
  const sampleScores = advisories.length > 0
    ? advisories.map((a) => a.risk_score || 50)
    : [25, 35, 42, 55, 60, 68, 72, 45, 88, 92, 30, 48, 75, 81, 63];

  const autoApproved = sampleScores.filter((s) => s < risk_threshold).length;
  const escalated = sampleScores.filter((s) => s >= escalation_threshold).length;
  const underReview = totalAdvisories - autoApproved - escalated;

  const avgRisk = sampleScores.reduce((a, b) => a + b, 0) / sampleScores.length;
  const expectedYieldLoss = Math.max(0, (avgRisk * (100 - risk_threshold)) / 100);
  const resourceCostProjection = escalated * auto_intervention_limit * 0.8 + underReview * auto_intervention_limit * 0.3;
  const preventedLossValue = autoApproved * 1200 + underReview * 800;

  return {
    simulation_results: {
      total_advisories: totalAdvisories,
      auto_approved: autoApproved,
      under_review: underReview,
      escalated_to_human: escalated,
      auto_approval_rate: Math.round((autoApproved / totalAdvisories) * 100),
      escalation_rate: Math.round((escalated / totalAdvisories) * 100),
    },
    yield_metrics: {
      expected_yield_loss_percent: Math.round(expectedYieldLoss * 100) / 100,
      resource_cost_projection: Math.round(resourceCostProjection),
      prevented_loss_value: Math.round(preventedLossValue),
      net_benefit: Math.round(preventedLossValue - resourceCostProjection),
      yield_optimization_score: Math.round(Math.max(0, 100 - expectedYieldLoss)),
    },
    threshold_impact: {
      risk_threshold,
      auto_intervention_limit,
      escalation_threshold,
      sensitivity_note: risk_threshold < 40
        ? 'Aggressive threshold - more cases auto-approved, higher yield risk'
        : risk_threshold > 75
        ? 'Conservative threshold - most cases escalated, higher operational cost'
        : 'Balanced threshold - optimal risk-reward distribution',
    },
    distribution: sampleScores.map((score, idx) => ({
      advisory_index: idx + 1,
      risk_score: score,
      status: score < risk_threshold ? 'AUTO_APPROVED' : score >= escalation_threshold ? 'ESCALATED' : 'UNDER_REVIEW',
    })),
  };
}

export default { generatePathogenRingData, generateAnomalySpikeData, runPolicySimulation };
