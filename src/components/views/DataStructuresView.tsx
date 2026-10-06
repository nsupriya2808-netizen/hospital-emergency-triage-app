import { FC } from 'react';
import { Network, Layers, TrendingUp, Database, ShieldCheck, Zap, Code } from 'lucide-react';

export const DataStructuresView: FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Data Structure Architecture & System Design
        </h2>
        <p className="text-xs text-slate-500">
          Theoretical foundations, algorithmic invariants, and operational roles of the 4 core data structures used in the Emergency Triage Engine.
        </p>
      </div>

      {/* The 4 Architectural Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: AVL Tree */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                <Network className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-blue-600 font-bold">Module 1 Core</span>
                <h3 className="text-base font-bold text-slate-900">1. AVL Tree (Self-Balancing BST)</h3>
              </div>
            </div>
            <span className="text-xs font-mono bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md font-bold">
              O(log N) Lookup
            </span>
          </div>

          <div className="space-y-2 text-xs text-slate-600 leading-relaxed">
            <p>
              <strong>Primary Purpose:</strong> Ultra-fast indexing and retrieval of active and archived patient clinical dossiers using unique <strong>Patient ID</strong> as the primary search key.
            </p>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 space-y-1.5 font-mono text-[11px]">
              <div><strong>Balance Factor:</strong> BF(node) = Height(Left) - Height(Right)</div>
              <div><strong>Invariant:</strong> ∀ nodes, |BF(node)| ≤ 1</div>
              <div><strong>Rotations:</strong> LL (Single Right), RR (Single Left), LR (Double), RL (Double)</div>
              <div><strong>Max Height Bound:</strong> H &lt; 1.4404 · log₂(N + 2) - 0.328</div>
            </div>
            <p>
              Unlike an unbalanced Binary Search Tree which degrades to O(N) when records arrive in sorted order, AVL trees strictly enforce logarithmic height, guaranteeing predictable sub-millisecond retrieval under emergency spikes.
            </p>
          </div>
        </div>

        {/* Card 2: Max Heap Priority Queue */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-amber-600 font-bold">Module 2 Core</span>
                <h3 className="text-base font-bold text-slate-900">2. Max-Heap Priority Queue</h3>
              </div>
            </div>
            <span className="text-xs font-mono bg-amber-50 text-amber-700 px-2.5 py-1 rounded-md font-bold">
              O(1) Peek Root
            </span>
          </div>

          <div className="space-y-2 text-xs text-slate-600 leading-relaxed">
            <p>
              <strong>Primary Purpose:</strong> Dynamic emergency triage scheduling. Selects the most clinically urgent patient for immediate physician assignment in O(1) peek or O(log N) extraction.
            </p>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 space-y-1.5 font-mono text-[11px]">
              <div><strong>Heap Property:</strong> Parent priority ≥ Children priority</div>
              <div><strong>Parent Index:</strong> parent(i) = ⌊(i - 1) / 2⌋</div>
              <div><strong>Children Indices:</strong> left(i) = 2i + 1, right(i) = 2i + 2</div>
              <div><strong>Extract-Max / Insert:</strong> O(log N) via Sift-Down / Sift-Up</div>
            </div>
            <p>
              Stores active waiting patients in a contiguous flat array. Provides direct O(1) examination of the highest-urgency admission without searching the entire database.
            </p>
          </div>
        </div>

        {/* Card 3: Dynamic Severity & Priority Model */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-rose-600 font-bold">Module 3 Core</span>
                <h3 className="text-base font-bold text-slate-900">3. Dynamic Severity & Re-Heapify</h3>
              </div>
            </div>
            <span className="text-xs font-mono bg-rose-50 text-rose-700 px-2.5 py-1 rounded-md font-bold">
              O(log N) Key Update
            </span>
          </div>

          <div className="space-y-2 text-xs text-slate-600 leading-relaxed">
            <p>
              <strong>Primary Purpose:</strong> Re-evaluates queue rank when a patient's vitals escalate (e.g., pain spikes, oxygen falls, or shock ensues).
            </p>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 space-y-1.5 font-mono text-[11px]">
              <div><strong>Priority Formula:</strong> Priority = (Severity × 100) + WaitingTime</div>
              <div><strong>Direct Index Map:</strong> Hash table mapping PatientID → HeapIndex [O(1)]</div>
              <div><strong>Increase-Key:</strong> heapifyUp(index) in O(log N)</div>
              <div><strong>Decrease-Key:</strong> heapifyDown(index) in O(log N)</div>
            </div>
            <p>
              By pairing an ID-to-index tracking hash map with the binary heap, the system avoids O(N) linear scans to locate patients when modifying keys, executing real-time re-prioritization in pure O(log N).
            </p>
          </div>
        </div>

        {/* Card 4: Historical Patient Records & Audit Array */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                <Database className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-emerald-600 font-bold">Persistence & Audit</span>
                <h3 className="text-base font-bold text-slate-900">4. Records, Audit Log & Storage</h3>
              </div>
            </div>
            <span className="text-xs font-mono bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md font-bold">
              O(1) Appends
            </span>
          </div>

          <div className="space-y-2 text-xs text-slate-600 leading-relaxed">
            <p>
              <strong>Primary Purpose:</strong> Maintains complete clinical admission histories, severity reassessment audit logs, and discharged patient records across browser sessions.
            </p>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 space-y-1.5 font-mono text-[11px]">
              <div><strong>Audit Trail:</strong> Array&lt;SeverityChangeRecord&gt; on each patient</div>
              <div><strong>Metrics Telemetry:</strong> High-resolution timing log Array&lt;DynamicUpdateMetrics&gt;</div>
              <div><strong>Persistence:</strong> LocalStorage serialization with schema validation</div>
              <div><strong>Memory Clean-up:</strong> Treated patients removed from Max-Heap, retained in AVL</div>
            </div>
            <p>
              Separates the transient scheduling queue (Max-Heap) from permanent medical records (AVL Tree and audit trail), guaranteeing comprehensive medical compliance.
            </p>
          </div>
        </div>
      </div>

      {/* Cross-Structure Architecture Dataflow Diagram */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <h3 className="font-bold text-slate-900 text-sm">
          System Data Flow: How the Algorithms Work Together
        </h3>

        <div className="bg-slate-900 text-slate-200 p-5 rounded-xl font-mono text-xs overflow-x-auto space-y-2 leading-relaxed">
          <div className="text-blue-400 font-bold">// INTEGRATED PIPELINE DATAFLOW:</div>
          <div>PATIENT INTAKE   → [Patient Record Created]</div>
          <div className="text-slate-400 pl-4">↓</div>
          <div>AVL TREE         → insert(patient) [Key: Patient ID, Height Balanced via Rotations]</div>
          <div className="text-slate-400 pl-4">↓</div>
          <div>MAX HEAP QUEUE   → insert(patient) [Priority = Severity * 100 + WaitTime, Sift-Up]</div>
          <div className="text-slate-400 pl-4">↓</div>
          <div>DYNAMIC UPDATE   → updatePriority(patientId, newSeverity) [Sift-Up / Down O(log N)]</div>
          <div className="text-slate-400 pl-4">↓</div>
          <div>CRITICAL ALERT   → If Severity ≥ 9: Trigger instant emergency notification</div>
          <div className="text-slate-400 pl-4">↓</div>
          <div>DISPATCH / TREAT → extractMax() from Heap [Highest Priority Patient Treated]</div>
          <div className="text-slate-400 pl-4">↓</div>
          <div>REGISTRY AUDIT   → Update status = 'Treated' in AVL Tree [Node preserved for history]</div>
        </div>
      </div>
    </div>
  );
};
