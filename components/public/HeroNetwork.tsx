"use client";

/**
 * Hero visual: a stylized AI mission network. Pure SVG + CSS transitions,
 * honors reduced-motion via global stylesheet. Decorative (aria-hidden).
 */
export function HeroNetwork() {
  // [x, y, label?] nodes on a 400x320 canvas
  const nodes: { x: number; y: number; label?: string; big?: boolean }[] = [
    { x: 200, y: 40, label: "ETHICS" },
    { x: 320, y: 90, label: "DETECTIVE" },
    { x: 90, y: 80, big: false },
    { x: 200, y: 160, big: true, label: "YOU" },
    { x: 330, y: 200, label: "PROMPT LAB" },
    { x: 60, y: 190, label: "ML LAB" },
    { x: 140, y: 270, label: "GEN AI" },
    { x: 290, y: 280, big: false },
    { x: 200, y: 315, label: "FUNDAMENTALS" },
  ];
  const edges: [number, number][] = [
    [3, 0], [3, 1], [3, 2], [3, 4], [3, 5], [3, 6], [3, 8],
    [1, 4], [5, 6], [6, 8], [4, 7], [7, 8], [0, 1],
  ];
  return (
    <svg
      viewBox="0 0 400 340"
      className="h-full w-full"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="edgegrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.7" />
        </linearGradient>
        <radialGradient id="nodeglow">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.2" />
        </radialGradient>
      </defs>
      {edges.map(([a, b], i) => (
        <line
          key={i}
          x1={nodes[a]!.x}
          y1={nodes[a]!.y}
          x2={nodes[b]!.x}
          y2={nodes[b]!.y}
          stroke="url(#edgegrad)"
          strokeWidth="1.1"
          strokeDasharray="5 7"
          className="hero-line"
        />
      ))}
      {nodes.map((n, i) => (
        <g key={i} className="animate-node-drift" style={{ animationDelay: `${i * 0.35}s` }}>
          <circle cx={n.x} cy={n.y} r={n.big ? 22 : 12} fill="#0b1020" stroke="#38bdf8" strokeOpacity="0.5" />
          <circle cx={n.x} cy={n.y} r={n.big ? 10 : 5} fill="url(#nodeglow)" />
          {n.big && (
            <circle cx={n.x} cy={n.y} r={30} fill="none" stroke="#8b5cf6" strokeOpacity="0.35" className="animate-pulse-soft">
              <animate attributeName="r" values="26;38;26" dur="4s" repeatCount="indefinite" />
            </circle>
          )}
          {n.label && (
            <text
              x={n.x}
              y={n.y + (n.big ? 42 : 28)}
              textAnchor="middle"
              className="fill-ink-faint"
              fontSize="9"
              fontFamily="ui-monospace, monospace"
              letterSpacing="1.5"
            >
              {n.label}
            </text>
          )}
        </g>
      ))}
    </svg>
  );
}
