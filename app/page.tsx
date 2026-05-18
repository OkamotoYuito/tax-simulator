"use client";

import { useState, useMemo } from "react";
import InputPanel from "@/components/InputPanel";
import ResultsTable from "@/components/ResultsTable";
import PieChart, { type PieSegment } from "@/components/PieChart";
import TaxDetailPanel from "@/components/TaxDetailPanel";
import TaxExplanation from "@/components/TaxExplanation";
import BudgetPanel, { DEFAULT_EXPENSES, type ExpenseItem } from "@/components/BudgetPanel";
import { calculate } from "@/lib/calculator";
import type { TaxInputs } from "@/types/tax";
import { useEffect, useRef } from "react";

const DEFAULT_INPUTS: TaxInputs = {
  inputMode: "monthly",
  incomeInput: 312_000,
  bonusSummer: 500_000,
  bonusWinter: 500_000,
  housingMonthly: 50_000,
  includeHousingAsIncome: true,
  scholarshipMonthly: 30_000,
  age40plus: false,
  prefecture: "神奈川県",
  dailyWorkHours: 8,
  dailyWorkMinutes: 0,
  annualHolidays: 120,
  paidLeaveDays: 0,
  overtimeHoursMonthly: 0,
};

// 所得内訳の hex カラー（BarChart と統一）
const INCOME_COLORS = {
  incomeTax:   "#f43f5e",
  residentTax: "#f472b6",
  nenkin:      "#8b5cf6",
  kenpo:       "#60a5fa",
  koyo:        "#22d3ee",
  kaigo:       "#2dd4bf",
  scholarship: "#fbbf24",
  disposable:  "#10b981",
};

interface SectionProps {
  title: string;
  defaultOpen?: boolean;
  badge?: string;
  children: React.ReactNode;
}

function CollapsibleSection({ title, defaultOpen = true, badge, children }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{title}</span>
          {badge && (
            <span className="text-xs text-gray-400 dark:text-gray-500">{badge}</span>
          )}
        </div>
        <svg
          className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-800 pt-4">{children}</div>}
    </div>
  );
}

