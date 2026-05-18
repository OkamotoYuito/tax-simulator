"use client";

import { useState, useEffect, useRef } from "react";
import { PREFECTURE_LIST } from "@/lib/constants";
import type { TaxInputs } from "@/types/tax";

interface Props {
  inputs: TaxInputs;
  onChange: (inputs: TaxInputs) => void;
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
      {children}
      {hint && <p className="text-xs text-gray-500 dark:text-gray-400">{hint}</p>}
    </div>
  );
}

const baseInputClass =
  "w-full rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-1";
const normalBorder = "border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500";
const warnBorder   = "border-red-400 dark:border-red-500 focus:border-red-500 focus:ring-red-500";

interface NumericInputProps {
  value: number;
  onChange: (n: number) => void;
  placeholder?: string;
  unit?: string;
  warnOnZero?: boolean;
  warnMessage?: string;
}

function NumericInput({
  value,
  onChange,
  placeholder,
  unit = "円",
  warnOnZero = false,
  warnMessage,
}: NumericInputProps) {
  const [str, setStr] = useState(() => value > 0 ? String(value) : "");
  const focused = useRef(false);

  useEffect(() => {
    if (!focused.current) {
      setStr(value > 0 ? String(value) : "");
    }
  }, [value]);

  const isWarn = warnOnZero && value === 0 && str === "0";

  return (
    <div className="relative">
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={str}
        placeholder={placeholder}
        className={`${baseInputClass} ${isWarn ? warnBorder : normalBorder} pr-10`}
        onFocus={() => { focused.current = true; }}
        onBlur={() => {
          focused.current = false;
          if (value === 0) setStr("");
        }}
        onChange={(e) => {
          const raw = e.target.value.replace(/[^0-9]/g, "");
          setStr(raw);
          onChange(raw === "" ? 0 : parseInt(raw, 10));
        }}
      />
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 pointer-events-none">{unit}</span>
      {isWarn && (
        <p className="mt-0.5 text-xs text-red-500 dark:text-red-400">
          {warnMessage ?? `0${unit}の場合、この列は表示されません`}
        </p>
      )}
    </div>
  );
}

const inputClass =
  "w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500";

const fmt = (n: number) =>
  new Intl.NumberFormat("ja-JP", { style: "currency", currency: "JPY" }).format(Math.round(n));

