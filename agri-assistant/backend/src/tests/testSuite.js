import { executeAgentPipeline } from '../services/agentPipeline.js';
import { generatePathogenRingData, generateAnomalySpikeData, runPolicySimulation } from '../services/analytics.js';
import db from '../config/database.js';

async function runTestSuite() {
  console.log('🌾 ═══ RUNNING BACKEND INTEGRATION TEST SUITE ═══\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ ${message}`);
      passed++;
    } else {
      console.error(`  ✗ FAILED: ${message}`);
      failed++;
    }
  }

  try {
    // Test 1: Agent Pipeline Execution
    console.log('--- Test 1: Autonomous 3-Agent Pipeline Execution ---');
    const samplePayload = {
      field_id: 'FLD-TEST-001',
      crop_type: 'Wheat',
      soil_ph: 5.2,
      moisture_level_percent: 22,
      nitrogen_ppm: 35,
      farmer_observation: 'Yellowing leaves and dry soil noticed around perimeter',
      weather_forecast: 'Drought',
    };

    const result = await executeAgentPipeline(samplePayload);
    assert(result.advisory !== undefined, 'Pipeline returned saved advisory');
    assert(result.execution_trace.length === 3, 'Pipeline generated exactly 3 execution steps');
    assert(result.pipeline_summary.risk_score >= 0 && result.pipeline_summary.risk_score <= 100, 'Risk score is within 0-100');
    assert(result.advisory.field_id === 'FLD-TEST-001', 'Advisory preserved field_id');

    // Test 2: Database Storage & Query
    console.log('\n--- Test 2: Database Layer & In-Memory Adapter ---');
    const storedAdvisory = await db.getById('advisories', result.advisory.id);
    assert(storedAdvisory !== null, 'Advisory successfully retrieved by ID');
    assert(storedAdvisory.field_id === 'FLD-TEST-001', 'Advisory matches stored data');

    // Test 3: Pathogen Ring Analytics
    console.log('\n--- Test 3: Pathogen Ring Analytics Data ---');
    const pathogenData = await generatePathogenRingData();
    assert(pathogenData.nodes.length > 0, 'Pathogen nodes generated');
    assert(pathogenData.links.length > 0, 'Pathogen links generated');
    assert(pathogenData.metadata.total_pathogens > 0, 'Pathogen metadata present');

    // Test 4: Anomaly Spike Monitor
    console.log('\n--- Test 4: Anomaly Spike Detection ---');
    const anomalyData = await generateAnomalySpikeData();
    assert(anomalyData.weeks.length === 10, 'Generated exactly 10 weeks of trailing data');
    assert(Array.isArray(anomalyData.anomalies), 'Anomalies array returned');

    // Test 5: Policy Simulator
    console.log('\n--- Test 5: Policy & Yield Simulation ---');
    const simData = await runPolicySimulation({
      risk_threshold: 65,
      auto_intervention_limit: 500,
      escalation_threshold: 80,
    });
    assert(simData.simulation_results.total_advisories > 0, 'Simulated total advisories > 0');
    assert(typeof simData.yield_metrics.net_benefit === 'number', 'Net benefit metric calculated');
    assert(Array.isArray(simData.distribution), 'Distribution array returned');

    console.log(`\n🌾 ═══ TEST RESULTS: ${passed} PASSED, ${failed} FAILED ═══\n`);
    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error('Test suite exception:', err);
    process.exit(1);
  }
}

runTestSuite();
