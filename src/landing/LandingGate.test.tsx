import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LandingGate from './LandingGate';

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
});
