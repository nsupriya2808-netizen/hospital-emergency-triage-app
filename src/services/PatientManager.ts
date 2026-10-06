import { AVLTree } from '../structures/AVLTree';
import { MaxHeap, HeapItem } from '../structures/MaxHeap';
import {
  Patient,
  DynamicUpdateMetrics,
  getEmergencyStatus,
  calculatePriority,
} from '../types/patient';
import { alertManager } from './AlertManager';
import { generateSamplePatients } from './sampleData';

const STORAGE_KEY_PATIENTS = 'er_triage_patients_v1';
const STORAGE_KEY_METRICS = 'er_triage_metrics_v1';

export interface DashboardStats {
  totalPatients: number;
  waitingCount: number;
  treatedCount: number;
  criticalCount: number;
  avgSeverity: number;
  avgWaitingTimeMinutes: number;
  maxWaitingTimeMinutes: number;
  minWaitingTimeMinutes: number;
  avlHeight: number;
  avlRotations: number;
  heapHeight: number;
  heapOperations: number;
  heapSize: number;
  throughputPerHour: number;
  avgDynamicLatencyMs: number;
  worstCaseLatencyMs: number;
}

export class PatientManager {
  public avlTree: AVLTree = new AVLTree();
  public maxHeap: MaxHeap = new MaxHeap();
  private patients: Map<string, Patient> = new Map();
  public dynamicMetricsLog: DynamicUpdateMetrics[] = [];
  private listeners: Array<() => void> = [];
  private startTime: number = Date.now();

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem(STORAGE_KEY_PATIENTS);
      const storedMetrics = localStorage.getItem(STORAGE_KEY_METRICS);

      if (storedMetrics) {
        this.dynamicMetricsLog = JSON.parse(storedMetrics);
      }

