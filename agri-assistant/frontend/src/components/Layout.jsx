import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import {
  LayoutDashboard,
  Sparkles,
  UploadCloud,
  ShieldCheck,
  Sliders,
  Share2,
  Activity,
  LogOut,
  Zap,
} from 'lucide-react';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Executive Overview', icon: LayoutDashboard },
  { path: '/score-field', label: 'Score a Crop', icon: Sparkles },
  { path: '/batch-scoring', label: 'Batch Telemetry Ingestion', icon: UploadCloud },
  { path: '/review-queue', label: 'Agronomist Review Queue', icon: ShieldCheck },
  { path: '/policy-simulator', label: 'Yield & Policy Simulator', icon: Sliders },
  { path: '/pathogen-rings', label: 'Pathogen Transmission Rings', icon: Share2 },
  { path: '/anomaly-spikes', label: 'Agronomic Anomaly Monitor', icon: Activity },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0a0a0a] to-[#050505] flex font-sans text-slate-200">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0a0c10] border-r border-white/5 flex flex-col fixed h-full z-20 select-none">
        {/* Logo */}
        <div className="p-5 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center shadow-[0_0_12px_rgba(37,99,235,0.4)] border border-blue-400/30">
              <Zap className="w-4 h-4 text-white fill-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white tracking-wide">AgriAdvisor</h1>
              <p className="text-[10px] text-blue-400 font-mono tracking-wider font-semibold">ENTERPRISE INTELLIGENCE</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 text-xs transition-all duration-150 ${
                    isActive
                      ? 'text-white font-medium border-l-2 border-blue-500 bg-gradient-to-r from-blue-500/15 to-transparent'
                      : 'text-slate-500 hover:text-slate-300 border-l-2 border-transparent'
                  }`
                }
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-white/5 bg-[#08090c]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-slate-800 border border-white/10 flex items-center justify-center text-xs font-bold text-slate-200">
              {user?.full_name?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-200 truncate">{user?.full_name || 'Agronomist'}</p>
              <p className="text-[10px] text-slate-500 truncate font-mono">{user?.email || 'user@farm.com'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full text-xs text-slate-500 hover:text-slate-300 transition-colors py-1.5 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/10 flex items-center justify-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Exit to Home</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 min-h-screen">
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
