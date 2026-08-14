import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
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

  it('clamps the duration to the selected product max years', () => {
    render(<LandingPage onLaunchApp={() => {}} />);
    const duration = screen.getByLabelText('مدة التمويل بالسنوات') as HTMLSelectElement;
    fireEvent.change(duration, { target: { value: '5' } });
    expect(duration.value).toBe('5');

    const rowButtons = screen.getAllByRole('button', { name: 'احسب هذا المنتج' });
    fireEvent.click(rowButtons[3]);
    const select = screen.getByLabelText('نوع التمويل') as HTMLSelectElement;
    expect(select.value).toBe('goods_supplies');
    expect(duration.value).toBe('3');
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

  it('links the logo home to "/" and renders nav links on desktop and mobile', () => {
    render(<LandingPage onLaunchApp={() => {}} />);
    expect(screen.getByRole('link', { name: 'جمعية موظفي بلدية مادبا الكبرى' })).toHaveAttribute(
      'href',
      '/',
    );
    const navs = screen.getAllByRole('navigation', { name: 'التنقل الرئيسي' });
    expect(navs).toHaveLength(2);
    for (const nav of navs) {
      for (const href of ['#products', '#ledger', '#how', '#announcements']) {
        const links = within(nav)
          .getAllByRole('link')
          .filter((l) => l.getAttribute('href') === href);
        expect(links).toHaveLength(1);
      }
    }
  });

  it('respects prefers-reduced-motion: scrolls instantly when reduce is requested', () => {
    vi.stubGlobal(
      'matchMedia',
      (query: string) => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }),
    );
    try {
      render(<LandingPage onLaunchApp={() => {}} />);
      fireEvent.click(screen.getAllByRole('button', { name: 'احسب هذا المنتج' })[0]);
      expect(Element.prototype.scrollIntoView).toHaveBeenCalledWith(
        expect.objectContaining({ behavior: 'auto', block: 'start' }),
      );
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('scrolls smoothly when matchMedia exists and reduce is not requested', () => {
    vi.stubGlobal(
      'matchMedia',
      (query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }),
    );
    try {
      render(<LandingPage onLaunchApp={() => {}} />);
      fireEvent.click(screen.getAllByRole('button', { name: 'احسب هذا المنتج' })[0]);
      expect(Element.prototype.scrollIntoView).toHaveBeenCalledWith(
        expect.objectContaining({ behavior: 'smooth', block: 'start' }),
      );
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
