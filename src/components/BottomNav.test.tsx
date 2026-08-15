import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BottomNav } from './BottomNav';

describe('BottomNav', () => {
  it('renders member navigation without the admin tab by default', () => {
    render(<BottomNav activeTab="home" setActiveTab={vi.fn()} />);
    expect(screen.getByText('الحاسبة')).toBeInTheDocument();
    expect(screen.queryByText('المراجعة')).toBeNull();
  });

  it('shows the admin review tab for admins', () => {
    render(<BottomNav activeTab="home" setActiveTab={vi.fn()} isAdmin />);
    expect(screen.getByText('المراجعة')).toBeInTheDocument();
  });
});
