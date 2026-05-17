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
