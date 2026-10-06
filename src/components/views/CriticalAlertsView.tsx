import { FC, useState } from 'react';
import { alertManager } from '../../services/AlertManager';
import { patientManager } from '../../services/PatientManager';
import { CriticalAlert, Patient } from '../../types/patient';
import {
  AlertOctagon,
  RefreshCw,
  Stethoscope,
  Clock,
  HeartPulse,
  ShieldAlert,
  CheckCircle2,
  Volume2,
} from 'lucide-react';

interface Props {
  alerts: CriticalAlert[];
  onTreatPatient: (patientId: string) => void;
  onSelectPatient: (patient: Patient) => void;
}

export const CriticalAlertsView: FC<Props> = ({
  alerts,
  onTreatPatient,
  onSelectPatient,
}) => {
  const [, setTick] = useState(0);

  const handleRefresh = () => {
    patientManager.refreshWaitingTimes();
    setTick((t) => t + 1);
  };

  const activeAlerts = alerts.filter((a) => a.status === 'Active');
  const resolvedAlerts = alerts.filter((a) => a.status !== 'Active');

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Critical Emergency Alert Command Center
            </h2>
            {activeAlerts.length > 0 && (
              <span className="bg-red-600 text-white font-mono text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
                {activeAlerts.length} Active
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500">
            Immediate notification trigger for patients with <strong>Severity Score ≥ 9 (Critical)</strong>. Automated priority heap promotion.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className="px-3.5 py-2 text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg shadow-2xs flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Alerts</span>
          </button>
        </div>
      </div>

      {/* Mandatory Academic Disclaimer Banner */}
      <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 text-xs text-amber-900 flex items-start gap-3 shadow-2xs">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <div className="font-bold uppercase tracking-wider text-[11px] text-amber-800">
            Academic Demonstration Safeguard
          </div>
          <p className="leading-relaxed">
            "Academic alert mechanism only. It does not replace clinical decision-making."
          </p>
          <p className="text-[11px] text-amber-700/80">
            This module benchmarks real-time threshold detection, AVL node balance invariants, and Max-Heap priority queue reordering latencies under simulated acute clinical emergency conditions.
          </p>
        </div>
      </div>

      {/* Active Critical Alerts List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <AlertOctagon className="w-4 h-4 text-red-600" />
            <span>Active Critical Emergencies (Severity ≥ 9)</span>
          </h3>
          <span className="text-xs text-slate-500 font-mono">
            {activeAlerts.length} pending intervention
          </span>
        </div>

        {activeAlerts.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500 text-xs">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="font-semibold text-slate-800">No active critical emergency alerts at this time.</p>
            <p className="text-slate-400 mt-1">All current waiting patients have severity score &lt; 9.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeAlerts.map((alert) => {
              const patient = patientManager.searchPatientAVL(alert.patientId).patient;

              return (
                <div
                  key={alert.id}
                  className="bg-white rounded-xl border-2 border-red-500 shadow-md p-5 space-y-4 relative overflow-hidden animate-in fade-in"
                >
                  <div className="absolute top-0 right-0 bg-red-600 text-white font-mono text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">
                    {alert.triggerType}
                  </div>

                  <div className="flex items-start justify-between pr-24">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-sm">
                          {alert.patientId}
                        </span>
                        <h4 className="font-bold text-slate-900 text-base">{alert.patientName}</h4>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 line-clamp-2" title={alert.symptoms}>
                        {alert.symptoms}
                      </p>
                    </div>
                  </div>

                  {/* Metrics Box */}
                  <div className="grid grid-cols-3 gap-2 bg-red-50/70 p-3 rounded-lg border border-red-200/60 text-xs font-mono">
                    <div>
                      <span className="text-red-700/80 block text-[10px] uppercase">Severity</span>
                      <strong className="text-base text-red-700 font-extrabold">{alert.severity} / 10</strong>
                    </div>
                    <div>
                      <span className="text-red-700/80 block text-[10px] uppercase">Heap Priority</span>
                      <strong className="text-base text-red-700 font-bold">{alert.priority}</strong>
                    </div>
                    <div>
                      <span className="text-red-700/80 block text-[10px] uppercase">Waiting Time</span>
                      <strong className="text-base text-slate-800 font-semibold">{alert.waitingTimeMinutes} min</strong>
                    </div>
                  </div>

                  {/* Bottom Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <span className="text-slate-400 font-mono text-[11px]">
                      Alert Raised: {new Date(alert.alertTime).toLocaleTimeString()}
                    </span>

                    <div className="flex items-center gap-2">
                      {patient && (
                        <button
                          onClick={() => onSelectPatient(patient)}
                          className="px-3 py-1.5 font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                        >
                          View Record
                        </button>
                      )}
                      <button
                        onClick={() => onTreatPatient(alert.patientId)}
                        className="px-3.5 py-1.5 font-bold text-white bg-red-600 hover:bg-red-700 rounded-md shadow-xs transition-colors flex items-center gap-1.5"
                      >
                        <Stethoscope className="w-3.5 h-3.5" />
                        <span>Treat Immediately</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Resolved / Treated Alerts History */}
      {resolvedAlerts.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">Resolved Critical Alerts History</h3>
            <span className="text-xs text-slate-500 font-mono">({resolvedAlerts.length} past alerts)</span>
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto">
            {resolvedAlerts.map((alert) => (
              <div
                key={alert.id}
                className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-slate-600 bg-white px-2 py-0.5 rounded-sm border border-slate-200">
                    {alert.patientId}
                  </span>
                  <span className="font-semibold text-slate-800">{alert.patientName}</span>
                  <span className="text-slate-500">(Severity: {alert.severity}/10 · Priority: {alert.priority})</span>
                </div>

                <div className="flex items-center gap-4 text-right">
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    {alert.status}
                  </span>
                  <span className="text-slate-400 font-mono text-[11px]">
                    {new Date(alert.alertTime).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
