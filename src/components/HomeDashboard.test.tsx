import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HomeDashboard } from './HomeDashboard';
import type { LoanRecord, MemberProfile } from '../types';

type Announcement = { id: string; title: string; content: string; date: string; type: string };

const announcements = vi.hoisted(() => ({
  value: [] as Announcement[],
}));

vi.mock('../data/mockData', () => ({
  get ASSOCIATION_ANNOUNCEMENTS() {
    return announcements.value;
  },
}));

const profile: MemberProfile = {
  id: 'mem_1',
  membershipNo: '12345',
  fullName: 'أحمد محمود الشوابكة',
  nationalId: '9851023456',
  department: 'مديرية الهندسة والمشاريع',
  jobTitle: 'رئيس قسم التخطيط العمراني',
  netSalary: 850,
  currentDeductions: 120,
  phone: '0791234567',
  joinDate: '2018-04-15',
  activeLoanCount: 1,
  totalLoansPaid: 3,
};

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
    status: 'pending',
  },
];

const renderDashboard = (overrides: Partial<Parameters<typeof HomeDashboard>[0]> = {}) => {
  const props = {
    profile,
    records,
    onNavigateToCalculator: vi.fn(),
    onNavigateToRecords: vi.fn(),
    ...overrides,
  };
  render(<HomeDashboard {...props} />);
  return props;
};

beforeAll(async () => {
  const real = await vi.importActual<typeof import('../data/mockData')>('../data/mockData');
  announcements.value = real.ASSOCIATION_ANNOUNCEMENTS;
});

describe('HomeDashboard', () => {
  it('uses a non-skipping heading order: h1 then h2 then h3', () => {
    renderDashboard();
    const headings = screen.getAllByRole('heading').map((h) => h.tagName);
    expect(headings[0]).toBe('H1');
    expect(headings).toContain('H2');
    expect(headings).toContain('H3');
    // No heading level is skipped between consecutive levels.
    for (let i = 1; i < headings.length; i++) {
      const prev = Number(headings[i - 1].slice(1));
      const next = Number(headings[i].slice(1));
      expect(next - prev).toBeLessThanOrEqual(1);
    }
  });

  it('navigates via the quick action buttons', async () => {
    const props = renderDashboard();
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /ابدأ حاسبة المرابحة/ }));
    expect(props.onNavigateToCalculator).toHaveBeenCalledTimes(1);
    await user.click(screen.getByRole('button', { name: /استعراض السجلات والطلبات/ }));
    expect(props.onNavigateToRecords).toHaveBeenCalledTimes(1);
  });

  it('derives the announcement month label from the latest announcement date', () => {
    renderDashboard();
    expect(screen.getByText('أغسطس 2026')).toBeInTheDocument();
  });

  it('renders an empty month label when there are no announcements', () => {
    const saved = announcements.value;
    announcements.value = [];
    try {
      renderDashboard();
      const heading = screen.getByRole('heading', { name: 'إعلانات وتعليمات الجمعية' });
      expect(heading.parentElement!.lastElementChild).toBeEmptyDOMElement();
      expect(screen.queryByText(/اعتماد المرابحة الإسلامية/)).not.toBeInTheDocument();
    } finally {
      announcements.value = saved;
    }
  });
});
