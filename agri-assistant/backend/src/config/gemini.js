import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

if (!process.env.GEMINI_API_KEY) {
  console.warn('⚠ CRITICAL: GEMINI_API_KEY is not defined. AI features will use deterministic fallback.');
}

let ai = null;
if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'AIzaSyYourGeminiApiKeyHere') {
  ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
}

export const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

export const SYSTEM_PROMPT = `You are the core intelligence of the AI-Powered Agriculture Crop Advisory Assistant.
Your primary objective is to evaluate soil telemetry, detect agronomic risks, and execute mathematically defensible yield optimization protocols.

1. OBJECTIVE GROUNDING: Base every calculation strictly on telemetry and botanical science.
2. STRUCTURED DETERMINISM: All outputs must be valid, unescaped JSON matching the exact schema provided.
3. SCIENTIFIC PRECISION: Reference established agronomic thresholds (e.g., optimal pH ranges, nitrogen requirements per crop).
4. RISK QUANTIFICATION: Use probabilistic scoring (0-100) grounded in input parameters.
5. NEVER fabricate data. If information is insufficient, flag it in your reasoning.`;

export { ai };
export default ai;