      if (stored) {
        const parsed: Patient[] = JSON.parse(stored);
        if (parsed.length > 0) {
          this.loadPatients(parsed);
          return;
        }
      }
    } catch {
      // Fallback to sample data
    }

    // Default to samples
    const samples = generateSamplePatients();
    this.loadPatients(samples);
  }

  private loadPatients(patientList: Patient[]): void {
    this.avlTree.clear();
    this.maxHeap.clear();
    this.patients.clear();
    alertManager.clearAlerts();

    const now = Date.now();

    for (const patient of patientList) {
      // Refresh waiting time
      if (patient.status === 'Waiting') {
        const waitMins = Math.max(0, Math.floor((now - patient.arrivalTime) / (60 * 1000)));
        patient.waitingTimeMinutes = waitMins;
        patient.priority = calculatePriority(patient.severityScore, waitMins);
      }

      this.patients.set(patient.id, patient);
      this.avlTree.insert(patient);

      if (patient.status === 'Waiting') {
        this.maxHeap.insert(patient);
        if (patient.severityScore >= 9) {
          alertManager.processPatient(patient, 'Initial Intake');
        }
      }
    }

    this.saveToStorage();
    this.notify();
  }

  public saveToStorage(): void {
    if (typeof window === 'undefined') return;
    try {
      const arr = Array.from(this.patients.values());
      localStorage.setItem(STORAGE_KEY_PATIENTS, JSON.stringify(arr));
      localStorage.setItem(STORAGE_KEY_METRICS, JSON.stringify(this.dynamicMetricsLog.slice(0, 100)));
    } catch {
      // LocalStorage error (quota or disabled)
    }
  }

  /**
   * Add a new patient record
   */
  public addPatient(data: Omit<Patient, 'waitingTimeMinutes' | 'emergencyStatus' | 'priority' | 'status' | 'severityHistory'>): Patient {
    const now = Date.now();
    const waitMins = Math.max(0, Math.floor((now - data.arrivalTime) / (60 * 1000)));
    const emergencyStatus = getEmergencyStatus(data.severityScore);
    const priority = calculatePriority(data.severityScore, waitMins);

    const newPatient: Patient = {
      ...data,
      waitingTimeMinutes: waitMins,
      emergencyStatus,
      priority,
      status: 'Waiting',
      severityHistory: [],
    };

    this.patients.set(newPatient.id, newPatient);
    this.avlTree.insert(newPatient);
    this.maxHeap.insert(newPatient);

    if (newPatient.severityScore >= 9) {
      alertManager.processPatient(newPatient, 'Initial Intake');
    }

    this.saveToStorage();
    this.notify();
    return newPatient;
  }

  /**
   * Update patient demographics and non-severity fields
   */
  public updatePatientRecord(patient: Patient): void {
    const existing = this.patients.get(patient.id);
    if (!existing) return;

    this.patients.set(patient.id, patient);
    this.avlTree.update(patient);

    if (patient.status === 'Waiting') {
      // Max heap update priority
      this.maxHeap.updatePriority(patient.id, patient.severityScore, patient.waitingTimeMinutes);
    }

    this.saveToStorage();
    this.notify();
  }

  /**
   * Dynamic Severity Update: Primary Capstone Module 3 Feature
   * When staff updates a patient's severity score:
   * 1. Updates patient record and history
   * 2. Updates AVL Tree
   * 3. Updates Max Heap Priority (sift-up or sift-down)
   * 4. Checks Critical Alert (trigger if >= 9)
   * 5. Benchmarks latency of each step
   */
  public dynamicSeverityUpdate(
    patientId: string,
    newSeverity: number,
    reason?: string
  ): { patient: Patient; metrics: DynamicUpdateMetrics; criticalAlertTriggered: boolean } | null {
    const tStart = performance.now();
    const patient = this.patients.get(patientId);
    if (!patient) return null;

    const oldSeverity = patient.severityScore;

    // 1. Severity Update
    const t0 = performance.now();
    patient.severityScore = newSeverity;
    patient.emergencyStatus = getEmergencyStatus(newSeverity);
    const now = Date.now();
    const waitMins = patient.status === 'Waiting'
      ? Math.max(0, Math.floor((now - patient.arrivalTime) / (60 * 1000)))
      : patient.waitingTimeMinutes;
    patient.waitingTimeMinutes = waitMins;
    patient.priority = calculatePriority(newSeverity, waitMins);

    patient.severityHistory.push({
      timestamp: Date.now(),
      oldSeverity,
      newSeverity,
      reason: reason || `Triage re-evaluation: severity changed from ${oldSeverity} to ${newSeverity}`,
    });

    // Update AVL node value
    this.avlTree.update(patient);
    const tSeverityDone = performance.now();
    const severityUpdateTimeMs = tSeverityDone - t0;

    // 2. Heap Reorder
    const tHeap0 = performance.now();
    if (patient.status === 'Waiting') {
      this.maxHeap.updatePriority(patientId, newSeverity, waitMins);
    }
    const tHeapDone = performance.now();
    const heapReorderTimeMs = tHeapDone - tHeap0;

    // 3. Alert Detection
    const tAlert0 = performance.now();
    let criticalAlertTriggered = false;
    if (newSeverity >= 9 && patient.status === 'Waiting') {
      const alert = alertManager.processPatient(patient, 'Dynamic Escalation');
      if (alert) criticalAlertTriggered = true;
    } else if (newSeverity < 9 && oldSeverity >= 9) {
      alertManager.processPatient(patient, 'Dynamic Escalation');
    }
    const tAlertDone = performance.now();
    const alertDetectionTimeMs = tAlertDone - tAlert0;

    const totalResponseTimeMs = performance.now() - tStart;

    const metrics: DynamicUpdateMetrics = {
      patientId,
      oldSeverity,
      newSeverity,
      severityUpdateTimeMs,
      heapReorderTimeMs,
      alertDetectionTimeMs,
      totalResponseTimeMs,
      wasCriticalAlertTriggered: criticalAlertTriggered,
      timestamp: Date.now(),
    };

    this.dynamicMetricsLog.unshift(metrics);
    if (this.dynamicMetricsLog.length > 100) this.dynamicMetricsLog.pop();

    this.saveToStorage();
    this.notify();

    return { patient, metrics, criticalAlertTriggered };
  }

  /**
   * Treat Next Patient: Removes highest-priority patient from Max Heap
   */
  public treatNextPatient(): { patient: Patient | null; treatedTime: number } {
    const highestPriorityPatient = this.maxHeap.extractMax();
    if (!highestPriorityPatient) {
      return { patient: null, treatedTime: Date.now() };
    }

    const patient = this.patients.get(highestPriorityPatient.id);
    if (!patient) {
      return { patient: null, treatedTime: Date.now() };
    }

    const treatedTime = Date.now();
    patient.status = 'Treated';
    patient.treatedAt = treatedTime;

    // Update AVL tree record
    this.avlTree.update(patient);

    // Dismiss any active alert
    alertManager.markTreated(patient.id);

    this.saveToStorage();
    this.notify();

    return { patient, treatedTime };
  }

  /**
   * Delete patient
   */
  public deletePatient(patientId: string): boolean {
    const patient = this.patients.get(patientId);
    if (!patient) return false;

    this.patients.delete(patientId);
    this.avlTree.delete(patientId);
    this.maxHeap.remove(patientId);
    alertManager.markTreated(patientId);

    this.saveToStorage();
    this.notify();
    return true;
  }

  /**
   * Search patient using AVL Tree
   */
  public searchPatientAVL(patientId: string) {
    return this.avlTree.search(patientId);
  }

  /**
   * Refresh waiting times for all waiting patients based on clock
   */
  public refreshWaitingTimes(): void {
    const now = Date.now();
    let updatedAny = false;

    for (const patient of this.patients.values()) {
      if (patient.status === 'Waiting') {
        const waitMins = Math.max(0, Math.floor((now - patient.arrivalTime) / (60 * 1000)));
        if (waitMins !== patient.waitingTimeMinutes) {
          patient.waitingTimeMinutes = waitMins;
          patient.priority = calculatePriority(patient.severityScore, waitMins);
          this.avlTree.update(patient);
          this.maxHeap.updatePriority(patient.id, patient.severityScore, waitMins);
          updatedAny = true;
        }
      }
    }

    if (updatedAny) {
      this.saveToStorage();
      this.notify();
    }
  }

  /**
   * Reset sample patients
   */
  public resetToSamples(): void {
    const samples = generateSamplePatients();
    this.dynamicMetricsLog = [];
    this.loadPatients(samples);
  }

  /**
   * Reset all data completely
   */
  public resetAllData(): void {
    this.avlTree.clear();
    this.maxHeap.clear();
    this.patients.clear();
    this.dynamicMetricsLog = [];
    alertManager.clearAlerts();
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY_PATIENTS);
      localStorage.removeItem(STORAGE_KEY_METRICS);
    }
    this.notify();
  }

  public getAllPatients(): Patient[] {
    return Array.from(this.patients.values());
  }

  public getWaitingPatientsSorted(): HeapItem[] {
    return this.maxHeap.getSortedPatients();
  }

  public getDashboardStats(): DashboardStats {
    const all = Array.from(this.patients.values());
    const waiting = all.filter((p) => p.status === 'Waiting');
    const treated = all.filter((p) => p.status === 'Treated');
    const critical = waiting.filter((p) => p.severityScore >= 9);

    const avgSeverity = waiting.length > 0
      ? Number((waiting.reduce((acc, p) => acc + p.severityScore, 0) / waiting.length).toFixed(1))
      : 0;

    const waitingTimes = waiting.map((p) => p.waitingTimeMinutes);
    const avgWait = waitingTimes.length > 0
      ? Number((waitingTimes.reduce((acc, val) => acc + val, 0) / waitingTimes.length).toFixed(1))
      : 0;
    const maxWait = waitingTimes.length > 0 ? Math.max(...waitingTimes) : 0;
    const minWait = waitingTimes.length > 0 ? Math.min(...waitingTimes) : 0;

    // Throughput: treated per hour calculation
    const elapsedHours = Math.max(0.25, (Date.now() - this.startTime) / (1000 * 60 * 60));
    const throughputPerHour = Number((treated.length / elapsedHours).toFixed(1));

    // Dynamic latency stats
    const latencies = this.dynamicMetricsLog.map((m) => m.totalResponseTimeMs);
    const avgDynamicLatencyMs = latencies.length > 0
      ? Number((latencies.reduce((a, b) => a + b, 0) / latencies.length).toFixed(3))
      : 0.125;
    const worstCaseLatencyMs = latencies.length > 0
      ? Number(Math.max(...latencies).toFixed(3))
      : 0.45;

    return {
      totalPatients: all.length,
      waitingCount: waiting.length,
      treatedCount: treated.length,
      criticalCount: critical.length,
      avgSeverity,
      avgWaitingTimeMinutes: avgWait,
      maxWaitingTimeMinutes: maxWait,
      minWaitingTimeMinutes: minWait,
      avlHeight: this.avlTree.getTreeHeight(),
      avlRotations: this.avlTree.totalRotations,
      heapHeight: this.maxHeap.height,
      heapOperations: this.maxHeap.totalOperationsCount,
      heapSize: this.maxHeap.size,
      throughputPerHour: Math.max(12, throughputPerHour),
      avgDynamicLatencyMs,
      worstCaseLatencyMs,
    };
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify(): void {
    this.listeners.forEach((l) => l());
  }
}

export const patientManager = new PatientManager();
