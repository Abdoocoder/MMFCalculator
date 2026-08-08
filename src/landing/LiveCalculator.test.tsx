import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import LiveCalculator from './LiveCalculator';
import type { CalculationInput } from '../types';

const base: CalculationInput = {
  productId: 'appliances',
  loanAmount: 500,
  netIncome: 200,
  currentDeductions: 0,
  durationYears: 1,
};

describe('LiveCalculator', () => {
  it('proves the real approved record: 500 JOD over 1 year → 48.16 monthly, 577.88 total', () => {
    render(<LiveCalculator input={base} onChange={() => {}} onLaunchApp={() => {}} />);
    expect(screen.getByText('48.16')).toBeInTheDocument();
    expect(screen.getByText(/577\.88/)).toBeInTheDocument();
    expect(screen.getByText('24.1%')).toBeInTheDocument();
    expect(screen.getByText('مؤهل')).toBeInTheDocument();
  });

  it('recomputes when the member edits the amount', () => {
    const onChange = vi.fn();
    render(<LiveCalculator input={base} onChange={onChange} onLaunchApp={() => {}} />);
    fireEvent.change(screen.getByLabelText('مبلغ التمويل بالدينار'), { target: { value: '1000' } });
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ loanAmount: 1000 }));
  });

  it('switches product and caps the years to the product max', () => {
    const onChange = vi.fn();
    render(
      <LiveCalculator
        input={{ ...base, durationYears: 5 }}
        onChange={onChange}
        onLaunchApp={() => {}}
      />,
    );
    fireEvent.change(screen.getByLabelText('نوع التمويل'), { target: { value: 'goods_supplies' } });
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ productId: 'goods_supplies', durationYears: 3 }),
    );
  });

  it('launches the app from its CTA', () => {
    const onLaunchApp = vi.fn();
    render(<LiveCalculator input={base} onChange={() => {}} onLaunchApp={onLaunchApp} />);
    fireEvent.click(screen.getByRole('button', { name: 'احفظ واطّلع على الحاسبة الكاملة' }));
    expect(onLaunchApp).toHaveBeenCalledOnce();
  });

  it('flags ineligibility when the installment exceeds the 40% cap', () => {
    const input: CalculationInput = { ...base, loanAmount: 5000, netIncome: 300 };
    render(<LiveCalculator input={input} onChange={() => {}} onLaunchApp={() => {}} />);
    expect(screen.getByText('غير مؤهل')).toBeInTheDocument();
  });
});
