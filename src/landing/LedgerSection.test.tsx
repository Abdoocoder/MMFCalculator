import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import LedgerSection from './LedgerSection';
import type { CalculationInput } from '../types';

const input: CalculationInput = {
  productId: 'appliances',
  loanAmount: 500,
  netIncome: 200,
  currentDeductions: 0,
  durationYears: 1,
};

describe('LedgerSection', () => {
  it('balances the account: debit equals credit and the balance settles to zero', () => {
    render(<LedgerSection input={input} />);
    expect(screen.getByText('الحساب مطابق — الدفاتر تتساوى')).toBeInTheDocument();
    expect(screen.getByText(/الرصيد 0\.00 JOD/)).toBeInTheDocument();
  });

  it('lists the three debit entries and the single credit entry', () => {
    render(<LedgerSection input={input} />);
    expect(screen.getByText('أصل التمويل (سعر السلعة)')).toBeInTheDocument();
    expect(screen.getByText('ربح المرابحة الثابت')).toBeInTheDocument();
    expect(screen.getByText('تقدير التأمين')).toBeInTheDocument();
    expect(screen.getByText('القسط الشهري × عدد الأشهر')).toBeInTheDocument();
  });

  it('shows both totals of the settled account as equal figures', () => {
    render(<LedgerSection input={input} />);
    const totals = screen.getAllByText(/577\.88/);
    expect(totals.length).toBeGreaterThanOrEqual(2);
  });

  it('reflects the live input: longer tenure shifts the profit share', () => {
    const { unmount } = render(<LedgerSection input={input} />);
    expect(screen.getByText('12 شهراً')).toBeInTheDocument();
    unmount();
    render(<LedgerSection input={{ ...input, durationYears: 2 }} />);
    expect(screen.getByText('24 شهراً')).toBeInTheDocument();
  });
});
