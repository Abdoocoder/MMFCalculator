import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { INITIAL_MEMBER_PROFILE } from './data/mockData';
import type { CalculationResult, LoanRecord } from './types';

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
  vi.stubGlobal('matchMedia', matchMediaMock);
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('App localStorage guards and persistence', () => {
  it('renders with fallback data when localStorage reads are blocked', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('storage denied');
    });
    render(<App />);
    expect(screen.getAllByText(INITIAL_MEMBER_PROFILE.fullName).length).toBeGreaterThan(0);
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

  it('still toggles dark mode when localStorage writes are blocked', async () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota exceeded');
    });
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'تغيير المظهر' }));
    expect(document.documentElement.classList.contains('dark')).toBe(true);
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
    const record: LoanRecord = {
      id: 'rec_9000',
      referenceNo: 'MDB-2026-7777',
      date: '2026-08-01',
      productName: 'مرابحة الأجهزة الكهربائية والإلكترونية',
      loanAmount: 500,
      netIncome: 200,
      durationYears: 1,
      monthlyInstallment: 48.16,
      totalWithInsurance: 577.88,
      status: 'draft',
      resultSnapshot: snapshot,
    };
    localStorage.setItem('mmf-records', JSON.stringify([record]));

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
});
