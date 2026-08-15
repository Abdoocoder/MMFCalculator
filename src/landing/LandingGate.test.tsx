import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LandingGate from './LandingGate';

const authMocks = vi.hoisted(() => ({
  isLoaded: true,
  isSignedIn: true,
  profile: null as Record<string, unknown> | null,
  records: [] as unknown[],
}));

vi.mock('@clerk/clerk-react', () => ({
  useAuth: () => ({ isLoaded: authMocks.isLoaded, isSignedIn: authMocks.isSignedIn }),
}));

vi.mock('convex/react', async () => {
  const { getFunctionName } = await import('convex/server');
  return {
    useQuery: (ref: any) => {
      const name = getFunctionName(ref);
      if (name === 'loanRecords:listMy') return authMocks.records;
      if (name === 'admin:listApplications') return [];
      if (name === 'auth:getMyRole') return null;
      return authMocks.profile;
    },
    useMutation: () => vi.fn(),
  };
});

vi.mock('../auth/SignInScreen', () => ({
  default: () => <div data-testid="sign-in-screen" />,
}));

vi.mock('../auth/SignUpForm', () => ({
  default: () => <div data-testid="sign-up-form" />,
}));

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
  window.location.hash = '';
  authMocks.isLoaded = true;
  authMocks.isSignedIn = true;
  authMocks.records = [];
  authMocks.profile = {
    _id: "mem_1",
    userId: "user_1",
    membershipNo: "MDB-1001",
    fullName: "أحمد محمود الشوابكة",
    nationalId: "9876543210",
    department: "قسم الحاسوب",
    jobTitle: "مطور برمجيات",
    netSalary: 850,
    currentDeductions: 120,
    phone: "0791112223",
    joinDate: "2020-03-15",
    activeLoanCount: 1,
    totalLoansPaid: 0,
  };
  vi.stubGlobal('matchMedia', matchMediaMock);
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
});

afterEach(() => {
  window.location.hash = '';
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('LandingGate', () => {
  it('renders the landing page by default', () => {
    render(<LandingGate />);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('mounts the app when the hash is #app', async () => {
    render(<LandingGate />);
    window.location.hash = '#app';
    await waitFor(() => expect(screen.getByText(/نسبة الربح المعتمدة/)).toBeInTheDocument());
  });

  it('launches the app from the top-bar CTA', async () => {
    render(<LandingGate />);
    fireEvent.click(screen.getByRole('button', { name: 'افتح الحاسبة' }));
    await waitFor(() => expect(screen.getByText(/نسبة الربح المعتمدة/)).toBeInTheDocument());
  });

  it('returns to the landing when the hash is cleared', async () => {
    render(<LandingGate />);
    window.location.hash = '#app';
    await waitFor(() => expect(screen.getByText(/نسبة الربح المعتمدة/)).toBeInTheDocument());

    window.location.hash = '';
    await waitFor(() => expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument());
  });

  it('shows the sign-in screen instead of the app when signed out on #app', async () => {
    authMocks.isSignedIn = false;
    render(<LandingGate />);
    window.location.hash = '#app';
    await waitFor(() => expect(screen.getByTestId('sign-in-screen')).toBeInTheDocument());
    expect(screen.queryByText(/نسبة الربح المعتمدة/)).not.toBeInTheDocument();
  });

  it('shows the sign-up form on first login (no profile row) on #app', async () => {
    authMocks.profile = null;
    render(<LandingGate />);
    window.location.hash = '#app';
    await waitFor(() => expect(screen.getByTestId('sign-up-form')).toBeInTheDocument());
    expect(screen.queryByText(/نسبة الربح المعتمدة/)).not.toBeInTheDocument();
  });
});
