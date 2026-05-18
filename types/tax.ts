export interface TaxInputs {
  inputMode: "annual" | "monthly";
  incomeInput: number;
  bonusSummer: number;
  bonusWinter: number;
  housingMonthly: number;
  includeHousingAsIncome: boolean;
  scholarshipMonthly: number;
  age40plus: boolean;
  prefecture: string;
  // 残業代計算用
  dailyWorkHours: number;    // 1日の所定労働時間（時）
  dailyWorkMinutes: number;  // 1日の所定労働時間（分）
  annualHolidays: number;    // 年間休日数（土日＋祝日＋会社休日）
  paidLeaveDays: number;     // 年間有給取得日数
  overtimeHoursMonthly: number;
}

export interface BonusSocialInsuranceBreakdown {
  nenkin: number;
  kenpo: number;
  kaigo: number;
  total: number;
}

export interface SocialInsurance {
  nenkinMonthly: number;
  kenpoMonthly: number;
  koyoMonthly: number;
  kaigoMonthly: number;
  totalMonthly: number;
  totalAnnual: number;
  summer: BonusSocialInsuranceBreakdown;
  winter: BonusSocialInsuranceBreakdown;
}

export interface MonthlyBreakdown {
  gross: number;
  incomeTax: number;
  residentTax: number;
  socialInsurance: number;
  totalDeductions: number;
  takeHome: number;
  disposableIncome: number;
}

export interface TaxResult {
  grossAnnual: number;
  grossMonthly: number;
  hourlyRate: number;
  overtimePayMonthly: number;
  annualWorkingDays: number;
  prescribedHoursMonthly: number;
  socialInsurance: SocialInsurance;
  employmentIncomeDeduction: number;
  basicDeductionIncomeTax: number;
  basicDeductionResidentTax: number;
  taxableIncomeForIncomeTax: number;
  taxableIncomeForResidentTax: number;
  incomeTaxAnnual: number;
  incomeTaxMonthly: number;
  residentTaxAnnual: number;
  residentTaxMonthly: number;
  totalDeductionsAnnual: number;
  takeHomeAnnual: number;
  disposableIncomeAnnual: number;
  effectiveTaxRate: number;
  smr: number;
  normalMonth: MonthlyBreakdown;
  summerBonusMonth: MonthlyBreakdown | null;
  winterBonusMonth: MonthlyBreakdown | null;
}
