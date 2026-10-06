import { AVLTree } from '../structures/AVLTree';
import { MaxHeap } from '../structures/MaxHeap';
import { Patient, getEmergencyStatus, calculatePriority } from '../types/patient';

export interface BenchmarkRow {
  datasetSize: number;
  avlHeight: number;
  avlRotations: number;
  avlInsertTimeMs: number;
  avlSearchTimeUs: number;
  linearSearchTimeUs: number;
  searchSpeedup: number;
  heapInsertTimeMs: number;
  heapUpdateTimeUs: number;
  heapExtractTimeUs: number;
  timestamp: number;
}

export interface BenchmarkProgress {
  currentN: number;
  step: string;
  percent: number;
}

const STORAGE_KEY_BENCHMARK = 'er_triage_benchmark_results_v1';

export class BenchmarkManager {
  private results: BenchmarkRow[] = [];
  private isRunning: boolean = false;

  constructor() {
    this.loadResults();
  }

  private loadResults(): void {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY_BENCHMARK);
      if (stored) {
        this.results = JSON.parse(stored);
      }
    } catch {
      this.results = [];
    }
  }

  public getResults(): BenchmarkRow[] {
    return [...this.results].sort((a, b) => a.datasetSize - b.datasetSize);
  }

  public clearResults(): void {
    this.results = [];
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY_BENCHMARK);
  }

  public getIsRunning(): boolean {
    return this.isRunning;
  }

  /**
   * Helper to generate N realistic synthetic patients
   */
  private generateSyntheticPatients(n: number): Patient[] {
    const list: Patient[] = new Array(n);
    const now = Date.now();
    const depts = ['Cardiology', 'Trauma Bay', 'General ER', 'Neurology', 'Pediatric ER', 'Orthopedics'];
    const docs = ['Dr. Vance', 'Dr. Lin', 'Dr. Stone', 'Dr. Thorne', 'Dr. Monroe', 'Dr. Miller'];

    for (let i = 0; i < n; i++) {
      const id = `P${(i + 1).toString().padStart(6, '0')}`;
      const severity = ((i % 10) + 1); // 1 to 10
      const waitMins = (i % 120);
      const arrival = now - waitMins * 60 * 1000;
      const priority = calculatePriority(severity, waitMins);

      list[i] = {
        id,
        name: `Patient #${i + 1}`,
        age: 18 + (i % 70),
        gender: (i % 2 === 0 ? 'Male' : 'Female'),
        contact: `+1-555-${(1000 + (i % 9000))}`,
        symptoms: `Triage evaluation category ${severity}`,
        severityScore: severity,
        arrivalTime: arrival,
        waitingTimeMinutes: waitMins,
        emergencyStatus: getEmergencyStatus(severity),
        priority,
        assignedDoctor: docs[i % docs.length],
        department: depts[i % depts.length],
        status: 'Waiting',
        severityHistory: [],
      };
    }

    return list;
  }

  /**
   * Run benchmark for an array of dataset sizes
   */
  public async runBenchmark(
    sizes: number[],
    onProgress?: (progress: BenchmarkProgress) => void
  ): Promise<BenchmarkRow[]> {
    if (this.isRunning) {
      throw new Error('A benchmark run is already in progress.');
    }

    this.isRunning = true;
    const newResults: BenchmarkRow[] = [];
    const totalSteps = sizes.length * 5;
    let completedSteps = 0;

    const yieldToEventLoop = () => new Promise<void>((resolve) => setTimeout(resolve, 15));

    try {
      for (const N of sizes) {
        // Step 1: Data Generation
        onProgress?.({
          currentN: N,
          step: `Generating ${N.toLocaleString()} patient records...`,
          percent: Math.round((completedSteps / totalSteps) * 100),
        });
        await yieldToEventLoop();

        const patients = this.generateSyntheticPatients(N);
        completedSteps++;

        // Step 2: AVL Tree Insertion
        onProgress?.({
          currentN: N,
          step: `Executing AVL Tree insertions for N=${N.toLocaleString()}...`,
          percent: Math.round((completedSteps / totalSteps) * 100),
        });
        await yieldToEventLoop();

        const avl = new AVLTree();
        const tAvlInsert0 = performance.now();
        for (let i = 0; i < N; i++) {
          avl.insert(patients[i]);
          // For very large N (e.g. 100,000), periodically yield so the UI doesn't freeze
          if (N >= 50000 && i > 0 && i % 25000 === 0) {
            await yieldToEventLoop();
          }
        }
        const avlInsertTimeMs = Number((performance.now() - tAvlInsert0).toFixed(2));
        const avlHeight = avl.getTreeHeight();
        const avlRotations = avl.totalRotations;
        completedSteps++;

        // Step 3: Search Benchmark (AVL vs Linear Search)
        onProgress?.({
          currentN: N,
          step: `Measuring AVL vs Linear Search for N=${N.toLocaleString()}...`,
          percent: Math.round((completedSteps / totalSteps) * 100),
        });
        await yieldToEventLoop();

        // Sample search queries (sample up to 200 keys evenly across the dataset)
        const sampleSize = Math.min(200, N);
        const searchSampleKeys: string[] = [];
        const stepSize = Math.max(1, Math.floor(N / sampleSize));
        for (let i = 0; i < N && searchSampleKeys.length < sampleSize; i += stepSize) {
          searchSampleKeys.push(patients[i].id);
        }

        // JIT warm-up
        for (let i = 0; i < Math.min(30, searchSampleKeys.length); i++) {
          avl.get(searchSampleKeys[i]);
        }

        // Measure pure AVL Search (lookup using get without tracking overhead)
        const avlReps = N <= 1000 ? 10 : 3;
        const tAvlSearch0 = performance.now();
        let checksumAvl = 0;
        for (let r = 0; r < avlReps; r++) {
          for (let i = 0; i < searchSampleKeys.length; i++) {
            const found = avl.get(searchSampleKeys[i]);
            if (found) checksumAvl += found.severityScore;
          }
        }
        const avlSearchTotalMs = performance.now() - tAvlSearch0;
        const totalAvlSearches = avlReps * searchSampleKeys.length;
        const avlSearchTimeUs = Number(
          Math.max(0.02, (avlSearchTotalMs / totalAvlSearches) * 1000).toFixed(3)
        );

        // Measure Linear Search (Array traversal)
        // For large datasets, sample enough queries to achieve high precision
        const linearSampleSize = N >= 50000 ? Math.min(25, searchSampleKeys.length) : Math.min(80, searchSampleKeys.length);
        const tLinear0 = performance.now();
        let checksumLinear = 0;
        for (let i = 0; i < linearSampleSize; i++) {
          const targetKey = searchSampleKeys[i];
          for (let j = 0; j < N; j++) {
            if (patients[j].id === targetKey) {
              checksumLinear += patients[j].severityScore;
              break;
            }
          }
        }
        const linearSearchTotalMs = performance.now() - tLinear0;
        const linearSearchTimeUs = Number(
          Math.max(0.04, (linearSearchTotalMs / linearSampleSize) * 1000).toFixed(3)
        );

        // Compute speedup: Linear Search Time / AVL Search Time
        const rawSpeedup = linearSearchTimeUs / Math.max(0.001, avlSearchTimeUs);
        const searchSpeedup = Number(Math.max(1.0, rawSpeedup).toFixed(1));
        completedSteps++;

        // Step 4: Max Heap Insertion
        onProgress?.({
          currentN: N,
          step: `Building Max-Heap Priority Queue for N=${N.toLocaleString()}...`,
          percent: Math.round((completedSteps / totalSteps) * 100),
        });
        await yieldToEventLoop();

        const heap = new MaxHeap();
        const tHeapInsert0 = performance.now();
        for (let i = 0; i < N; i++) {
          heap.insert(patients[i]);
          if (N >= 50000 && i > 0 && i % 25000 === 0) {
            await yieldToEventLoop();
          }
        }
        const heapInsertTimeMs = Number((performance.now() - tHeapInsert0).toFixed(2));
        completedSteps++;

        // Step 5: Heap Dynamic Update & Extract Max
        onProgress?.({
          currentN: N,
          step: `Testing Heap Key Updates and Extract-Max for N=${N.toLocaleString()}...`,
          percent: Math.round((completedSteps / totalSteps) * 100),
        });
        await yieldToEventLoop();

        // Sample Heap Updates (e.g. 50 items)
        const heapSampleCount = Math.min(50, Math.floor(N / 2));
        const tHeapUpdate0 = performance.now();
        for (let i = 0; i < heapSampleCount; i++) {
          const p = patients[i * 2];
          heap.updatePriority(p.id, 10, p.waitingTimeMinutes + 10);
        }
        const heapUpdateTotalMs = performance.now() - tHeapUpdate0;
        const heapUpdateTimeUs = Number(
          ((heapUpdateTotalMs / heapSampleCount) * 1000).toFixed(3)
        );

        // Sample Heap Extracts (e.g. 50 items)
        const tHeapExtract0 = performance.now();
        for (let i = 0; i < heapSampleCount; i++) {
          heap.extractMax();
        }
        const heapExtractTotalMs = performance.now() - tHeapExtract0;
        const heapExtractTimeUs = Number(
          ((heapExtractTotalMs / heapSampleCount) * 1000).toFixed(3)
        );
        completedSteps++;

        const row: BenchmarkRow = {
          datasetSize: N,
          avlHeight,
          avlRotations,
          avlInsertTimeMs,
          avlSearchTimeUs,
          linearSearchTimeUs,
          searchSpeedup,
          heapInsertTimeMs,
          heapUpdateTimeUs,
          heapExtractTimeUs,
          timestamp: Date.now(),
        };

        newResults.push(row);
      }

      // Merge new results with existing, keeping most recent per dataset size
      const mergedMap = new Map<number, BenchmarkRow>();
      for (const r of this.results) {
        mergedMap.set(r.datasetSize, r);
      }
      for (const r of newResults) {
        mergedMap.set(r.datasetSize, r);
      }

      this.results = Array.from(mergedMap.values()).sort((a, b) => a.datasetSize - b.datasetSize);

      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY_BENCHMARK, JSON.stringify(this.results));
      }

      onProgress?.({
        currentN: sizes[sizes.length - 1],
        step: 'Benchmark completed successfully.',
        percent: 100,
      });

      return this.results;
    } finally {
      this.isRunning = false;
    }
  }
}

export const benchmarkManager = new BenchmarkManager();
