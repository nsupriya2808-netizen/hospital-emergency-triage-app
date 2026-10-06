export type EmergencyStatus = 'Low' | 'Moderate' | 'High' | 'Critical';
export type PatientStatus = 'Waiting' | 'Treated' | 'In Consultation';

export interface SeverityChangeRecord {
  timestamp: number;
  oldSeverity: number;
  newSeverity: number;
  reason?: string;
}

export interface Patient {
  id: string; // e.g. "P101", "P102"
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  contact: string;
  symptoms: string;
  severityScore: number; // 1 to 10
  arrivalTime: number; // unix timestamp ms
  waitingTimeMinutes: number; // dynamically computed or persisted
  emergencyStatus: EmergencyStatus;
  priority: number; // Severity * 100 + waitingTimeMinutes
  assignedDoctor: string;
  department: string;
  status: PatientStatus;
  treatedAt?: number;
  severityHistory: SeverityChangeRecord[];
}

export interface CriticalAlert {
  id: string;
  patientId: string;
  patientName: string;
  severity: number;
  priority: number;
  waitingTimeMinutes: number;
  alertTime: number;
  symptoms: string;
  status: 'Active' | 'Treated' | 'Dismissed';
  triggerType: 'Initial Intake' | 'Dynamic Escalation';
}

export interface DynamicUpdateMetrics {
  patientId: string;
  oldSeverity: number;
  newSeverity: number;
  severityUpdateTimeMs: number;
  heapReorderTimeMs: number;
  alertDetectionTimeMs: number;
  totalResponseTimeMs: number;
  wasCriticalAlertTriggered: boolean;
  timestamp: number;
}

export function getEmergencyStatus(severity: number): EmergencyStatus {
  if (severity >= 9) return 'Critical';
  if (severity >= 7) return 'High';
  if (severity >= 4) return 'Moderate';
  return 'Low';
}

export function calculatePriority(severity: number, waitingTimeMinutes: number): number {
  return severity * 100 + Math.max(0, Math.floor(waitingTimeMinutes));
}
