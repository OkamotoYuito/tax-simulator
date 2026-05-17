"use client";

import type { TaxResult } from "@/types/tax";

interface Props {
  result: TaxResult;
  scholarshipMonthly: number;
}

interface Segment {
  label: string;
  value: number;
  color: string;
}

export default function BarChart({ result: r, scholarshipMonthly }: Props) {
  const gross = r.grossAnnual;
  if (gross <= 0) return null;

  const segments: Segment[] = [
    { label: "所得税", value: r.incomeTaxAnnual, color: "bg-rose-500" },
    { label: "住民税", value: r.residentTaxAnnual, color: "bg-pink-400" },
    { label: "厚生年金", value: r.socialInsurance.nenkinMonthly * 12 + r.socialInsurance.summer.nenkin + r.socialInsurance.winter.nenkin, color: "bg-violet-500" },
    { label: "健康保険", value: r.socialInsurance.kenpoMonthly * 12 + r.socialInsurance.summer.kenpo + r.socialInsurance.winter.kenpo, color: "bg-blue-400" },
    { label: "雇用保険", value: r.socialInsurance.koyoMonthly * 12, color: "bg-cyan-400" },
    ...(r.socialInsurance.kaigoMonthly > 0
      ? [{ label: "介護保険", value: r.socialInsurance.kaigoMonthly * 12 + r.socialInsurance.summer.kaigo + r.socialInsurance.winter.kaigo, color: "bg-teal-400" }]
      : []),
    ...(scholarshipMonthly > 0
      ? [{ label: "奨学金返済", value: scholarshipMonthly * 12, color: "bg-amber-400" }]
      : []),
    { label: "可処分所得", value: r.disposableIncomeAnnual, color: "bg-emerald-500" },
  ];

  const total = segments.reduce((s, seg) => s + seg.value, 0);

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">収入の内訳（年額）</p>
      <div className="flex h-7 w-full overflow-hidden rounded-lg">
        {segments.map((seg) =>
          seg.value > 0 ? (
            <div
              key={seg.label}
              className={`${seg.color} transition-all duration-500`}
              style={{ width: `${(seg.value / total) * 100}%` }}
              title={`${seg.label}: ${Math.round((seg.value / gross) * 100)}%`}
            />
          ) : null
        )}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {segments.map((seg) => {
          const pct = Math.round((seg.value / gross) * 1000) / 10; // 小数点第一位
          return seg.value > 0 && pct >= 0.1 ? (
            <div key={seg.label} className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
              <span className={`inline-block h-2.5 w-2.5 rounded-sm ${seg.color}`} />
              {seg.label} ({pct % 1 === 0 ? pct.toFixed(0) : pct.toFixed(1)}%)
            </div>
          ) : null;
        })}
      </div>
    </div>
  );
}
