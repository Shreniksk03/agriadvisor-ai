import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Lock, Mail, User, ArrowRight, ShieldCheck, AlertTriangle, Zap } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { authAPI } from '../lib/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const isRegister = location.pathname === '/register';
  const [fullName, setFullName] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let response;
      if (isRegister) {
        response = await authAPI.register({ email, password, full_name: fullName });
      } else {
        response = await authAPI.login({ email, password });
      }

      const { token, user } = response.data.data;
      login(token, user);
      navigate('/dashboard');
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.details?.[0]?.message ||
        'Authentication failed. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0a0a0a] to-[#050505] flex items-center justify-center p-4 relative overflow-hidden font-sans selection:bg-blue-600 selection:text-white">
      <div className="relative z-10 w-full max-w-md">
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-blue-600 mb-4 shadow-[0_0_20px_rgba(37,99,235,0.4)] border border-blue-400/30">
            <Zap className="w-7 h-7 text-white fill-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">AgriAdvisor</h1>
          <p className="text-blue-400 mt-1 text-[11px] font-mono tracking-wider font-semibold">ENTERPRISE CROP INTELLIGENCE</p>
        </div>

        {/* Auth Card */}
        <div className="bg-[#0d0f12] border border-white/5 rounded-xl p-8 shadow-2xl">
          <h2 className="text-lg font-bold text-slate-100 mb-6">
            {isRegister ? 'Create Agronomist Account' : 'Sign In to Workspace'}
          </h2>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-950/40 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2 font-mono">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Full Name</label>
                <div className="relative">
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Dr. Evelyn Vance"
                    required
                    className="w-full text-xs pl-9 bg-[#080a0e] border border-slate-800 text-slate-200 rounded-xl py-2 focus:border-blue-500 focus:shadow-[0_0_10px_rgba(37,99,235,0.4)] focus:outline-none"
                  />
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="agronomist@farm.com"
                  required
                  className="w-full text-xs pl-9 bg-[#080a0e] border border-slate-800 text-slate-200 rounded-xl py-2 focus:border-blue-500 focus:shadow-[0_0_10px_rgba(37,99,235,0.4)] focus:outline-none font-mono"
                />
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={isRegister ? 8 : 1}
                  className="w-full text-xs pl-9 bg-[#080a0e] border border-slate-800 text-slate-200 rounded-xl py-2 focus:border-blue-500 focus:shadow-[0_0_10px_rgba(37,99,235,0.4)] focus:outline-none font-mono"
                />
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-6 rounded-xl font-semibold text-white text-xs bg-blue-600 hover:bg-blue-500 hover:shadow-[0_0_15px_rgba(37,99,235,0.5)] transition-all disabled:opacity-50 flex items-center justify-center gap-2 border border-white/10 mt-2"
            >
              {loading ? (
                <>
                  <div className="spinner w-4 h-4 border-2" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>{isRegister ? 'Initialize Account' : 'Sign In to Platform'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-400">
            {isRegister ? (
              <>
                Already registered?{' '}
                <Link to="/login" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
                  Sign in
                </Link>
              </>
            ) : (
              <>
                Don&apos;t have an account?{' '}
                <Link to="/register" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
                  Create one
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-[11px] text-slate-500 mt-6 font-mono flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
          <span>Secured with JWT + bcrypt · Zero-Trust Encryption</span>
        </p>
      </div>
    </div>
  );
}
