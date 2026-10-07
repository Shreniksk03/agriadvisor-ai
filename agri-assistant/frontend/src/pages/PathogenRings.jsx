import { useState, useEffect } from 'react';
import { ShieldAlert, Share2, Zap, Radio } from 'lucide-react';
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
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Share2 className="w-5 h-5 text-blue-500" />
            Pathogen Transmission Rings
          </h1>
          <p className="text-slate-400 text-xs mt-0.5">
            Dynamic node-based biological vector network mapping shared identities and infection propagation
          </p>
        </div>

        {/* Severity filter */}
        <div className="flex items-center gap-1.5 bg-[#0d0f12] p-1.5 rounded-lg border border-white/5 font-mono text-xs">
          <span className="text-slate-500 px-2 uppercase text-[10px]">Severity:</span>
          {['ALL', 'CRITICAL', 'HIGH', 'MODERATE'].map((sev) => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`px-2.5 py-1 rounded transition-all ${
                filterSeverity === sev
                  ? 'bg-blue-600 text-white font-semibold shadow-[0_0_12px_rgba(37,99,235,0.4)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Pitch-Black SVG Graph + Details Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Pitch-Black Graph Canvas */}
        <div className="lg:col-span-2 bg-[#000000] border border-white/5 rounded-xl p-6 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute top-4 left-4 text-[10px] font-mono text-slate-500 flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
            <span>DYNAMIC NODE NETWORK · TOPOLOGICAL VECTOR ENGINE</span>
          </div>

          <div className="absolute top-4 right-4 flex items-center gap-3 text-[11px] text-slate-400 font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              <span>Fields</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
              <span>Pathogens</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
              <span>Vectors</span>
            </div>
          </div>

          {loading ? (
            <div className="py-36 text-center">
              <div className="spinner mx-auto mb-3" />
              <p className="text-slate-500 text-xs font-mono">Synthesizing topological pathogen graph...</p>
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
                  stroke="rgba(255,255,255,0.05)"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <circle
                  cx={centerX}
                  cy={centerY}
                  r={pathogenRadius}
                  fill="none"
                  stroke="rgba(255,255,255,0.05)"
                  strokeWidth="1"
                  strokeDasharray="2 2"
                />

                {/* Vector Links - very faint thin white lines: stroke-white/10 */}
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
                        stroke={isHighlighted ? '#3b82f6' : 'rgba(255, 255, 255, 0.1)'}
                        strokeWidth={isHighlighted ? 2.5 : 1}
                        strokeOpacity={isDimmed ? 0.05 : isHighlighted ? 1 : 0.4}
                        strokeDasharray={isHighlighted ? '4 2' : 'none'}
                        className={isHighlighted ? 'animate-pulse' : ''}
                      />
                    </g>
                  );
                })}

                {/* Nodes - Small brightly colored scatter nodes (blue/green/red) */}
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
                      {/* Pulse ring for critical nodes */}
                      {node.severity === 'CRITICAL' && (
                        <circle
                          r="14"
                          fill="#ef4444"
                          opacity="0.25"
                          className="animate-ping"
                        />
                      )}

                      {/* Halo on selection */}
                      {isSelected && (
                        <circle
                          r="16"
                          fill="none"
                          stroke={node.type === 'pathogen' ? '#ef4444' : '#3b82f6'}
                          strokeWidth="2"
                          strokeDasharray="3 3"
                        />
                      )}

                      {/* Main Node Circle */}
                      <circle
                        r={node.type === 'pathogen' ? 8 : 6}
                        fill={node.color || (node.type === 'pathogen' ? '#ef4444' : '#10b981')}
                        stroke="#000000"
                        strokeWidth="1.5"
                        className="hover:scale-125 transition-transform"
                      />

                      {/* Node Label */}
                      <text
                        y={node.type === 'pathogen' ? 20 : -12}
                        textAnchor="middle"
                        fill="#cbd5e1"
                        fontSize="9"
                        fontWeight="500"
                        fontFamily="monospace"
                        className="pointer-events-none select-none"
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
        <div className="bg-[#0d0f12] border border-white/5 rounded-xl p-6 space-y-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <h3 className="text-xs tracking-wider text-slate-500 uppercase font-semibold flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-500" />
                Vector Threat Intel
              </h3>
              {selectedNode && (
                <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold uppercase border ${
                  selectedNode.type === 'pathogen' ? 'bg-rose-950/40 text-rose-400 border-rose-500/30' : 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30'
                }`}>
                  {selectedNode.type}
                </span>
              )}
            </div>

            {selectedNode ? (
              <div className="space-y-4 mt-4">
                <div className="p-3.5 bg-[#080a0e] rounded-lg border border-white/5 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-sans">Node Identifier:</span>
                    <span className="font-mono font-bold text-slate-200">{selectedNode.label || selectedNode.id}</span>
                  </div>

                  {selectedNode.severity && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-sans">Threat Severity:</span>
                      <span className={`font-mono font-bold ${
                        selectedNode.severity === 'CRITICAL' ? 'text-rose-400' : selectedNode.severity === 'HIGH' ? 'text-amber-400' : 'text-blue-400'
                      }`}>
                        {selectedNode.severity}
                      </span>
                    </div>
                  )}

                  {selectedNode.crop && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-sans">Host Crop:</span>
                      <span className="text-emerald-400 font-mono font-semibold">{selectedNode.crop}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-sans">Active Transmission Links:</span>
                    <span className="font-mono font-bold text-blue-400">{connectedLinks.length}</span>
                  </div>
                </div>

                {/* Connected Links Breakdown */}
                <div>
                  <h4 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2 font-sans">
                    Infection Vectors & Pathogens
                  </h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {connectedLinks.map((link, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-lg bg-[#080a0e] border border-white/5 text-xs flex items-center justify-between"
                      >
                        <div>
                          <p className="font-medium text-slate-200 font-mono text-[11px]">
                            {link.source === selectedNode.id ? link.target : link.source}
                          </p>
                          <p className="text-[10px] text-slate-500">{link.label || 'Spore propagation'}</p>
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
              <div className="py-12 text-center text-slate-500 text-xs font-mono">
                Select any node on the network ring to inspect infection vectors and transmission strength
              </div>
            )}
          </div>

          {/* Action Protocol */}
          <div className="pt-4 border-t border-white/5">
            <button
              onClick={() => alert(`Quarantine containment dispatched for ${selectedNode?.label || 'selected vector'}`)}
              disabled={!selectedNode}
              className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-[0_0_15px_rgba(37,99,235,0.5)] disabled:opacity-40 transition-all flex items-center justify-center gap-2 border border-white/10"
            >
              <Zap className="w-3.5 h-3.5 fill-white" />
              <span>Deploy Biosecurity Containment Protocol</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
