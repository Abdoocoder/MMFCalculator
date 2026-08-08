import { describe, expect, it } from 'vitest';
import { buildLedger, formatJOD } from './ledger';
import { calculateLoan, LOAN_PRODUCTS } from '../utils/loanCalculator';
import { CalculationInput } from '../types';

const input: CalculationInput = {
  productId: 'appliances',
  loanAmount: 500,
  netIncome: 200,
  currentDeductions: 0,
  durationYears: 1,
};

describe('buildLedger', () => {
  it('balances to zero for a standard case', () => {
    const result = calculateLoan(input);
    const book = buildLedger(input, result);
    expect(book.isBalanced).toBe(true);
    expect(book.balance).toBe(0);
  });

  it('debit total equals credit total exactly', () => {
    const result = calculateLoan(input);
    const book = buildLedger(input, result);
    expect(book.debitTotal).toBe(book.creditTotal);
  });

  it('debit is the sum of principal, profit and insurance', () => {
    const result = calculateLoan(input);
    const book = buildLedger(input, result);
    expect(book.debitTotal).toBeCloseTo(
      result.netFinancing + result.totalProfit + result.totalInsurance,
      2,
    );
    expect(book.debitTotal).toBeCloseTo(result.totalWithInsurance, 2);
  });

  it('credit is the monthly installment times the number of months', () => {
    const result = calculateLoan(input);
    const book = buildLedger(input, result);
    expect(book.months).toBe(12);
    expect(book.creditTotal).toBeCloseTo(result.monthlyInstallment * 12, 2);
  });

  it('labels every debit line with an honest note', () => {
    const result = calculateLoan(input);
    const book = buildLedger(input, result);
    const labels = book.debitLines.map((l) => l.label);
    expect(labels).toEqual([
      'أصل التمويل (سعر السلعة)',
      'ربح المرابحة الثابت',
      'تقدير التأمين',
    ]);
    expect(book.debitLines[2].note).toContain('ليس رسوم بنكية');
  });

  it('balances across all product lines and terms', () => {
    for (const product of LOAN_PRODUCTS) {
      for (const years of [1, 2, 3, 4, 5, 6, 7]) {
        const next = { ...input, productId: product.id, durationYears: years };
        const result = calculateLoan(next);
        const book = buildLedger(next, result);
        expect(book.isBalanced, `${product.id} / ${years}y`).toBe(true);
      }
    }
  });

  it('reports an unbalanced book when the result is internally inconsistent', () => {
    const result = calculateLoan(input);
    const inconsistent = { ...result, monthlyInstallment: result.monthlyInstallment + 1 };
    const book = buildLedger(input, inconsistent);
    expect(Math.abs(book.balance)).toBeGreaterThan(0.005);
    expect(book.isBalanced).toBe(false);
  });
});

describe('formatJOD', () => {
  it('formats to two decimals with thousands separators', () => {
    expect(formatJOD(1575.6)).toBe('1,575.60');
    expect(formatJOD(48.15625)).toBe('48.16');
  });
});