export default function Page() {
  const [inputs, setInputs] = useState<TaxInputs>(DEFAULT_INPUTS);
  const [dark, setDark] = useState(false);
  const [expenses, setExpenses] = useState<ExpenseItem[]>(DEFAULT_EXPENSES);
  const [pieHeight, setPieHeight] = useState(140);
  const pieRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ startY: number; startH: number } | null>(null);

  const onPieDragStart = (e: React.MouseEvent) => {
    e.preventDefault();
    const h = pieRef.current?.getBoundingClientRect().height ?? pieHeight;
    dragRef.current = { startY: e.clientY, startH: h };

    const onMove = (ev: MouseEvent) => {
      if (!dragRef.current) return;
      const newH = Math.max(80, Math.min(400, dragRef.current.startH + ev.clientY - dragRef.current.startY));
      setPieHeight(newH);
    };
    const onUp = () => {
      dragRef.current = null;
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  };

  useEffect(() => {
    const html = document.documentElement;
    if (dark) html.classList.add("dark");
    else html.classList.remove("dark");
  }, [dark]);

  const result = useMemo(() => calculate(inputs), [inputs]);

  // 所得内訳の円グラフデータ
  const incomeSegments = useMemo((): PieSegment[] => {
    const si = result.socialInsurance;
    const nenkinAnnual = si.nenkinMonthly * 12 + si.summer.nenkin + si.winter.nenkin;
    const kenpoAnnual  = si.kenpoMonthly  * 12 + si.summer.kenpo  + si.winter.kenpo;
    const koyoAnnual   = si.koyoMonthly   * 12;
    const kaigoAnnual  = si.kaigoMonthly  * 12 + si.summer.kaigo  + si.winter.kaigo;

    return [
      { label: "所得税",    hex: INCOME_COLORS.incomeTax,   value: result.incomeTaxAnnual },
      { label: "住民税",    hex: INCOME_COLORS.residentTax,  value: result.residentTaxAnnual },
      { label: "厚生年金",  hex: INCOME_COLORS.nenkin,       value: nenkinAnnual },
      { label: "健康保険",  hex: INCOME_COLORS.kenpo,        value: kenpoAnnual },
      { label: "雇用保険",  hex: INCOME_COLORS.koyo,         value: koyoAnnual },
      ...(kaigoAnnual > 0 ? [{ label: "介護保険", hex: INCOME_COLORS.kaigo, value: kaigoAnnual }] : []),
      ...(inputs.scholarshipMonthly > 0
        ? [{ label: "奨学金返済", hex: INCOME_COLORS.scholarship, value: inputs.scholarshipMonthly * 12 }]
        : []),
      { label: "可処分所得", hex: INCOME_COLORS.disposable, value: result.disposableIncomeAnnual },
    ];
  }, [result, inputs.scholarshipMonthly]);

  // 支出内訳の円グラフデータ
  const budgetSegments = useMemo((): PieSegment[] => {
    const baseIncome = result.normalMonth.takeHome - inputs.scholarshipMonthly;
    const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
    const remaining = baseIncome - totalExpenses;

    const segs: PieSegment[] = expenses
      .filter((e) => e.amount > 0)
      .map((e) => ({ label: e.label, icon: e.icon, hex: e.hex, value: e.amount }));

    if (remaining > 0) {
      segs.push({ label: "貯蓄・余剰", hex: "#10b981", value: remaining });
    }
    return segs;
  }, [expenses, result.normalMonth, inputs.scholarshipMonthly]);

  const takeHomeRate = result.grossAnnual > 0
    ? (100 - result.effectiveTaxRate).toFixed(1)
    : "—";

  // padding(24) + title(20) + gap(8) = 52
  const chartSize = Math.max(56, pieHeight - 52);

  const budgetBase = result.normalMonth.takeHome - inputs.scholarshipMonthly;
  const budgetTotal = expenses.reduce((s, e) => s + e.amount, 0);
  const budgetRemaining = budgetBase - budgetTotal;
  const savingsRate = budgetBase > 0 ? Math.max(0, (budgetRemaining / budgetBase) * 100) : 0;

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-slate-50 dark:bg-gray-950">
      {/* ヘッダー */}
      <header className="flex-shrink-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-[1400px] mx-auto px-4 h-12 flex items-center gap-3">
          <span className="text-xl">🧮</span>
          <h1 className="text-sm font-bold text-gray-900 dark:text-gray-100 leading-tight truncate flex-1">
            日本の税金シミュレーター
            <span className="ml-2 text-xs font-normal text-gray-500 dark:text-gray-400">2025年度版</span>
          </h1>
          <button
            onClick={() => setDark((d) => !d)}
            className="p-1.5 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="ダークモード切り替え"
          >
            {dark ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            )}
          </button>
        </div>
      </header>

      {/* メインエリア */}
      <main className="flex-1 overflow-hidden">
        <div className="h-full max-w-[1400px] mx-auto flex">

          {/* 左: 入力パネル */}
          <aside className="w-72 flex-shrink-0 overflow-y-auto border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-4">
            <h2 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
              収入・控除の入力
            </h2>
            <InputPanel inputs={inputs} onChange={setInputs} />
          </aside>

          {/* 右: 常時表示エリア＋スクロールエリア */}
          <div className="flex-1 flex flex-col overflow-hidden">

            {/* ── 常時表示: 2つの円グラフ ── */}
            <div
              ref={pieRef}
              className="relative flex-shrink-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700"
              style={{ height: pieHeight }}
            >
              <div className="flex items-stretch gap-2 px-4 py-3 h-full overflow-hidden">
                {/* 所得内訳グラフ */}
                <div className="flex-1 min-w-0">
                  <PieChart
                    title="所得の内訳（年額）"
                    segments={incomeSegments}
                    centerText={`${takeHomeRate}%`}
                    centerSubtext="手取り率"
                    size={chartSize}
                  />
                </div>

                <div className="w-px bg-gray-200 dark:bg-gray-700 flex-shrink-0" />

                {/* 支出内訳グラフ */}
                <div className="flex-1 min-w-0">
                  <PieChart
                    title="支出の内訳（通常月）"
                    segments={budgetSegments}
                    centerText={budgetBase > 0 ? `${savingsRate.toFixed(0)}%` : undefined}
                    centerSubtext={budgetBase > 0 ? "貯蓄率" : undefined}
                    size={chartSize}
                  />
                </div>
              </div>

              {/* リサイズハンドル */}
              <div
                className="absolute bottom-0 left-0 right-0 h-3 cursor-row-resize flex items-center justify-center group z-10"
                onMouseDown={onPieDragStart}
              >
                <div className="w-10 h-1 rounded-full bg-gray-300 dark:bg-gray-600 group-hover:bg-blue-400 dark:group-hover:bg-blue-500 transition-colors" />
              </div>
            </div>

            {/* ── スクロールエリア: 折り畳みセクション ── */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">

              <CollapsibleSection
                title="計算結果"
                badge={`実効負担率 ${result.effectiveTaxRate.toFixed(1)}%`}
              >
                <ResultsTable result={result} scholarshipMonthly={inputs.scholarshipMonthly} />
              </CollapsibleSection>

              <CollapsibleSection title="支出管理" badge="通常月の手取りをベース">
                <BudgetPanel
                  normalMonth={result.normalMonth}
                  scholarshipMonthly={inputs.scholarshipMonthly}
                  expenses={expenses}
                  onExpensesChange={setExpenses}
                />
              </CollapsibleSection>

              <CollapsibleSection title="課税所得の内訳" defaultOpen={false}>
                <TaxDetailPanel result={result} />
              </CollapsibleSection>

              <CollapsibleSection title="税金の解説" defaultOpen={false}>
                <TaxExplanation />
              </CollapsibleSection>

              <p className="text-xs text-gray-400 dark:text-gray-500 text-center pb-2">
                本シミュレーターは概算計算です。実際の税額は源泉徴収票・確定申告書をご確認ください。
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
