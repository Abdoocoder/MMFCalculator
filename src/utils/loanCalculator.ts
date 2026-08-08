import { CalculationInput, CalculationResult, LoanProduct } from '../types';

export const LOAN_PRODUCTS: LoanProduct[] = [
  {
    id: 'appliances',
    name: 'مرابحة الأجهزة الكهربائية والإلكترونية',
    profitRate: 0.15, // 15%
    maxYears: 5,
    description: 'تمويل شراء الأجهزة الكهربائية والإلكترونية بالمرابحة الإسلامية'
  },
  {
    id: 'furniture_building',
    name: 'مرابحة الأثاث ومواد البناء والترميم',
    profitRate: 0.15, // 15%
    maxYears: 6,
    description: 'تمويل شراء الأثاث المنزلي ومواد البناء بالمرابحة الإسلامية'
  },
  {
    id: 'vehicles',
    name: 'مرابحة السيارات والمركبات',
    profitRate: 0.15, // 15%
    maxYears: 7,
    description: 'تمويل شراء السيارات والمركبات وفق أحكام المرابحة الإسلامية'
  },
  {
    id: 'goods_supplies',
    name: 'مرابحة السلع والمستلزمات العائلية',
    profitRate: 0.15, // 15%
    maxYears: 3,
    description: 'تمويل شراء البضائع والسلع الاستهلاكية بالمرابحة الإسلامية'
  },
  {
    id: 'medical_education',
    name: 'مرابحة المستلزمات الطبية والتعليمية',
    profitRate: 0.15, // 15%
    maxYears: 3,
    description: 'تمويل شراء الأجهزة الطبية والأدوات التعليمية بالمرابحة الإسلامية'
  }
];

export const DTI_RATIO = 0.40; // 40% limit of net income
export const INSURANCE_RATE = 0.005; // 0.5% per year

export function calculateLoan(input: CalculationInput): CalculationResult {
  const product = LOAN_PRODUCTS.find(p => p.id === input.productId) || LOAN_PRODUCTS[0];
  const principal = Math.max(0, Number(input.loanAmount) || 0);
  const netIncome = Math.max(0, Number(input.netIncome) || 0);
  const deductions = Math.max(0, Number(input.currentDeductions) || 0);
  const years = Math.max(1, Number(input.durationYears) || 1);

  // Maximum allowed monthly installment
  const maxInstallment = Math.max(0, (netIncome * DTI_RATIO) - deductions);

  // Loan Math exactly as specified in Association formulas
  const totalProfit = principal * product.profitRate * years;
  const annualProfit = years > 0 ? totalProfit / years : 0;
  const totalPayable = principal + totalProfit;

  const totalInsurance = totalPayable * INSURANCE_RATE * years;
  const annualInsurance = years > 0 ? totalInsurance / years : 0;

  const totalWithInsurance = totalPayable + totalInsurance;
  const totalMonths = years * 12;
  const monthlyInstallment = totalMonths > 0 ? totalWithInsurance / totalMonths : 0;

  const isEligible = monthlyInstallment <= maxInstallment && maxInstallment > 0;
  const dtiPercentage = netIncome > 0 ? ((deductions + monthlyInstallment) / netIncome) * 100 : 0;

  return {
    netFinancing: principal,
    profitRate: product.profitRate * 100,
    annualProfit,
    totalProfit,
    totalPayable,
    annualInsurance,
    totalInsurance,
    totalWithInsurance,
    monthlyInstallment,
    maxInstallment,
    isEligible,
    dtiPercentage
  };
}

export function generateReferenceNo(): string {
  return `MDB-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
}

export function formatJODNumber(value: number): string {
  return value.toFixed(2);
}
