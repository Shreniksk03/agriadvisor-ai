import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/AuthContext';
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
import LoginPage from './pages/LoginPage';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-mesh flex items-center justify-center">
        <div className="spinner" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-mesh flex items-center justify-center">
        <div className="spinner" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Root Landing Page */}
          <Route path="/" element={<LandingPage />} />

          {/* Cinematic Boot Sequence */}
          <Route path="/boot" element={<BootSequence />} />

          {/* Authentication Routes */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />

          {/* Protected Application Layout */}
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/score-field" element={<ScoreField />} />
            <Route path="/batch-scoring" element={<BatchScoring />} />
            <Route path="/review-queue" element={<ReviewQueue />} />
            <Route path="/policy-simulator" element={<PolicySimulator />} />
            <Route path="/pathogen-rings" element={<PathogenRings />} />
            <Route path="/anomaly-spikes" element={<AnomalySpikes />} />
            <Route path="/advisory/:id" element={<AdvisoryDetail />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
