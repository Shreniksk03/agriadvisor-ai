import { ai, GEMINI_MODEL, SYSTEM_PROMPT } from '../config/gemini.js';
import { Agent1OutputSchema, Agent2OutputSchema, Agent3OutputSchema } from '../validators/schemas.js';
import db from '../config/database.js';

// ─── Agent Prompts ───────────────────────────────────────────────────────────

const AGENT1_PROMPT = `You are Agent 1: Soil & Triage Orchestrator.

TASK: Ingest the farmer's field statement and soil metadata. Extract core entities (crop type, symptoms, soil metrics), classify the agronomic issue into one of these categories:
- NUTRIENT_DEFICIENCY: Soil telemetry indicates lack of nitrogen, phosphorus, or potassium
- PEST_OUTBREAK: Visual or sensor evidence of localized insect/pathogen damage
- DROUGHT_STRESS: Moisture levels below critical thresholds
- WATERLOGGING: Poor drainage leading to root asphyxiation
- DISEASE_FUNGAL: High humidity combined with specific spore detections

Generate a 3-step deterministic audit plan.

REASONING RULES:
- If soil_ph < 5.5 or > 8.0, flag pH imbalance
- If moisture_level_percent < 25, consider DROUGHT_STRESS
- If moisture_level_percent > 85, consider WATERLOGGING
- If nitrogen_ppm < 40, flag NUTRIENT_DEFICIENCY
- Parse farmer_observation for keywords: yellowing, spots, wilting, mold, insects

You MUST respond with ONLY valid JSON matching this exact schema:
{
  "issue_classification": "string (one of the categories above)",
  "extracted_entities": {
    "crop": "string",
    "field_id": "string",
    "symptoms": ["array of identified symptoms"],
    "soil_metrics": { "ph": number, "moisture": number, "nitrogen": number }
  },
  "severity_estimate": "LOW | MODERATE | HIGH | CRITICAL",
  "audit_plan": [
    { "step": 1, "task": "string description", "priority": "LOW | MEDIUM | HIGH" },
    { "step": 2, "task": "string description", "priority": "LOW | MEDIUM | HIGH" },
    { "step": 3, "task": "string description", "priority": "LOW | MEDIUM | HIGH" }
  ]
}`;

const AGENT2_PROMPT = `You are Agent 2: Climate & Pathogen Risk Worker.

TASK: Evaluate the Triage Plan from Agent 1 against weather forecast and historical pest data. Calculate a precise Crop Risk Score (0-100) based on combined factors.

SCORING ALGORITHM:
- Base score starts at 20
- Weather risk multiplier: Drought (+25), Heavy Rain (+20), Frost (+30), Sunny (+0)
- Pathogen detection: If symptoms suggest pest/fungal, add 15-30 based on severity
- Nutrient deficiency severity: mild (+5), moderate (+15), severe (+25)
- Moisture deviation from optimal (40-60%): each 10% deviation adds +5
- pH deviation from optimal (6.0-7.5): each 0.5 unit deviation adds +3
- Cap the final score at 100

You MUST respond with ONLY valid JSON:
{
  "climate_risk": "string summary of weather impact",
  "pathogen_detected": boolean,
  "pathogen_type": "string or null",
  "crop_risk_score": number (0-100),
  "confidence_score": number (0-100),
  "yield_impact_percent": number (estimated yield loss percentage),
  "audit_reasoning": "string detailed reasoning chain"
}`;

const AGENT3_PROMPT = `You are Agent 3: Agronomy Arbiter Agent.

TASK: Synthesize the findings from Agent 1 (Triage) and Agent 2 (Risk Assessment). Apply the following decision logic:
- If crop_risk_score < 30: AUTO_APPROVED - Standard maintenance protocol
- If crop_risk_score 30-79: UNDER_REVIEW - Enhanced monitoring with intervention plan
- If crop_risk_score >= 80 (escalation threshold): ESCALATED - Mandatory human review with urgent protocol

Output a precise, actionable treatment plan with chemical dosages, timelines, and cost estimates.

You MUST respond with ONLY valid JSON:
{
  "final_verdict": "string comprehensive verdict summary",
  "status_transition": "AUTO_APPROVED | ESCALATED | UNDER_REVIEW | RESOLVED",
  "treatment_protocol": {
    "action": "string specific action plan",
    "chemical_dosage": "string dosage specification",
    "timeline": "string implementation timeline",
    "estimated_cost": number
  },
  "requires_human_review": boolean,
  "confidence": number (0-100)
}`;

