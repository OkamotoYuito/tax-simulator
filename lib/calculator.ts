import {
  INCOME_TAX_BRACKETS,
  SMR_TABLE,
  NENKIN_SMR_CAP,
  KENPO_SMR_CAP,
  KENPO_RATES,
  BONUS_NENKIN_CAP,
  BONUS_KENPO_CAP_ANNUAL,
} from "./constants";
import type {
  TaxInputs,
  TaxResult,
  SocialInsurance,
  MonthlyBreakdown,
  BonusSocialInsuranceBreakdown,
} from "../types/tax";

function lookupSMR(monthlyGross: number): number {
  for (const [lower, upper, smr] of SMR_TABLE) {
    if (monthlyGross >= lower && monthlyGross < upper) return smr;
  }
  return SMR_TABLE[SMR_TABLE.length - 1][2];
}

function calcEmploymentIncomeDeduction(gross: number): number {
  if (gross <= 1_625_000) return 550_000;
  if (gross <= 1_800_000) return Math.floor(gross * 0.4) - 100_000;
  if (gross <= 3_600_000) return Math.floor(gross * 0.3) + 80_000;
  if (gross <= 6_600_000) return Math.floor(gross * 0.2) + 440_000;
  if (gross <= 8_500_000) return Math.floor(gross * 0.1) + 1_100_000;
  return 1_950_000;
}

// 基礎控除（所得税用）— 2025年度改正で480,000→580,000に引き上げ
function calcBasicDeductionIncomeTax(gross: number): number {
  if (gross <= 24_000_000) return 580_000;
  if (gross <= 24_500_000) return 387_000;
  if (gross <= 25_000_000) return 193_000;
  return 0;
}

// 基礎控除（住民税用）— 2025年度改正で430,000→530,000に引き上げ
function calcBasicDeductionResidentTax(gross: number): number {
  if (gross <= 24_000_000) return 530_000;
  if (gross <= 24_500_000) return 353_000;
  if (gross <= 25_000_000) return 177_000;
  return 0;
}

function calcIncomeTax(taxableIncome: number): number {
  if (!(taxableIncome > 0)) return 0;
  const bracket = INCOME_TAX_BRACKETS.find((b) => taxableIncome <= b.limit)
    ?? INCOME_TAX_BRACKETS[INCOME_TAX_BRACKETS.length - 1];
  const baseTax = taxableIncome * bracket.rate - bracket.deduction;
  return Math.floor(baseTax * 1.021);
}

function calcResidentTax(taxableIncome: number): number {
  if (taxableIncome <= 0) return 5_000;
  return Math.floor(taxableIncome * 0.1) + 5_000;
}

function calcBonusSI(
  bonus: number,
  kenpoRate: number,
  age40plus: boolean
): BonusSocialInsuranceBreakdown {
  if (bonus <= 0) return { nenkin: 0, kenpo: 0, kaigo: 0, total: 0 };
  const std = Math.floor(bonus / 1_000) * 1_000;
  const nenkin = Math.floor(Math.min(std, BONUS_NENKIN_CAP) * 0.0915);
  const kenpo  = Math.floor(Math.min(std, BONUS_KENPO_CAP_ANNUAL) * kenpoRate);
  const kaigo  = age40plus ? Math.floor(Math.min(std, BONUS_KENPO_CAP_ANNUAL) * 0.008) : 0;
  return { nenkin, kenpo, kaigo, total: nenkin + kenpo + kaigo };
}

function calcBonusMonth(
  bonus: number,
  si: BonusSocialInsuranceBreakdown,
  grossMonthlyBase: number,
  incomeTaxMonthly: number,
  residentTaxMonthly: number,
  socialInsuranceTotalMonthly: number,
  scholarshipMonthly: number
): MonthlyBreakdown {
  const siTotal = socialInsuranceTotalMonthly + si.total;
  const deductions = incomeTaxMonthly + residentTaxMonthly + siTotal;
  const gross = grossMonthlyBase + bonus;
  return {
    gross,
    incomeTax: incomeTaxMonthly,
    residentTax: residentTaxMonthly,
    socialInsurance: siTotal,
    totalDeductions: deductions,
    takeHome: gross - deductions,
    disposableIncome: gross - deductions - scholarshipMonthly,
  };
}

