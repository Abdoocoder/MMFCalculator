import { CalculationInput, CalculationResult } from '../types';

/**
 * Narrative ledger — the world commitment that the landing page balances
 * like a double-entry book. Debit (financing + profit + insurance) must
 * equal credit (installment × months), settling the account to zero.
 * Pure and fully testable; mirrors the real calculateLoan math exactly.
 */

export interface LedgerLine {
  id: string;
  label: string;
  amount: number;
  note?: string;
}

export interface LedgerBook {
  debitLines: LedgerLine[];
  creditLines: LedgerLine[];
  debitTotal: number;
  creditTotal: number;
  balance: number;
  isBalanced: boolean;
  months: number;
  monthlyInstallment: number;
  totalWithInsurance: number;
}

export function formatJOD(value: number): string {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function buildLedger(input: CalculationInput, result: CalculationResult): LedgerBook {
  const years = Math.max(1, Number(input.durationYears) || 1);
  const months = years * 12;

  const debitLines: LedgerLine[] = [
    {
      id: 'principal',
      label: 'أصل التمويل (سعر السلعة)',
      amount: result.netFinancing,
      note: 'المبلغ الذي تموّله الجمعية لشراء السلعة',
    },
    {
      id: 'profit',
      label: 'ربح المرابحة الثابت',
      amount: result.totalProfit,
      note: `${result.profitRate}% سنوياً وفق سياسة الجمعية`,
    },
    {
      id: 'insurance',
      label: 'تقدير التأمين',
      amount: result.totalInsurance,
      note: '0.5% سنوياً — تقدير تكلفة وليس رسوم بنكية',
    },
  ];

  const creditLines: LedgerLine[] = [
    {
      id: 'installments',
      label: 'القسط الشهري × عدد الأشهر',
      amount: result.monthlyInstallment * months,
      note: `${formatJOD(result.monthlyInstallment)} JOD شهرياً لمدة ${years} سنة`,
    },
  ];

  const debitTotal = debitLines.reduce((sum, l) => sum + l.amount, 0);
  const creditTotal = creditLines.reduce((sum, l) => sum + l.amount, 0);
  const balance = Number((debitTotal - creditTotal).toFixed(2));

  return {
    debitLines,
    creditLines,
    debitTotal,
    creditTotal,
    balance,
    isBalanced: Math.abs(balance) < 0.005,
    months,
    monthlyInstallment: result.monthlyInstallment,
    totalWithInsurance: result.totalWithInsurance,
  };
}
