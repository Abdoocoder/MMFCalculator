import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ApplicationsHistory } from './ApplicationsHistory';
import type { LoanRecord } from '../types';

const records: LoanRecord[] = [
  {
    id: 'r1',
    referenceNo: 'MDB-2026-0842',
    date: '2026-08-01',
    productName: 'مرابحة الأجهزة الكهربائية والإلكترونية',
    loanAmount: 500,
    netIncome: 200,
    durationYears: 1,
    monthlyInstallment: 48.16,
    totalWithInsurance: 577.88,
    status: 'approved',
  },
  {
    id: 'r2',
    referenceNo: 'MDB-2026-0911',
    date: '2026-08-05',
    productName: 'مرابحة الأثاث ومواد البناء والترميم',
    loanAmount: 1200,
    netIncome: 350,
    durationYears: 2,
    monthlyInstallment: 65.65,
    totalWithInsurance: 1575.6,
    status: 'pending',
  },
  {
    id: 'r3',
    referenceNo: 'MDB-2026-0999',
    date: '2026-08-06',
    productName: 'مرابحة السلع والمستلزمات العائلية',
    loanAmount: 800,
    netIncome: 300,
    durationYears: 1,
    monthlyInstallment: 80,
    totalWithInsurance: 924.6,
    status: 'draft',
  },
];

const renderHistory = (overrides: Partial<Parameters<typeof ApplicationsHistory>[0]> = {}) => {
  const props = {
    records,
    onDeleteRecord: vi.fn(),
    onPrintRecord: vi.fn(),
    ...overrides,
  };
  render(<ApplicationsHistory {...props} />);
  return props;
};

describe('ApplicationsHistory', () => {
  it('filters records by status', () => {
    renderHistory();
    expect(screen.getByText('مرابحة الأجهزة الكهربائية والإلكترونية')).toBeInTheDocument();
    expect(screen.getByText('مرابحة الأثاث ومواد البناء والترميم')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'قيد الدراسة' }));
    expect(screen.getByText('مرابحة الأثاث ومواد البناء والترميم')).toBeInTheDocument();
    expect(screen.queryByText('مرابحة الأجهزة الكهربائية والإلكترونية')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'المعتمدة' }));
    expect(screen.getByText('مرابحة الأجهزة الكهربائية والإلكترونية')).toBeInTheDocument();
    expect(screen.queryByText('مرابحة الأثاث ومواد البناء والترميم')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'المسودات' }));
    expect(screen.getByText('مرابحة السلع والمستلزمات العائلية')).toBeInTheDocument();
    expect(screen.queryByText('مرابحة الأجهزة الكهربائية والإلكترونية')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /^الكل/ }));
    expect(screen.getByText('مرابحة الأثاث ومواد البناء والترميم')).toBeInTheDocument();
  });

  it('searches by reference number and product name and shows an empty state', () => {
    renderHistory();
    const search = screen.getByLabelText('البحث في السجلات');

    fireEvent.change(search, { target: { value: '0842' } });
    expect(screen.getByText('مرابحة الأجهزة الكهربائية والإلكترونية')).toBeInTheDocument();
    expect(screen.queryByText('مرابحة الأثاث ومواد البناء والترميم')).not.toBeInTheDocument();

    fireEvent.change(search, { target: { value: 'الأثاث' } });
    expect(screen.getByText('مرابحة الأثاث ومواد البناء والترميم')).toBeInTheDocument();

    fireEvent.change(search, { target: { value: 'zzz' } });
    expect(screen.getByText('لا توجد سجلات مطابقة')).toBeInTheDocument();
  });

  it('calls onDeleteRecord and onPrintRecord with the right record', async () => {
    const onDeleteRecord = vi.fn();
    const onPrintRecord = vi.fn();
    const user = userEvent.setup();
    renderHistory({ onDeleteRecord, onPrintRecord });

    // Only drafts expose a delete (trash) button — submitted records are final.
    expect(screen.getAllByRole('button', { name: 'حذف السجل' })).toHaveLength(1);
    await user.click(screen.getAllByRole('button', { name: 'حذف السجل' })[0]);
    expect(onDeleteRecord).toHaveBeenCalledWith('r3');

    await user.click(screen.getAllByRole('button', { name: 'طباعة' })[2]);
    expect(onPrintRecord).toHaveBeenCalledWith(records[2]);
  });
});
