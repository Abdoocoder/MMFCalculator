import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import LandingPage from './LandingPage';
import { LOAN_PRODUCTS } from '../utils/loanCalculator';
import { ASSOCIATION_ANNOUNCEMENTS } from '../data/mockData';

beforeEach(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

afterEach(() => {
  vi.restoreAllMocks();
  // jsdom does not implement scrollIntoView — drop the stub back off.
  Element.prototype.scrollIntoView = undefined as unknown as () => void;
});

describe('LandingPage', () => {
  it('renders the persuasion arc end to end', () => {
    render(<LandingPage onLaunchApp={() => {}} />);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText('مفتاح الدفاتر: ماذا تعني كل نجمة؟')).toBeInTheDocument();
    expect(screen.getAllByText(/دفتر التسوية/).length).toBeGreaterThan(0);
    expect(screen.getAllByText('كيف تعمل').length).toBeGreaterThan(0);
    expect(screen.getAllByText('إعلانات الجمعية').length).toBeGreaterThan(0);
  });

  it('lists every product line', () => {
    render(<LandingPage onLaunchApp={() => {}} />);
    for (const p of LOAN_PRODUCTS) {
      expect(screen.getAllByText(p.name).length).toBeGreaterThan(0);
    }
  });

  it('shows real association announcements', () => {
    render(<LandingPage onLaunchApp={() => {}} />);
    for (const a of ASSOCIATION_ANNOUNCEMENTS) {
      expect(screen.getByText(a.title)).toBeInTheDocument();
    }
  });

  it('pre-selects a product from its ledger row', () => {
    render(<LandingPage onLaunchApp={() => {}} />);
    const select = screen.getByLabelText('نوع التمويل') as HTMLSelectElement;
    expect(select.value).toBe('appliances');

    const rowButtons = screen.getAllByRole('button', { name: 'احسب هذا المنتج' });
    fireEvent.click(rowButtons[2]);
    expect(select.value).toBe('vehicles');
  });

  it('launches the app from the final CTA', () => {
    const onLaunchApp = vi.fn();
    render(<LandingPage onLaunchApp={onLaunchApp} />);
    fireEvent.click(screen.getByRole('button', { name: 'افتح الحاسبة الكاملة' }));
    expect(onLaunchApp).toHaveBeenCalledOnce();
  });

  it('credits the maker in the footer', () => {
    render(<LandingPage onLaunchApp={() => {}} />);
    const link = screen.getByRole('link', { name: 'Abdoo Coder' });
    expect(link).toHaveAttribute('href', 'https://www.abdoocoder.dev/');
  });
});
