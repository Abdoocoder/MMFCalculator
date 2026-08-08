import { describe, expect, it } from 'vitest';
import {
  calculateLoan,
  DTI_RATIO,
  formatJODNumber,
  generateReferenceNo,
  INSURANCE_RATE,
  LOAN_PRODUCTS,
} from '../utils/loanCalculator';

const baseInput = {
  productId: 'appliances',
  loanAmount: 1000,
  netIncome: 1000,
  currentDeductions: 0,
  durationYears: 1,
};

describe('calculateLoan', () => {
  it('computes 15% profit on the principal over the term', () => {
    const r = calculateLoan(baseInput);
    expect(r.netFinancing).toBe(1000);
    expect(r.profitRate).toBe(15);
    expect(r.totalProfit).toBe(150);
    expect(r.totalPayable).toBe(1150);
  });

  it('adds 0.5% annual insurance on the total payable', () => {
    const r = calculateLoan(baseInput);
    expect(r.totalInsurance).toBeCloseTo(1150 * INSURANCE_RATE, 5);
    expect(r.totalWithInsurance).toBeCloseTo(1155.75, 5);
    expect(r.monthlyInstallment).toBeCloseTo(1155.75 / 12, 5);
  });

  it('is eligible when the installment fits within 40% of net income', () => {
    const r = calculateLoan(baseInput);
    expect(r.maxInstallment).toBe(1000 * DTI_RATIO);
    expect(r.monthlyInstallment).toBeLessThanOrEqual(r.maxInstallment);
    expect(r.isEligible).toBe(true);
  });

  it('rejects when the installment exceeds the 40% DTI ceiling', () => {
    const r = calculateLoan({ ...baseInput, loanAmount: 100000, netIncome: 500 });
    expect(r.maxInstallment).toBe(200);
    expect(r.monthlyInstallment).toBeGreaterThan(r.maxInstallment);
    expect(r.isEligible).toBe(false);
  });

  it('reports the DTI percentage including current deductions', () => {
    const r = calculateLoan({ ...baseInput, netIncome: 1000, currentDeductions: 100 });
    expect(r.dtiPercentage).toBeCloseTo(((100 + r.monthlyInstallment) / 1000) * 100, 5);
  });

  it('falls back to the first product for an unknown product id', () => {
    const r = calculateLoan({ ...baseInput, productId: 'does-not-exist' });
    expect(r.profitRate).toBe(LOAN_PRODUCTS[0].profitRate * 100);
  });

  it('clamps negative and missing inputs to safe minimums', () => {
    const r = calculateLoan({
      productId: 'appliances',
      loanAmount: -500,
      netIncome: -100,
      currentDeductions: -50,
      durationYears: 0,
    });
    expect(r.netFinancing).toBe(0);
    expect(r.maxInstallment).toBe(0);
    expect(r.isEligible).toBe(false);
  });
});

describe('generateReferenceNo', () => {
  it('matches the MDB-<year>-<4digit> format', () => {
    const ref = generateReferenceNo();
    expect(ref).toMatch(/^MDB-\d{4}-\d{4}$/);
    expect(ref).toContain(String(new Date().getFullYear()));
  });
});

describe('formatJODNumber', () => {
  it('formats a number to two decimals', () => {
    expect(formatJODNumber(1155.75)).toBe('1155.75');
    expect(formatJODNumber(96.3125)).toBe('96.31');
  });
});
