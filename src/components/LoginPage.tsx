import { FC, useState } from 'react';
import { UserSession, PRESET_ACCOUNTS } from '../types/auth';
import {
  HeartPulse,
  Lock,
  Mail,
  User,
  Shield,
  ArrowRight,
  UserPlus,
  Stethoscope,
  Activity,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface Props {
  onLogin: (session: UserSession) => void;
  onOpenPatientIntake: () => void;
}

export const LoginPage: FC<Props> = ({ onLogin, onOpenPatientIntake }) => {
  const [email, setEmail] = useState('sarah.lin@hospital.org');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(true);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const matched = PRESET_ACCOUNTS.find(
      (acc) => acc.email.toLowerCase() === email.trim().toLowerCase()
    );

    if (matched) {
      if (password.length >= 4) {
        onLogin({
          id: matched.id,
          name: matched.name,
          email: matched.email,
          role: matched.role,
          avatarInitials: matched.avatarInitials,
          department: matched.department,
          loginTime: Date.now(),
        });
      } else {
        setError('Invalid password. Minimum 4 characters required.');
      }
    } else {
      // Allow custom email sign in as physician
      if (email.includes('@') && password.length >= 4) {
        const namePart = email.split('@')[0].replace('.', ' ');
        onLogin({
          id: `usr-${Date.now()}`,
          name: namePart.charAt(0).toUpperCase() + namePart.slice(1),
          email: email.trim(),
          role: 'Attending Physician',
          avatarInitials: namePart.slice(0, 2).toUpperCase(),
          department: 'Emergency Medicine',
          loginTime: Date.now(),
        });
      } else {
        setError('Please enter a valid hospital email address and password.');
      }
    }
  };

  const handleSelectPreset = (preset: typeof PRESET_ACCOUNTS[0]) => {
    onLogin({
      id: preset.id,
      name: preset.name,
      email: preset.email,
      role: preset.role,
      avatarInitials: preset.avatarInitials,
      department: preset.department,
      loginTime: Date.now(),
    });
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-indigo-950 flex flex-col justify-center items-center p-4 sm:p-6 text-slate-100">
      {/* Background Accent Lines */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(59,130,246,0.15),rgba(255,255,255,0))] pointer-events-none" />

      <div className="w-full max-w-4xl relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 text-white shadow-xl shadow-blue-500/25 mb-1">
            <HeartPulse className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Hospital Emergency Triage System
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-medium max-w-lg mx-auto">
            AVL Trees • Max-Heap Priority Queue • Dynamic Severity Updates
          </p>
        </div>

        {/* Main Grid: Login Box + One-Click Roles */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-slate-900/90 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-md">
          {/* Left: Login Form (7 cols) */}
          <div className="md:col-span-7 p-6 sm:p-8 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Staff Authentication Portal
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Sign in to access real-time clinical triage, AVL patient lookup, and priority queues.
              </p>
            </div>

            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Hospital Email / Username
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. sarah.lin@hospital.org"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-800/80 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Password / Access Key
                  </label>
                  <span className="text-[11px] text-slate-500 font-mono">Demo: password123</span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-800/80 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 cursor-pointer select-none text-slate-400 hover:text-slate-300">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-700 text-blue-600 focus:ring-blue-500 bg-slate-800"
                  />
                  <span>Remember session on this device</span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2"
              >
                <span>Sign In to Triage Console</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>

            {/* Direct Patient Registration Shortcut */}
            <div className="pt-4 border-t border-slate-800">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Need to register a new emergency patient?</span>
                <button
                  type="button"
                  onClick={onOpenPatientIntake}
                  className="font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Add Patient Directly</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right: 1-Click Fast Demo Roles (5 cols) */}
          <div className="md:col-span-5 bg-slate-950/60 p-6 sm:p-8 border-t md:border-t-0 md:border-l border-slate-800 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-blue-400 uppercase tracking-wider">
                <Shield className="w-3.5 h-3.5" />
                <span>One-Click Role Selection</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                Click any staff credential below to immediately launch the dashboard without typing credentials:
              </p>

              <div className="space-y-2 pt-1">
                {PRESET_ACCOUNTS.map((acc) => (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() => handleSelectPreset(acc)}
                    className="w-full text-left p-2.5 bg-slate-900/80 hover:bg-blue-900/30 border border-slate-800 hover:border-blue-500/50 rounded-xl transition-all group flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 font-bold font-mono text-xs flex items-center justify-center shrink-0 border border-blue-500/30 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        {acc.avatarInitials}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-white text-xs truncate group-hover:text-blue-300 transition-colors">
                          {acc.name}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {acc.role} · {acc.department}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-blue-400 shrink-0 ml-1 transition-colors" />
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Security Badge */}
            <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl text-[10px] text-slate-400 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>In-Memory Algorithmic Triage Ready</span>
              </div>
              <p className="text-slate-500 leading-tight">
                AVL Tree indexed records & Max-Heap priority scheduling initialized and ready.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
