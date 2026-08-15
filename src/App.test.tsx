import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import type { CalculationResult, MemberProfile, LoanRecord } from './types';

const mocks = vi.hoisted(() => {
  const profileDoc = {
    _id: 'mem_1',
    userId: 'user_1',
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
  } as const;

  const recordDoc = {
    _id: 'rec_9000',
    referenceNo: 'MDB-2026-7777',
    date: '2026-08-01',
    productName: 'مرابحة الأجهزة الكهربائية والإلكترونية',
    loanAmount: 500,
    netIncome: 200,
    durationYears: 1,
    monthlyInstallment: 48.16,
    totalWithInsurance: 577.88,
    status: 'draft',
    notes: undefined,
    resultSnapshot: null,
  } as const;

  return {
    profile: profileDoc as unknown as (typeof profileDoc & { _id: string }) | null,
    records: [] as unknown[],
    role: null as string | null | undefined,
    applications: [] as unknown[],
    mutations: {
      createRecord: vi.fn(),
      updateRecordStatus: vi.fn(),
      deleteRecord: vi.fn(),
      upsertProfile: vi.fn(),
      setDecision: vi.fn(),
    },
  };
});

vi.mock('convex/react', async () => {
  const { getFunctionName } = await import('convex/server');
  return {
    useQuery: (ref: any) => {
      const name = getFunctionName(ref);
      if (name === 'loanRecords:listMy') return mocks.records;
      if (name === 'auth:getMyRole') return mocks.role;
      if (name === 'admin:listApplications') return mocks.applications;
      return mocks.profile;
    },
    useMutation: (ref: any) => {
      const name = getFunctionName(ref);
      if (name === 'loanRecords:create') return mocks.mutations.createRecord;
      if (name === 'loanRecords:updateStatus') return mocks.mutations.updateRecordStatus;
      if (name === 'loanRecords:deleteDraft') return mocks.mutations.deleteRecord;
      if (name === 'admin:setDecision') return mocks.mutations.setDecision;
      return mocks.mutations.upsertProfile;
    },
  };
});

const matchMediaMock = (query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
});

