import { FC, useState } from 'react';
import { Patient } from '../../types/patient';
import { patientManager } from '../../services/PatientManager';
import {
  Search,
  UserPlus,
  Trash2,
  Edit,
  Eye,
  TrendingUp,
  ShieldCheck,
  AlertCircle,
  Filter,
  CheckCircle2,
} from 'lucide-react';
import { SearchResult } from '../../structures/AVLTree';

interface Props {
  patients: Patient[];
  onSelectPatient: (patient: Patient) => void;
  onEditPatient: (patient: Patient) => void;
  onOpenAddModal: () => void;
  onOpenSeverityModal: (patientId: string) => void;
}

export const PatientRecordsView: FC<Props> = ({
  patients,
  onSelectPatient,
  onEditPatient,
  onOpenAddModal,
  onOpenSeverityModal,
}) => {
  const [searchKey, setSearchKey] = useState('');
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'All' | 'Waiting' | 'Treated'>('All');
  const [severityFilter, setSeverityFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'id' | 'priority' | 'severity' | 'wait'>('priority');

  const handleAvlSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchKey.trim()) return;

    const res = patientManager.searchPatientAVL(searchKey.trim().toUpperCase());
    setSearchResult(res);
    setHasSearched(true);
  };

  const handleClearSearch = () => {
    setSearchKey('');
    setSearchResult(null);
    setHasSearched(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete patient ${name} (${id}) from the AVL Tree registry?`)) {
      patientManager.deletePatient(id);
      if (searchResult?.patient?.id === id) {
        handleClearSearch();
      }
    }
  };

  // Filter & sort
  const filtered = patients.filter((p) => {
    if (statusFilter !== 'All' && p.status !== statusFilter) return false;
    if (severityFilter === 'Critical' && p.severityScore < 9) return false;
    if (severityFilter === 'High' && (p.severityScore < 7 || p.severityScore > 8)) return false;
    if (severityFilter === 'Moderate' && (p.severityScore < 4 || p.severityScore > 6)) return false;
    if (severityFilter === 'Low' && p.severityScore > 3) return false;
    return true;
  });

  filtered.sort((a, b) => {
    if (sortBy === 'priority') return b.priority - a.priority;
    if (sortBy === 'severity') return b.severityScore - a.severityScore;
    if (sortBy === 'wait') return b.waitingTimeMinutes - a.waitingTimeMinutes;
    return a.id.localeCompare(b.id, undefined, { numeric: true });
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Patient Registry & Records
          </h2>
          <p className="text-xs text-slate-500">
            Primary storage indexed via self-balancing <strong>AVL Tree</strong> (Key = Patient ID). Guaranteed O(log N) operations.
          </p>
        </div>

        <button
          onClick={onOpenAddModal}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg shadow-xs flex items-center gap-1.5 self-start sm:self-auto transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          <span>Register Patient</span>
        </button>
      </div>

      {/* Module 1 AVL Search Interactive Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Module 1: AVL Tree Search Console
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-500">
            Complexity: <strong className="text-blue-700">O(log N)</strong>
          </span>
        </div>

        <form onSubmit={handleAvlSearch} className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchKey}
              onChange={(e) => setSearchKey(e.target.value)}
              placeholder="Search by Patient ID (e.g., P102, P106, P115)..."
              className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-hidden"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5"
          >
            <Search className="w-3.5 h-3.5" />
            <span>AVL Search</span>
          </button>
          {hasSearched && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-300 rounded-lg transition-colors"
            >
              Clear
            </button>
          )}
        </form>

        {/* Search Result Feedback */}
        {hasSearched && searchResult && (
          <div className={`p-3.5 rounded-lg border text-xs animate-in fade-in ${
            searchResult.found ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 font-bold">
                {searchResult.found ? (
                  <>
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span className="text-emerald-900">AVL Search Successful</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                    <span className="text-rose-900">Patient Not Found in AVL Tree</span>
                  </>
                )}
              </div>
              <span className="font-mono text-slate-600 text-[11px]">
                Search Time: <strong>{searchResult.executionTimeMs.toFixed(3)} ms</strong>
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-200/60 text-[11px] font-mono">
              <div>
                <span className="text-slate-500 block">Comparisons:</span>
                <strong className="text-blue-700 text-xs">{searchResult.comparisons} node checks</strong>
              </div>
              <div>
                <span className="text-slate-500 block">AVL Tree Height:</span>
                <strong className="text-slate-800 text-xs">{patientManager.avlTree.getTreeHeight()} levels</strong>
              </div>
              <div className="sm:col-span-2">
                <span className="text-slate-500 block">Search Traversal Path:</span>
                <span className="text-slate-800 font-bold truncate block">
                  {searchResult.path.join(' → ') || 'Root'}
                </span>
              </div>
            </div>

            {searchResult.found && searchResult.patient && (
              <div className="mt-3 p-2 bg-white rounded-md border border-emerald-200/80 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900">{searchResult.patient.name}</span>
                  <span className="text-slate-500 ml-2">
                    ({searchResult.patient.id} · Severity: {searchResult.patient.severityScore}/10 · Priority: {searchResult.patient.priority})
                  </span>
                </div>
                <button
                  onClick={() => onSelectPatient(searchResult.patient!)}
                  className="px-2.5 py-1 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-md"
                >
                  Inspect Dossier
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Filter and Table Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {/* Filter bar */}
        <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-slate-500 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Filter:
            </span>

            {/* Status tabs */}
            <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50">
              {(['All', 'Waiting', 'Treated'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                    statusFilter === s ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Severity category dropdown */}
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="px-2.5 py-1 border border-slate-200 rounded-lg bg-slate-50 text-slate-700 focus:outline-hidden"
            >
              <option value="All">All Severities</option>
              <option value="Critical">Critical (9–10)</option>
              <option value="High">High (7–8)</option>
              <option value="Moderate">Moderate (4–6)</option>
              <option value="Low">Low (1–3)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2.5 py-1 border border-slate-200 rounded-lg bg-slate-50 text-slate-700 focus:outline-hidden"
            >
              <option value="priority">Priority (Highest first)</option>
              <option value="severity">Severity Score</option>
              <option value="wait">Waiting Time</option>
              <option value="id">Patient ID</option>
            </select>
            <span className="text-slate-400 font-mono">({filtered.length} records)</span>
          </div>
        </div>

        {/* Patient Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Patient ID</th>
                <th className="py-3 px-4">Name & Demographics</th>
                <th className="py-3 px-4">Symptoms</th>
                <th className="py-3 px-4 text-center">Severity</th>
                <th className="py-3 px-4 text-right">Priority</th>
                <th className="py-3 px-4 text-right">Waiting</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No patient records match the selected filters.
                  </td>
                </tr>
              ) : (
                filtered.map((patient) => {
                  const isCritical = patient.severityScore >= 9;
                  return (
                    <tr
                      key={patient.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isCritical && patient.status === 'Waiting' ? 'bg-red-50/20' : ''
                      }`}
                    >
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {patient.id}
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{patient.name}</div>
                        <div className="text-[11px] text-slate-500">
                          {patient.age} yrs · {patient.gender} · {patient.department}
                        </div>
                      </td>

                      <td className="py-3 px-4 max-w-xs truncate text-slate-600" title={patient.symptoms}>
                        {patient.symptoms}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className={`inline-block font-mono font-bold px-2 py-0.5 rounded-sm ${
                          patient.severityScore >= 9
                            ? 'bg-red-100 text-red-800 border border-red-300'
                            : patient.severityScore >= 7
                            ? 'bg-amber-100 text-amber-800'
                            : patient.severityScore >= 4
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {patient.severityScore}/10
                        </span>
                        <div className="text-[10px] text-slate-500 mt-0.5">{patient.emergencyStatus}</div>
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-bold text-blue-700">
                        {patient.priority}
                      </td>

                      <td className="py-3 px-4 text-right font-mono text-slate-700">
                        {patient.status === 'Treated' ? (
                          <span className="text-slate-400">—</span>
                        ) : (
                          `${patient.waitingTimeMinutes} min`
                        )}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          patient.status === 'Treated'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : isCritical
                            ? 'bg-red-100 text-red-800 font-bold border border-red-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {patient.status === 'Treated' && <CheckCircle2 className="w-3 h-3" />}
                          {patient.status}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onSelectPatient(patient)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                            title="View Dossier"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          {patient.status === 'Waiting' && (
                            <button
                              onClick={() => onOpenSeverityModal(patient.id)}
                              className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
                              title="Update Severity"
                            >
                              <TrendingUp className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => onEditPatient(patient)}
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
                            title="Edit Record"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(patient.id, patient.name)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                            title="Delete Patient"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
