import { FC } from 'react';
import { Patient } from '../../types/patient';
import { X, HeartPulse, Clock, Activity, FileText, UserCheck, ShieldAlert, Sparkles } from 'lucide-react';

interface Props {
  patient: Patient | null;
  onClose: () => void;
  onOpenSeverityUpdate?: (patientId: string) => void;
  onTreatPatient?: (patientId: string) => void;
}

export const PatientDetailModal: FC<Props> = ({
  patient,
  onClose,
  onOpenSeverityUpdate,
  onTreatPatient,
}) => {
  if (!patient) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className={`px-6 py-4 text-white flex items-center justify-between ${
          patient.severityScore >= 9 ? 'bg-red-700' :
          patient.severityScore >= 7 ? 'bg-amber-600' :
          'bg-slate-900'
        }`}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg">
              <HeartPulse className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs uppercase bg-white/20 px-2 py-0.5 rounded-sm">
                  AVL Key: {patient.id}
                </span>
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded-sm font-semibold">
                  Status: {patient.status}
                </span>
              </div>
              <h2 className="text-xl font-bold tracking-tight mt-0.5">{patient.name}</h2>
            </div>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white p-1 rounded-md" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Priority formula box */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Max-Heap Priority Evaluation Formula
              </span>
              <span className="font-mono text-lg font-bold text-blue-700">
                Score: {patient.priority}
              </span>
            </div>
            <div className="flex items-center gap-2 font-mono text-xs bg-white p-2.5 rounded-md border border-slate-200 text-slate-700">
              <span className="text-blue-600 font-semibold">Priority</span>
              <span>=</span>
              <span>(Severity × 100)</span>
              <span>+</span>
              <span>WaitingTime</span>
              <span className="text-slate-400">→</span>
              <span className="text-slate-900 font-semibold">
                ({patient.severityScore} × 100) + {patient.waitingTimeMinutes} = {patient.priority}
              </span>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80">
              <div className="text-xs text-slate-500 flex items-center gap-1 mb-1">
                <HeartPulse className="w-3.5 h-3.5 text-rose-500" /> Severity
              </div>
              <div className="font-mono text-base font-bold text-slate-900">
                {patient.severityScore} / 10
              </div>
              <div className="text-[11px] font-medium text-slate-500">{patient.emergencyStatus}</div>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80">
              <div className="text-xs text-slate-500 flex items-center gap-1 mb-1">
                <Clock className="w-3.5 h-3.5 text-amber-500" /> Waiting Time
              </div>
              <div className="font-mono text-base font-bold text-slate-900">
                {patient.waitingTimeMinutes} min
              </div>
              <div className="text-[11px] text-slate-500">Arrived {new Date(patient.arrivalTime).toLocaleTimeString()}</div>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80">
              <div className="text-xs text-slate-500 flex items-center gap-1 mb-1">
                <Activity className="w-3.5 h-3.5 text-blue-500" /> Age & Gender
              </div>
              <div className="text-sm font-bold text-slate-900">
                {patient.age} yrs
              </div>
              <div className="text-[11px] text-slate-500">{patient.gender}</div>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80">
              <div className="text-xs text-slate-500 flex items-center gap-1 mb-1">
                <UserCheck className="w-3.5 h-3.5 text-emerald-500" /> Assigned MD
              </div>
              <div className="text-xs font-semibold text-slate-900 truncate" title={patient.assignedDoctor}>
                {patient.assignedDoctor.split('(')[0]}
              </div>
              <div className="text-[11px] text-slate-500 truncate">{patient.department}</div>
            </div>
          </div>

          {/* Symptoms and Contact */}
          <div className="space-y-3">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5" /> Clinical Presentation & Symptoms
              </h3>
              <p className="p-3 bg-slate-50 rounded-lg text-sm text-slate-800 border border-slate-200">
                {patient.symptoms}
              </p>
            </div>

            <div className="text-xs text-slate-600 flex items-center gap-4">
              <span><strong>Contact Phone:</strong> {patient.contact}</span>
              <span><strong>Station:</strong> {patient.department}</span>
            </div>
          </div>

          {/* Severity History Audit Log */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5" /> Dynamic Severity Audit Trail
            </h3>
            {patient.severityHistory.length === 0 ? (
              <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-500 border border-slate-200">
                Initial triage assessment maintained. No dynamic reassessments recorded yet.
              </div>
            ) : (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {patient.severityHistory.map((hist, idx) => (
                  <div key={idx} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs flex items-center justify-between">
                    <div>
                      <span className="font-mono font-bold text-slate-800">
                        Severity {hist.oldSeverity} → {hist.newSeverity}
                      </span>
                      <span className="text-slate-500 ml-2">({hist.reason})</span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {new Date(hist.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <div className="text-xs text-slate-500">
            Node indexed in memory via AVL Tree.
          </div>
          <div className="flex items-center gap-2">
            {patient.status === 'Waiting' && onOpenSeverityUpdate && (
              <button
                onClick={() => {
                  onClose();
                  onOpenSeverityUpdate(patient.id);
                }}
                className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" /> Update Severity
              </button>
            )}
            {patient.status === 'Waiting' && onTreatPatient && (
              <button
                onClick={() => {
                  onClose();
                  onTreatPatient(patient.id);
                }}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors"
              >
                Treat Patient
              </button>
            )}
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
