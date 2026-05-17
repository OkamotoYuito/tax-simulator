"use client";

import type { TaxResult } from "@/types/tax";

interface Props {
  result: TaxResult;
}

const fmt = (n: number) =>
  new Intl.NumberFormat("ja-JP", { style: "currency", currency: "JPY" }).format(Math.round(n));

function DetailRow({ label, value, deduction }: { label: string; value: number; deduction?: boolean }) {
  return (
    <div className="flex justify-between py-1 text-sm border-b border-gray-100 dark:border-gray-700 last:border-0">
      <span className="text-gray-600 dark:text-gray-400">{label}</span>
      <span className={deduction
        ? "text-red-600 dark:text-red-400 font-medium"
        : "text-gray-800 dark:text-gray-200 font-medium"
      }>
        {deduction ? `▲ ${fmt(value)}` : fmt(value)}
      </span>
    </div>
  );
}

export default function TaxDetailPanel({ result: r }: Props) {
  return (
    <details className="group rounded-lg border border-gray-200 dark:border-gray-700">
      <summary className="flex cursor-pointer items-center justify-between px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/60 rounded-lg">
        <span>課税所得の内訳を見る</span>
        <svg
          className="h-4 w-4 text-gray-400 transition-transform group-open:rotate-180"
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </summary>
      <div className="px-4 pb-4 pt-2 space-y-4">
        <div>
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">所得税の計算</p>
          <div className="bg-gray-50 dark:bg-gray-800/60 rounded-lg p-3 space-y-0.5">
            <DetailRow label="総支給額（ボーナス込）" value={r.grossAnnual} />
            <DetailRow label="給与所得控除" value={r.employmentIncomeDeduction} deduction />
            <DetailRow label="社会保険料控除" value={r.socialInsurance.totalAnnual} deduction />
            <DetailRow label="基礎控除" value={r.basicDeductionIncomeTax} deduction />
            <div className="flex justify-between pt-2 mt-1 border-t border-gray-200 dark:border-gray-600 text-sm font-bold">
              <span className="text-gray-700 dark:text-gray-300">課税所得（所得税用）</span>
              <span className="text-gray-900 dark:text-gray-100">{fmt(r.taxableIncomeForIncomeTax)}</span>
            </div>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">住民税の計算</p>
          <div className="bg-gray-50 dark:bg-gray-800/60 rounded-lg p-3 space-y-0.5">
            <DetailRow label="総支給額（ボーナス込）" value={r.grossAnnual} />
            <DetailRow label="給与所得控除" value={r.employmentIncomeDeduction} deduction />
            <DetailRow label="社会保険料控除" value={r.socialInsurance.totalAnnual} deduction />
            <DetailRow label="基礎控除（住民税用）" value={r.basicDeductionResidentTax} deduction />
            <div className="flex justify-between pt-2 mt-1 border-t border-gray-200 dark:border-gray-600 text-sm font-bold">
              <span className="text-gray-700 dark:text-gray-300">課税所得（住民税用）</span>
              <span className="text-gray-900 dark:text-gray-100">{fmt(r.taxableIncomeForResidentTax)}</span>
            </div>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">社会保険の基礎</p>
          <div className="bg-gray-50 dark:bg-gray-800/60 rounded-lg p-3 space-y-0.5">
            <DetailRow label="標準報酬月額（SMR）" value={r.smr} />
            <DetailRow label="ボーナス社会保険料 夏" value={r.socialInsurance.summer.total} />
            <DetailRow label="ボーナス社会保険料 冬" value={r.socialInsurance.winter.total} />
          </div>
        </div>
      </div>
    </details>
  );
}
