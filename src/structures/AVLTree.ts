import { Patient } from '../types/patient';

export type RotationType = 'Left Rotation (RR)' | 'Right Rotation (LL)' | 'Left-Right Rotation (LR)' | 'Right-Left Rotation (RL)';

export interface RotationEvent {
  type: RotationType;
  nodeKey: string;
  timestamp: number;
  description: string;
}

export class AVLNode {
  key: string;
  value: Patient;
  height: number;
  left: AVLNode | null;
  right: AVLNode | null;

  constructor(key: string, value: Patient) {
    this.key = key;
    this.value = value;
    this.height = 1;
    this.left = null;
    this.right = null;
  }

  get balanceFactor(): number {
    const leftHeight = this.left ? this.left.height : 0;
    const rightHeight = this.right ? this.right.height : 0;
    return leftHeight - rightHeight;
  }
}

export interface SearchResult {
  found: boolean;
  patient: Patient | null;
  comparisons: number;
  path: string[];
  executionTimeMs: number;
}

export interface TreeVisualNode {
  key: string;
  severity: number;
  patient: Patient;
  height: number;
  balanceFactor: number;
  left?: TreeVisualNode | null;
  right?: TreeVisualNode | null;
  x?: number;
  y?: number;
}

/**
 * Fast natural key comparison for patient IDs (e.g. "P101", "P99", "P000001")
 */
export function compareKeys(a: string, b: string): number {
  if (a === b) return 0;
  // Fast path for standard "P" prefixed patient IDs
  if (a.charCodeAt(0) === 80 && b.charCodeAt(0) === 80) {
    const aNum = parseInt(a.slice(1), 10);
    const bNum = parseInt(b.slice(1), 10);
    if (!Number.isNaN(aNum) && !Number.isNaN(bNum)) {
      return aNum - bNum;
    }
  }
  return a < b ? -1 : 1;
}

export class AVLTree {
  root: AVLNode | null = null;
  nodeCount: number = 0;
  totalRotations: number = 0;
  rotationHistory: RotationEvent[] = [];

  constructor() {
    this.root = null;
    this.nodeCount = 0;
    this.totalRotations = 0;
    this.rotationHistory = [];
  }

  private getHeight(node: AVLNode | null): number {
    return node ? node.height : 0;
  }

  private updateHeight(node: AVLNode): void {
    node.height = 1 + Math.max(this.getHeight(node.left), this.getHeight(node.right));
  }

  private getBalance(node: AVLNode | null): number {
    return node ? this.getHeight(node.left) - this.getHeight(node.right) : 0;
  }

  // Right rotation (LL Case)
  private rotateRight(y: AVLNode): AVLNode {
    const x = y.left!;
    const T2 = x.right;

    x.right = y;
    y.left = T2;

    this.updateHeight(y);
    this.updateHeight(x);

    this.totalRotations++;
    const event: RotationEvent = {
      type: 'Right Rotation (LL)',
      nodeKey: y.key,
      timestamp: Date.now(),
      description: `Right Rotation (LL) performed at node ${y.key}`,
    };
    this.rotationHistory.unshift(event);
    if (this.rotationHistory.length > 50) this.rotationHistory.pop();

    return x;
  }

  // Left rotation (RR Case)
  private rotateLeft(x: AVLNode): AVLNode {
    const y = x.right!;
    const T2 = y.left;

    y.left = x;
    x.right = T2;

    this.updateHeight(x);
    this.updateHeight(y);

    this.totalRotations++;
    const event: RotationEvent = {
      type: 'Left Rotation (RR)',
      nodeKey: x.key,
      timestamp: Date.now(),
      description: `Left Rotation (RR) performed at node ${x.key}`,
    };
    this.rotationHistory.unshift(event);
    if (this.rotationHistory.length > 50) this.rotationHistory.pop();

    return y;
  }

  /**
   * Insert a patient into the AVL Tree
   */
  insert(patient: Patient): boolean {
    let inserted = false;

    const insertNode = (node: AVLNode | null, key: string, value: Patient): AVLNode => {
      if (node === null) {
        inserted = true;
        this.nodeCount++;
        return new AVLNode(key, value);
      }

      const cmp = compareKeys(key, node.key);
      if (cmp < 0) {
        node.left = insertNode(node.left, key, value);
      } else if (cmp > 0) {
        node.right = insertNode(node.right, key, value);
      } else {
        // Key already exists: update existing patient record
        node.value = value;
        return node;
      }

      this.updateHeight(node);
      const balance = this.getBalance(node);

      // Left-Left Case
      if (balance > 1 && compareKeys(key, node.left!.key) < 0) {
        return this.rotateRight(node);
      }

      // Right-Right Case
      if (balance < -1 && compareKeys(key, node.right!.key) > 0) {
        return this.rotateLeft(node);
      }

      // Left-Right Case
      if (balance > 1 && compareKeys(key, node.left!.key) > 0) {
        const doubleEvent: RotationEvent = {
          type: 'Left-Right Rotation (LR)',
          nodeKey: node.key,
          timestamp: Date.now(),
          description: `Left-Right Rotation (LR) performed at node ${node.key}`,
        };
        this.rotationHistory.unshift(doubleEvent);
        if (this.rotationHistory.length > 50) this.rotationHistory.pop();

        node.left = this.rotateLeft(node.left!);
        return this.rotateRight(node);
      }

      // Right-Left Case
      if (balance < -1 && compareKeys(key, node.right!.key) < 0) {
        const doubleEvent: RotationEvent = {
          type: 'Right-Left Rotation (RL)',
          nodeKey: node.key,
          timestamp: Date.now(),
          description: `Right-Left Rotation (RL) performed at node ${node.key}`,
        };
        this.rotationHistory.unshift(doubleEvent);
        if (this.rotationHistory.length > 50) this.rotationHistory.pop();

        node.right = this.rotateRight(node.right!);
        return this.rotateLeft(node);
      }

      return node;
    };

    this.root = insertNode(this.root, patient.id, patient);
    return inserted;
  }

