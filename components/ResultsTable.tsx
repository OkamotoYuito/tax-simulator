"use client";

import type { TaxResult } from "@/types/tax";

interface Props {
  result: TaxResult;
  scholarshipMonthly: number;
}

const fmt = (n: number) =>
  new Intl.NumberFormat("ja-JP", { style: "currency", currency: "JPY" }).format(Math.round(n));

type Variant = "default" | "deduction" | "total" | "takehome" | "disposable" | "scholarship";

const textStyles: Record<Variant, string> = {
  default:    "text-gray-700 dark:text-gray-300",
  deduction:  "text-red-600 dark:text-red-400",
  total:      "text-red-700 dark:text-red-400 font-semibold",
  takehome:   "text-emerald-700 dark:text-emerald-400 font-bold",
  disposable: "text-blue-700 dark:text-blue-400 font-bold",
  scholarship:"text-orange-600 dark:text-orange-400",
};
const rowBg: Record<Variant, string> = {
  default:    "",
  deduction:  "bg-red-50/40 dark:bg-red-950/20",
  total:      "bg-red-50 dark:bg-red-950/30",
  takehome:   "bg-emerald-50 dark:bg-emerald-950/30",
  disposable: "bg-blue-50 dark:bg-blue-950/30",
  scholarship:"bg-orange-50/40 dark:bg-orange-950/20",
};

interface RowProps {
  label: string;
  normal: number;
  summer?: number;
  winter?: number;
  annual: number;
  variant?: Variant;
  hasSummer: boolean;
  hasWinter: boolean;
}

function Row({ label, normal, summer, winter, annual, variant = "default", hasSummer, hasWinter }: RowProps) {
  return (
    <tr className={`border-b border-gray-100 dark:border-gray-700 ${rowBg[variant]}`}>
      <td className={`py-2 px-3 text-sm ${textStyles[variant]}`}>{label}</td>
      <td className={`py-2 px-3 text-sm text-right tabular-nums ${textStyles[variant]}`}>{fmt(normal)}</td>
      {hasSummer && (
        <td className={`py-2 px-3 text-sm text-right tabular-nums ${textStyles[variant]}`}>
          {summer !== undefined ? fmt(summer) : "—"}
        </td>
      )}
      {hasWinter && (
        <td className={`py-2 px-3 text-sm text-right tabular-nums ${textStyles[variant]}`}>
          {winter !== undefined ? fmt(winter) : "—"}
        </td>
      )}
      <td className={`py-2 px-3 text-sm text-right tabular-nums ${textStyles[variant]}`}>{fmt(annual)}</td>
    </tr>
  );
}

function SectionHeader({ label, colSpan }: { label: string; colSpan: number }) {
  return (
    <tr className="bg-gray-50/60 dark:bg-gray-800/60">
      <td colSpan={colSpan} className="py-1 px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
        {label}
      </td>
    </tr>
  );
}

