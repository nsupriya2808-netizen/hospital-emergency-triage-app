import { FC } from 'react';
import { DashboardStats } from '../../services/PatientManager';
import { HeapItem } from '../../structures/MaxHeap';
import {
  Users,
  Clock,
  HeartPulse,
  CheckCircle2,
  Network,
  RotateCw,
  Layers,
  Zap,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Stethoscope,
  Activity,
} from 'lucide-react';
import { Patient } from '../../types/patient';

interface Props {
  stats: DashboardStats;
  waitingQueue: HeapItem[];
  allPatients: Patient[];
  onTreatNext: () => void;
  onSelectPatient: (patient: Patient) => void;
  onNavigateTab: (tabId: string) => void;
}

export const DashboardView: FC<Props> = ({
  stats,
  waitingQueue,
  allPatients,
  onTreatNext,
  onSelectPatient,
  onNavigateTab,
}) => {
  // Severity distribution
  const waitingPatients = allPatients.filter((p) => p.status === 'Waiting');
  const lowCount = waitingPatients.filter((p) => p.severityScore <= 3).length;
  const modCount = waitingPatients.filter((p) => p.severityScore >= 4 && p.severityScore <= 6).length;
  const highCount = waitingPatients.filter((p) => p.severityScore >= 7 && p.severityScore <= 8).length;
  const critCount = waitingPatients.filter((p) => p.severityScore >= 9).length;
  const totalWaiting = waitingPatients.length || 1;

  return (
    <div className="space-y-6">
      {/* Top Banner with Quick Action */}
      <div className="bg-linear-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-400/30">
              <Activity className="w-3.5 h-3.5" />
              <span>Real-Time In-Memory Triage Engine Active</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight">
              Hospital Emergency Triage Command Center
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Managing emergency admissions via self-balancing <strong>AVL Trees (O(log N) lookup)</strong> and a dynamic <strong>Max-Heap Priority Queue</strong> prioritizing by severity & waiting time.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <button
              onClick={onTreatNext}
              disabled={stats.waitingCount === 0}
              className={`px-5 py-3 rounded-xl font-bold text-sm shadow-lg flex items-center gap-2 transition-all ${
                stats.waitingCount === 0
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-white cursor-pointer active:scale-98'
              }`}
            >
              <Stethoscope className="w-5 h-5" />
              <span>Treat Next Patient</span>
            </button>
            <button
              onClick={() => onNavigateTab('benchmarking')}
              className="px-4 py-3 rounded-xl font-semibold text-xs bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-colors flex items-center gap-1.5"
            >
              <Zap className="w-4 h-4 text-amber-300" />
              <span>Run Benchmarks</span>
            </button>
          </div>
        </div>
      </div>

      {/* 8 Real-Time Primary Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Total Patients */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Patients</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">{stats.totalPatients}</div>
          <div className="text-[11px] text-slate-500 mt-1">Registry in AVL index</div>
        </div>

        {/* Waiting Patients */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Waiting Patients</span>
            <Layers className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-600">{stats.waitingCount}</div>
          <div className="text-[11px] text-slate-500 mt-1">Active in Max-Heap</div>
        </div>

        {/* Critical Patients */}
        <div className={`p-4 rounded-xl border shadow-2xs ${
          stats.criticalCount > 0 ? 'bg-red-50/60 border-red-200' : 'bg-white border-slate-200/80'
        }`}>
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-red-700">Critical Patients</span>
            <AlertTriangle className="w-4 h-4 text-red-600 animate-pulse" />
          </div>
          <div className="text-2xl font-bold font-mono text-red-600">{stats.criticalCount}</div>
          <div className="text-[11px] text-red-700/80 mt-1 font-medium">Severity 9–10 alerts</div>
        </div>

        {/* Patients Treated */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Patients Treated</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-600">{stats.treatedCount}</div>
          <div className="text-[11px] text-slate-500 mt-1">Throughput: {stats.throughputPerHour}/hr</div>
        </div>

        {/* Average Severity */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Avg Severity</span>
            <HeartPulse className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">{stats.avgSeverity} <span className="text-xs font-normal text-slate-400">/ 10</span></div>
          <div className="text-[11px] text-slate-500 mt-1">Waiting patient mean</div>
        </div>

        {/* Average Waiting Time */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Avg Wait Time</span>
            <Clock className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">{stats.avgWaitingTimeMinutes} <span className="text-xs font-normal text-slate-400">min</span></div>
          <div className="text-[11px] text-slate-500 mt-1">Max: {stats.maxWaitingTimeMinutes}m · Min: {stats.minWaitingTimeMinutes}m</div>
        </div>

        {/* AVL Tree Height */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">AVL Tree Height</span>
            <Network className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-indigo-700">{stats.avlHeight}</div>
          <div className="text-[11px] text-slate-500 mt-1">Balanced: ⌊log₂N⌋ ≤ H ≤ 1.44 log₂N</div>
        </div>

        {/* Total AVL Rotations */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">AVL Rotations</span>
            <RotateCw className="w-4 h-4 text-violet-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-violet-700">{stats.avlRotations}</div>
          <div className="text-[11px] text-slate-500 mt-1">LL, RR, LR, RL balancing events</div>
        </div>
      </div>

      {/* Grid: Triage Distribution & Next In Line (Max Heap) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Triage Severity Breakdown */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Triage Severity Distribution</h3>
              <p className="text-xs text-slate-500">Live breakdown of waiting patients</p>
            </div>
            <span className="text-xs font-mono font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
              N = {stats.waitingCount}
            </span>
          </div>

          {/* Stacked bar visual */}
          <div className="w-full h-4 rounded-full bg-slate-100 overflow-hidden flex">
            <div style={{ width: `${(critCount / totalWaiting) * 100}%` }} className="bg-red-500" title={`Critical: ${critCount}`} />
            <div style={{ width: `${(highCount / totalWaiting) * 100}%` }} className="bg-amber-500" title={`High: ${highCount}`} />
            <div style={{ width: `${(modCount / totalWaiting) * 100}%` }} className="bg-blue-500" title={`Moderate: ${modCount}`} />
            <div style={{ width: `${(lowCount / totalWaiting) * 100}%` }} className="bg-emerald-500" title={`Low: ${lowCount}`} />
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between p-2 rounded-lg bg-red-50 border border-red-200/60">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <span className="font-semibold text-red-900">Critical (9–10)</span>
              </div>
              <span className="font-mono font-bold text-red-700">{critCount} ({Math.round((critCount / totalWaiting) * 100)}%)</span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-amber-50 border border-amber-200/60">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="font-semibold text-amber-900">High (7–8)</span>
              </div>
              <span className="font-mono font-bold text-amber-700">{highCount} ({Math.round((highCount / totalWaiting) * 100)}%)</span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-blue-50 border border-blue-200/60">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span className="font-semibold text-blue-900">Moderate (4–6)</span>
              </div>
              <span className="font-mono font-bold text-blue-700">{modCount} ({Math.round((modCount / totalWaiting) * 100)}%)</span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 border border-emerald-200/60">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="font-semibold text-emerald-900">Low (1–3)</span>
              </div>
              <span className="font-mono font-bold text-emerald-700">{lowCount} ({Math.round((lowCount / totalWaiting) * 100)}%)</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Critical patients trigger instant alerts</span>
            <button
              onClick={() => onNavigateTab('critical_alerts')}
              className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-0.5"
            >
              Alerts <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Next In Line: Top 5 from Max Heap */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Next In Queue (Max-Heap Root Order)</h3>
              <p className="text-xs text-slate-500">Determined by: Priority = (Severity × 100) + WaitingTime</p>
            </div>
            <button
              onClick={() => onNavigateTab('priority_queue')}
              className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
            >
              View Full Heap ({waitingQueue.length}) <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {waitingQueue.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-xl text-slate-500 text-xs">
              No patients currently waiting in the priority queue.
            </div>
          ) : (
            <div className="space-y-2.5">
              {waitingQueue.slice(0, 5).map((item, idx) => (
                <div
                  key={item.patient.id}
                  onClick={() => onSelectPatient(item.patient)}
                  className={`p-3 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                    idx === 0
                      ? 'bg-amber-50/50 border-amber-300 ring-1 ring-amber-200/60'
                      : 'bg-slate-50/50 hover:bg-slate-100/70 border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold shrink-0 ${
                      idx === 0 ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-700'
                    }`}>
                      #{idx + 1}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-900">{item.patient.id}</span>
                        <span className="text-xs font-semibold text-slate-800 truncate">{item.patient.name}</span>
                        {item.patient.severityScore >= 9 && (
                          <span className="text-[10px] bg-red-100 text-red-800 font-bold px-1.5 py-0.2 rounded-sm uppercase">
                            Critical
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate mt-0.5">
                        {item.patient.symptoms}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 text-right">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block">Severity</span>
                      <span className={`text-xs font-mono font-bold ${
                        item.severity >= 9 ? 'text-red-600' :
                        item.severity >= 7 ? 'text-amber-600' : 'text-slate-800'
                      }`}>
                        {item.severity} / 10
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block">Wait</span>
                      <span className="text-xs font-mono font-semibold text-slate-700">
                        {item.waitingTimeMinutes}m
                      </span>
                    </div>

                    <div className="pl-2 border-l border-slate-200">
                      <span className="text-[10px] text-slate-400 uppercase block">Priority</span>
                      <span className="text-sm font-mono font-bold text-blue-700">
                        {item.priority}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Algorithmic Performance Summary & Module 3 KPIs */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-sm">
              Module 3: Critical Alert & Reorder Latency Benchmarks
            </h3>
          </div>
          <button
            onClick={() => onNavigateTab('severity_update')}
            className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
          >
            Dynamic Update Simulator <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-[11px] text-slate-500 block">Avg Dynamic Update Latency</span>
            <div className="text-lg font-mono font-bold text-blue-700 mt-1">
              {stats.avgDynamicLatencyMs} ms
            </div>
            <span className="text-[10px] text-slate-400">Record + AVL + Heap Update</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-[11px] text-slate-500 block">Worst-Case Reorder Latency</span>
            <div className="text-lg font-mono font-bold text-amber-700 mt-1">
              {stats.worstCaseLatencyMs} ms
            </div>
            <span className="text-[10px] text-slate-400">Heapify Sift-Up/Down</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-[11px] text-slate-500 block">Throughput Processing Rate</span>
            <div className="text-lg font-mono font-bold text-emerald-700 mt-1">
              {stats.throughputPerHour} pts/hr
            </div>
            <span className="text-[10px] text-slate-400">Extract-Max Execution Speed</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-[11px] text-slate-500 block">Heap Operations Executed</span>
            <div className="text-lg font-mono font-bold text-indigo-700 mt-1">
              {stats.heapOperations}
            </div>
            <span className="text-[10px] text-slate-400">Total Swaps & Comparisons</span>
          </div>
        </div>
      </div>
    </div>
  );
};
