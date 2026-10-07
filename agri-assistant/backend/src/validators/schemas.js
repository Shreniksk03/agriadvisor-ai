import { z } from 'zod';

// ─── Authentication Schemas ──────────────────────────────────────────────────

export const RegisterSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  full_name: z.string().min(2, 'Full name must be at least 2 characters').max(100),
});

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// ─── Field Scoring Schemas ───────────────────────────────────────────────────

export const ScoreSingleFieldSchema = z.object({
  field_id: z.string().min(3, 'Field ID must be at least 3 characters'),
  crop_type: z.enum(['Wheat', 'Corn', 'Soybean', 'Rice', 'Cotton']),
  soil_ph: z.number().min(0).max(14),
  moisture_level_percent: z.number().int().min(0).max(100),
  nitrogen_ppm: z.number().int().min(0).max(500),
  farmer_observation: z.string().min(10, 'Observation must be at least 10 characters'),
  weather_forecast: z.enum(['Sunny', 'Heavy Rain', 'Drought', 'Frost']).optional().default('Sunny'),
});

// ─── Batch Upload Schema ─────────────────────────────────────────────────────

export const BatchRowSchema = z.object({
  field_id: z.string().min(3),
  crop_type: z.enum(['Wheat', 'Corn', 'Soybean', 'Rice', 'Cotton']),
  soil_ph: z.coerce.number().min(0).max(14),
  moisture_level_percent: z.coerce.number().int().min(0).max(100),
  nitrogen_ppm: z.coerce.number().int().min(0).max(500),
  farmer_observation: z.string().min(5),
  weather_forecast: z.enum(['Sunny', 'Heavy Rain', 'Drought', 'Frost']).optional().default('Sunny'),
});

// ─── Policy Simulator Schema ─────────────────────────────────────────────────

export const PolicySimulatorSchema = z.object({
  risk_threshold: z.number().int().min(0).max(100).default(65),
  auto_intervention_limit: z.number().min(0).max(100000).default(500),
  escalation_threshold: z.number().int().min(0).max(100).default(80),
});

// ─── Agent Output Schemas ────────────────────────────────────────────────────

export const Agent1OutputSchema = z.object({
  issue_classification: z.string(),
  extracted_entities: z.object({
    crop: z.string(),
    field_id: z.string().optional(),
    symptoms: z.array(z.string()).optional(),
    soil_metrics: z.object({
      ph: z.number().optional(),
      moisture: z.number().optional(),
      nitrogen: z.number().optional(),
    }).optional(),
  }),
  severity_estimate: z.enum(['LOW', 'MODERATE', 'HIGH', 'CRITICAL']).optional(),
  audit_plan: z.array(z.object({
    step: z.number(),
    task: z.string(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  })),
});

export const Agent2OutputSchema = z.object({
  climate_risk: z.string(),
  pathogen_detected: z.boolean(),
  pathogen_type: z.string().nullable().optional(),
  crop_risk_score: z.number().min(0).max(100),
  confidence_score: z.number().min(0).max(100),
  yield_impact_percent: z.number().optional(),
  audit_reasoning: z.string(),
});

export const Agent3OutputSchema = z.object({
  final_verdict: z.string(),
  status_transition: z.enum(['AUTO_APPROVED', 'ESCALATED', 'UNDER_REVIEW', 'RESOLVED']).optional(),
  treatment_protocol: z.object({
    action: z.string(),
    chemical_dosage: z.string(),
    timeline: z.string().optional(),
    estimated_cost: z.number().optional(),
  }),
  requires_human_review: z.boolean(),
  confidence: z.number().min(0).max(100).optional(),
});

export default {
  RegisterSchema,
  LoginSchema,
  ScoreSingleFieldSchema,
  BatchRowSchema,
  PolicySimulatorSchema,
  Agent1OutputSchema,
  Agent2OutputSchema,
  Agent3OutputSchema,
};
