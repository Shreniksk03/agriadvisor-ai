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
  Leaf,
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
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex font-sans text-slate-100">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900/90 backdrop-blur-xl border-r border-slate-800 flex flex-col fixed h-full z-20">
        {/* Logo */}
        <div className="p-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/25 border border-cyan-400/30">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-100 tracking-wide">AgriAdvisor AI</h1>
              <p className="text-[10px] text-cyan-400 font-mono font-semibold">AUTONOMOUS MULTI-AGENT</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 group ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/10 text-cyan-300 border border-cyan-500/30 shadow-sm shadow-cyan-500/10'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-850 border border-transparent'
                  }`
                }
              >
                <Icon className="w-4 h-4 flex-shrink-0 text-slate-400 group-hover:text-cyan-400 transition-colors" />
                <span className="truncate">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-xs font-bold text-white shadow-md">
              {user?.full_name?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-200 truncate">{user?.full_name || 'Agronomist'}</p>
              <p className="text-[10px] text-slate-400 truncate font-mono">{user?.email || 'user@farm.com'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full text-xs text-slate-400 hover:text-rose-400 transition-colors py-2 rounded-xl hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 flex items-center justify-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 min-h-screen bg-mesh">
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
