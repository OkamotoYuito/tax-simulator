"use client";

import { useState } from "react";

export interface PieSegment {
  label: string;
  value: number;
  hex: string;
  icon?: string;
}

interface Props {
  title: string;
  segments: PieSegment[];
  centerText?: string;
  centerSubtext?: string;
  size?: number;
}

function polarXY(cx: number, cy: number, r: number, angle: number) {
  return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
}

export default function PieChart({ title, segments, centerText, centerSubtext, size = 100 }: Props) {
  const [hovered, setHovered] = useState<number | null>(null);

  const filtered = segments.filter((s) => s.value > 0);
  const total = filtered.reduce((s, seg) => s + seg.value, 0);

  const cx = 100, cy = 100, outerR = 82, innerR = 52;
  const GAP = filtered.length > 1 ? 0.018 : 0;

  let angle = -Math.PI / 2;
  const slices = filtered.map((seg) => {
    const sweep = (seg.value / total) * 2 * Math.PI;
    const sa = angle + GAP / 2;
    const ea = angle + sweep - GAP / 2;
    const midAngle = angle + sweep / 2;
    angle += sweep;

    let d: string;
    let evenodd = false;
    if (sweep >= 2 * Math.PI - 0.002) {
      evenodd = true;
      d = [
        `M ${cx + outerR} ${cy}`,
        `A ${outerR} ${outerR} 0 1 1 ${cx - outerR} ${cy}`,
        `A ${outerR} ${outerR} 0 1 1 ${cx + outerR} ${cy} Z`,
        `M ${cx + innerR} ${cy}`,
        `A ${innerR} ${innerR} 0 1 1 ${cx - innerR} ${cy}`,
        `A ${innerR} ${innerR} 0 1 1 ${cx + innerR} ${cy} Z`,
      ].join(" ");
    } else {
      const o1 = polarXY(cx, cy, outerR, sa);
      const o2 = polarXY(cx, cy, outerR, ea);
      const i1 = polarXY(cx, cy, innerR, ea);
      const i2 = polarXY(cx, cy, innerR, sa);
      const lg = ea - sa > Math.PI ? 1 : 0;
      d = `M ${o1.x} ${o1.y} A ${outerR} ${outerR} 0 ${lg} 1 ${o2.x} ${o2.y} L ${i1.x} ${i1.y} A ${innerR} ${innerR} 0 ${lg} 0 ${i2.x} ${i2.y} Z`;
    }
    return { ...seg, d, evenodd, pct: (seg.value / total) * 100, midAngle };
  });

  const activeCenterText = hovered !== null ? `${slices[hovered].pct.toFixed(1)}%` : centerText;
  const activeCenterSubtext = hovered !== null ? slices[hovered].label : centerSubtext;

  const scale = size / 100;
  const itemsCount = slices.length;
  const LINE_H = 1.3;

  const idealText = Math.max(10, Math.min(18, 12 * scale));
  const idealGap  = Math.max(2, 4 * scale);
  const needed    = itemsCount * idealText * LINE_H + Math.max(0, itemsCount - 1) * idealGap;

  let textSize: number;
  let rowGap: number;
  if (needed <= size) {
    textSize = idealText;
    rowGap   = idealGap;
  } else {
    rowGap   = 1;
    textSize = Math.max(8, (size - (itemsCount - 1) * rowGap) / (itemsCount * LINE_H));
  }

  const dotSize = Math.round(Math.max(5, Math.min(12, textSize * 0.75)));

  return (
    <div className="flex flex-col gap-2 min-w-0">
      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide truncate">
        {title}
      </p>

      {total <= 0 ? (
        <p className="text-xs text-gray-400 dark:text-gray-600 text-center py-4">データなし</p>
      ) : (
        <div className="flex items-center gap-3">
          {/* ドーナツ */}
          <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
            <svg viewBox="0 0 200 200" className="w-full h-full" onMouseLeave={() => setHovered(null)}>
              {slices.map((s, i) => {
                const isHovered = hovered === i;
                const offset = isHovered ? 6 : 0;
                const tx = offset > 0 ? Math.cos(s.midAngle) * offset : 0;
                const ty = offset > 0 ? Math.sin(s.midAngle) * offset : 0;
                return (
                  <path
                    key={i}
                    d={s.d}
                    fill={s.hex}
                    fillRule={s.evenodd ? "evenodd" : "nonzero"}
                    style={{
                      opacity: hovered !== null && !isHovered ? 0.35 : 1,
                      transform: `translate(${tx}px, ${ty}px)`,
                      transition: "opacity 0.15s, transform 0.15s",
                      cursor: "pointer",
                    }}
                    onMouseEnter={() => setHovered(i)}
                  />
                );
              })}
              {activeCenterText && (
                <text
                  x="100" y="97"
                  textAnchor="middle"
                  fill="currentColor"
                  style={{ fontSize: 22, fontWeight: 800, transition: "all 0.15s" }}
                >
                  {activeCenterText}
                </text>
              )}
              {activeCenterSubtext && (
                <text x="100" y="116" textAnchor="middle" fill="#6b7280" style={{ fontSize: 13, transition: "all 0.15s" }}>
                  {activeCenterSubtext}
                </text>
              )}
            </svg>
          </div>

          {/* 凡例 */}
          <div className="flex-1 min-w-0 overflow-hidden" style={{ display: "flex", flexDirection: "column", gap: rowGap }}>
            {slices.map((s, i) => (
              <div
                key={i}
                className="flex items-center cursor-default rounded"
                style={{
                  gap: Math.round(6 * scale),
                  opacity: hovered !== null && hovered !== i ? 0.35 : 1,
                  transition: "opacity 0.15s",
                  fontSize: textSize,
                  lineHeight: 1.3,
                }}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
              >
                <span
                  className="inline-block rounded-sm flex-shrink-0"
                  style={{ backgroundColor: s.hex, width: dotSize, height: dotSize }}
                />
                <span className="text-gray-600 dark:text-gray-400 truncate flex-1">
                  {s.icon}{s.icon ? " " : ""}{s.label}
                </span>
                <span
                  className="flex-shrink-0 tabular-nums font-medium transition-colors"
                  style={{ color: hovered === i ? s.hex : undefined }}
                >
                  {s.pct.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
