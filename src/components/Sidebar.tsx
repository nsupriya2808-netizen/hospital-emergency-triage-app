import { FC } from 'react';
import {
  LayoutDashboard,
  Users,
  Layers,
  Network,
  TrendingUp,
  AlertOctagon,
  Gauge,
  Boxes,
  Binary,
  GraduationCap,
  HeartPulse,
  UserPlus,
} from 'lucide-react';

export interface NavItem {
  id: string;
  label: string;
  icon: typeof LayoutDashboard;
  badge?: number;
  badgeColor?: string;
  academicTag?: string;
}

interface Props {
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  onOpenAddPatient: () => void;
  activeCriticalAlerts: number;
  totalWaitingCount: number;
}

export const Sidebar: FC<Props> = ({
  activeTab,
  onSelectTab,
  onOpenAddPatient,
  activeCriticalAlerts,
  totalWaitingCount,
}) => {
  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      academicTag: 'Real-time KPIs',
    },
    {
      id: 'records',
      label: 'Patient Records',
      icon: Users,
      badge: totalWaitingCount,
      badgeColor: 'bg-blue-100 text-blue-800',
      academicTag: 'AVL Registry',
    },
    {
      id: 'priority_queue',
      label: 'Priority Queue',
      icon: Layers,
      academicTag: 'Max-Heap',
    },
    {
      id: 'avl_visualizer',
      label: 'AVL Tree Visualizer',
      icon: Network,
      academicTag: 'Self-Balancing',
    },
    {
      id: 'severity_update',
      label: 'Severity Update',
      icon: TrendingUp,
      academicTag: 'Dynamic Triage',
    },
    {
      id: 'critical_alerts',
      label: 'Critical Alerts',
      icon: AlertOctagon,
      badge: activeCriticalAlerts > 0 ? activeCriticalAlerts : undefined,
      badgeColor: 'bg-red-500 text-white',
      academicTag: 'Severity ≥ 9',
    },
    {
      id: 'benchmarking',
      label: 'Benchmarking',
      icon: Gauge,
      academicTag: 'Empirical O(log N)',
    },
    {
      id: 'data_structures',
      label: 'Data Structures',
      icon: Boxes,
      academicTag: 'Architecture',
    },
    {
      id: 'complexity',
      label: 'Complexity Analysis',
      icon: Binary,
      academicTag: 'Big-O Proofs',
    },
    {
      id: 'viva_prep',
      label: 'About / Viva Prep',
      icon: GraduationCap,
      academicTag: 'Project Dossier',
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800 select-none">
      {/* Hospital Department Branding */}
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-400">
          <HeartPulse className="w-4 h-4 text-blue-500" />
          <span>Emergency Department</span>
        </div>
        <div className="text-xs text-slate-400 mt-0.5 font-medium leading-relaxed">
          Clinical Triage Command
        </div>
      </div>

      {/* Quick Add Patient Button in Sidebar */}
      <div className="p-3 border-b border-slate-800/80">
        <button
          onClick={onOpenAddPatient}
          className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-sm flex items-center justify-center gap-2 transition-all"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ Add Patient Option</span>
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all group ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm font-semibold'
                  : 'hover:bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0 ml-2">
                {item.badge !== undefined && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      item.badgeColor || 'bg-slate-700 text-slate-200'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
                {item.academicTag && !isActive && (
                  <span className="text-[9px] text-slate-500 font-mono hidden xl:inline-block">
                    {item.academicTag}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </nav>

      {/* Academic Disclaimer Footer */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/60 text-[11px] text-slate-400 space-y-1">
        <div className="font-semibold text-slate-300 flex items-center gap-1">
          <span>Algorithmic Triage Core</span>
        </div>
        <p className="text-[10px] text-slate-500 leading-snug">
          AVL tree indices & binary max-heap priority queues operate live in memory.
        </p>
      </div>
    </aside>
  );
};
