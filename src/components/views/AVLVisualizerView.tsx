import { FC, useState, useMemo } from 'react';
import { AVLTree, TreeVisualNode } from '../../structures/AVLTree';
import { patientManager } from '../../services/PatientManager';
import { Patient } from '../../types/patient';
import {
  Network,
  Search,
  PlusCircle,
  Trash2,
  RotateCw,
  Info,
  CheckCircle2,
  AlertTriangle,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';

interface Props {
  avlTree: AVLTree;
  onSelectPatient: (patient: Patient) => void;
  onOpenAddModal: () => void;
  onResetSamples: () => void;
}

interface PositionedNode {
  node: TreeVisualNode;
  x: number;
  y: number;
  parentX?: number;
  parentY?: number;
}

export const AVLVisualizerView: FC<Props> = ({
  avlTree,
  onSelectPatient,
  onOpenAddModal,
  onResetSamples,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedPath, setHighlightedPath] = useState<string[]>([]);
  const [searchStatus, setSearchStatus] = useState<string | null>(null);
  const [deleteKey, setDeleteKey] = useState('');
  const [scale, setScale] = useState(1);

  // Generate visual tree hierarchy and compute layout coordinates
  const visualRoot = useMemo(() => avlTree.toVisualTree(), [avlTree, avlTree.nodeCount, avlTree.totalRotations]);

  // Compute 2D coordinates for visual nodes
  const { positionedNodes, minX, maxX, maxY } = useMemo(() => {
    const list: PositionedNode[] = [];
    if (!visualRoot) return { positionedNodes: list, minX: 0, maxX: 1000, maxY: 500 };

    // In-order traversal to calculate X spacing cleanly without overlaps
    let currentXIndex = 0;
    const xPositions = new Map<string, number>();

    const assignX = (node: TreeVisualNode | null | undefined) => {
      if (!node) return;
      assignX(node.left);
      xPositions.set(node.key, currentXIndex++);
      assignX(node.right);
    };

    assignX(visualRoot);

    const xSpacing = 110;
    const ySpacing = 95;
    const paddingX = 80;
    const paddingY = 60;

    let minXVal = Infinity;
    let maxXVal = -Infinity;
    let maxYVal = 0;

    const assignPositions = (
      node: TreeVisualNode | null | undefined,
      depth: number,
      parentX?: number,
      parentY?: number
    ) => {
      if (!node) return;

      const xIndex = xPositions.get(node.key) || 0;
      const x = paddingX + xIndex * xSpacing;
      const y = paddingY + depth * ySpacing;

      minXVal = Math.min(minXVal, x);
      maxXVal = Math.max(maxXVal, x);
      maxYVal = Math.max(maxYVal, y);

      list.push({ node, x, y, parentX, parentY });

      assignPositions(node.left, depth + 1, x, y);
      assignPositions(node.right, depth + 1, x, y);
    };

    assignPositions(visualRoot, 0);

    return {
      positionedNodes: list,
      minX: Math.max(0, minXVal - 60),
      maxX: Math.max(900, maxXVal + 100),
      maxY: Math.max(450, maxYVal + 120),
    };
  }, [visualRoot]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const res = avlTree.search(searchQuery.trim().toUpperCase());
    setHighlightedPath(res.path);
    if (res.found) {
      setSearchStatus(`Found patient "${res.patient?.id}" in ${res.comparisons} comparisons (${res.executionTimeMs.toFixed(3)} ms).`);
    } else {
      setSearchStatus(`Patient "${searchQuery.trim().toUpperCase()}" not found after traversing ${res.path.length} nodes.`);
    }
  };

  const handleDelete = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deleteKey.trim()) return;

    const key = deleteKey.trim().toUpperCase();
    const success = patientManager.deletePatient(key);
    if (success) {
      setSearchStatus(`Deleted patient ${key}. AVL tree rebalanced.`);
      setDeleteKey('');
      setHighlightedPath([]);
    } else {
      setSearchStatus(`Patient ${key} could not be found to delete.`);
    }
  };

  const clearHighlight = () => {
    setHighlightedPath([]);
    setSearchStatus(null);
    setSearchQuery('');
  };

  const lastRotation = avlTree.rotationHistory[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            AVL Tree Visualizer & Interactive Balancer
          </h2>
          <p className="text-xs text-slate-500">
            Self-balancing binary search tree maintaining balance factor <code className="font-mono text-blue-700 bg-blue-50 px-1 py-0.5 rounded-sm">|BF| ≤ 1</code> via automatic rotations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenAddModal}
            className="px-3.5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Insert Patient</span>
          </button>
          <button
            onClick={onResetSamples}
            className="px-3 py-2 text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg shadow-2xs flex items-center gap-1 transition-colors"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Reset Samples</span>
          </button>
        </div>
      </div>

      {/* Complexity & Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Tree Height</span>
          <div className="text-2xl font-bold font-mono text-indigo-700 mt-1">{avlTree.getTreeHeight()}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Max depth from root</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Total Nodes (N)</span>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1">{avlTree.nodeCount}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Active patient records</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Total Rotations</span>
          <div className="text-2xl font-bold font-mono text-violet-700 mt-1">{avlTree.totalRotations}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Rebalancing operations</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Balance Invariant</span>
          <div className="text-2xl font-bold font-mono text-emerald-600 mt-1">
            {avlTree.isBalanced() ? 'BALANCED' : 'UNBALANCED'}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">∀ nodes: |H_L - H_R| ≤ 1</div>
        </div>
      </div>

      {/* Last Rotation Callout */}
      {lastRotation && (
        <div className="bg-violet-50 border border-violet-200 rounded-xl p-3.5 text-xs text-violet-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold bg-violet-600 text-white px-2 py-0.5 rounded-sm text-[10px]">
              ROTATION EVENT
            </span>
            <span>
              <strong>{lastRotation.type}:</strong> {lastRotation.description}
            </span>
          </div>
          <span className="text-[11px] text-violet-600 font-mono">
            {new Date(lastRotation.timestamp).toLocaleTimeString()}
          </span>
        </div>
      )}

      {/* Interactive Controls Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        {/* Search */}
        <form onSubmit={handleSearch} className="flex items-center gap-2 flex-1 min-w-[280px]">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search key (e.g. P105)..."
            className="flex-1 px-3 py-1.5 text-xs font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-hidden"
          />
          <button
            type="submit"
            className="px-3.5 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-1"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Trace Search</span>
          </button>
          {highlightedPath.length > 0 && (
            <button
              type="button"
              onClick={clearHighlight}
              className="px-2.5 py-1.5 text-xs text-slate-600 hover:text-slate-900 border border-slate-300 rounded-lg"
            >
              Clear Trace
            </button>
          )}
        </form>

        {/* Delete */}
        <form onSubmit={handleDelete} className="flex items-center gap-2">
          <input
            type="text"
            value={deleteKey}
            onChange={(e) => setDeleteKey(e.target.value)}
            placeholder="Delete ID (e.g. P110)..."
            className="w-36 px-3 py-1.5 text-xs font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 outline-hidden"
          />
          <button
            type="submit"
            className="px-3.5 py-1.5 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-lg flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Node</span>
          </button>
        </form>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1 border border-slate-200 rounded-lg p-0.5 bg-slate-50">
          <button
            onClick={() => setScale((s) => Math.max(0.6, s - 0.1))}
            className="p-1 hover:bg-white rounded-md text-slate-600"
            title="Zoom out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[10px] font-mono px-1.5 text-slate-600">{Math.round(scale * 100)}%</span>
          <button
            onClick={() => setScale((s) => Math.min(1.5, s + 0.1))}
            className="p-1 hover:bg-white rounded-md text-slate-600"
            title="Zoom in"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Search Status Feedback */}
      {searchStatus && (
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-600" />
            <span className="font-medium text-slate-800">{searchStatus}</span>
          </div>
          {highlightedPath.length > 0 && (
            <div className="text-[11px] font-mono text-slate-600">
              Path: {highlightedPath.join(' → ')}
            </div>
          )}
        </div>
      )}

      {/* SVG Tree Canvas */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs overflow-auto max-h-[600px] relative">
        <div
          style={{
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            width: maxX + 100,
            height: maxY + 50,
          }}
          className="transition-transform duration-150"
        >
          <svg
            width={maxX + 100}
            height={maxY + 50}
            className="overflow-visible"
          >
            <defs>
              <linearGradient id="edgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#94a3b8" />
                <stop offset="100%" stopColor="#cbd5e1" />
              </linearGradient>
            </defs>

            {/* Connecting Edges */}
            {positionedNodes.map(({ node, x, y, parentX, parentY }) => {
              if (parentX === undefined || parentY === undefined) return null;
              const isPathEdge =
                highlightedPath.includes(node.key) &&
                highlightedPath.indexOf(node.key) > 0;

              return (
                <path
                  key={`edge-${node.key}`}
                  d={`M ${parentX} ${parentY + 20} C ${parentX} ${(parentY + y) / 2}, ${x} ${(parentY + y) / 2}, ${x} ${y - 20}`}
                  fill="none"
                  stroke={isPathEdge ? '#10b981' : '#cbd5e1'}
                  strokeWidth={isPathEdge ? 3 : 1.75}
                  strokeDasharray={isPathEdge ? 'none' : 'none'}
                />
              );
            })}

            {/* Tree Nodes */}
            {positionedNodes.map(({ node, x, y }) => {
              const pathIndex = highlightedPath.indexOf(node.key);
              const isHighlighted = pathIndex !== -1;
              const isTargetFound = isHighlighted && pathIndex === highlightedPath.length - 1;
              const isCrit = node.severity >= 9;

              return (
                <g
                  key={`node-${node.key}`}
                  transform={`translate(${x}, ${y})`}
                  className="cursor-pointer group"
                  onClick={() => onSelectPatient(node.patient)}
                >
                  {/* Outer glow if highlighted in search */}
                  {isHighlighted && (
                    <circle
                      r="36"
                      fill={isTargetFound ? 'rgba(16, 185, 129, 0.2)' : 'rgba(59, 130, 246, 0.15)'}
                      className="animate-pulse"
                    />
                  )}

                  {/* Main Node Circle */}
                  <circle
                    r="28"
                    fill={
                      isTargetFound
                        ? '#ecfdf5'
                        : isHighlighted
                        ? '#eff6ff'
                        : isCrit
                        ? '#fff1f2'
                        : '#ffffff'
                    }
                    stroke={
                      isTargetFound
                        ? '#10b981'
                        : isHighlighted
                        ? '#3b82f6'
                        : isCrit
                        ? '#f43f5e'
                        : '#94a3b8'
                    }
                    strokeWidth={isHighlighted ? 3 : 2}
                    className="transition-colors group-hover:stroke-blue-500 shadow-sm"
                  />

                  {/* Patient ID */}
                  <text
                    y="-4"
                    textAnchor="middle"
                    className="font-mono text-[11px] font-bold fill-slate-900 pointer-events-none select-none"
                  >
                    {node.key}
                  </text>

                  {/* Severity Badge */}
                  <text
                    y="10"
                    textAnchor="middle"
                    className={`font-mono text-[9px] font-semibold pointer-events-none select-none ${
                      isCrit ? 'fill-red-600' : 'fill-slate-600'
                    }`}
                  >
                    Sev: {node.severity}
                  </text>

                  {/* Balance Factor & Height Tag */}
                  <g transform="translate(18, -18)">
                    <rect
                      x="-10"
                      y="-7"
                      width="20"
                      height="14"
                      rx="4"
                      fill={Math.abs(node.balanceFactor) > 1 ? '#fee2e2' : '#f1f5f9'}
                      stroke={Math.abs(node.balanceFactor) > 1 ? '#ef4444' : '#cbd5e1'}
                      strokeWidth="1"
                    />
                    <text
                      y="3"
                      textAnchor="middle"
                      className={`font-mono text-[8px] font-bold pointer-events-none ${
                        Math.abs(node.balanceFactor) > 1 ? 'fill-red-700' : 'fill-slate-700'
                      }`}
                    >
                      {node.balanceFactor > 0 ? `+${node.balanceFactor}` : node.balanceFactor}
                    </text>
                  </g>

                  {/* Search Path Step Indicator */}
                  {isHighlighted && (
                    <g transform="translate(-18, -18)">
                      <circle r="7" fill="#10b981" />
                      <text
                        y="2.5"
                        textAnchor="middle"
                        className="font-mono text-[8px] font-bold fill-white pointer-events-none"
                      >
                        #{pathIndex + 1}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Legend & Rotation Theory Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        {/* Node anatomy legend */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
          <h4 className="font-bold text-slate-900">Visual Node Anatomy</h4>
          <div className="flex items-center gap-4 text-slate-600">
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-full border-2 border-slate-400 bg-white" />
              <span>Standard Node</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-full border-2 border-red-500 bg-red-50" />
              <span>Critical Patient (Sev ≥ 9)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-full border-2 border-emerald-500 bg-emerald-50" />
              <span>Search Target</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 pt-1">
            Top-right pill: <strong>Balance Factor (BF)</strong> = Height(Left) - Height(Right). If |BF| &gt; 1, AVL rotations are triggered automatically.
          </p>
        </div>

        {/* 4 AVL Rotation cases */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
          <h4 className="font-bold text-slate-900">The 4 AVL Balancing Rotations</h4>
          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
            <div className="p-1.5 bg-slate-50 rounded-md border border-slate-200">
              <strong className="text-blue-700">Right (LL):</strong> BF &gt; 1 & Key &lt; Left.Key
            </div>
            <div className="p-1.5 bg-slate-50 rounded-md border border-slate-200">
              <strong className="text-blue-700">Left (RR):</strong> BF &lt; -1 & Key &gt; Right.Key
            </div>
            <div className="p-1.5 bg-slate-50 rounded-md border border-slate-200">
              <strong className="text-purple-700">Left-Right (LR):</strong> BF &gt; 1 & Key &gt; Left.Key
            </div>
            <div className="p-1.5 bg-slate-50 rounded-md border border-slate-200">
              <strong className="text-purple-700">Right-Left (RL):</strong> BF &lt; -1 & Key &lt; Right.Key
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
