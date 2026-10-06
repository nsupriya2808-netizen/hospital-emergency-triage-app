import { FC, useState } from 'react';
import { MaxHeap, HeapItem } from '../../structures/MaxHeap';
import { patientManager } from '../../services/PatientManager';
import { Patient } from '../../types/patient';
import {
  Layers,
  ArrowDownUp,
  Stethoscope,
  Eye,
  RefreshCw,
  PlusCircle,
  TrendingUp,
  Info,
} from 'lucide-react';

interface Props {
  maxHeap: MaxHeap;
  waitingPatients: HeapItem[];
  onTreatNext: () => void;
  onSelectPatient: (patient: Patient) => void;
  onOpenAddModal: () => void;
  onOpenSeverityModal: (patientId: string) => void;
}

export const PriorityQueueView: FC<Props> = ({
  maxHeap,
  waitingPatients,
  onTreatNext,
  onSelectPatient,
  onOpenAddModal,
  onOpenSeverityModal,
}) => {
  const [peekedPatient, setPeekedPatient] = useState<HeapItem | null>(null);
  const [showPeekBanner, setShowPeekBanner] = useState(false);

  const rawHeap = maxHeap.getRawHeap();
  const heapHeight = maxHeap.height;
  const maxPriority = maxHeap.maxPriority;
  const totalOperations = maxHeap.totalOperationsCount;

  const handlePeek = () => {
    const item = maxHeap.peekItem();
    setPeekedPatient(item);
    setShowPeekBanner(true);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Triage Priority Queue (Max-Heap)
          </h2>
          <p className="text-xs text-slate-500">
            Binary Max-Heap ordering emergency patients by dynamic priority: <code className="font-mono text-blue-700 bg-blue-50 px-1 py-0.5 rounded-sm">Priority = (Severity × 100) + WaitingTime</code>
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onOpenAddModal}
            className="px-3.5 py-2 text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg shadow-2xs flex items-center gap-1.5 transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5 text-blue-600" />
            <span>Insert Patient</span>
          </button>

          <button
            onClick={handlePeek}
            disabled={rawHeap.length === 0}
            className="px-3.5 py-2 text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg shadow-2xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <Eye className="w-3.5 h-3.5 text-indigo-600" />
            <span>Peek Root [O(1)]</span>
          </button>

          <button
            onClick={onTreatNext}
            disabled={rawHeap.length === 0}
            className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <Stethoscope className="w-4 h-4" />
            <span>Extract Max [O(log N)]</span>
          </button>
        </div>
      </div>

      {/* Heap Complexity & Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Current Heap Size</span>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1">{rawHeap.length}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Active waiting queue</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Maximum Priority</span>
          <div className="text-2xl font-bold font-mono text-blue-700 mt-1">{maxPriority}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Heap Root element priority</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Binary Heap Height</span>
          <div className="text-2xl font-bold font-mono text-indigo-700 mt-1">{heapHeight}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">H = ⌊log₂ N⌋ + 1</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Heap Operations</span>
          <div className="text-2xl font-bold font-mono text-violet-700 mt-1">{totalOperations}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">{maxHeap.totalSwapsCount} swaps · {maxHeap.totalComparisonsCount} compares</div>
        </div>
      </div>

      {/* Complexity Badges Card */}
      <div className="bg-slate-900 text-white p-4 rounded-xl shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-blue-400" />
          <span className="font-bold">Max-Heap Algorithmic Complexities:</span>
        </div>
        <div className="flex items-center gap-4 font-mono text-[11px] flex-wrap">
          <span className="bg-slate-800 px-2 py-1 rounded-md">
            Insert: <strong className="text-emerald-400">O(log N)</strong>
          </span>
          <span className="bg-slate-800 px-2 py-1 rounded-md">
            Extract Max: <strong className="text-emerald-400">O(log N)</strong>
          </span>
          <span className="bg-slate-800 px-2 py-1 rounded-md">
            Peek Root: <strong className="text-blue-400">O(1)</strong>
          </span>
          <span className="bg-slate-800 px-2 py-1 rounded-md">
            Update Priority: <strong className="text-amber-400">O(log N)</strong>
          </span>
        </div>
      </div>

      {/* Peek Root Feedback */}
      {showPeekBanner && peekedPatient && (
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 text-white rounded-lg font-bold font-mono">
              ROOT [0]
            </div>
            <div>
              <div className="font-bold text-slate-900 text-sm">
                Highest Priority: {peekedPatient.patient.name} ({peekedPatient.patient.id})
              </div>
              <div className="text-slate-600 mt-0.5 font-mono">
                Priority: <strong>{peekedPatient.priority}</strong> · Severity: <strong>{peekedPatient.severity}/10</strong> · Waiting: <strong>{peekedPatient.waitingTimeMinutes} min</strong>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onSelectPatient(peekedPatient.patient)}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold"
            >
              View Record
            </button>
            <button
              onClick={() => setShowPeekBanner(false)}
              className="text-slate-400 hover:text-slate-600 px-2 py-1 text-sm font-bold"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Visual Heap Tree */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Binary Max-Heap Tree Hierarchy</h3>
            <p className="text-xs text-slate-500">
              Parent at index <code className="font-mono">i</code> has children at <code className="font-mono">2i + 1</code> and <code className="font-mono">2i + 2</code>.
            </p>
          </div>
          <span className="text-xs font-mono bg-slate-100 text-slate-700 px-2 py-1 rounded-md">
            Root: Index [0]
          </span>
        </div>

        {rawHeap.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            Heap is empty. Insert a patient to populate the tree.
          </div>
        ) : (
          <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-200/80 overflow-x-auto min-h-64">
            {/* Render heap levels up to level 4 visually */}
            <div className="space-y-6 min-w-[700px] text-center">
              {[0, 1, 2, 3].map((level) => {
                const startIndex = Math.pow(2, level) - 1;
                const count = Math.pow(2, level);
                const endIndex = Math.min(rawHeap.length, startIndex + count);
                const itemsInLevel = rawHeap.slice(startIndex, endIndex);

                if (itemsInLevel.length === 0) return null;

                return (
                  <div key={level} className="space-y-1">
                    <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                      Level {level} {level === 0 ? '(Root)' : ''}
                    </div>
                    <div className="flex items-center justify-around gap-2 px-2">
                      {itemsInLevel.map((item, idxInLevel) => {
                        const globalIdx = startIndex + idxInLevel;
                        const isRoot = globalIdx === 0;
                        const isCrit = item.severity >= 9;

                        return (
                          <div
                            key={item.patient.id}
                            onClick={() => onSelectPatient(item.patient)}
                            className={`p-2.5 rounded-xl border shadow-2xs cursor-pointer transition-all hover:scale-105 min-w-[130px] max-w-[180px] text-left relative ${
                              isRoot
                                ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-300/60'
                                : isCrit
                                ? 'bg-red-50/70 border-red-200'
                                : 'bg-white border-slate-200 hover:border-blue-300'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded-sm">
                                [{globalIdx}]
                              </span>
                              <span className="text-[10px] font-mono font-bold text-blue-700">
                                P: {item.priority}
                              </span>
                            </div>

                            <div className="font-bold text-slate-900 text-xs truncate">
                              {item.patient.id} - {item.patient.name}
                            </div>

                            <div className="text-[10px] font-mono mt-1 flex items-center justify-between text-slate-500">
                              <span>Sev: <strong className={isCrit ? 'text-red-600' : 'text-slate-800'}>{item.severity}/10</strong></span>
                              <span>Wait: <strong>{item.waitingTimeMinutes}m</strong></span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {rawHeap.length > 15 && (
                <div className="text-xs text-slate-500 pt-2 font-mono">
                  + {rawHeap.length - 15} additional nodes deeper in the binary heap (inspect in array below)
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Heap Array Memory Representation */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Underlying Array Memory Layout</h3>
            <p className="text-xs text-slate-500">
              Array contiguous index mapping. Direct O(1) random access for indexing.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500">
            Array Length: <strong>{rawHeap.length}</strong>
          </span>
        </div>

        <div className="overflow-x-auto pb-2">
          <div className="flex gap-2 min-w-max">
            {rawHeap.map((item, idx) => (
              <div
                key={idx}
                onClick={() => onSelectPatient(item.patient)}
                className={`p-2 rounded-lg border text-center font-mono cursor-pointer transition-all hover:border-blue-400 ${
                  idx === 0
                    ? 'bg-amber-50 border-amber-300 min-w-24'
                    : 'bg-slate-50 border-slate-200 min-w-24'
                }`}
              >
                <div className="text-[10px] text-slate-400 font-bold">[{idx}]</div>
                <div className="text-xs font-bold text-slate-900">{item.patient.id}</div>
                <div className="text-[10px] text-blue-700 font-semibold">Pr: {item.priority}</div>
                <div className="text-[9px] text-slate-500">Sev: {item.severity}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Operations Audit History */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ArrowDownUp className="w-4 h-4 text-violet-600" />
            <h3 className="font-bold text-slate-900 text-sm">Recent Heap Operations & Benchmarks</h3>
          </div>
          <span className="text-xs text-slate-500">Audit Trail</span>
        </div>

        <div className="space-y-2 max-h-56 overflow-y-auto">
          {maxHeap.operationLogs.length === 0 ? (
            <div className="text-xs text-slate-400 py-4 text-center">No heap operations recorded yet.</div>
          ) : (
            maxHeap.operationLogs.map((log, i) => (
              <div
                key={i}
                className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase ${
                    log.operation === 'extractMax' ? 'bg-emerald-100 text-emerald-800' :
                    log.operation === 'updatePriority' ? 'bg-amber-100 text-amber-800' :
                    log.operation === 'insert' ? 'bg-blue-100 text-blue-800' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {log.operation}
                  </span>
                  <span className="text-slate-800 font-medium">{log.details}</span>
                </div>

                <div className="flex items-center gap-4 text-right font-mono text-[11px] text-slate-500">
                  <span>{log.swaps} swaps · {log.comparisons} comp</span>
                  <span className="font-bold text-slate-700">{log.timeMs.toFixed(3)} ms</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
