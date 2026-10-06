import { CriticalAlert, Patient } from '../types/patient';

export class AlertManager {
  private alerts: CriticalAlert[] = [];
  private listeners: Array<() => void> = [];

  constructor() {
    this.alerts = [];
  }

  getAlerts(): CriticalAlert[] {
    return [...this.alerts].sort((a, b) => {
      // Active first, then higher severity, then higher priority
      if (a.status !== b.status) {
        return a.status === 'Active' ? -1 : 1;
      }
      if (b.severity !== a.severity) {
        return b.severity - a.severity;
      }
      return b.priority - a.priority;
    });
  }

  getActiveAlertCount(): number {
    return this.alerts.filter((a) => a.status === 'Active').length;
  }

  /**
   * Process patient intake or update to see if a critical alert should be created or updated
   */
  processPatient(patient: Patient, triggerType: 'Initial Intake' | 'Dynamic Escalation' = 'Initial Intake'): CriticalAlert | null {
    if (patient.severityScore >= 9 && patient.status === 'Waiting') {
      // Check if alert already exists for this patient
      const existing = this.alerts.find((a) => a.patientId === patient.id && a.status === 'Active');
      if (existing) {
        existing.severity = patient.severityScore;
        existing.priority = patient.priority;
        existing.waitingTimeMinutes = patient.waitingTimeMinutes;
        this.notify();
        return existing;
      }

      const newAlert: CriticalAlert = {
        id: `ALT-${Date.now()}-${patient.id}`,
        patientId: patient.id,
        patientName: patient.name,
        severity: patient.severityScore,
        priority: patient.priority,
        waitingTimeMinutes: patient.waitingTimeMinutes,
        alertTime: Date.now(),
        symptoms: patient.symptoms,
        status: 'Active',
        triggerType,
      };

      this.alerts.unshift(newAlert);
      this.playAlertTone();
      this.notify();
      return newAlert;
    } else {
      // If patient severity dropped below 9 or patient is treated, dismiss active alert
      const existing = this.alerts.find((a) => a.patientId === patient.id && a.status === 'Active');
      if (existing) {
        existing.status = patient.status === 'Treated' ? 'Treated' : 'Dismissed';
        this.notify();
      }
      return null;
    }
  }

  markTreated(patientId: string): void {
    const alert = this.alerts.find((a) => a.patientId === patientId && a.status === 'Active');
    if (alert) {
      alert.status = 'Treated';
      this.notify();
    }
  }

  dismissAlert(alertId: string): void {
    const alert = this.alerts.find((a) => a.id === alertId);
    if (alert) {
      alert.status = 'Dismissed';
      this.notify();
    }
  }

  clearAlerts(): void {
    this.alerts = [];
    this.notify();
  }

  setAlerts(alerts: CriticalAlert[]): void {
    this.alerts = alerts;
    this.notify();
  }

  subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify(): void {
    this.listeners.forEach((l) => l());
  }

  private playAlertTone(): void {
    try {
      if (typeof window !== 'undefined' && 'AudioContext' in window) {
        const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
        osc.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.35); // A4

        gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start();
        osc.stop(audioCtx.currentTime + 0.36);
      }
    } catch {
      // Audio playback might be restricted if no user interaction yet, ignore silently
    }
  }
}

export const alertManager = new AlertManager();