// ─── Deterministic Fallback Engine ───────────────────────────────────────────
// Used when Gemini API is unavailable - provides scientifically-grounded results

function deterministicAgent1(payload) {
  const { field_id, crop_type, soil_ph, moisture_level_percent, nitrogen_ppm, farmer_observation, weather_forecast } = payload;

  const symptoms = [];
  let classification = 'NUTRIENT_DEFICIENCY';
  let severity = 'MODERATE';

  const obsLower = farmer_observation.toLowerCase();

  if (obsLower.includes('yellow') || obsLower.includes('pale')) symptoms.push('leaf_chlorosis');
  if (obsLower.includes('spot') || obsLower.includes('lesion')) symptoms.push('foliar_lesions');
  if (obsLower.includes('wilt') || obsLower.includes('droop')) symptoms.push('turgor_loss');
  if (obsLower.includes('mold') || obsLower.includes('fungus') || obsLower.includes('blight')) symptoms.push('fungal_presence');
  if (obsLower.includes('insect') || obsLower.includes('bug') || obsLower.includes('pest')) symptoms.push('insect_damage');
  if (obsLower.includes('rot') || obsLower.includes('smell')) symptoms.push('root_decay');

  if (symptoms.length === 0) symptoms.push('general_stress_indicators');

  // Classification logic
  if (moisture_level_percent < 25) {
    classification = 'DROUGHT_STRESS';
    severity = moisture_level_percent < 15 ? 'CRITICAL' : 'HIGH';
  } else if (moisture_level_percent > 85) {
    classification = 'WATERLOGGING';
    severity = moisture_level_percent > 95 ? 'CRITICAL' : 'HIGH';
  } else if (symptoms.includes('fungal_presence') || symptoms.includes('foliar_lesions')) {
    classification = 'DISEASE_FUNGAL';
    severity = 'HIGH';
  } else if (symptoms.includes('insect_damage')) {
    classification = 'PEST_OUTBREAK';
    severity = 'HIGH';
  } else if (nitrogen_ppm < 40 || soil_ph < 5.5 || soil_ph > 8.0) {
    classification = 'NUTRIENT_DEFICIENCY';
    severity = nitrogen_ppm < 20 ? 'HIGH' : 'MODERATE';
  }

  if (weather_forecast === 'Frost') severity = 'CRITICAL';

  return {
    issue_classification: classification,
    extracted_entities: {
      crop: crop_type,
      field_id: field_id,
      symptoms: symptoms,
      soil_metrics: { ph: soil_ph, moisture: moisture_level_percent, nitrogen: nitrogen_ppm },
    },
    severity_estimate: severity,
    audit_plan: [
      { step: 1, task: `Conduct comprehensive soil assay for ${field_id} focusing on ${classification.toLowerCase().replace('_', ' ')} indicators`, priority: 'HIGH' },
      { step: 2, task: `Cross-reference ${crop_type} historical yield data with current ${weather_forecast.toLowerCase()} weather pattern and moisture at ${moisture_level_percent}%`, priority: 'MEDIUM' },
      { step: 3, task: `Execute targeted intervention protocol for ${classification} with severity level ${severity}`, priority: severity === 'CRITICAL' ? 'HIGH' : 'MEDIUM' },
    ],
  };
}

