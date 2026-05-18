"use client";

import type { MonthlyBreakdown } from "@/types/tax";

export interface ExpenseItem {
  id: string;
  label: string;
  icon: string;
  amount: number;
  color: string; // Tailwind bg-* class（棒グラフ用）
  hex: string;   // hex color（円グラフ用）
}

export const DEFAULT_EXPENSES: ExpenseItem[] = [
  { id: "rent",      label: "家賃",      icon: "🏠", amount: 0, color: "bg-blue-400",    hex: "#60a5fa" },
  { id: "food",      label: "食費",      icon: "🍱", amount: 0, color: "bg-orange-400",  hex: "#fb923c" },
  { id: "utility",   label: "光熱費",    icon: "💡", amount: 0, color: "bg-yellow-400",  hex: "#facc15" },
  { id: "comm",      label: "通信費",    icon: "📱", amount: 0, color: "bg-purple-400",  hex: "#c084fc" },
  { id: "transport", label: "交通費",    icon: "🚃", amount: 0, color: "bg-teal-400",    hex: "#2dd4bf" },
  { id: "health",    label: "医療・美容", icon: "💊", amount: 0, color: "bg-pink-400",    hex: "#f472b6" },
  { id: "insurance", label: "民間保険",  icon: "🛡️", amount: 0, color: "bg-indigo-400",  hex: "#818cf8" },
  { id: "entertain", label: "娯楽・趣味", icon: "🎮", amount: 0, color: "bg-rose-400",    hex: "#fb7185" },
  { id: "social",    label: "交際費",    icon: "🍻", amount: 0, color: "bg-amber-400",   hex: "#fbbf24" },
  { id: "daily",     label: "日用品",    icon: "🛒", amount: 0, color: "bg-lime-400",    hex: "#a3e635" },
  { id: "clothing",  label: "被服費",    icon: "👗", amount: 0, color: "bg-fuchsia-400", hex: "#e879f9" },
  { id: "other",     label: "その他",    icon: "📦", amount: 0, color: "bg-gray-400",    hex: "#9ca3af" },
];

interface Props {
  normalMonth: MonthlyBreakdown;
  scholarshipMonthly: number;
  expenses: ExpenseItem[];
  onExpensesChange: (expenses: ExpenseItem[]) => void;
}

const fmt = (n: number) =>
  new Intl.NumberFormat("ja-JP", { style: "currency", currency: "JPY" }).format(Math.round(n));

const inputClass =
  "w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 pl-3 pr-9 py-1.5 text-sm text-right focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 tabular-nums";