beforeEach(() => {
  localStorage.clear();
  document.documentElement.className = '';
  mocks.profile = {
    _id: 'mem_1',
    userId: 'user_1',
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
  mocks.records = [];
  mocks.role = null;
  mocks.applications = [];
  vi.stubGlobal('matchMedia', matchMediaMock);
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('App with Convex queries and mutations', () => {
  it('renders the calculator with the profile loaded from Convex', () => {
    render(<App />);
    expect(screen.getAllByText('أحمد محمود الشوابكة').length).toBeGreaterThan(0);
    expect(screen.getByText(/نسبة الربح المعتمدة/)).toBeInTheDocument();
  });

  it('initializes dark mode from the stored raw string', () => {
    localStorage.setItem('mmf-dark-mode', 'true');
    const first = render(<App />);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    first.unmount();

    localStorage.setItem('mmf-dark-mode', 'false');
    render(<App />);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('toggles dark mode and persists the raw boolean strings', async () => {
    const user = userEvent.setup();
    render(<App />);
    expect(localStorage.getItem('mmf-dark-mode')).toBe('false');

    await user.click(screen.getByRole('button', { name: 'تغيير المظهر' }));
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(localStorage.getItem('mmf-dark-mode')).toBe('true');

    await user.click(screen.getByRole('button', { name: 'تغيير المظهر' }));
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(localStorage.getItem('mmf-dark-mode')).toBe('false');
  });

  it('opens the print modal for a saved record using its stored result snapshot', async () => {
    const snapshot: CalculationResult = {
      netFinancing: 500,
      profitRate: 42,
      annualProfit: 0,
      totalProfit: 0,
      totalPayable: 0,
      annualInsurance: 0,
      totalInsurance: 0,
      totalWithInsurance: 0,
      monthlyInstallment: 123.45,
      maxInstallment: 80,
      isEligible: true,
      dtiPercentage: 0,
    };
    mocks.records = [
      {
        _id: 'rec_9000',
        referenceNo: 'MDB-2026-7777',
        date: '2026-08-01',
        productName: 'مرابحة الأجهزة الكهربائية والإلكترونية',
        loanAmount: 500,
        netIncome: 200,
        durationYears: 1,
        monthlyInstallment: 48.16,
        totalWithInsurance: 577.88,
        status: 'draft',
        notes: undefined,
        resultSnapshot: snapshot,
      },
    ];

    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'السجلات' }));
    await user.click(screen.getByRole('button', { name: 'طباعة' }));

    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText(/MDB-2026-7777/)).toBeInTheDocument();
    expect(within(dialog).getByText('42%')).toBeInTheDocument();
    expect(within(dialog).getByText(/123.45/)).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'Escape' });
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('shows a loading state before the Convex profile arrives', () => {
    mocks.profile = null;
    render(<App />);
    expect(screen.getByText(/جارٍ تحميل الملف الشخصي/)).toBeInTheDocument();
  });

  it('lets an admin through the loading gate even without a member profile', () => {
    mocks.profile = null;
    mocks.role = 'admin';
    render(<App />);
    expect(screen.queryByText(/جارٍ تحميل الملف الشخصي/)).toBeNull();
    expect(screen.getByRole('button', { name: 'مراجعة الطلبات' })).toBeInTheDocument();
  });

  it('does not show the admin tab for a non-admin member', () => {
    mocks.role = 'member';
    render(<App />);
    expect(screen.queryByRole('button', { name: 'مراجعة الطلبات' })).toBeNull();
  });

  it('renders the admin review screen when an admin opens the tab', async () => {
    mocks.role = 'admin';
    mocks.applications = [
      {
        record: {
          _id: 'rec_1',
          referenceNo: 'MDB-2026-5001',
          date: '2026-08-10',
          productName: 'مرابحة الأجهزة الكهربائية والإلكترونية',
          loanAmount: 500,
          netIncome: 200,
          durationYears: 1,
          monthlyInstallment: 48.16,
          totalWithInsurance: 577.88,
          status: 'pending',
        },
        member: {
          _id: 'mem_1',
          membershipNo: 'MDB-1001',
          fullName: 'أحمد محمود الشوابكة',
          department: 'قسم الحاسوب',
          phone: '0791112223',
        },
      },
    ];
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'مراجعة الطلبات' }));

    expect(screen.getAllByText('مراجعة الطلبات').length).toBeGreaterThan(0);
    expect(screen.getByText('MDB-2026-5001')).toBeInTheDocument();
  });

  it('lets an admin decide an application from the review screen', async () => {
    mocks.role = 'admin';
    mocks.applications = [
      {
        record: {
          _id: 'rec_1',
          referenceNo: 'MDB-2026-5001',
          date: '2026-08-10',
          productName: 'مرابحة الأجهزة الكهربائية والإلكترونية',
          loanAmount: 500,
          netIncome: 200,
          durationYears: 1,
          monthlyInstallment: 48.16,
          totalWithInsurance: 577.88,
          status: 'pending',
        },
        member: {
          _id: 'mem_1',
          membershipNo: 'MDB-1001',
          fullName: 'أحمد محمود الشوابكة',
          department: 'قسم الحاسوب',
          phone: '0791112223',
        },
      },
    ];
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'مراجعة الطلبات' }));

    await user.click(screen.getByRole('button', { name: /موافقة/ }));
    expect(mocks.mutations.setDecision).toHaveBeenCalledWith({
      id: 'rec_1',
      status: 'approved',
    });
  });

  it('renders the home dashboard with profile stats and navigates via quick actions', async () => {
    mocks.records = [
      {
        _id: 'rec_1',
        referenceNo: 'MDB-2026-1001',
        date: '2026-08-01',
        productName: 'مرابحة الأجهزة الكهربائية والإلكترونية',
        loanAmount: 500,
        netIncome: 200,
        durationYears: 1,
        monthlyInstallment: 48.16,
        totalWithInsurance: 577.88,
        status: 'pending',
        notes: undefined,
        resultSnapshot: null,
      },
      {
        _id: 'rec_2',
        referenceNo: 'MDB-2026-1002',
        date: '2026-08-02',
        productName: 'مرابحة الأثاث المنزلي',
        loanAmount: 750,
        netIncome: 300,
        durationYears: 2,
        monthlyInstallment: 40.5,
        totalWithInsurance: 972.0,
        status: 'approved',
        notes: undefined,
        resultSnapshot: null,
      },
    ];

    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getAllByRole('button', { name: 'الرئيسية' })[0]);

    expect(screen.getByText('أهلاً بك، أحمد محمود الشوابكة')).toBeInTheDocument();
    expect(screen.getAllByText('MDB-1001').length).toBeGreaterThan(0);
    expect(screen.getByText('850.00 د.أ')).toBeInTheDocument();
    expect(screen.getByText('1 طلب')).toBeInTheDocument();
    expect(screen.getByText('1 سلفة')).toBeInTheDocument();
    expect(screen.getByText('إعلانات وتعليمات الجمعية')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'ابدأ حاسبة المرابحة' }));
    expect(screen.getByText(/نسبة الربح المعتمدة/)).toBeInTheDocument();

    await user.click(screen.getAllByRole('button', { name: 'الرئيسية' })[0]);
    await user.click(screen.getByRole('button', { name: /استعراض السجلات والطلبات/ }));
    expect(screen.getByText('سجل الطلبات والحسبات المحفوظة')).toBeInTheDocument();
    expect(screen.getByText('MDB-2026-1001')).toBeInTheDocument();
    expect(screen.getByText('750.00 د.أ')).toBeInTheDocument();
  });

  it('exposes a skip link to the main content region', () => {
    render(<App />);
    const skip = screen.getByRole('link', { name: 'تخطي إلى المحتوى الرئيسي' });
    expect(skip).toHaveAttribute('href', '#main-content');
    const main = document.getElementById('main-content');
    expect(main).not.toBeNull();
    expect(main).toHaveAttribute('tabindex', '-1');
  });

  it('marks the active navigation item with aria-current="true"', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: 'الحاسبة' })).toHaveAttribute('aria-current', 'true');
    expect(screen.getByRole('button', { name: 'حاسبة المرابحة' })).toHaveAttribute(
      'aria-current',
      'true',
    );
    for (const home of screen.getAllByRole('button', { name: 'الرئيسية' })) {
      expect(home).not.toHaveAttribute('aria-current');
    }
  });

  it('moves focus to the main content region when the tab changes', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getAllByRole('button', { name: 'الرئيسية' })[0]);
    expect(document.getElementById('main-content')).toHaveFocus();
  });

  it('shows a dismissible error toast and clears it on dismiss', async () => {
    mocks.mutations.createRecord.mockRejectedValueOnce(new Error('network'));
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: 'حفظ الحسبة' }));
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(/تعذر حفظ الحسبة/);

    await user.click(screen.getByRole('button', { name: 'إغلاق رسالة الخطأ' }));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('updates the profile from the profile tab', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getAllByRole('button', { name: 'الملف الشخصي' })[0]);
    expect(screen.getByText('الملف الشخصي والبيانات الوظيفية')).toBeInTheDocument();

    const nameInput = screen.getByLabelText('اسم الموظف الثلاثي');
    await user.clear(nameInput);
    await user.type(nameInput, 'عمر خالد العبدالله');
    await user.click(screen.getByRole('button', { name: 'حفظ التغييرات' }));

    expect(mocks.mutations.upsertProfile).toHaveBeenCalledTimes(1);
    expect(mocks.mutations.upsertProfile).toHaveBeenCalledWith(
      expect.objectContaining({
        profile: expect.objectContaining({ fullName: 'عمر خالد العبدالله' }),
      }),
    );
    expect(screen.getByRole('status')).toHaveTextContent(/تم حفظ بياناتك/);
  });
});
