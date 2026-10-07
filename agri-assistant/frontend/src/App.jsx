import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './lib/AuthContext';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import ScoreField from './pages/ScoreField';
import BatchScoring from './pages/BatchScoring';
import ReviewQueue from './pages/ReviewQueue';
import PolicySimulator from './pages/PolicySimulator';
import PathogenRings from './pages/PathogenRings';
import AnomalySpikes from './pages/AnomalySpikes';
import AdvisoryDetail from './pages/AdvisoryDetail';
import BootSequence from './pages/BootSequence';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Root Landing Page */}
          <Route path="/" element={<LandingPage />} />

          {/* Cinematic Boot Sequence */}
          <Route path="/boot" element={<BootSequence />} />

          {/* Core Application Routes - Fully Public & Unprotected for Instant Access */}
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/score-field" element={<ScoreField />} />
            <Route path="/batch-scoring" element={<BatchScoring />} />
            <Route path="/review-queue" element={<ReviewQueue />} />
            <Route path="/policy-simulator" element={<PolicySimulator />} />
            <Route path="/pathogen-rings" element={<PathogenRings />} />
            <Route path="/anomaly-spikes" element={<AnomalySpikes />} />
            <Route path="/advisory/:id" element={<AdvisoryDetail />} />
          </Route>

          {/* Legacy Auth Redirects */}
          <Route path="/login" element={<Navigate to="/dashboard" replace />} />
          <Route path="/register" element={<Navigate to="/dashboard" replace />} />

          {/* Catch-all Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