function deterministicAgent2(payload, agent1Output) {
  const { soil_ph, moisture_level_percent, nitrogen_ppm, weather_forecast } = payload;

  let riskScore = 20;
  let climateRisk = 'Stable conditions with minimal weather-related stress';
  let pathogenDetected = false;
  let pathogenType = null;

  // Weather risk
  const weatherRisks = { 'Drought': 25, 'Heavy Rain': 20, 'Frost': 30, 'Sunny': 0 };
  riskScore += weatherRisks[weather_forecast] || 0;
  if (weather_forecast === 'Drought') climateRisk = 'Severe drought conditions threatening crop viability';
  if (weather_forecast === 'Heavy Rain') climateRisk = 'Excessive precipitation increasing pathogen and waterlogging risk';
  if (weather_forecast === 'Frost') climateRisk = 'Critical frost warning - immediate crop protection required';

  // Pathogen check
  if (agent1Output.issue_classification === 'DISEASE_FUNGAL' || agent1Output.issue_classification === 'PEST_OUTBREAK') {
    pathogenDetected = true;
    pathogenType = agent1Output.issue_classification === 'DISEASE_FUNGAL' ? 'Fungal spore contamination (probable Blight strain)' : 'Arthropod infestation (leaf-feeding insects)';
    riskScore += agent1Output.severity_estimate === 'CRITICAL' ? 30 : 20;
  }

  // Nutrient deficiency impact
  if (nitrogen_ppm < 20) riskScore += 25;
  else if (nitrogen_ppm < 40) riskScore += 15;
  else if (nitrogen_ppm < 60) riskScore += 5;

  // Moisture deviation from optimal (40-60%)
  const optimalMoisture = 50;
  const moistureDeviation = Math.abs(moisture_level_percent - optimalMoisture);
  riskScore += Math.floor(moistureDeviation / 10) * 5;

  // pH deviation from optimal (6.0-7.5)
  const optimalPh = 6.75;
  const phDeviation = Math.abs(soil_ph - optimalPh);
  riskScore += Math.floor(phDeviation / 0.5) * 3;

  riskScore = Math.min(100, Math.max(0, riskScore));

  const confidence = Math.max(60, 95 - Math.abs(riskScore - 50) * 0.3);
  const yieldImpact = Math.min(80, riskScore * 0.7);

  return {
    climate_risk: climateRisk,
    pathogen_detected: pathogenDetected,
    pathogen_type: pathogenType,
    crop_risk_score: riskScore,
    confidence_score: Math.round(confidence * 10) / 10,
    yield_impact_percent: Math.round(yieldImpact * 10) / 10,
    audit_reasoning: `Risk assessment computed from telemetry: soil pH ${soil_ph} (deviation ${phDeviation.toFixed(1)} from optimal), moisture ${moisture_level_percent}% (deviation ${moistureDeviation}% from optimal range), nitrogen ${nitrogen_ppm}ppm. Weather factor: ${weather_forecast} contributing +${weatherRisks[weather_forecast] || 0} risk points. Classification: ${agent1Output.issue_classification} with ${agent1Output.severity_estimate} severity. Composite risk score: ${riskScore}/100.`,
  };
}

function deterministicAgent3(payload, agent1Output, agent2Output) {
  const riskScore = agent2Output.crop_risk_score;
  let statusTransition, verdict, requiresReview;

  if (riskScore < 30) {
    statusTransition = 'AUTO_APPROVED';
    verdict = `Field ${payload.field_id} assessed at LOW risk (score: ${riskScore}/100). Standard maintenance protocol approved for ${payload.crop_type}. Continue current agronomic practices with routine monitoring schedule.`;
    requiresReview = false;
  } else if (riskScore >= 80) {
    statusTransition = 'ESCALATED';
    verdict = `CRITICAL ALERT: Field ${payload.field_id} risk score ${riskScore}/100 exceeds escalation threshold. ${agent1Output.issue_classification} classified as ${agent1Output.severity_estimate} severity. Mandatory human agronomist review required before intervention. Pathogen quarantine protocols may be necessary.`;
    requiresReview = true;
  } else {
    statusTransition = 'UNDER_REVIEW';
    verdict = `Field ${payload.field_id} risk score ${riskScore}/100 warrants enhanced monitoring. ${agent1Output.issue_classification} detected with ${agent2Output.climate_risk.toLowerCase()}. Intervention plan prepared pending threshold analysis.`;
    requiresReview = riskScore >= 65;
  }

  const interventionCosts = {
    'NUTRIENT_DEFICIENCY': { action: 'Apply targeted fertilizer amendment', dosage: 'NPK 20-10-10 at 150kg/hectare', cost: 180 },
    'PEST_OUTBREAK': { action: 'Deploy integrated pest management protocol', dosage: 'Pyrethrin 0.5% solution, 2L/hectare', cost: 320 },
    'DROUGHT_STRESS': { action: 'Initiate emergency drip irrigation', dosage: 'Water supplement 25mm/day for 7 days', cost: 250 },
    'WATERLOGGING': { action: 'Install subsurface drainage and apply gypsum', dosage: 'Gypsum 500kg/hectare + drainage tiles', cost: 450 },
    'DISEASE_FUNGAL': { action: 'Apply systemic fungicide and quarantine affected zone', dosage: 'Mancozeb 75% WP at 2.5kg/hectare', cost: 380 },
  };

  const intervention = interventionCosts[agent1Output.issue_classification] || interventionCosts['NUTRIENT_DEFICIENCY'];
  const costMultiplier = riskScore > 70 ? 1.5 : riskScore > 50 ? 1.2 : 1.0;

  return {
    final_verdict: verdict,
    status_transition: statusTransition,
    treatment_protocol: {
      action: intervention.action,
      chemical_dosage: intervention.dosage,
      timeline: riskScore >= 80 ? 'Immediate - within 24 hours' : riskScore >= 50 ? 'Within 3-5 days' : 'Within 7-14 days as part of routine maintenance',
      estimated_cost: Math.round(intervention.cost * costMultiplier),
    },
    requires_human_review: requiresReview,
    confidence: Math.round(agent2Output.confidence_score),
  };
}

