export interface LoanProduct {
  id: string;
  name: string;
  profitRate: number; // e.g. 0.15 for 15%
  maxYears: number;
  description: string;
}

export interface CalculationInput {
  productId: string;
  loanAmount: number;
  netIncome: number;
  currentDeductions: number;
  durationYears: number;
}

export interface CalculationResult {
  netFinancing: number;
  profitRate: number; // percentage display e.g. 15
  annualProfit: number;
  totalProfit: number;
  totalPayable: number;
  annualInsurance: number;
  totalInsurance: number;
  totalWithInsurance: number;
  monthlyInstallment: number;
  maxInstallment: number;
  isEligible: boolean;
  dtiPercentage: number;
}

export interface LoanRecord {
  id: string;
  date: string;
  productName: string;
  loanAmount: number;
  netIncome: number;
  durationYears: number;
  monthlyInstallment: number;
  totalWithInsurance: number;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  referenceNo: string;
  notes?: string;
  resultSnapshot?: CalculationResult;
}

export interface MemberProfile {
  id: string;
  membershipNo: string;
  fullName: string;
  nationalId: string;
  department: string;
  jobTitle: string;
  netSalary: number;
  currentDeductions: number;
  phone: string;
  joinDate: string;
  activeLoanCount: number;
  totalLoansPaid: number;
}
