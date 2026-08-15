import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Sidebar } from './Sidebar';
import type { MemberProfile } from '../types';

const profile: MemberProfile = {
  id: 'mem_1',
  membershipNo: 'MDB-1001',
  fullName: 'أحمد محمود الشوابكة',
  nationalId: '9876543210',
  department: 'قسم الحاسوب',
  jobTitle: 'مطور برمجيات',
  netSalary: 850,
  currentDeductions: 120,
  phone: '0791112223',
  joinDate: '2020-03-15',
  activeLoanCount: 1,
  totalLoansPaid: 0,
};

describe('Sidebar', () => {
  it('renders member navigation without the admin tab by default', () => {
    render(<Sidebar activeTab="home" setActiveTab={vi.fn()} profile={profile} />);
    expect(screen.getByText('أحمد محمود الشوابكة')).toBeInTheDocument();
    expect(screen.queryByText('مراجعة الطلبات')).toBeNull();
  });

  it('shows the admin review tab for admins', () => {
    render(<Sidebar activeTab="home" setActiveTab={vi.fn()} profile={profile} isAdmin />);
    expect(screen.getByText('مراجعة الطلبات')).toBeInTheDocument();
  });

  it('handles a null profile (admin without member profile)', () => {
    render(<Sidebar activeTab="admin" setActiveTab={vi.fn()} profile={null} isAdmin />);
    expect(screen.getByText('الإدارة')).toBeInTheDocument();
    expect(screen.getByText('مراجعة الطلبات')).toBeInTheDocument();
  });
});