// ─── Gemini AI Call Wrapper ──────────────────────────────────────────────────

async function callGeminiAgent(agentPrompt, inputData, fallbackFn, outputSchema) {
  if (!ai) {
    console.log('  ↳ Using deterministic fallback (Gemini not configured)');
    return fallbackFn();
  }

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `${SYSTEM_PROMPT}\n\n${agentPrompt}\n\nINPUT DATA:\n${JSON.stringify(inputData, null, 2)}\n\nRespond with ONLY valid JSON strictly matching the requested schema. No markdown, no code blocks, no trailing comments.`,
            },
          ],
        },
      ],
      config: {
        temperature: 0.2,
        maxOutputTokens: 4096,
        responseMimeType: 'application/json',
      },
    });

    const rawText = response.text ? response.text.trim() : '';
    // Strip markdown code fences if present
    const jsonText = rawText.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim();

    const parsed = JSON.parse(jsonText);
    const validated = outputSchema.safeParse(parsed);

    if (validated.success) {
      return validated.data;
    }
    console.warn('  ↳ Gemini output failed schema validation, using fallback:', validated.error.issues);
    return fallbackFn();
  } catch (err) {
    console.warn('  ↳ Gemini API call failed, using deterministic fallback:', err.message);
    return fallbackFn();
  }
}

// ─── Main Agent Pipeline ─────────────────────────────────────────────────────

/**
 * Execute the full 3-agent autonomous pipeline
 * Returns advisory result with complete execution trace
 */