  /**
   * Search patient with detailed metrics: comparisons, path, execution time
   */
  search(key: string): SearchResult {
    const t0 = performance.now();
    let current = this.root;
    let comparisons = 0;
    const path: string[] = [];
    let found = false;
    let patient: Patient | null = null;

    while (current !== null) {
      comparisons++;
      path.push(current.key);
      const cmp = compareKeys(key, current.key);
      if (cmp === 0) {
        found = true;
        patient = current.value;
        break;
      } else if (cmp < 0) {
        current = current.left;
      } else {
        current = current.right;
      }
    }

    const t1 = performance.now();
    return {
      found,
      patient,
      comparisons,
      path,
      executionTimeMs: t1 - t0,
    };
  }

  /**
   * Fast get without tracking
   */
  get(key: string): Patient | null {
    let current = this.root;
    while (current !== null) {
      const cmp = compareKeys(key, current.key);
      if (cmp === 0) return current.value;
      if (cmp < 0) current = current.left;
      else current = current.right;
    }
    return null;
  }

  /**
   * Update existing patient in the tree
   */
  update(patient: Patient): boolean {
    let current = this.root;
    while (current !== null) {
      const cmp = compareKeys(patient.id, current.key);
      if (cmp === 0) {
        current.value = patient;
        return true;
      }
      if (cmp < 0) current = current.left;
      else current = current.right;
    }
    return false;
  }

  private minValueNode(node: AVLNode): AVLNode {
    let current = node;
    while (current.left !== null) {
      current = current.left;
    }
    return current;
  }

  /**
   * Delete patient record by key
   */
  delete(key: string): boolean {
    let deleted = false;

    const deleteNode = (node: AVLNode | null, keyToDelete: string): AVLNode | null => {
      if (node === null) return null;

      const cmp = compareKeys(keyToDelete, node.key);
      if (cmp < 0) {
        node.left = deleteNode(node.left, keyToDelete);
      } else if (cmp > 0) {
        node.right = deleteNode(node.right, keyToDelete);
      } else {
        // Node found
        deleted = true;
        this.nodeCount--;

        // Node with only one child or no child
        if (node.left === null || node.right === null) {
          const temp = node.left ? node.left : node.right;
          if (temp === null) {
            return null;
          } else {
            return temp;
          }
        } else {
          // Node with two children: get inorder successor (smallest in the right subtree)
          const temp = this.minValueNode(node.right);
          node.key = temp.key;
          node.value = temp.value;
          node.right = deleteNode(node.right, temp.key);
        }
      }

      this.updateHeight(node);
      const balance = this.getBalance(node);

      // Left-Left Case
      if (balance > 1 && this.getBalance(node.left) >= 0) {
        return this.rotateRight(node);
      }

      // Left-Right Case
      if (balance > 1 && this.getBalance(node.left) < 0) {
        node.left = this.rotateLeft(node.left!);
        return this.rotateRight(node);
      }

      // Right-Right Case
      if (balance < -1 && this.getBalance(node.right) <= 0) {
        return this.rotateLeft(node);
      }

      // Right-Left Case
      if (balance < -1 && this.getBalance(node.right) > 0) {
        node.right = this.rotateRight(node.right!);
        return this.rotateLeft(node);
      }

      return node;
    };

    this.root = deleteNode(this.root, key);
    return deleted;
  }

  /**
   * Traversals
   */
  inOrderTraversal(): Patient[] {
    const result: Patient[] = [];
    const traverse = (node: AVLNode | null) => {
      if (!node) return;
      traverse(node.left);
      result.push(node.value);
      traverse(node.right);
    };
    traverse(this.root);
    return result;
  }

  preOrderTraversal(): Patient[] {
    const result: Patient[] = [];
    const traverse = (node: AVLNode | null) => {
      if (!node) return;
      result.push(node.value);
      traverse(node.left);
      traverse(node.right);
    };
    traverse(this.root);
    return result;
  }

  postOrderTraversal(): Patient[] {
    const result: Patient[] = [];
    const traverse = (node: AVLNode | null) => {
      if (!node) return;
      traverse(node.left);
      traverse(node.right);
      result.push(node.value);
    };
    traverse(this.root);
    return result;
  }

  getTreeHeight(): number {
    return this.getHeight(this.root);
  }

  isBalanced(): boolean {
    const checkBalance = (node: AVLNode | null): boolean => {
      if (!node) return true;
      const bf = Math.abs(this.getBalance(node));
      if (bf > 1) return false;
      return checkBalance(node.left) && checkBalance(node.right);
    };
    return checkBalance(this.root);
  }

  /**
   * Convert tree to visual representation
   */
  toVisualTree(): TreeVisualNode | null {
    const convert = (node: AVLNode | null): TreeVisualNode | null => {
      if (!node) return null;
      return {
        key: node.key,
        severity: node.value.severityScore,
        patient: node.value,
        height: node.height,
        balanceFactor: node.balanceFactor,
        left: convert(node.left),
        right: convert(node.right),
      };
    };
    return convert(this.root);
  }

  clear(): void {
    this.root = null;
    this.nodeCount = 0;
    this.totalRotations = 0;
    this.rotationHistory = [];
  }
}