export function calculate(inputs: TaxInputs): TaxResult {
  const {
    inputMode,
    incomeInput,
    bonusSummer,
    bonusWinter,
    housingMonthly,
    includeHousingAsIncome,
    scholarshipMonthly,
    age40plus,
    prefecture,
  } = inputs;

  const kenpoRate = KENPO_RATES[prefecture] ?? KENPO_RATES["全国平均"];

  const baseSalaryMonthly = inputMode === "monthly" ? incomeInput : Math.floor(incomeInput / 12);
  const grossMonthlyBase = includeHousingAsIncome
    ? baseSalaryMonthly + housingMonthly
    : baseSalaryMonthly;

  const totalBonus = bonusSummer + bonusWinter;
  const grossAnnualSalary = grossMonthlyBase * 12;
  const grossAnnual = grossAnnualSalary + totalBonus;

  // 標準報酬月額
  const smr = lookupSMR(grossMonthlyBase);
  const nenkinSMR = Math.min(smr, NENKIN_SMR_CAP);
  const kenpoSMR = Math.min(smr, KENPO_SMR_CAP);

  // 社会保険料（月額）
  const nenkinMonthly = Math.floor(nenkinSMR * 0.0915);
  const kenpoMonthly = Math.floor(kenpoSMR * kenpoRate);
  const koyoMonthly = Math.floor(grossMonthlyBase * 0.006);
  const kaigoMonthly = age40plus ? Math.floor(kenpoSMR * 0.008) : 0;
  const socialInsuranceTotalMonthly = nenkinMonthly + kenpoMonthly + koyoMonthly + kaigoMonthly;

  // 夏・冬ボーナスの社会保険料（各回で厚生年金上限を独立適用）
  const summerSI = calcBonusSI(bonusSummer, kenpoRate, age40plus);
  const winterSI = calcBonusSI(bonusWinter, kenpoRate, age40plus);
  const bonusSITotal = summerSI.total + winterSI.total;
  const socialInsuranceTotalAnnual = socialInsuranceTotalMonthly * 12 + bonusSITotal;

  const socialInsurance: SocialInsurance = {
    nenkinMonthly,
    kenpoMonthly,
    koyoMonthly,
    kaigoMonthly,
    totalMonthly: socialInsuranceTotalMonthly,
    totalAnnual: socialInsuranceTotalAnnual,
    summer: summerSI,
    winter: winterSI,
  };

  // 控除・課税所得
  const employmentIncomeDeduction = calcEmploymentIncomeDeduction(grossAnnual);
  const basicDeductionIncomeTax = calcBasicDeductionIncomeTax(grossAnnual);
  const basicDeductionResidentTax = calcBasicDeductionResidentTax(grossAnnual);

  const taxableIncomeForIncomeTax = Math.max(
    0,
    Math.floor(
      (grossAnnual - employmentIncomeDeduction - basicDeductionIncomeTax - socialInsuranceTotalAnnual) / 1_000
    ) * 1_000
  );
  const taxableIncomeForResidentTax = Math.max(
    0,
    Math.floor(
      (grossAnnual - employmentIncomeDeduction - basicDeductionResidentTax - socialInsuranceTotalAnnual) / 1_000
    ) * 1_000
  );

  const incomeTaxAnnual = calcIncomeTax(taxableIncomeForIncomeTax);
  const incomeTaxMonthly = Math.floor(incomeTaxAnnual / 12);
  const residentTaxAnnual = calcResidentTax(taxableIncomeForResidentTax);
  const residentTaxMonthly = Math.floor(residentTaxAnnual / 12);

  const totalDeductionsAnnual = incomeTaxAnnual + residentTaxAnnual + socialInsuranceTotalAnnual;
  const takeHomeAnnual = grossAnnual - totalDeductionsAnnual;
  const disposableIncomeAnnual = takeHomeAnnual - scholarshipMonthly * 12;

  // 通常月
  const normalMonthDeductions = incomeTaxMonthly + residentTaxMonthly + socialInsuranceTotalMonthly;
  const normalMonth: MonthlyBreakdown = {
    gross: grossMonthlyBase,
    incomeTax: incomeTaxMonthly,
    residentTax: residentTaxMonthly,
    socialInsurance: socialInsuranceTotalMonthly,
    totalDeductions: normalMonthDeductions,
    takeHome: grossMonthlyBase - normalMonthDeductions,
    disposableIncome: grossMonthlyBase - normalMonthDeductions - scholarshipMonthly,
  };

  // 夏・冬ボーナス月
  const summerBonusMonth = bonusSummer > 0
    ? calcBonusMonth(bonusSummer, summerSI, grossMonthlyBase, incomeTaxMonthly, residentTaxMonthly, socialInsuranceTotalMonthly, scholarshipMonthly)
    : null;
  const winterBonusMonth = bonusWinter > 0
    ? calcBonusMonth(bonusWinter, winterSI, grossMonthlyBase, incomeTaxMonthly, residentTaxMonthly, socialInsuranceTotalMonthly, scholarshipMonthly)
    : null;

  const effectiveTaxRate = grossAnnual > 0
    ? (totalDeductionsAnnual / grossAnnual) * 100
    : 0;

  return {
    grossAnnual,
    grossMonthly: grossMonthlyBase,
    socialInsurance,
    employmentIncomeDeduction,
    basicDeductionIncomeTax,
    basicDeductionResidentTax,
    taxableIncomeForIncomeTax,
    taxableIncomeForResidentTax,
    incomeTaxAnnual,
    incomeTaxMonthly,
    residentTaxAnnual,
    residentTaxMonthly,
    totalDeductionsAnnual,
    takeHomeAnnual,
    disposableIncomeAnnual,
    effectiveTaxRate,
    smr,
    normalMonth,
    summerBonusMonth,
    winterBonusMonth,
  };
}
