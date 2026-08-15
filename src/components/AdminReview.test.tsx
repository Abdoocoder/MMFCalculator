import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { AdminReview } from './AdminReview';
import type { AdminApplication } from '../types';

const applications: AdminApplication[] = [
  {
    record: {
      id: 'a1',
      referenceNo: 'MDB-2026-1001',
      date: '2026-08-01',
      productName: 'مرابحة الأجهزة الكهربائية والإلكترونية',
      loanAmount: 500,
      netIncome: 200,
      durationYears: 1,
      monthlyInstallment: 48.16,
      totalWithInsurance: 577.88,
      status: 'pending',
    },
    member: {
      membershipNo: 'MDB-1001',
      fullName: 'أحمد محمود الشوابكة',
      department: 'قسم الحاسوب',
      phone: '0791112223',
    },
  },
  {
    record: {
      id: 'a2',
      referenceNo: 'MDB-2026-1002',
      date: '2026-08-02',
      productName: 'مرابحة الأثاث ومواد البناء والترميم',
      loanAmount: 1200,
      netIncome: 350,
      durationYears: 2,
      monthlyInstallment: 65.65,
      totalWithInsurance: 1575.6,
      status: 'approved',
    },
    member: {
      membershipNo: 'MDB-1002',
      fullName: 'سامي عودة الحجايا',
      department: 'قسم التخطيط',
      phone: '0792223334',
    },
  },
];

const renderAdminReview = (overrides: Partial<Parameters<typeof AdminReview>[0]> = {}) => {
  const props = {
    applications,
    onDecide: vi.fn(),
    isSubmitting: false,
    ...overrides,
  };
  render(<AdminReview {...props} />);
  return props;
};

describe('AdminReview', () => {
  it('renders the review heading and member/loan details', () => {
    renderAdminReview();
    expect(screen.getByText('مراجعة الطلبات')).toBeInTheDocument();
    expect(screen.getByText('أحمد محمود الشوابكة')).toBeInTheDocument();
    expect(screen.getByText('MDB-1001')).toBeInTheDocument();
    expect(screen.getByText('قسم الحاسوب')).toBeInTheDocument();
    expect(screen.getByText('0791112223')).toBeInTheDocument();
  });

  it('shows approve/reject actions for pending applications', () => {
    renderAdminReview();
    const pendingCard = screen.getByText('أحمد محمود الشوابكة').closest('[data-testid="admin-application"]') as HTMLElement;
    expect(within(pendingCard).getByRole('button', { name: /موافقة/ })).toBeInTheDocument();
    expect(within(pendingCard).getByRole('button', { name: /رفض/ })).toBeInTheDocument();
  });

  it('shows a change-decision action for already-decided applications', () => {
    renderAdminReview();
    const decidedCard = screen.getByText('سامي عودة الحجايا').closest('[data-testid="admin-application"]') as HTMLElement;
    expect(within(decidedCard).getByRole('button', { name: /تغيير القرار/ })).toBeInTheDocument();
    expect(within(decidedCard).queryByRole('button', { name: /موافقة/ })).toBeNull();
  });

  it('calls onDecide with approve when the approve button is clicked', () => {
    const { onDecide } = renderAdminReview();
    const pendingCard = screen.getByText('أحمد محمود الشوابكة').closest('[data-testid="admin-application"]') as HTMLElement;
    fireEvent.click(within(pendingCard).getByRole('button', { name: /موافقة/ }));
    expect(onDecide).toHaveBeenCalledWith('a1', 'approved');
  });

  it('calls onDecide with reject when the reject button is clicked', () => {
    const { onDecide } = renderAdminReview();
    const pendingCard = screen.getByText('أحمد محمود الشوابكة').closest('[data-testid="admin-application"]') as HTMLElement;
    fireEvent.click(within(pendingCard).getByRole('button', { name: /رفض/ }));
    expect(onDecide).toHaveBeenCalledWith('a1', 'rejected');
  });

  it('calls onDecide with the opposite status from a decided card', () => {
    const { onDecide } = renderAdminReview();
    const decidedCard = screen.getByText('سامي عودة الحجايا').closest('[data-testid="admin-application"]') as HTMLElement;
    fireEvent.click(within(decidedCard).getByRole('button', { name: /تغيير القرار/ }));
    expect(onDecide).toHaveBeenCalledWith('a2', 'rejected');
  });

  it('filters applications by status chip', () => {
    renderAdminReview();
    expect(screen.getAllByTestId('admin-application')).toHaveLength(2);

    fireEvent.click(screen.getByRole('button', { name: /المعتمدة/ }));
    expect(screen.getAllByTestId('admin-application')).toHaveLength(1);
    expect(screen.getByText('سامي عودة الحجايا')).toBeInTheDocument();
    expect(screen.queryByText('أحمد محمود الشوابكة')).toBeNull();
  });

  it('shows an empty state when no applications match', () => {
    renderAdminReview({ applications: [] });
    expect(screen.getByText('لا توجد طلبات')).toBeInTheDocument();
  });

  it('renders an application whose owner has no profile', () => {
    renderAdminReview({
      applications: [{ ...applications[0], member: null }],
    });
    expect(screen.queryByText('أحمد محمود الشوابكة')).toBeNull();
    expect(screen.getByText('عضو بدون ملف تعريف')).toBeInTheDocument();
    expect(screen.getByText('MDB-2026-1001')).toBeInTheDocument();
  });
});