export async function executeAgentPipeline(payload) {
  const startTime = Date.now();
  const executionLogs = [];

  console.log(`\n🌾 ═══ AGENT PIPELINE INITIATED ═══`);
  console.log(`   Field: ${payload.field_id} | Crop: ${payload.crop_type}`);

  // ── Phase 1: Soil & Triage Orchestrator ────────────────────────────────────
  console.log('\n  🔬 Phase 1: Soil & Triage Orchestrator executing...');
  const phase1Start = Date.now();

  const agent1Output = await callGeminiAgent(
    AGENT1_PROMPT,
    payload,
    () => deterministicAgent1(payload),
    Agent1OutputSchema
  );

  const phase1Duration = Date.now() - phase1Start;
  executionLogs.push({
    agent_name: 'Soil & Triage Orchestrator',
    execution_step: 1,
    thought_process: `Parsed farmer report for field ${payload.field_id}. Identified crop: ${payload.crop_type}, soil pH: ${payload.soil_ph}, moisture: ${payload.moisture_level_percent}%, nitrogen: ${payload.nitrogen_ppm}ppm. Classified issue as ${agent1Output.issue_classification} with ${agent1Output.severity_estimate} severity. Generated 3-step audit plan. Execution time: ${phase1Duration}ms.`,
    agent_output: agent1Output,
    duration_ms: phase1Duration,
  });
  console.log(`  ✓ Phase 1 complete: ${agent1Output.issue_classification} (${phase1Duration}ms)`);

  // ── Phase 2: Climate & Pathogen Risk Worker ────────────────────────────────
  console.log('\n  🌡️  Phase 2: Climate & Pathogen Risk Worker executing...');
  const phase2Start = Date.now();

  const agent2Input = { ...payload, agent1_findings: agent1Output };
  const agent2Output = await callGeminiAgent(
    AGENT2_PROMPT,
    agent2Input,
    () => deterministicAgent2(payload, agent1Output),
    Agent2OutputSchema
  );

  const phase2Duration = Date.now() - phase2Start;
  executionLogs.push({
    agent_name: 'Climate & Pathogen Risk Worker',
    execution_step: 2,
    thought_process: `Evaluated triage plan against weather forecast (${payload.weather_forecast}). Climate risk: ${agent2Output.climate_risk}. Pathogen detected: ${agent2Output.pathogen_detected}. Calculated composite Crop Risk Score: ${agent2Output.crop_risk_score}/100 with ${agent2Output.confidence_score}% confidence. Estimated yield impact: ${agent2Output.yield_impact_percent}%. Execution time: ${phase2Duration}ms.`,
    agent_output: agent2Output,
    duration_ms: phase2Duration,
  });
  console.log(`  ✓ Phase 2 complete: Risk Score ${agent2Output.crop_risk_score}/100 (${phase2Duration}ms)`);

  // ── Phase 3: Agronomy Arbiter Agent ────────────────────────────────────────
  console.log('\n  ⚖️  Phase 3: Agronomy Arbiter Agent executing...');
  const phase3Start = Date.now();

  const agent3Input = { payload, triage: agent1Output, risk_assessment: agent2Output };
  const agent3Output = await callGeminiAgent(
    AGENT3_PROMPT,
    agent3Input,
    () => deterministicAgent3(payload, agent1Output, agent2Output),
    Agent3OutputSchema
  );

  const phase3Duration = Date.now() - phase3Start;
  executionLogs.push({
    agent_name: 'Agronomy Arbiter',
    execution_step: 3,
    thought_process: `Synthesized risk findings. Risk score: ${agent2Output.crop_risk_score}/100. Decision: ${agent3Output.status_transition}. ${agent3Output.requires_human_review ? 'ESCALATED to human review queue.' : 'Auto-approved intervention.'} Treatment: ${agent3Output.treatment_protocol.action}. Estimated cost: $${agent3Output.treatment_protocol.estimated_cost}. Execution time: ${phase3Duration}ms.`,
    agent_output: agent3Output,
    duration_ms: phase3Duration,
  });
  console.log(`  ✓ Phase 3 complete: ${agent3Output.status_transition} (${phase3Duration}ms)`);

  const totalDuration = Date.now() - startTime;
  console.log(`\n🌾 ═══ PIPELINE COMPLETE ═══ (${totalDuration}ms total)\n`);

  // ── Persist Advisory to Database ───────────────────────────────────────────
  const advisory = {
    field_id: payload.field_id,
    issue_category: agent1Output.issue_classification,
    farmer_statement: payload.farmer_observation,
    status: agent3Output.status_transition || 'UNDER_REVIEW',
    final_protocol: JSON.stringify(agent3Output.treatment_protocol),
    risk_score: agent2Output.crop_risk_score,
  };

  // Ensure field exists
  const existingField = await db.select('fields', { id: payload.field_id });
  if (!existingField || existingField.length === 0) {
    await db.insert('fields', {
      id: payload.field_id,
      owner_name: 'Auto-registered',
      crop_type: payload.crop_type,
      historical_yield_score: 85.00,
      coordinates_hash: Math.random().toString(36).substring(7),
    });
  }

  const [savedAdvisory] = await db.insert('advisories', advisory);

  // Save execution logs
  for (const log of executionLogs) {
    await db.insert('agent_execution_logs', {
      advisory_id: savedAdvisory.id,
      ...log,
    });
  }

  return {
    advisory: savedAdvisory,
    execution_trace: executionLogs,
    pipeline_summary: {
      total_duration_ms: totalDuration,
      issue_classification: agent1Output.issue_classification,
      risk_score: agent2Output.crop_risk_score,
      status: agent3Output.status_transition,
      requires_review: agent3Output.requires_human_review,
    },
  };
}

export default { executeAgentPipeline };
