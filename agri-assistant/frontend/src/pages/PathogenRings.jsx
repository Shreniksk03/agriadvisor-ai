import { useState, useEffect } from 'react';
import { ShieldAlert, Activity, Share2, Zap, AlertTriangle, CheckCircle, Radio } from 'lucide-react';
import { analyticsAPI } from '../lib/api';

export default function PathogenRings() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState(null);
  const [filterSeverity, setFilterSeverity] = useState('ALL');

  useEffect(() => {
    loadPathogenData();
  }, []);

  const loadPathogenData = async () => {
    setLoading(true);
    try {
      const { data: res } = await analyticsAPI.pathogenRings();
      setData(res.data);
      const firstPathogen = res.data?.nodes?.find((n) => n.type === 'pathogen');
      if (firstPathogen) setSelectedNode(firstPathogen);
    } catch (err) {
      console.error('Failed to load pathogen data:', err);
    } finally {
      setLoading(false);
    }
  };

  const nodes = data?.nodes || [];
  const links = data?.links || [];

  const filteredNodes = nodes.filter((n) => {
    if (n.type === 'field') return true;
    if (filterSeverity === 'ALL') return true;
    return n.severity === filterSeverity;
  });

  const width = 640;
  const height = 520;
  const centerX = width / 2;
  const centerY = height / 2;
  const fieldRadius = 200;
  const pathogenRadius = 105;

  const fieldNodes = filteredNodes.filter((n) => n.type === 'field');
  const pathogenNodes = filteredNodes.filter((n) => n.type === 'pathogen');

  const nodePositions = {};

  fieldNodes.forEach((node, i) => {
    const angle = (i / fieldNodes.length) * 2 * Math.PI - Math.PI / 2;
    nodePositions[node.id] = {
      x: centerX + fieldRadius * Math.cos(angle),
      y: centerY + fieldRadius * Math.sin(angle),
      ...node,
    };
  });

  pathogenNodes.forEach((node, i) => {
    const angle = (i / pathogenNodes.length) * 2 * Math.PI - Math.PI / 2;
    nodePositions[node.id] = {
      x: centerX + pathogenRadius * Math.cos(angle),
      y: centerY + pathogenRadius * Math.sin(angle),
      ...node,
    };
  });

  const connectedLinks = selectedNode
    ? links.filter((l) => l.source === selectedNode.id || l.target === selectedNode.id)
    : [];

  const connectedNodeIds = new Set(
    connectedLinks.flatMap((l) => [l.source, l.target])
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
            <span className="p-2 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400">
              <Share2 className="w-6 h-6" />
            </span>
            Pathogen Transmission Rings
          </h1>
          <p className="text-slate-300 text-sm mt-1">
            Dynamic node-based biological vector network modeling cross-field infection transmission
          </p>
        </div>

        {/* Severity filter */}
        <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 font-medium px-2">Severity:</span>
          {['ALL', 'CRITICAL', 'HIGH', 'MODERATE'].map((sev) => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterSeverity === sev
                  ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/25'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: SVG Graph + Details Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Graph Canvas */}
        <div className="lg:col-span-2 glass-card p-6 flex flex-col items-center justify-center relative overflow-hidden bg-slate-900/85 border border-slate-800">
          <div className="absolute top-4 left-4 text-xs font-mono text-slate-400 flex items-center gap-2">
            <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span>DYNAMIC NODE NETWORK · TOPOLOGICAL VECTOR ENGINE</span>
          </div>

          <div className="absolute top-4 right-4 flex items-center gap-4 text-xs text-slate-400 font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500 border border-emerald-400 inline-block" />
              <span>Field Nodes</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500 border border-rose-400 inline-block" />
              <span>Pathogen Nodes</span>
            </div>
          </div>

          {loading ? (
            <div className="py-36 text-center">
              <div className="spinner mx-auto mb-3" />
              <p className="text-slate-400 text-xs font-mono">Synthesizing topological pathogen graph...</p>
            </div>
          ) : (
            <div className="w-full max-w-[640px] h-[520px] flex items-center justify-center">
              <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full select-none">
                {/* Background Orbit Guides */}
                <circle
                  cx={centerX}
                  cy={centerY}
                  r={fieldRadius}
                  fill="none"
                  stroke="#1e293b"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                />
                <circle
                  cx={centerX}
                  cy={centerY}
                  r={pathogenRadius}
                  fill="none"
                  stroke="#334155"
                  strokeWidth="1.5"
                  strokeDasharray="2 2"
                />

                {/* Vector Links */}
                {links.map((link, idx) => {
                  const sourcePos = nodePositions[link.source];
                  const targetPos = nodePositions[link.target];
                  if (!sourcePos || !targetPos) return null;

                  const isHighlighted =
                    selectedNode && (link.source === selectedNode.id || link.target === selectedNode.id);
                  const isDimmed = selectedNode && !isHighlighted;

                  return (
                    <g key={`link-${idx}`}>
                      <line
                        x1={sourcePos.x}
                        y1={sourcePos.y}
                        x2={targetPos.x}
                        y2={targetPos.y}
                        stroke={isHighlighted ? '#f43f5e' : '#38bdf8'}
                        strokeWidth={isHighlighted ? 3 : link.strength * 2.2}
                        strokeOpacity={isDimmed ? 0.12 : isHighlighted ? 0.95 : 0.35}
                        strokeDasharray={isHighlighted ? '5 3' : 'none'}
                        className={isHighlighted ? 'animate-pulse' : ''}
                      />
                    </g>
                  );
                })}

                {/* Nodes */}
                {Object.values(nodePositions).map((node) => {
                  const isSelected = selectedNode?.id === node.id;
                  const isConnected = connectedNodeIds.has(node.id);
                  const isDimmed = selectedNode && !isSelected && !isConnected;

                  return (
                    <g
                      key={node.id}
                      transform={`translate(${node.x}, ${node.y})`}
                      onClick={() => setSelectedNode(node)}
                      className="cursor-pointer transition-all duration-300 group"
                      opacity={isDimmed ? 0.2 : 1}
                    >
                      {/* Pulse ring for critical/high nodes */}
                      {node.severity === 'CRITICAL' && (
                        <circle
                          r="18"
                          fill="#f43f5e"
                          opacity="0.25"
                          className="animate-ping"
                        />
                      )}

                      {/* Halo on selection */}
                      {isSelected && (
                        <circle
                          r="22"
                          fill="none"
                          stroke={node.type === 'pathogen' ? '#f43f5e' : '#06b6d4'}
                          strokeWidth="2.5"
                          strokeDasharray="3 3"
                        />
                      )}

                      {/* Main Node Circle */}
                      <circle
                        r={node.type === 'pathogen' ? 14 : 11}
                        fill={node.color || (node.type === 'pathogen' ? '#f43f5e' : '#10b981')}
                        stroke="#020617"
                        strokeWidth="2.5"
                        className="hover:scale-125 transition-transform"
                      />

                      {/* Node Label */}
                      <text
                        y={node.type === 'pathogen' ? 26 : -16}
                        textAnchor="middle"
                        fill="#f1f5f9"
                        fontSize="10"
                        fontWeight="600"
                        className="pointer-events-none drop-shadow font-sans"
                      >
                        {node.label || node.id}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          )}
        </div>

        {/* Selected Node Details & Threat Analysis */}
        <div className="glass-card p-6 space-y-5 flex flex-col justify-between bg-slate-900/85 border border-slate-800">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-400" />
                Vector Threat Intel
              </h3>
              {selectedNode && (
                <span className={`text-[10px] px-2.5 py-1 rounded-full font-mono font-bold uppercase border ${
                  selectedNode.type === 'pathogen' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                }`}>
                  {selectedNode.type}
                </span>
              )}
            </div>

            {selectedNode ? (
              <div className="space-y-4 mt-4">
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Node Identifier:</span>
                    <span className="font-mono font-bold text-slate-100">{selectedNode.label || selectedNode.id}</span>
                  </div>

                  {selectedNode.severity && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Threat Severity:</span>
                      <span className={`font-bold ${
                        selectedNode.severity === 'CRITICAL' ? 'text-rose-400' : selectedNode.severity === 'HIGH' ? 'text-amber-400' : 'text-cyan-400'
                      }`}>
                        {selectedNode.severity}
                      </span>
                    </div>
                  )}

                  {selectedNode.crop && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Host Crop:</span>
                      <span className="text-emerald-400 font-semibold">{selectedNode.crop}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Active Transmission Links:</span>
                    <span className="font-mono font-bold text-cyan-400">{connectedLinks.length}</span>
                  </div>
                </div>

                {/* Connected Links Breakdown */}
                <div>
                  <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Infection Vectors & Pathogens
                  </h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {connectedLinks.map((link, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-xs flex items-center justify-between"
                      >
                        <div>
                          <p className="font-medium text-slate-200">
                            {link.source === selectedNode.id ? link.target : link.source}
                          </p>
                          <p className="text-[10px] text-slate-400">{link.label || 'Spore propagation'}</p>
                        </div>
                        <span className="font-mono font-bold text-rose-400 text-xs">
                          {Math.round(link.strength * 100)}% risk
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 text-xs">
                Select any node on the ring to inspect infection vectors and transmission strength
              </div>
            )}
          </div>

          {/* Action Protocol */}
          <div className="pt-4 border-t border-slate-800">
            <button
              onClick={() => alert(`Quarantine alert dispatched for ${selectedNode?.label || 'selected vector'}`)}
              disabled={!selectedNode}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white text-xs font-bold shadow-lg shadow-rose-500/25 disabled:opacity-40 transition-all flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4" />
              Deploy Biosecurity Containment Protocol
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
