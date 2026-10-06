import { FC } from 'react';
import { Binary, CheckCircle2, Zap, ArrowRight, ShieldCheck, Activity } from 'lucide-react';

export const ComplexityAnalysisView: FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Algorithmic Complexity & Big-O Analysis
        </h2>
        <p className="text-xs text-slate-500">
          Formal asymptotic time and space complexity evaluations comparing AVL Trees, Binary Max-Heaps, and Linear Array baselines.
        </p>
      </div>

      {/* Comprehensive Big-O Comparison Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden space-y-2">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Binary className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-sm">
              Asymptotic Time & Space Complexity Matrix
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-500">
            N = Number of Patient Records in Emergency Registry
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Data Structure</th>
                <th className="py-3 px-3">Operation</th>
                <th className="py-3 px-3">Best Case</th>
                <th className="py-3 px-3">Average Case</th>
                <th className="py-3 px-3">Worst Case</th>
                <th className="py-3 px-3">Space Complexity</th>
                <th className="py-3 px-4">Algorithmic Justification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {/* AVL Tree Search */}
              <tr className="hover:bg-slate-50/70">
                <td rowSpan={4} className="py-3 px-4 font-bold text-blue-900 bg-blue-50/30 align-top font-sans">
                  AVL Tree
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">Self-Balancing BST</div>
                </td>
                <td className="py-2.5 px-3 font-semibold text-slate-800">Search (Lookup)</td>
                <td className="py-2.5 px-3 text-emerald-600 font-bold">O(1) [Root]</td>
                <td className="py-2.5 px-3 text-blue-700 font-bold">O(log N)</td>
                <td className="py-2.5 px-3 text-blue-700 font-bold">O(log N)</td>
                <td className="py-2.5 px-3 text-slate-700 font-bold">O(N)</td>
                <td className="py-2.5 px-4 font-sans text-slate-600 text-[11px]">
                  Tree height strictly capped at ≤ 1.44 log₂(N).
                </td>
              </tr>
              <tr className="hover:bg-slate-50/70">
                <td className="py-2.5 px-3 font-semibold text-slate-800">Insert Record</td>
                <td className="py-2.5 px-3 text-emerald-600 font-bold">O(1) [Empty]</td>
                <td className="py-2.5 px-3 text-blue-700 font-bold">O(log N)</td>
                <td className="py-2.5 px-3 text-blue-700 font-bold">O(log N)</td>
                <td className="py-2.5 px-3 text-slate-700 font-bold">O(N)</td>
                <td className="py-2.5 px-4 font-sans text-slate-600 text-[11px]">
                  BST traversal + at most 1 rotation sequence.
                </td>
              </tr>
              <tr className="hover:bg-slate-50/70">
                <td className="py-2.5 px-3 font-semibold text-slate-800">Delete Record</td>
                <td className="py-2.5 px-3 text-emerald-600 font-bold">O(1)</td>
                <td className="py-2.5 px-3 text-blue-700 font-bold">O(log N)</td>
                <td className="py-2.5 px-3 text-blue-700 font-bold">O(log N)</td>
                <td className="py-2.5 px-3 text-slate-700 font-bold">O(N)</td>
                <td className="py-2.5 px-4 font-sans text-slate-600 text-[11px]">
                  Node removal + at most O(log N) rotations up to root.
                </td>
              </tr>
              <tr className="hover:bg-slate-50/70 border-b border-slate-200">
                <td className="py-2.5 px-3 font-semibold text-slate-800">Rotations (LL/RR/LR/RL)</td>
                <td className="py-2.5 px-3 text-emerald-600 font-bold">O(1)</td>
                <td className="py-2.5 px-3 text-emerald-600 font-bold">O(1)</td>
                <td className="py-2.5 px-3 text-emerald-600 font-bold">O(1)</td>
                <td className="py-2.5 px-3 text-emerald-600 font-bold">O(1)</td>
                <td className="py-2.5 px-4 font-sans text-slate-600 text-[11px]">
                  Fixed constant pointer rewrites (3-5 pointer swaps).
                </td>
              </tr>

              {/* Max Heap */}
              <tr className="hover:bg-slate-50/70">
                <td rowSpan={4} className="py-3 px-4 font-bold text-amber-900 bg-amber-50/30 align-top font-sans">
                  Max-Heap
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">Priority Queue</div>
                </td>
                <td className="py-2.5 px-3 font-semibold text-slate-800">Peek Root</td>
                <td className="py-2.5 px-3 text-emerald-600 font-bold">O(1)</td>
                <td className="py-2.5 px-3 text-emerald-600 font-bold">O(1)</td>
                <td className="py-2.5 px-3 text-emerald-600 font-bold">O(1)</td>
                <td className="py-2.5 px-3 text-slate-700 font-bold">O(N)</td>
                <td className="py-2.5 px-4 font-sans text-slate-600 text-[11px]">
                  Direct access to index [0] in underlying flat array.
                </td>
              </tr>
              <tr className="hover:bg-slate-50/70">
                <td className="py-2.5 px-3 font-semibold text-slate-800">Extract Max (Treat)</td>
                <td className="py-2.5 px-3 text-emerald-600 font-bold">O(1)</td>
                <td className="py-2.5 px-3 text-amber-700 font-bold">O(log N)</td>
                <td className="py-2.5 px-3 text-amber-700 font-bold">O(log N)</td>
                <td className="py-2.5 px-3 text-slate-700 font-bold">O(N)</td>
                <td className="py-2.5 px-4 font-sans text-slate-600 text-[11px]">
                  Root pop + Sift-Down heapify across tree height ⌊log₂N⌋.
                </td>
              </tr>
              <tr className="hover:bg-slate-50/70">
                <td className="py-2.5 px-3 font-semibold text-slate-800">Insert Patient</td>
                <td className="py-2.5 px-3 text-emerald-600 font-bold">O(1)</td>
                <td className="py-2.5 px-3 text-amber-700 font-bold">O(log N)</td>
                <td className="py-2.5 px-3 text-amber-700 font-bold">O(log N)</td>
                <td className="py-2.5 px-3 text-slate-700 font-bold">O(N)</td>
                <td className="py-2.5 px-4 font-sans text-slate-600 text-[11px]">
                  Append to end of array + Sift-Up heapify.
                </td>
              </tr>
              <tr className="hover:bg-slate-50/70 border-b border-slate-200">
                <td className="py-2.5 px-3 font-semibold text-slate-800">Dynamic Key Update</td>
                <td className="py-2.5 px-3 text-emerald-600 font-bold">O(1)</td>
                <td className="py-2.5 px-3 text-amber-700 font-bold">O(log N)</td>
                <td className="py-2.5 px-3 text-amber-700 font-bold">O(log N)</td>
                <td className="py-2.5 px-3 text-slate-700 font-bold">O(N)</td>
                <td className="py-2.5 px-4 font-sans text-slate-600 text-[11px]">
                  O(1) Hash Map index lookup + Sift-Up or Sift-Down.
                </td>
              </tr>

              {/* Linear Search Baseline */}
              <tr className="hover:bg-slate-50/70">
                <td rowSpan={2} className="py-3 px-4 font-bold text-rose-900 bg-rose-50/30 align-top font-sans">
                  Linear Array
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">Unordered Baseline</div>
                </td>
                <td className="py-2.5 px-3 font-semibold text-slate-800">Search by ID</td>
                <td className="py-2.5 px-3 text-emerald-600 font-bold">O(1) [First item]</td>
                <td className="py-2.5 px-3 text-rose-700 font-bold">O(N)</td>
                <td className="py-2.5 px-3 text-rose-700 font-bold">O(N)</td>
                <td className="py-2.5 px-3 text-slate-700 font-bold">O(N)</td>
                <td className="py-2.5 px-4 font-sans text-slate-600 text-[11px]">
                  Must scan each array element linearly until found.
                </td>
              </tr>
              <tr className="hover:bg-slate-50/70">
                <td className="py-2.5 px-3 font-semibold text-slate-800">Find Max Priority</td>
                <td className="py-2.5 px-3 text-rose-700 font-bold">O(N)</td>
                <td className="py-2.5 px-3 text-rose-700 font-bold">O(N)</td>
                <td className="py-2.5 px-3 text-rose-700 font-bold">O(N)</td>
                <td className="py-2.5 px-3 text-slate-700 font-bold">O(N)</td>
                <td className="py-2.5 px-4 font-sans text-slate-600 text-[11px]">
                  Must inspect all N patients to find highest severity/wait.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Why AVL Tree is Essential in Healthcare */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
          <h3 className="font-bold text-slate-900 text-sm">
            Why AVL Trees Over Standard Binary Search Trees (BST)?
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            In medical triage, patients frequently arrive in sequential order (e.g., <code className="font-mono text-slate-800">P101, P102, P103, P104...</code>). In a vanilla, un-balanced BST, inserting strictly ascending keys results in a degenerate skewed tree resembling a linked list with height <strong>H = N</strong>.
          </p>
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-900 space-y-1">
            <strong>Degenerate BST Worst Case:</strong>
            <p>Search degrades to <strong>O(N)</strong> comparisons (e.g. 100,000 checks for 100,000 patients), unacceptable in emergency medical care.</p>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            AVL Trees resolve this via strict balancing invariants. When inserting or deleting, balance factors are re-evaluated in O(1). If |BF| &gt; 1, rotations restore height bound <code className="font-mono text-blue-700 font-bold">H ≤ 1.44 log₂(N)</code>.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
          <h3 className="font-bold text-slate-900 text-sm">
            Why Max-Heap Over Sorted Arrays for Triage?
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Maintaining a fully sorted array requires <strong>O(N)</strong> insertion time (shifting elements). Because patient severity and waiting times change continually, frequent updates in a sorted array would create an unbearable CPU bottleneck.
          </p>
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900 space-y-1">
            <strong>Max-Heap Semi-Ordered Advantage:</strong>
            <p>Heaps do not enforce total order across all siblings; they only enforce the heap invariant between parent and child. This allows insertions, key escalations, and extractions to execute in pure <strong>O(log N)</strong>.</p>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            With N = 100,000 emergency admissions, an O(log N) heap update executes in ~17 comparisons, whereas a sorted array requires up to 100,000 element shifts.
          </p>
        </div>
      </div>
    </div>
  );
};
