import { FC } from 'react';
import { Patient } from '../../types/patient';
import { CheckCircle2, Clock, Activity, User, HeartPulse, X } from 'lucide-react';

interface Props {
  patient: Patient | null;
  onClose: () => void;
}

export const TreatedPatientModal: FC<Props> = ({ patient, onClose }) => {
  if (!patient) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-emerald-600 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500 rounded-lg">
              <CheckCircle2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight">Patient Treated & Admitted</h2>
              <p className="text-xs text-emerald-100">Dispatched from Max-Heap Priority Queue</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-emerald-100 hover:text-white p-1 rounded-md transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Patient Identifier</span>
              <div className="text-2xl font-bold font-mono text-slate-900">{patient.id}</div>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Triage Priority Score</span>
              <div className="text-2xl font-bold font-mono text-emerald-600">{patient.priority}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <User className="w-3.5 h-3.5" /> Full Name
              </span>
              <p className="font-semibold text-slate-800">{patient.name}</p>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Activity className="w-3.5 h-3.5" /> Age & Gender
              </span>
              <p className="font-semibold text-slate-800">{patient.age} yrs · {patient.gender}</p>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <HeartPulse className="w-3.5 h-3.5" /> Severity Score
              </span>
              <p className="font-semibold text-slate-800 font-mono">
                {patient.severityScore} / 10 ({patient.emergencyStatus})
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Total Waiting Time
              </span>
              <p className="font-semibold text-slate-800 font-mono">{patient.waitingTimeMinutes} minutes</p>
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80 text-xs text-slate-600">
            <div className="font-medium text-slate-700 mb-1">Assigned Medical Station:</div>
            <div>{patient.department} — {patient.assignedDoctor}</div>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-xs text-emerald-800 flex items-start gap-2">
            <div className="shrink-0 mt-0.5 font-bold font-mono text-emerald-600 text-xs">HEAP</div>
            <p>
              Max-Heap executed <strong>extractMax()</strong> in <strong>O(log N)</strong>. Patient status updated in primary AVL Tree record.
            </p>
          </div>
        </div>

        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors"
          >
            Acknowledge & Proceed
          </button>
        </div>
      </div>
    </div>
  );
};
