import { FC, useState, useEffect } from 'react';
import { patientManager } from '../../services/PatientManager';
import { Patient, DynamicUpdateMetrics, calculatePriority, getEmergencyStatus } from '../../types/patient';
import {
  TrendingUp,
  AlertTriangle,
  Zap,
  CheckCircle2,
  Clock,
  HeartPulse,
  Search,
  Activity,
  History,
} from 'lucide-react';

interface Props {
  patients: Patient[];
  preselectedPatientId?: string;
  onSelectPatient: (patient: Patient) => void;
  onNavigateTab: (tabId: string) => void;
}

export const SeverityUpdateView: FC<Props> = ({
  patients,
  preselectedPatientId,
  onSelectPatient,
  onNavigateTab,
}) => {
  const waitingPatients = patients.filter((p) => p.status === 'Waiting');
  const [selectedId, setSelectedId] = useState<string>(
    preselectedPatientId || (waitingPatients[0]?.id ?? '')
  );
  const [newSeverity, setNewSeverity] = useState<number>(8);
  const [reason, setReason] = useState<string>('Patient deteriorating: escalating vital signs.');
  const [searchFilter, setSearchFilter] = useState('');
  const [lastUpdateResult, setLastUpdateResult] = useState<{
    metrics: DynamicUpdateMetrics;
    criticalTriggered: boolean;
    patient: Patient;
  } | null>(null);

  useEffect(() => {
    if (preselectedPatientId) {
      setSelectedId(preselectedPatientId);
    }
  }, [preselectedPatientId]);

  const currentPatient = patients.find((p) => p.id === selectedId) || null;

  useEffect(() => {
    if (currentPatient) {
      // Suggest opposite or severe change for demonstration
      setNewSeverity(currentPatient.severityScore >= 8 ? 5 : 9);
    }
  }, [selectedId]);

  const handleExecuteUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPatient) return;

    const result = patientManager.dynamicSeverityUpdate(
      currentPatient.id,
      Number(newSeverity),
      reason.trim()
    );

    if (result) {
      setLastUpdateResult({
        metrics: result.metrics,
        criticalTriggered: result.criticalAlertTriggered,
        patient: result.patient,
      });
    }
  };

  const oldPriority = currentPatient ? currentPatient.priority : 0;
  const simulatedNewPriority = currentPatient
    ? calculatePriority(newSeverity, currentPatient.waitingTimeMinutes)
    : 0;
  const priorityDiff = simulatedNewPriority - oldPriority;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Module 3: Dynamic Severity Updates & Heap Reordering
        </h2>
        <p className="text-xs text-slate-500">
          When a patient's medical condition changes, the system re-indexes records in <strong>AVL Tree</strong>, triggers <strong>O(log N) Heapify Sift-Up/Down</strong> in Max-Heap, and raises immediate <strong>Critical Alerts</strong> if severity reaches ≥ 9.
        </p>
      </div>

      {/* Critical Alert Warning Banner (If Triggered) */}
      {lastUpdateResult && lastUpdateResult.criticalTriggered && (
        <div className="bg-red-600 text-white p-4 rounded-xl shadow-lg border border-red-700 animate-in fade-in slide-in-from-top-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-700 rounded-lg shrink-0">
              <AlertTriangle className="w-6 h-6 text-white animate-bounce" />
            </div>
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-red-200 font-bold">
                HIGH-PRIORITY ESCALATION DETECTED
              </div>
              <h3 className="text-base font-extrabold tracking-tight">
                CRITICAL ALERT: Patient {lastUpdateResult.patient.id} ({lastUpdateResult.patient.name}) requires immediate attention!
              </h3>
              <p className="text-xs text-red-100 mt-0.5">
                Severity escalated to {lastUpdateResult.metrics.newSeverity}/10. Heap position promoted to top of waiting queue.
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('critical_alerts')}
            className="px-4 py-2 bg-white text-red-700 hover:bg-red-50 font-bold text-xs rounded-lg shadow-xs transition-colors shrink-0"
          >
            Open Emergency Command Center
          </button>
        </div>
      )}

      {/* Main Two-Column Workflow */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Patient Selector (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
              Select Waiting Patient
            </h3>
            <span className="text-[11px] font-mono text-slate-500">
              ({waitingPatients.length} waiting)
            </span>
          </div>

          {/* Quick Filter */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Filter by ID or Name..."
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500"
            />
          </div>

          {/* List */}
          <div className="space-y-1.5 max-h-[460px] overflow-y-auto pr-1">
            {waitingPatients
              .filter(
                (p) =>
                  p.id.toLowerCase().includes(searchFilter.toLowerCase()) ||
                  p.name.toLowerCase().includes(searchFilter.toLowerCase())
              )
              .map((p) => {
                const isSelected = p.id === selectedId;
                const isCrit = p.severityScore >= 9;

                return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedId(p.id)}
                    className={`w-full text-left p-2.5 rounded-lg border transition-all text-xs flex items-center justify-between ${
                      isSelected
                        ? 'bg-blue-50 border-blue-400 ring-1 ring-blue-300'
                        : 'bg-slate-50/60 hover:bg-slate-100 border-slate-200/80'
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-slate-900">{p.id}</span>
                        <span className="font-medium text-slate-800 truncate">{p.name}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 truncate mt-0.5">
                        {p.symptoms}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className={`font-mono font-bold px-1.5 py-0.2 rounded-sm text-[10px] ${
                        isCrit ? 'bg-red-100 text-red-800' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {p.severityScore}/10
                      </span>
                      <div className="text-[10px] font-mono text-blue-700 mt-0.5 font-semibold">
                        P: {p.priority}
                      </div>
                    </div>
                  </button>
                );
              })}
          </div>
        </div>

        {/* Right: Dynamic Re-evaluation Form & Real-time Metrics (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {currentPatient ? (
            <form onSubmit={handleExecuteUpdate} className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-5">
              <div className="flex items-start justify-between pb-4 border-b border-slate-100">
                <div>
                  <span className="text-[11px] font-mono text-slate-400 uppercase">Selected Patient Record</span>
                  <h3 className="text-lg font-bold text-slate-900">{currentPatient.name}</h3>
                  <div className="text-xs text-slate-500 mt-0.5">
                    ID: <strong className="font-mono text-blue-600">{currentPatient.id}</strong> · {currentPatient.department} · {currentPatient.age} yrs
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] font-mono text-slate-400 uppercase block">Current Priority</span>
                  <div className="text-2xl font-bold font-mono text-slate-900">{currentPatient.priority}</div>
                  <span className="text-[11px] text-slate-500">Wait: {currentPatient.waitingTimeMinutes}m</span>
                </div>
              </div>

              {/* Severity Comparison Slider */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-500 block text-[11px]">Old Severity</span>
                    <strong className="text-base font-mono text-slate-800">
                      {currentPatient.severityScore} / 10 ({currentPatient.emergencyStatus})
                    </strong>
                  </div>

                  <div className="text-center px-4 py-1 bg-white rounded-lg border border-slate-200">
                    <span className="text-[10px] font-mono text-slate-400 block uppercase">Projected Priority Delta</span>
                    <span className={`text-sm font-mono font-bold ${priorityDiff >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {priorityDiff >= 0 ? `+${priorityDiff}` : priorityDiff} (New: {simulatedNewPriority})
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-slate-500 block text-[11px]">New Severity</span>
                    <strong className={`text-base font-mono ${newSeverity >= 9 ? 'text-red-600 font-extrabold' : 'text-blue-700'}`}>
                      {newSeverity} / 10 ({getEmergencyStatus(newSeverity)})
                    </strong>
                  </div>
                </div>

                <div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={newSeverity}
                    onChange={(e) => setNewSeverity(Number(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                    <span>1 (Low)</span>
                    <span>4 (Moderate)</span>
                    <span>7 (High)</span>
                    <span className="text-red-600 font-bold">9-10 (Critical Alert)</span>
                  </div>
                </div>
              </div>

              {/* Clinical note */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Clinical Re-evaluation Reason / Triage Note *
                </label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-hidden"
                  placeholder="e.g. Acute chest discomfort escalated, oxygen saturation dropped to 84%"
                  required
                />
              </div>

              {/* Submit CTA */}
              <div className="flex items-center justify-between pt-2">
                <div className="text-xs text-slate-500 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <span>Updates AVL Record + Max Heapify in O(log N)</span>
                </div>

                <button
                  type="submit"
                  className={`px-5 py-2.5 rounded-lg font-bold text-xs text-white shadow-xs transition-colors flex items-center gap-1.5 ${
                    newSeverity >= 9
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  <TrendingUp className="w-4 h-4" />
                  <span>Execute Dynamic Severity Update</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="p-12 text-center bg-white rounded-xl border border-slate-200 text-slate-400 text-xs">
              Select a patient from the left panel to update triage severity.
            </div>
          )}

          {/* Micro-Benchmark Latency Breakdown Card */}
          {lastUpdateResult && (
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                    Empirical Update Latency Breakdown (Module 3)
                  </h4>
                </div>
                <span className="font-mono text-xs text-slate-500">
                  Total Latency: <strong className="text-blue-700">{lastUpdateResult.metrics.totalResponseTimeMs.toFixed(3)} ms</strong>
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs font-mono">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-400 block uppercase">1. Severity Update</span>
                  <div className="text-base font-bold text-slate-800 mt-1">
                    {lastUpdateResult.metrics.severityUpdateTimeMs.toFixed(3)} ms
                  </div>
                  <span className="text-[10px] text-slate-500">AVL Tree update</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-400 block uppercase">2. Heap Reorder</span>
                  <div className="text-base font-bold text-amber-700 mt-1">
                    {lastUpdateResult.metrics.heapReorderTimeMs.toFixed(3)} ms
                  </div>
                  <span className="text-[10px] text-slate-500">Sift-up / down</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-400 block uppercase">3. Alert Detection</span>
                  <div className="text-base font-bold text-rose-700 mt-1">
                    {lastUpdateResult.metrics.alertDetectionTimeMs.toFixed(3)} ms
                  </div>
                  <span className="text-[10px] text-slate-500">Threshold check</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-400 block uppercase">4. Priority Result</span>
                  <div className="text-base font-bold text-emerald-700 mt-1">
                    {lastUpdateResult.patient.priority}
                  </div>
                  <span className="text-[10px] text-slate-500">Max-Heap Key</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Audit History Log */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-slate-500" />
            <h3 className="font-bold text-slate-900 text-sm">Dynamic Re-evaluation Audit Log</h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            {patientManager.dynamicMetricsLog.length} events logged
          </span>
        </div>

        <div className="space-y-2 max-h-56 overflow-y-auto">
          {patientManager.dynamicMetricsLog.length === 0 ? (
            <div className="text-xs text-slate-400 py-4 text-center">
              No dynamic updates performed yet. Use the form above to re-evaluate a patient.
            </div>
          ) : (
            patientManager.dynamicMetricsLog.map((metric, idx) => (
              <div
                key={idx}
                className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded-sm border border-slate-200">
                    {metric.patientId}
                  </span>
                  <span className="font-mono text-slate-700">
                    Severity: <strong>{metric.oldSeverity} → {metric.newSeverity}</strong>
                  </span>
                  {metric.wasCriticalAlertTriggered && (
                    <span className="text-[10px] bg-red-100 text-red-800 font-bold px-1.5 py-0.2 rounded-sm uppercase">
                      Critical Alert Raised
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4 font-mono text-[11px] text-slate-500">
                  <span>Reorder: {metric.heapReorderTimeMs.toFixed(3)} ms</span>
                  <span className="font-bold text-slate-700">Total: {metric.totalResponseTimeMs.toFixed(3)} ms</span>
                  <span className="text-slate-400">{new Date(metric.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
