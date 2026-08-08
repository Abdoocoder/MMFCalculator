import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoanCalculator } from './LoanCalculator';
import type { LoanRecord, MemberProfile } from '../types';

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

describe('LoanCalculator', () => {
  it('saves a draft and submits a pending application, both with a result snapshot', async () => {
    const onSaveRecord = vi.fn();
    const user = userEvent.setup();
    render(<LoanCalculator profile={profile} onSaveRecord={onSaveRecord} />);

    await user.click(screen.getByRole('button', { name: 'حفظ الحسبة' }));
    expect(onSaveRecord).toHaveBeenCalledTimes(1);
    const draft = onSaveRecord.mock.calls[0][0] as LoanRecord;
    expect(draft.status).toBe('draft');
    expect(draft.referenceNo).toMatch(/^MDB-\d{4}-\d{4}$/);
    expect(draft.loanAmount).toBe(500);
    expect(draft.resultSnapshot?.profitRate).toBe(15);
    expect(screen.getByText(/تم حفظ الحسبة في قائمة السجلات/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'تقديم طلب المرابحة' }));
    expect(onSaveRecord).toHaveBeenCalledTimes(2);
    const pending = onSaveRecord.mock.calls[1][0] as LoanRecord;
    expect(pending.status).toBe('pending');
    expect(pending.resultSnapshot?.monthlyInstallment).toBeCloseTo(
      draft.resultSnapshot!.monthlyInstallment,
      5
    );
  });

  it('warns when the requested amount exceeds the DTI cap', async () => {
    const user = userEvent.setup();
    render(<LoanCalculator profile={profile} onSaveRecord={vi.fn()} />);

    const amount = screen.getByLabelText('المبلغ المطلوب (دينار)');
    await user.clear(amount);
    await user.type(amount, '100000');

    expect(screen.getByText(/تنبيه: القسط الشهري/)).toBeInTheDocument();
  });
});
