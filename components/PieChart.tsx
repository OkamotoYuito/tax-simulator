"use client";

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
}

const fmt = (n: number) =>
  new Intl.NumberFormat("ja-JP", { style: "currency", currency: "JPY" }).format(Math.round(n));

function polarXY(cx: number, cy: number, r: number, angle: number) {
  return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
}

export default function PieChart({ title, segments, centerText, centerSubtext }: Props) {
  const filtered = segments.filter((s) => s.value > 0);
  const total = filtered.reduce((s, seg) => s + seg.value, 0);

  const cx = 100, cy = 100, outerR = 82, innerR = 52;
  const GAP = filtered.length > 1 ? 0.018 : 0;

  let angle = -Math.PI / 2;
  const slices = filtered.map((seg) => {
    const sweep = (seg.value / total) * 2 * Math.PI;
    const sa = angle + GAP / 2;
    const ea = angle + sweep - GAP / 2;
    angle += sweep;

    let d: string;
    let evenodd = false;
    if (sweep >= 2 * Math.PI - 0.002) {
      // 全円: 外円と内円を evenodd で重ねてドーナツを作る
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
    return { ...seg, d, evenodd, pct: (seg.value / total) * 100 };
  });

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
          <div className="relative flex-shrink-0 w-[100px] h-[100px]">
            <svg viewBox="0 0 200 200" className="w-full h-full">
              {slices.map((s, i) => (
                <path
                  key={i}
                  d={s.d}
                  fill={s.hex}
                  fillRule={s.evenodd ? "evenodd" : "nonzero"}
                  className="transition-opacity hover:opacity-75"
                />
              ))}
              {centerText && (
                <text
                  x="100" y="97"
                  textAnchor="middle"
                  fill="currentColor"
                  style={{ fontSize: 22, fontWeight: 800 }}
                >
                  {centerText}
                </text>
              )}
              {centerSubtext && (
                <text x="100" y="116" textAnchor="middle" fill="#6b7280" style={{ fontSize: 13 }}>
                  {centerSubtext}
                </text>
              )}
            </svg>
          </div>

          {/* 凡例 */}
          <div className="flex-1 min-w-0 space-y-0.5 max-h-[100px] overflow-y-auto pr-0.5">
            {slices.map((s, i) => (
              <div key={i} className="flex items-center gap-1.5 text-xs leading-tight">
                <span
                  className="inline-block w-2 h-2 rounded-sm flex-shrink-0"
                  style={{ backgroundColor: s.hex }}
                />
                <span className="text-gray-600 dark:text-gray-400 truncate flex-1">
                  {s.icon}{s.icon ? " " : ""}{s.label}
                </span>
                <span className="text-gray-400 dark:text-gray-500 flex-shrink-0 tabular-nums">
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