export default function ResultsTable({ result: r, scholarshipMonthly }: Props) {
  const hasSummer = r.summerBonusMonth !== null;
  const hasWinter = r.winterBonusMonth !== null;
  const sm = r.summerBonusMonth;
  const wm = r.winterBonusMonth;
  const nm = r.normalMonth;
  const si = r.socialInsurance;
  const colSpan = 2 + (hasSummer ? 1 : 0) + (hasWinter ? 1 : 0);

  const nenkinAnnual = si.nenkinMonthly * 12 + si.summer.nenkin + si.winter.nenkin;
  const kenpoAnnual  = si.kenpoMonthly  * 12 + si.summer.kenpo  + si.winter.kenpo;
  const koyoAnnual   = si.koyoMonthly   * 12;
  const kaigoAnnual  = si.kaigoMonthly  * 12 + si.summer.kaigo  + si.winter.kaigo;

  return (
    <div className="space-y-4">
      <div className="flex gap-3 flex-wrap">
        <span className="rounded-full bg-red-100 dark:bg-red-900/40 px-3 py-1 text-sm font-semibold text-red-700 dark:text-red-300">
          実効負担率 {r.effectiveTaxRate.toFixed(1)}%
        </span>
        <span className="rounded-full bg-emerald-100 dark:bg-emerald-900/40 px-3 py-1 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
          手取り率 {(100 - r.effectiveTaxRate).toFixed(1)}%
        </span>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <th className="py-2 px-3 text-left font-semibold text-gray-600 dark:text-gray-400">項目</th>
              <th className="py-2 px-3 text-right font-semibold text-gray-600 dark:text-gray-400">通常月</th>
              {hasSummer && <th className="py-2 px-3 text-right font-semibold text-orange-500 dark:text-orange-400">夏ボーナス月 ☀️</th>}
              {hasWinter && <th className="py-2 px-3 text-right font-semibold text-blue-500 dark:text-blue-400">冬ボーナス月 ❄️</th>}
              <th className="py-2 px-3 text-right font-semibold text-gray-600 dark:text-gray-400">年額</th>
            </tr>
          </thead>
          <tbody>
            <Row label="総支給額" normal={nm.gross} summer={sm?.gross} winter={wm?.gross} annual={r.grossAnnual} hasSummer={hasSummer} hasWinter={hasWinter} />

            <SectionHeader label="税金" colSpan={colSpan} />
            <Row label="所得税（概算・復興税込）" normal={nm.incomeTax} summer={sm?.incomeTax} winter={wm?.incomeTax} annual={r.incomeTaxAnnual} variant="deduction" hasSummer={hasSummer} hasWinter={hasWinter} />
            <Row label="住民税" normal={nm.residentTax} summer={sm?.residentTax} winter={wm?.residentTax} annual={r.residentTaxAnnual} variant="deduction" hasSummer={hasSummer} hasWinter={hasWinter} />

            <SectionHeader label="社会保険料" colSpan={colSpan} />
            <Row
              label="厚生年金保険料"
              normal={si.nenkinMonthly}
              summer={sm ? si.nenkinMonthly + si.summer.nenkin : undefined}
              winter={wm ? si.nenkinMonthly + si.winter.nenkin : undefined}
              annual={nenkinAnnual}
              variant="deduction" hasSummer={hasSummer} hasWinter={hasWinter}
            />
            <Row
              label="健康保険料"
              normal={si.kenpoMonthly}
              summer={sm ? si.kenpoMonthly + si.summer.kenpo : undefined}
              winter={wm ? si.kenpoMonthly + si.winter.kenpo : undefined}
              annual={kenpoAnnual}
              variant="deduction" hasSummer={hasSummer} hasWinter={hasWinter}
            />
            <Row
              label="雇用保険料"
              normal={si.koyoMonthly}
              summer={sm ? si.koyoMonthly : undefined}
              winter={wm ? si.koyoMonthly : undefined}
              annual={koyoAnnual}
              variant="deduction" hasSummer={hasSummer} hasWinter={hasWinter}
            />
            {si.kaigoMonthly > 0 && (
              <Row
                label="介護保険料"
                normal={si.kaigoMonthly}
                summer={sm ? si.kaigoMonthly + si.summer.kaigo : undefined}
                winter={wm ? si.kaigoMonthly + si.winter.kaigo : undefined}
                annual={kaigoAnnual}
                variant="deduction" hasSummer={hasSummer} hasWinter={hasWinter}
              />
            )}

            <Row label="控除合計" normal={nm.totalDeductions} summer={sm?.totalDeductions} winter={wm?.totalDeductions} annual={r.totalDeductionsAnnual} variant="total" hasSummer={hasSummer} hasWinter={hasWinter} />
            <Row label="手取り額" normal={nm.takeHome} summer={sm?.takeHome} winter={wm?.takeHome} annual={r.takeHomeAnnual} variant="takehome" hasSummer={hasSummer} hasWinter={hasWinter} />

            {scholarshipMonthly > 0 && (
              <>
                <Row label="▲ 奨学金返済額" normal={scholarshipMonthly} summer={sm ? scholarshipMonthly : undefined} winter={wm ? scholarshipMonthly : undefined} annual={scholarshipMonthly * 12} variant="scholarship" hasSummer={hasSummer} hasWinter={hasWinter} />
                <Row label="可処分所得" normal={nm.disposableIncome} summer={sm?.disposableIncome} winter={wm?.disposableIncome} annual={r.disposableIncomeAnnual} variant="disposable" hasSummer={hasSummer} hasWinter={hasWinter} />
              </>
            )}
          </tbody>
        </table>
      </div>

      {(hasSummer || hasWinter) && (
        <p className="text-xs text-gray-400 dark:text-gray-500">
          ☀️❄️ ボーナス月の所得税は年税額の1/12概算です。厚生年金の上限（150万円）は夏・冬それぞれ独立して適用されます。
        </p>
      )}
      <p className="text-xs text-gray-400 dark:text-gray-500">
        ※住民税は前年所得に基づき翌年6月から課税。基礎控除は2025年度改正値（所得税58万円・住民税53万円）を使用。
      </p>
    </div>
  );
}