export default function InputPanel({ inputs, onChange }: Props) {
  const set = <K extends keyof TaxInputs>(key: K, value: TaxInputs[K]) =>
    onChange({ ...inputs, [key]: value });

  // 残業代の概算（InputPanel内で表示用に計算）
  const baseSalaryMonthly = inputs.inputMode === "monthly"
    ? inputs.incomeInput
    : Math.floor(inputs.incomeInput / 12);
  const dailyHoursDecimal = (inputs.dailyWorkHours ?? 8) + (inputs.dailyWorkMinutes ?? 0) / 60;
  const annualWorkingDays = Math.max(0, 365 - (inputs.annualHolidays ?? 120) - (inputs.paidLeaveDays ?? 0));
  const prescribedHoursMonthly = (annualWorkingDays / 12) * dailyHoursDecimal;
  const hourlyRate = prescribedHoursMonthly > 0
    ? Math.floor(baseSalaryMonthly / prescribedHoursMonthly)
    : 0;
  const overtimePayMonthly = Math.floor(hourlyRate * 1.25 * (inputs.overtimeHoursMonthly ?? 0));

  return (
    <div className="space-y-4">
      {/* 入力モード */}
      <Field label="収入の入力方法">
        <div className="flex gap-4">
          {(["annual", "monthly"] as const).map((mode) => (
            <label key={mode} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={inputs.inputMode === mode}
                onChange={() => set("inputMode", mode)}
                className="accent-blue-600"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {mode === "annual" ? "年収で入力" : "月収で入力"}
              </span>
            </label>
          ))}
        </div>
      </Field>

      {/* 年収 / 月収 */}
      <Field
        label={inputs.inputMode === "annual" ? "年収（円）" : "月収（円）"}
        hint={inputs.inputMode === "annual" ? "例：4,000,000（ボーナスを除いた額）" : "例：300,000（ボーナスを除いた額）"}
      >
        <NumericInput
          value={inputs.incomeInput}
          onChange={(n) => set("incomeInput", n)}
          placeholder={inputs.inputMode === "annual" ? "4000000" : "300000"}
        />
      </Field>

      {/* 残業代セクション */}
      <div className="rounded-lg border border-indigo-200 dark:border-indigo-800 bg-indigo-50/40 dark:bg-indigo-950/20 p-3 space-y-3">
        <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">
          残業代（自動計算）
        </p>

        {/* 1日の所定労働時間 */}
        <Field label="1日の所定労働時間">
          <div className="flex gap-2 items-center">
            <div className="relative flex-1">
              <NumericInput
                value={inputs.dailyWorkHours}
                onChange={(n) => set("dailyWorkHours", Math.min(24, n))}
                placeholder="8"
                unit="時間"
              />
            </div>
            <div className="relative w-28">
              <select
                value={inputs.dailyWorkMinutes}
                onChange={(e) => set("dailyWorkMinutes", Number(e.target.value))}
                className={inputClass}
              >
                {[0, 15, 30, 45].map((m) => (
                  <option key={m} value={m}>{m}分</option>
                ))}
              </select>
            </div>
          </div>
        </Field>

        {/* 年間休日数 */}
        <Field
          label="年間休日数"
          hint={`土日104日＋祝日${new Date(new Date().getFullYear(), 11, 31).getDay() >= 0 ? 16 : 16}日＝120日が目安`}
        >
          <NumericInput
            value={inputs.annualHolidays}
            onChange={(n) => set("annualHolidays", Math.min(365, n))}
            placeholder="120"
            unit="日"
          />
        </Field>

        {/* 年間有給取得日数 */}
        <Field label="年間有給取得日数" hint="取得した日数のみ（繰越・未取得は含めない）">
          <NumericInput
            value={inputs.paidLeaveDays}
            onChange={(n) => set("paidLeaveDays", n)}
            placeholder="0"
            unit="日"
          />
        </Field>

        {/* 月平均残業時間 */}
        <Field label="月平均残業時間">
          <NumericInput
            value={inputs.overtimeHoursMonthly}
            onChange={(n) => set("overtimeHoursMonthly", n)}
            placeholder="0"
            unit="時間"
          />
        </Field>

        {/* 計算結果のプレビュー */}
        <div className="rounded-md bg-white dark:bg-gray-800 border border-indigo-100 dark:border-indigo-900 px-3 py-2 space-y-1">
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>年間所定労働日数</span>
            <span className="font-medium text-gray-700 dark:text-gray-300">
              {annualWorkingDays}日
            </span>
          </div>
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>月間所定労働時間</span>
            <span className="font-medium text-gray-700 dark:text-gray-300">
              {prescribedHoursMonthly.toFixed(1)}時間
            </span>
          </div>
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>時給（基本給 ÷ 月間所定時間）</span>
            <span className="font-medium text-gray-700 dark:text-gray-300">
              {prescribedHoursMonthly > 0 ? fmt(hourlyRate) : "—"}
            </span>
          </div>
          <div className="flex justify-between text-xs border-t border-gray-100 dark:border-gray-700 pt-1 mt-1">
            <span className="font-semibold text-indigo-600 dark:text-indigo-400">残業代（月額 × 1.25）</span>
            <span className="font-bold text-indigo-600 dark:text-indigo-400">
              {overtimePayMonthly > 0 ? `+ ${fmt(overtimePayMonthly)}` : fmt(0)}
            </span>
          </div>
        </div>

        <p className="text-xs text-gray-400 dark:text-gray-500">
          残業代は月収に加算して税・社会保険料を計算します。
        </p>
      </div>

      {/* 夏ボーナス */}
      <Field label="夏ボーナス（円）" hint="入力すると「夏ボーナス月」列が表示されます">
        <NumericInput
          value={inputs.bonusSummer}
          onChange={(n) => set("bonusSummer", n)}
          placeholder="0"
          warnOnZero
        />
      </Field>

      {/* 冬ボーナス */}
      <Field label="冬ボーナス（円）" hint="入力すると「冬ボーナス月」列が表示されます">
        <NumericInput
          value={inputs.bonusWinter}
          onChange={(n) => set("bonusWinter", n)}
          placeholder="0"
          warnOnZero
        />
      </Field>

      {/* 家賃補助 */}
      <Field label="家賃補助（月額・円）" hint="会社から支給される住宅手当の月額">
        <NumericInput
          value={inputs.housingMonthly}
          onChange={(n) => set("housingMonthly", n)}
          placeholder="0"
        />
        <label className="mt-1.5 flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={inputs.includeHousingAsIncome}
            onChange={(e) => set("includeHousingAsIncome", e.target.checked)}
            className="accent-blue-600"
          />
          <span className="text-xs text-gray-600 dark:text-gray-400">課税対象の給与に含める（会社支給は原則課税）</span>
        </label>
      </Field>

      {/* 奨学金 */}
      <Field
        label="奨学金月額返済額（円）"
        hint="税制上の控除ではなく「可処分所得」として表示"
      >
        <NumericInput
          value={inputs.scholarshipMonthly}
          onChange={(n) => set("scholarshipMonthly", n)}
          placeholder="0"
        />
      </Field>

      {/* 都道府県 */}
      <Field label="都道府県" hint="健康保険料率（協会けんぽ）が変わります">
        <select
          value={inputs.prefecture}
          onChange={(e) => set("prefecture", e.target.value)}
          className={inputClass}
        >
          {PREFECTURE_LIST.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </Field>

      {/* 年齢 */}
      <label className="flex items-center gap-3 cursor-pointer rounded-lg border border-gray-200 dark:border-gray-700 p-3 hover:bg-gray-50 dark:hover:bg-gray-800/60">
        <input
          type="checkbox"
          checked={inputs.age40plus}
          onChange={(e) => set("age40plus", e.target.checked)}
          className="accent-blue-600 w-4 h-4"
        />
        <div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">40歳以上（介護保険料の対象）</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">40〜64歳は健康保険料に上乗せされます</p>
        </div>
      </label>
    </div>
  );
}
