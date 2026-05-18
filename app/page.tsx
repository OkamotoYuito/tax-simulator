"use client";

import { useState, useMemo, useEffect } from "react";
import InputPanel from "@/components/InputPanel";
import ResultsTable from "@/components/ResultsTable";
import BarChart from "@/components/BarChart";
import TaxDetailPanel from "@/components/TaxDetailPanel";
import TaxExplanation from "@/components/TaxExplanation";
import BudgetPanel from "@/components/BudgetPanel";
import { calculate } from "@/lib/calculator";
import type { TaxInputs } from "@/types/tax";

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

type Tab = "results" | "budget" | "explanation";

const TABS: { id: Tab; label: string }[] = [
  { id: "results",     label: "計算結果" },
  { id: "budget",      label: "支出管理" },
  { id: "explanation", label: "税金の解説" },
];

export default function Page() {
  const [inputs, setInputs] = useState<TaxInputs>(DEFAULT_INPUTS);
  const [tab, setTab] = useState<Tab>("results");
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const html = document.documentElement;
    if (dark) html.classList.add("dark");
    else html.classList.remove("dark");
  }, [dark]);

  const result = useMemo(() => calculate(inputs), [inputs]);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-slate-50 dark:bg-gray-950">
      {/* ヘッダー */}
      <header className="flex-shrink-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-[1400px] mx-auto px-4 h-12 flex items-center gap-3">
          <span className="text-xl">🧮</span>
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-bold text-gray-900 dark:text-gray-100 leading-tight truncate">
              日本の税金シミュレーター
              <span className="ml-2 text-xs font-normal text-gray-500 dark:text-gray-400">2025年度版</span>
            </h1>
          </div>

          {/* タブ */}
          <div className="flex gap-0.5 bg-gray-100 dark:bg-gray-800 p-0.5 rounded-md">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                  tab === t.id
                    ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* ダークモードトグル */}
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
          {/* 左: 入力パネル（常時表示） */}
          <aside className="w-72 flex-shrink-0 overflow-y-auto border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-4">
            <h2 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
              収入・控除の入力
            </h2>
            <InputPanel inputs={inputs} onChange={setInputs} />
          </aside>

          {/* 右: タブコンテンツ */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {tab === "results" && (
              <>
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                  <BarChart result={result} scholarshipMonthly={inputs.scholarshipMonthly} />
                </div>
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                  <ResultsTable result={result} scholarshipMonthly={inputs.scholarshipMonthly} />
                </div>
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                  <TaxDetailPanel result={result} />
                </div>
              </>
            )}

            {tab === "budget" && (
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    月次支出シミュレーター
                  </h2>
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    通常月（ボーナスなし）の手取りをベースに計算
                  </span>
                </div>
                <BudgetPanel
                  normalMonth={result.normalMonth}
                  scholarshipMonthly={inputs.scholarshipMonthly}
                />
              </div>
            )}

            {tab === "explanation" && (
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                <h2 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                  各税金・保険料の解説
                </h2>
                <TaxExplanation />
              </div>
            )}

            <p className="text-xs text-gray-400 dark:text-gray-500 text-center pb-2">
              本シミュレーターは概算計算です。実際の税額は源泉徴収票・確定申告書をご確認ください。
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
