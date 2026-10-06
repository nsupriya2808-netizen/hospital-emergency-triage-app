import { FC, useState } from 'react';
import { patientManager } from '../services/PatientManager';
import {
  Search,
  HeartPulse,
  Stethoscope,
  RotateCcw,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  UserPlus,
  LogOut,
  User,
} from 'lucide-react';
import { SearchResult } from '../structures/AVLTree';
import { Patient } from '../types/patient';
import { UserSession } from '../types/auth';

interface Props {
  activeCriticalCount: number;
  currentUser: UserSession | null;
  onTreatNext: () => void;
  onOpenAddPatient: () => void;
  onSelectPatient: (patient: Patient) => void;
  onNavigateTab: (tab: string) => void;
  onResetSamples: () => void;
  onLogout: () => void;
}

export const Navbar: FC<Props> = ({
  activeCriticalCount,
  currentUser,
  onTreatNext,
  onOpenAddPatient,
  onSelectPatient,
  onNavigateTab,
  onResetSamples,
  onLogout,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [searchedKey, setSearchedKey] = useState<string | null>(null);
  const [showSearchPopover, setShowSearchPopover] = useState(false);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = searchQuery.trim().toUpperCase();
    if (!query) return;

    const result = patientManager.searchPatientAVL(query);
    setSearchResult(result);
    setSearchedKey(query);
    setShowSearchPopover(true);
  };

  const currentAvlHeight = patientManager.avlTree.getTreeHeight();

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 px-4 lg:px-6 py-2.5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Title & Subtitle (WITHOUT any 'Capstone DSA' badge) */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs shrink-0">
            <HeartPulse className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-tight">
              Hospital Emergency Triage System
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              AVL Trees • Max-Heap Priority Queue • Dynamic Severity Updates
            </p>
          </div>
        </div>

        {/* Global AVL Search, Actions, and User Profile */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* AVL Search Bar */}
          <div className="relative">
            <form onSubmit={handleSearch} className="flex items-center">
              <div className="relative flex items-center">
                <Search className="w-4 h-4 text-slate-400 absolute left-2.5 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="AVL Search: e.g. P102"
                  className="w-40 sm:w-52 pl-8 pr-14 py-1.5 text-xs font-mono bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-hidden transition-all"
                />
                <button
                  type="submit"
                  className="absolute right-1 text-[10px] font-semibold bg-slate-200 hover:bg-slate-300 text-slate-700 px-2 py-0.5 rounded-md transition-colors"
                >
                  Find
                </button>
              </div>
            </form>

            {/* AVL Search Results Popover */}
            {showSearchPopover && searchResult && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 p-4 z-50 text-xs animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-1.5">
                    {searchResult.found ? (
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                    )}
                    <span className="font-bold text-slate-800">
                      AVL Search for <span className="font-mono text-blue-600">"{searchedKey}"</span>
                    </span>
                  </div>
                  <button
                    onClick={() => setShowSearchPopover(false)}
                    className="text-slate-400 hover:text-slate-600 text-sm font-bold"
                  >
                    ✕
                  </button>
                </div>

                <div className="mt-3 space-y-2">
                  <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2 rounded-lg text-[11px] font-mono">
                    <div>
                      <span className="text-slate-500 block text-[10px]">Comparisons</span>
                      <strong className="text-blue-700 text-xs">{searchResult.comparisons}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Tree Height</span>
                      <strong className="text-slate-700 text-xs">{currentAvlHeight}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Execution Time</span>
                      <strong className="text-emerald-700 text-xs">{searchResult.executionTimeMs.toFixed(3)} ms</strong>
                    </div>
                  </div>

                  {/* Search Path */}
                  <div className="bg-slate-50 p-2 rounded-lg text-[11px]">
                    <span className="text-slate-500 block text-[10px] mb-1">AVL Search Traversal Path:</span>
                    <div className="font-mono text-slate-700 flex flex-wrap items-center gap-1">
                      {searchResult.path.map((node, i) => (
                        <span key={i} className="flex items-center gap-1">
                          <span className={`px-1.5 py-0.5 rounded-sm ${
                            node === searchedKey ? 'bg-emerald-100 text-emerald-800 font-bold' : 'bg-slate-200 text-slate-700'
                          }`}>
                            {node}
                          </span>
                          {i < searchResult.path.length - 1 && <span className="text-slate-400">→</span>}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Patient Preview */}
                  {searchResult.found && searchResult.patient ? (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-bold text-slate-900">{searchResult.patient.name}</div>
                          <div className="text-[11px] text-slate-600">
                            Age: {searchResult.patient.age} · {searchResult.patient.department}
                          </div>
                          <div className="text-[11px] font-mono mt-1 text-slate-700">
                            Severity: <strong>{searchResult.patient.severityScore}/10</strong> ({searchResult.patient.emergencyStatus})
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setShowSearchPopover(false);
                            if (searchResult.patient) onSelectPatient(searchResult.patient);
                          }}
                          className="px-2.5 py-1 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center gap-1 shadow-2xs"
                        >
                          View <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-[11px]">
                      Patient not found in the AVL Tree index. Please check the ID or register them.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Add Patient Option (Prominent Action) */}
          <button
            onClick={onOpenAddPatient}
            className="px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs flex items-center gap-1.5 transition-colors whitespace-nowrap active:scale-98"
            title="Register New Emergency Patient"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>+ Add Patient</span>
          </button>

          {/* Treat Next Patient Button */}
          <button
            onClick={onTreatNext}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs flex items-center gap-1.5 transition-colors whitespace-nowrap"
          >
            <Stethoscope className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Treat Next</span>
          </button>

          {/* Critical Alerts Shortcut */}
          <button
            onClick={() => onNavigateTab('critical_alerts')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors border ${
              activeCriticalCount > 0
                ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100 animate-pulse'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
            title="Critical Emergency Alerts"
          >
            <AlertTriangle className={`w-3.5 h-3.5 ${activeCriticalCount > 0 ? 'text-red-600' : 'text-slate-400'}`} />
            <span>Alerts</span>
            {activeCriticalCount > 0 && (
              <span className="bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                {activeCriticalCount}
              </span>
            )}
          </button>

          {/* Reset Samples */}
          <button
            onClick={onResetSamples}
            className="p-1.5 text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg flex items-center transition-colors"
            title="Reset to 26 realistic clinical sample patients"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Current Logged-in Staff User Profile & Logout */}
          {currentUser && (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200 ml-1">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-800 font-bold font-mono text-xs flex items-center justify-center border border-blue-200 shrink-0">
                  {currentUser.avatarInitials}
                </div>
                <div className="hidden lg:block text-left text-xs leading-tight">
                  <div className="font-bold text-slate-800 truncate max-w-28">{currentUser.name}</div>
                  <div className="text-[10px] text-slate-500 truncate max-w-28">{currentUser.role}</div>
                </div>
              </div>

              <button
                onClick={onLogout}
                className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                title="Sign Out / Switch Staff Account"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
