import { Router } from 'express';
import multer from 'multer';
import { authenticateToken, validateBody } from '../middleware/auth.js';
import { RegisterSchema, LoginSchema, ScoreSingleFieldSchema, PolicySimulatorSchema } from '../validators/schemas.js';
import { registerUser, loginUser } from '../controllers/authController.js';
import {
  getAdvisories,
  getAdvisoryById,
  scoreSingleField,
  batchUpload,
  getPathogenRings,
  getAnomalySpikes,
  simulatePolicy,
  getDashboardStats,
  getReviewQueue,
  updateAdvisoryStatus,
} from '../controllers/advisoryController.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// ─── Public Routes ───────────────────────────────────────────────────────────
router.post('/auth/register', validateBody(RegisterSchema), registerUser);
router.post('/auth/login', validateBody(LoginSchema), loginUser);

// ─── Protected Routes ────────────────────────────────────────────────────────
router.get('/dashboard/stats', authenticateToken, getDashboardStats);
router.get('/advisories', authenticateToken, getAdvisories);
router.get('/advisories/:id', authenticateToken, getAdvisoryById);
router.patch('/advisories/:id', authenticateToken, updateAdvisoryStatus);
router.post('/advisories/score-single', authenticateToken, validateBody(ScoreSingleFieldSchema), scoreSingleField);
router.post('/advisories/batch-upload', authenticateToken, upload.single('csv_file'), batchUpload);
router.get('/review-queue', authenticateToken, getReviewQueue);
router.get('/analytics/pathogen-rings', authenticateToken, getPathogenRings);
router.get('/analytics/anomaly-spikes', authenticateToken, getAnomalySpikes);
router.put('/policies/simulate', authenticateToken, validateBody(PolicySimulatorSchema), simulatePolicy);

export default router;
