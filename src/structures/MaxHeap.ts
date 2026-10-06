import { Patient, calculatePriority } from '../types/patient';

export interface HeapItem {
  patient: Patient;
  priority: number;
  severity: number;
  waitingTimeMinutes: number;
}

export interface HeapOperationLog {
  operation: 'insert' | 'extractMax' | 'updatePriority' | 'heapify' | 'delete';
  patientId: string;
  details: string;
  comparisons: number;
  swaps: number;
  timeMs: number;
  timestamp: number;
}

export interface HeapVisualNode {
  index: number;
  patientId: string;
  patientName: string;
  priority: number;
  severity: number;
  waitingTimeMinutes: number;
  level: number;
  leftChildIndex: number | null;
  rightChildIndex: number | null;
  parentIndex: number | null;
}

export class MaxHeap {
  private heap: HeapItem[] = [];
  private patientIndexMap: Map<string, number> = new Map(); // patientId -> index in heap
  public totalOperationsCount: number = 0;
  public totalSwapsCount: number = 0;
  public totalComparisonsCount: number = 0;
  public operationLogs: HeapOperationLog[] = [];

  constructor() {
    this.heap = [];
    this.patientIndexMap = new Map();
  }

  get size(): number {
    return this.heap.length;
  }

  get height(): number {
    if (this.heap.length === 0) return 0;
    return Math.floor(Math.log2(this.heap.length)) + 1;
  }

  get maxPriority(): number {
    return this.heap.length > 0 ? this.heap[0].priority : 0;
  }

  private parent(index: number): number {
    return Math.floor((index - 1) / 2);
  }

  private leftChild(index: number): number {
    return 2 * index + 1;
  }

  private rightChild(index: number): number {
    return 2 * index + 2;
  }

  private swap(i: number, j: number): void {
    const temp = this.heap[i];
    this.heap[i] = this.heap[j];
    this.heap[j] = temp;

    // Update index mapping
    this.patientIndexMap.set(this.heap[i].patient.id, i);
    this.patientIndexMap.set(this.heap[j].patient.id, j);
    this.totalSwapsCount++;
  }

  /**
   * Compare two items. Returns true if item at `i` has higher priority than `j`.
   * Tie-breaker: higher severity, then earlier arrival time, then ID.
   */
  private hasHigherPriority(i: number, j: number): boolean {
    this.totalComparisonsCount++;
    const a = this.heap[i];
    const b = this.heap[j];

    if (a.priority !== b.priority) {
      return a.priority > b.priority;
    }
    // Tie break 1: higher severity
    if (a.severity !== b.severity) {
      return a.severity > b.severity;
    }
    // Tie break 2: earlier arrival time (first come first served for identical priority)
    if (a.patient.arrivalTime !== b.patient.arrivalTime) {
      return a.patient.arrivalTime < b.patient.arrivalTime;
    }
    return a.patient.id < b.patient.id;
  }

  private heapifyUp(index: number): { comparisons: number; swaps: number } {
    let curr = index;
    let comparisons = 0;
    let swaps = 0;

    while (curr > 0) {
      const p = this.parent(curr);
      comparisons++;
      if (this.hasHigherPriority(curr, p)) {
        this.swap(curr, p);
        swaps++;
        curr = p;
      } else {
        break;
      }
    }
    return { comparisons, swaps };
  }

  private heapifyDown(index: number): { comparisons: number; swaps: number } {
    let curr = index;
    const len = this.heap.length;
    let comparisons = 0;
    let swaps = 0;

    while (this.leftChild(curr) < len) {
      let largest = curr;
      const left = this.leftChild(curr);
      const right = this.rightChild(curr);

      comparisons++;
      if (left < len && this.hasHigherPriority(left, largest)) {
        largest = left;
      }

      if (right < len) {
        comparisons++;
        if (this.hasHigherPriority(right, largest)) {
          largest = right;
        }
      }

      if (largest !== curr) {
        this.swap(curr, largest);
        swaps++;
        curr = largest;
      } else {
        break;
      }
    }
    return { comparisons, swaps };
  }

  /**
   * Insert a patient into the priority queue
   */
  insert(patient: Patient): void {
    const t0 = performance.now();
    this.totalOperationsCount++;

    const priority = calculatePriority(patient.severityScore, patient.waitingTimeMinutes);
    const item: HeapItem = {
      patient,
      priority,
      severity: patient.severityScore,
      waitingTimeMinutes: patient.waitingTimeMinutes,
    };

    const newIndex = this.heap.length;
    this.heap.push(item);
    this.patientIndexMap.set(patient.id, newIndex);

    const { comparisons, swaps } = this.heapifyUp(newIndex);
    const timeMs = performance.now() - t0;

    this.logOperation({
      operation: 'insert',
      patientId: patient.id,
      details: `Inserted patient ${patient.id} with priority ${priority}`,
      comparisons,
      swaps,
      timeMs,
      timestamp: Date.now(),
    });
  }

  /**
   * Inspect the highest-priority patient without removing
   */
  peek(): Patient | null {
    if (this.heap.length === 0) return null;
    return this.heap[0].patient;
  }

  /**
   * Peek the full heap item
   */
  peekItem(): HeapItem | null {
    if (this.heap.length === 0) return null;
    return this.heap[0];
  }

