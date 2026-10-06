import { FC, useState } from 'react';
import {
  GraduationCap,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Award,
  BookOpen,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

interface VivaQA {
  question: string;
  shortAnswer: string;
  detailedAnswer: string;
  category: 'AVL Tree' | 'Max-Heap' | 'Dynamic Updates' | 'Complexity & Benchmarks';
}

export const VivaPrepView: FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [filterCategory, setFilterCategory] = useState<string>('All');

  const vivaQuestions: VivaQA[] = [
    {
      question: 'Why is an AVL Tree chosen for patient record management?',
      shortAnswer:
        'AVL Tree guarantees strict height balancing with maximum height H ≤ 1.44 log₂(N), preventing degenerate trees and ensuring O(log N) lookup, insertion, and deletion.',
      detailedAnswer:
        'In hospital systems, patient IDs frequently arrive in monotonic sequential order (P101, P102...). A standard binary search tree would degrade into an O(N) linked list. AVL trees continuously evaluate balance factors (|BF| ≤ 1) and apply O(1) single (LL, RR) or double (LR, RL) rotations, keeping patient lookup predictable and fast.',
      category: 'AVL Tree',
    },
    {
      question: 'Why is a Max-Heap utilized instead of a sorted list or queue for triage?',
      shortAnswer:
        'Max-Heap allows O(1) examination of the highest-urgency emergency case and O(log N) extraction and dynamic priority adjustments, avoiding O(N) shift costs of sorted lists.',
      detailedAnswer:
        'A fully sorted list requires O(N) time for every insertion and priority update. Because triage severity and waiting times change dynamically, an O(N) cost would choke real-time throughput. A Max-Heap maintains a semi-ordered binary heap structure in contiguous array memory, enabling O(log N) updates and O(1) peek.',
      category: 'Max-Heap',
    },
    {
      question: 'What is the exact triage priority formula and how is it justified?',
      shortAnswer:
        'Priority = (SeverityScore × 100) + WaitingTimeMinutes. Severity dominates while waiting time prevents starvation.',
      detailedAnswer:
        'Clinical triage mandates that severity is the primary determining factor (multiplied by 100 so that a patient with severity 9 always outranks a stable severity 4 patient even if the severity 4 patient waited an hour). However, for patients within identical or adjacent severity tiers, accumulated waiting time continuously escalates priority to prevent starvation.',
      category: 'Dynamic Updates',
    },
    {
      question: 'What occurs computationally when a patient\'s severity changes from 5 to 9?',
      shortAnswer:
        'Record updated in AVL, priority recalculated, Max-Heap executes Increase-Key (sift-up) in O(log N), and a Critical Alert is raised immediately.',
      detailedAnswer:
        '1. The patient record is retrieved via AVL Tree or hash index. 2. Severity score is updated and new priority is computed. 3. Because priority increased, the heap invokes heapifyUp (Increase-Key) moving the patient toward index [0]. 4. Critical threshold (Severity ≥ 9) triggers an immediate high-priority alert. 5. Total response latency is measured in microseconds.',
      category: 'Dynamic Updates',
    },
    {
      question: 'How do AVL tree rotations work, and what is their time complexity?',
      shortAnswer:
        'Rotations are O(1) pointer reassignments triggered when |BalanceFactor| > 1. There are 4 cases: LL, RR, LR, and RL.',
      detailedAnswer:
        'LL (Left-Left): single right rotation on node. RR (Right-Right): single left rotation on node. LR (Left-Right): left rotation on left child followed by right rotation on parent. RL (Right-Left): right rotation on right child followed by left rotation on parent. Each rotation takes constant O(1) time because only a constant number of parent/child pointers are updated.',
      category: 'AVL Tree',
    },
    {
      question: 'Why does empirical benchmarking show search speedup expanding as N increases?',
      shortAnswer:
        'Linear search scales as O(N) while AVL search scales as O(log N). The ratio O(N)/O(log N) increases rapidly with larger N.',
      detailedAnswer:
        'For N = 100, log₂(100) ≈ 7 vs 100 comparisons (speedup ~14×). For N = 100,000, log₂(100,000) ≈ 17 vs 100,000 comparisons (speedup ~5,800×). The empirical tests run actual in-memory loops measuring performance.now(), verifying the theoretical logarithmic scaling against linear array scans.',
      category: 'Complexity & Benchmarks',
    },
    {
      question: 'What is the space complexity of this integrated triage system?',
      shortAnswer:
        'O(N) total auxiliary space. AVL Tree stores N nodes with pointers, and Max-Heap stores N elements in a flat array.',
      detailedAnswer:
        'Each patient requires a node in the AVL tree (key, value reference, height, left/right pointers: O(N)) and an entry in the Max-Heap flat array (O(N)). The index hash map uses O(N) space. Thus total spatial overhead is linear O(N), which easily fits into memory for over 500,000 patients.',
      category: 'Complexity & Benchmarks',
    },
    {
      question: 'How is starvation prevented for low-severity patients in the Max-Heap?',
      shortAnswer:
        'The continuous addition of WaitingTimeMinutes to the priority formula guarantees that waiting patients gradually gain priority over newly arrived patients of similar severity.',
      detailedAnswer:
        'While critical emergencies (severity 9–10) always take clinical precedence, moderate and low patients accumulate minutes. If a patient with severity 5 waits 120 minutes, their priority becomes (5 × 100) + 120 = 620, exceeding a fresh severity 6 patient who just arrived ((6 × 100) + 0 = 600).',
      category: 'Dynamic Updates',
    },
  ];

  const filteredQAs = vivaQuestions.filter((q) => {
    if (filterCategory === 'All') return true;
    return q.category === filterCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Capstone Project Documentation & Viva Voce Preparation
        </h2>
        <p className="text-xs text-slate-500">
          Complete academic dossier, problem statement, architectural justifications, and oral examination questions & answers.
        </p>
      </div>

      {/* Project Overview Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider">
          <BookOpen className="w-4 h-4" />
          <span>Capstone Project Dossier</span>
        </div>

        <h3 className="text-lg font-bold text-slate-900">
          Hospital Emergency Triage System Using AVL Trees, Max-Heap Priority Queue, and Dynamic Severity Updates
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-600">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5">
            <h4 className="font-bold text-slate-900">Problem Statement</h4>
            <p className="leading-relaxed">
              Hospital Emergency Departments face severe throughput bottlenecks when handling high patient influx. Standard database scans (O(N)) cause intolerable delays during surges, while static FIFO queues fail to adapt when waiting patients rapidly deteriorate.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5">
            <h4 className="font-bold text-slate-900">Project Objectives</h4>
            <p className="leading-relaxed">
              1. Develop an in-memory patient registry using self-balancing AVL Trees to guarantee O(log N) lookup.
              <br />
              2. Implement an adaptive Max-Heap Priority Queue combining severity scores and waiting times.
              <br />
              3. Benchmark empirical reordering latency and critical alert detection under live stress.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-2">
          <div className="p-3 bg-blue-50/70 border border-blue-200/60 rounded-lg">
            <span className="text-[10px] text-blue-600 font-bold uppercase block">Core Structure 1</span>
            <strong className="text-slate-900 text-sm">AVL Tree</strong>
            <p className="text-[11px] text-slate-500 mt-0.5">O(log N) balanced records</p>
          </div>

          <div className="p-3 bg-amber-50/70 border border-amber-200/60 rounded-lg">
            <span className="text-[10px] text-amber-600 font-bold uppercase block">Core Structure 2</span>
            <strong className="text-slate-900 text-sm">Max-Heap</strong>
            <p className="text-[11px] text-slate-500 mt-0.5">O(1) peek root, O(log N) triage</p>
          </div>

          <div className="p-3 bg-rose-50/70 border border-rose-200/60 rounded-lg">
            <span className="text-[10px] text-rose-600 font-bold uppercase block">Core Mechanism</span>
            <strong className="text-slate-900 text-sm">Dynamic Updates</strong>
            <p className="text-[11px] text-slate-500 mt-0.5">Re-heapify + alerts in μs</p>
          </div>

          <div className="p-3 bg-emerald-50/70 border border-emerald-200/60 rounded-lg">
            <span className="text-[10px] text-emerald-600 font-bold uppercase block">Evaluation</span>
            <strong className="text-slate-900 text-sm">Empirical Suite</strong>
            <p className="text-[11px] text-slate-500 mt-0.5">Tested across 100 to 100,000</p>
          </div>
        </div>
      </div>

      {/* Viva Voce Questions Section */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Viva Voce / Oral Examination Questions & Answers
              </h3>
              <p className="text-xs text-slate-500">
                Frequently asked conceptual & implementation questions during capstone defence
              </p>
            </div>
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs overflow-x-auto">
            {['All', 'AVL Tree', 'Max-Heap', 'Dynamic Updates', 'Complexity & Benchmarks'].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-2.5 py-1 rounded-md font-medium whitespace-nowrap transition-colors ${
                  filterCategory === cat
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Q&A Accordion */}
        <div className="space-y-3">
          {filteredQAs.map((qa, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                key={index}
                className={`border rounded-xl transition-all overflow-hidden ${
                  isOpen ? 'border-blue-300 bg-blue-50/20 shadow-2xs' : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full text-left p-4 flex items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-sm shrink-0 mt-0.5">
                      Q{index + 1}
                    </span>
                    <span className="font-semibold text-slate-900 text-sm">
                      {qa.question}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md hidden md:inline">
                      {qa.category}
                    </span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-slate-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 pt-1 space-y-3 text-xs animate-in fade-in">
                    <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-lg text-emerald-950">
                      <span className="font-bold text-emerald-800 uppercase text-[10px] block mb-1">
                        Executive Viva Answer:
                      </span>
                      <p className="font-medium leading-relaxed">{qa.shortAnswer}</p>
                    </div>

                    <div className="text-slate-600 leading-relaxed pl-1">
                      <span className="font-bold text-slate-800 uppercase text-[10px] block mb-1">
                        In-Depth Algorithmic Defense:
                      </span>
                      <p>{qa.detailedAnswer}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Expected Outcomes & Future Enhancements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-2">
          <div className="flex items-center gap-2 text-emerald-700 font-bold">
            <CheckCircle2 className="w-4 h-4" />
            <span>Expected Academic Outcomes Achieved</span>
          </div>
          <ul className="list-disc pl-5 space-y-1 text-slate-600 leading-relaxed">
            <li>Fully operational self-balancing AVL Tree index in TypeScript with verified LL/RR/LR/RL balancing.</li>
            <li>Fully operational Binary Max-Heap priority queue ordering triage admissions by clinical urgency.</li>
            <li>Dynamic re-heapification responding to vital sign fluctuations in microsecond latencies.</li>
            <li>Empirical benchmarking suite proving asymptotic O(log N) vs O(N) scaling from 100 to 100,000 patients.</li>
          </ul>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-2">
          <div className="flex items-center gap-2 text-indigo-700 font-bold">
            <Sparkles className="w-4 h-4" />
            <span>Future Enhancements</span>
          </div>
          <ul className="list-disc pl-5 space-y-1 text-slate-600 leading-relaxed">
            <li>Multi-heap departmental partitioning (e.g. separate heaps for Cardiology, Trauma, and Pediatrics).</li>
            <li>Fibonacci Heap integration for theoretical O(1) amortized decrease-key and priority merges.</li>
            <li>WebWorker threading for background empirical stress testing beyond 1,000,000 patient records.</li>
            <li>Integration with HL7 / FHIR clinical healthcare interoperability schemas.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
