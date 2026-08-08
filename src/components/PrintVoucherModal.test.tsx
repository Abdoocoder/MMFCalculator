import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PrintVoucherModal } from './PrintVoucherModal';
import type { CalculationInput, CalculationResult, MemberProfile } from '../types';

const input: CalculationInput = {
  productId: 'appliances',
  loanAmount: 1000,
  netIncome: 1000,
  currentDeductions: 0,
  durationYears: 1,
};

const result: CalculationResult = {
  netFinancing: 1000,
  profitRate: 15,
  annualProfit: 150,
  totalProfit: 150,
  totalPayable: 1150,
  annualInsurance: 5.75,
  totalInsurance: 5.75,
  totalWithInsurance: 1155.75,
  monthlyInstallment: 96.31,
  maxInstallment: 400,
  isEligible: true,
  dtiPercentage: 9.6,
};

const profile: MemberProfile = {
  id: 'mem_1',
  membershipNo: '12345',
  fullName: 'أحمد محمود الشوابكة',
  nationalId: '9851023456',
  department: 'مديرية الهندسة والمشاريع',
  jobTitle: 'رئيس قسم التخطيط العمراني',
  netSalary: 200,
  currentDeductions: 0,
  phone: '0791234567',
  joinDate: '2018-04-15',
  activeLoanCount: 1,
  totalLoansPaid: 3,
};

const renderModal = (overrides: Partial<Parameters<typeof PrintVoucherModal>[0]> = {}) => {
  const props = {
    isOpen: true,
    onClose: vi.fn(),
    input,
    result,
    profile,
    productName: 'مرابحة الأجهزة الكهربائية والإلكترونية',
    ...overrides,
  };
  const utils = render(<PrintVoucherModal {...props} />);
  return { props, utils };
};

const extractCalcRef = (): string =>
  screen.getByText(/MDB-CALC-\d{4}/).textContent?.match(/MDB-CALC-\d{4}/)?.[0] ?? '';

describe('PrintVoucherModal', () => {
  it('keeps a provided referenceNo and does not regenerate it', () => {
    const { props, utils } = renderModal({ referenceNo: 'MDB-2026-0842' });
    expect(screen.getByText(/MDB-2026-0842/)).toBeInTheDocument();

    utils.rerender(<PrintVoucherModal {...props} referenceNo="MDB-2026-0842" />);
    expect(screen.getByText(/MDB-2026-0842/)).toBeInTheDocument();
  });

  it('regenerates a MDB-CALC reference each time it opens without a referenceNo', () => {
    const { props, utils } = renderModal({ isOpen: false });
    utils.rerender(<PrintVoucherModal {...props} isOpen />);
    const first = extractCalcRef();
    expect(first).toMatch(/^MDB-CALC-\d{4}$/);

    utils.rerender(<PrintVoucherModal {...props} isOpen={false} />);
    utils.rerender(<PrintVoucherModal {...props} isOpen />);
    const second = extractCalcRef();
    expect(second).toMatch(/^MDB-CALC-\d{4}$/);
    expect(second).not.toBe(first);
  });

  it('closes when Escape is pressed', () => {
    const { props } = renderModal();
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(props.onClose).toHaveBeenCalledTimes(1);
  });

  it('traps Tab focus inside the dialog', () => {
    renderModal();
    const buttons = screen.getAllByRole('button');
    const first = buttons[0];
    const last = buttons[buttons.length - 1];

    first.focus();
    fireEvent.keyDown(window, { key: 'Tab', shiftKey: true });
    expect(last).toHaveFocus();

    last.focus();
    fireEvent.keyDown(window, { key: 'Tab' });
    expect(first).toHaveFocus();
  });

  it('restores focus to the previously focused element on close', () => {
    const { props, utils } = renderModal({ isOpen: false });
    const trigger = document.createElement('button');
    document.body.appendChild(trigger);
    trigger.focus();

    utils.rerender(<PrintVoucherModal {...props} isOpen />);
    utils.rerender(<PrintVoucherModal {...props} isOpen={false} />);
    expect(trigger).toHaveFocus();
    trigger.remove();
  });

  it('calls window.print when the print action is clicked', async () => {
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});
    const user = userEvent.setup();
    renderModal();
    await user.click(screen.getByRole('button', { name: /اطبع التقرير الآن/ }));
    expect(printSpy).toHaveBeenCalledTimes(1);
    printSpy.mockRestore();
  });

  it('shows the eligible status when the installment fits and warns when it does not', () => {
    const { props, utils } = renderModal();
    expect(screen.getByText(/الحسبة متوافقة مع شروط الاقتطاع/)).toBeInTheDocument();

    utils.rerender(
      <PrintVoucherModal {...props} result={{ ...result, isEligible: false }} />
    );
    expect(screen.getByText(/القسط الشهري يتجاوز الحد الأعلى المسموح/)).toBeInTheDocument();
    expect(screen.queryByText(/الحسبة متوافقة/)).not.toBeInTheDocument();
  });
});