  /**
   * Extract the highest-priority patient from the queue
   */
  extractMax(): Patient | null {
    if (this.heap.length === 0) return null;

    const t0 = performance.now();
    this.totalOperationsCount++;

    const rootItem = this.heap[0];
    const patient = rootItem.patient;
    this.patientIndexMap.delete(patient.id);

    const last = this.heap.pop()!;

    let comparisons = 0;
    let swaps = 0;

    if (this.heap.length > 0) {
      this.heap[0] = last;
      this.patientIndexMap.set(last.patient.id, 0);
      const metrics = this.heapifyDown(0);
      comparisons = metrics.comparisons;
      swaps = metrics.swaps;
    }

    const timeMs = performance.now() - t0;
    this.logOperation({
      operation: 'extractMax',
      patientId: patient.id,
      details: `Extracted highest-priority patient ${patient.id} (priority: ${rootItem.priority})`,
      comparisons,
      swaps,
      timeMs,
      timestamp: Date.now(),
    });

    return patient;
  }

  /**
   * Dynamic Severity / Priority Update: O(log N)
   * Updates patient priority and restores the heap property via heapifyUp or heapifyDown.
   */
  updatePriority(
    patientId: string,
    newSeverity: number,
    waitingTimeMinutes: number
  ): { success: boolean; timeMs: number; oldPriority: number; newPriority: number; swaps: number; comparisons: number } {
    const t0 = performance.now();
    this.totalOperationsCount++;

    const index = this.patientIndexMap.get(patientId);
    if (index === undefined || index < 0 || index >= this.heap.length) {
      return {
        success: false,
        timeMs: performance.now() - t0,
        oldPriority: 0,
        newPriority: 0,
        swaps: 0,
        comparisons: 0,
      };
    }

    const item = this.heap[index];
    const oldPriority = item.priority;
    const newPriority = calculatePriority(newSeverity, waitingTimeMinutes);

    item.severity = newSeverity;
    item.waitingTimeMinutes = waitingTimeMinutes;
    item.priority = newPriority;
    item.patient.severityScore = newSeverity;
    item.patient.waitingTimeMinutes = waitingTimeMinutes;
    item.patient.priority = newPriority;

    let comparisons = 0;
    let swaps = 0;

    if (newPriority > oldPriority) {
      // Increase-key: sift up
      const metrics = this.heapifyUp(index);
      comparisons = metrics.comparisons;
      swaps = metrics.swaps;
    } else if (newPriority < oldPriority) {
      // Decrease-key: sift down
      const metrics = this.heapifyDown(index);
      comparisons = metrics.comparisons;
      swaps = metrics.swaps;
    }

    const timeMs = performance.now() - t0;
    this.logOperation({
      operation: 'updatePriority',
      patientId,
      details: `Updated priority for ${patientId}: ${oldPriority} -> ${newPriority} (severity: ${newSeverity})`,
      comparisons,
      swaps,
      timeMs,
      timestamp: Date.now(),
    });

    return {
      success: true,
      timeMs,
      oldPriority,
      newPriority,
      swaps,
      comparisons,
    };
  }

  /**
   * Remove a specific patient from the heap
   */
  remove(patientId: string): boolean {
    const index = this.patientIndexMap.get(patientId);
    if (index === undefined) return false;

    this.totalOperationsCount++;
    const t0 = performance.now();

    const last = this.heap.pop()!;
    this.patientIndexMap.delete(patientId);

    let comparisons = 0;
    let swaps = 0;

    if (index < this.heap.length) {
      this.heap[index] = last;
      this.patientIndexMap.set(last.patient.id, index);

      // Restore heap property
      const up = this.heapifyUp(index);
      const down = this.heapifyDown(index);
      comparisons = up.comparisons + down.comparisons;
      swaps = up.swaps + down.swaps;
    }

    const timeMs = performance.now() - t0;
    this.logOperation({
      operation: 'delete',
      patientId,
      details: `Removed patient ${patientId} from heap`,
      comparisons,
      swaps,
      timeMs,
      timestamp: Date.now(),
    });

    return true;
  }

  /**
   * Get sorted copy of waiting patients (highest priority first) without mutating heap
   */
  getSortedPatients(): HeapItem[] {
    return [...this.heap].sort((a, b) => {
      if (b.priority !== a.priority) return b.priority - a.priority;
      if (b.severity !== a.severity) return b.severity - a.severity;
      return a.patient.arrivalTime - b.patient.arrivalTime;
    });
  }

  /**
   * Raw heap array
   */
  getRawHeap(): HeapItem[] {
    return [...this.heap];
  }

  /**
   * Convert array heap to visual tree nodes
   */
  toVisualNodes(): HeapVisualNode[] {
    return this.heap.map((item, idx) => {
      const left = this.leftChild(idx);
      const right = this.rightChild(idx);
      return {
        index: idx,
        patientId: item.patient.id,
        patientName: item.patient.name,
        priority: item.priority,
        severity: item.severity,
        waitingTimeMinutes: item.waitingTimeMinutes,
        level: Math.floor(Math.log2(idx + 1)),
        leftChildIndex: left < this.heap.length ? left : null,
        rightChildIndex: right < this.heap.length ? right : null,
        parentIndex: idx > 0 ? this.parent(idx) : null,
      };
    });
  }

  private logOperation(log: HeapOperationLog): void {
    this.operationLogs.unshift(log);
    if (this.operationLogs.length > 50) this.operationLogs.pop();
  }

  clear(): void {
    this.heap = [];
    this.patientIndexMap.clear();
    this.totalOperationsCount = 0;
    this.totalSwapsCount = 0;
    this.totalComparisonsCount = 0;
    this.operationLogs = [];
  }
}