export default function BudgetPanel({ normalMonth, scholarshipMonthly, expenses, onExpensesChange }: Props) {
  const setAmount = (id: string, raw: string) => {
    const value = raw === "" ? 0 : parseInt(raw.replace(/[^0-9]/g, ""), 10) || 0;
    onExpensesChange(expenses.map((e) => (e.id === id ? { ...e, amount: value } : e)));
  };

  const baseIncome = normalMonth.takeHome - scholarshipMonthly;
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const remaining = baseIncome - totalExpenses;
  const savingsRate = baseIncome > 0 ? (remaining / baseIncome) * 100 : 0;
  const expenseRate = baseIncome > 0 ? (totalExpenses / baseIncome) * 100 : 0;

  const nonZero = expenses.filter((e) => e.amount > 0);

  const remainingColor =
    remaining > 0
      ? "text-emerald-600 dark:text-emerald-400"
      : "text-red-600 dark:text-red-400";

  return (
    <div className="space-y-4">
      {/* 収入サマリー */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 p-3 text-center">
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mb-0.5">手取り（通常月）</p>
          <p className="text-base font-bold text-emerald-700 dark:text-emerald-300 tabular-nums">{fmt(normalMonth.takeHome)}</p>
        </div>
        {scholarshipMonthly > 0 && (
          <div className="rounded-xl bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 p-3 text-center">
            <p className="text-xs text-orange-600 dark:text-orange-400 font-medium mb-0.5">奨学金返済</p>
            <p className="text-base font-bold text-orange-700 dark:text-orange-300 tabular-nums">▲{fmt(scholarshipMonthly)}</p>
          </div>
        )}
        <div className="rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 p-3 text-center">
          <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-0.5">収支の出発点</p>
          <p className="text-base font-bold text-blue-700 dark:text-blue-300 tabular-nums">{fmt(baseIncome)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 支出入力 */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            月々の支出を入力
          </h3>
          <div className="space-y-1.5">
            {expenses.map((item) => (
              <div key={item.id} className="flex items-center gap-2">
                <span className="text-base w-6 text-center flex-shrink-0">{item.icon}</span>
                <span className="text-sm text-gray-700 dark:text-gray-300 w-20 flex-shrink-0">{item.label}</span>
                <div className="relative min-w-0 flex-1">
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={item.amount || ""}
                    onChange={(e) => setAmount(item.id, e.target.value)}
                    placeholder="0"
                    className={inputClass}
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">円</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 結果サマリー */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            収支サマリー
          </h3>

          {baseIncome > 0 && (
            <div className="space-y-1.5">
              <div className="flex h-5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                {nonZero.map((e) => (
                  <div
                    key={e.id}
                    className={`${e.color} transition-all duration-300`}
                    style={{ width: `${Math.min((e.amount / baseIncome) * 100, 100)}%` }}
                    title={`${e.label}: ${fmt(e.amount)}`}
                  />
                ))}
                {remaining > 0 && (
                  <div
                    className="bg-emerald-500/30 transition-all duration-300"
                    style={{ width: `${(remaining / baseIncome) * 100}%` }}
                    title={`貯蓄・余剰: ${fmt(remaining)}`}
                  />
                )}
              </div>
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>支出 {expenseRate.toFixed(0)}%</span>
                <span>余剰 {Math.max(0, savingsRate).toFixed(0)}%</span>
              </div>
            </div>
          )}

          <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              <div className="flex justify-between px-3 py-2 text-sm">
                <span className="text-gray-600 dark:text-gray-400">収支の出発点</span>
                <span className="font-medium text-gray-800 dark:text-gray-200 tabular-nums">{fmt(baseIncome)}</span>
              </div>
              <div className="flex justify-between px-3 py-2 text-sm bg-red-50/40 dark:bg-red-950/20">
                <span className="text-red-600 dark:text-red-400">支出合計</span>
                <span className="font-medium text-red-600 dark:text-red-400 tabular-nums">▲ {fmt(totalExpenses)}</span>
              </div>
              <div className={`flex justify-between px-3 py-2.5 text-sm font-bold ${remaining >= 0 ? "bg-emerald-50 dark:bg-emerald-950/30" : "bg-red-50 dark:bg-red-950/30"}`}>
                <span className={remainingColor}>余剰・貯蓄額</span>
                <span className={`tabular-nums ${remainingColor}`}>
                  {remaining >= 0 ? fmt(remaining) : `▲ ${fmt(Math.abs(remaining))}`}
                </span>
              </div>
            </div>
          </div>

          {nonZero.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">支出の内訳</p>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {[...nonZero]
                  .sort((a, b) => b.amount - a.amount)
                  .map((e) => (
                    <div key={e.id} className="flex items-center gap-2 text-xs">
                      <span className={`inline-block w-2 h-2 rounded-sm flex-shrink-0 ${e.color}`} />
                      <span className="text-gray-600 dark:text-gray-400 flex-1">{e.icon} {e.label}</span>
                      <span className="tabular-nums text-gray-700 dark:text-gray-300 font-medium">{fmt(e.amount)}</span>
                      <span className="text-gray-400 dark:text-gray-500 w-8 text-right">
                        {baseIncome > 0 ? `${Math.round((e.amount / baseIncome) * 100)}%` : "—"}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {remaining < 0 && (
            <div className="rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 px-3 py-2">
              <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                ⚠️ 支出が手取りを {fmt(Math.abs(remaining))} 超えています
              </p>
            </div>
          )}

          {remaining > 0 && savingsRate >= 20 && (
            <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 px-3 py-2">
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                ✓ 貯蓄率 {savingsRate.toFixed(0)}% — 一般的な目安（20%以上）を達成しています
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
