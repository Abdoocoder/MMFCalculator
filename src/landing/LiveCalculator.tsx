import { useMemo } from 'react';
import { calculateLoan, formatJODNumber, LOAN_PRODUCTS } from '../utils/loanCalculator';
import { CalculationInput } from '../types';
import { StarSeal } from './StarField';

interface LiveCalculatorProps {
  input: CalculationInput;
  onChange: (input: CalculationInput) => void;
  onLaunchApp: () => void;
}

/** Reusable field wrapper with a figure-prefixed label. */
function Field({ label, unit, children }: { label: string; unit?: string; children: React.ReactNode }) {
  return (
    <label className="block text-right">
      <span className="mb-1.5 block text-[13px] font-medium text-[#cfe0f2]">{label}</span>
      <span className="flex items-center gap-2 rounded-md border border-white/20 bg-white/10 px-3 focus-within:border-[#95ccff]">
        {children}
        {unit ? <span className="landing-figures-sm text-[#9db8d4]">{unit}</span> : null}
      </span>
    </label>
  );
}

const inputCls =
  'w-full bg-transparent py-2.5 text-[15px] font-semibold text-[#eff1f3] outline-none placeholder:text-[#9db8d4] [color-scheme:dark]';

const selectCls =
  'w-full bg-transparent py-2.5 text-[15px] font-semibold text-[#eff1f3] outline-none [color-scheme:dark]';

export default function LiveCalculator({ input, onChange, onLaunchApp }: LiveCalculatorProps) {
  const result = useMemo(() => calculateLoan(input), [input]);
  const product = LOAN_PRODUCTS.find((p) => p.id === input.productId) ?? LOAN_PRODUCTS[0];

  const yearsOptions = useMemo(() => {
    return Array.from({ length: product.maxYears }, (_, i) => i + 1);
  }, [product]);

  const set = (patch: Partial<CalculationInput>) => onChange({ ...input, ...patch });

  const setProduct = (productId: string) => {
    const p = LOAN_PRODUCTS.find((x) => x.id === productId) ?? LOAN_PRODUCTS[0];
    const years = input.durationYears > p.maxYears ? p.maxYears : input.durationYears;
    onChange({ ...input, productId, durationYears: years });
  };

  const certifiedTerms = [
    {
      label: 'ربح ثابت',
      value: `${result.profitRate}%`,
      note: 'وفق سياسة الجمعية',
      certified: true,
    },
    {
      label: 'سقف الاقتطاع',
      value: '40%',
      note: 'من صافي الراتب',
      certified: result.maxInstallment > 0,
    },
    {
      label: 'القسط الشهري',
      value: `${formatJODNumber(result.monthlyInstallment)} JOD`,
      note: 'يشمل التقدير',
      certified: input.loanAmount > 0 && input.netIncome > 0,
    },
    {
      label: 'الأهلية',
      value: result.isEligible ? 'مؤهل' : 'غير مؤهل',
      note: result.isEligible ? 'ضمن السقف النظامي' : 'فوق سقف الاقتطاع',
      certified: result.isEligible,
    },
  ];

  return (
    <div className="rounded-xl border border-white/15 bg-[#0a3a66]/70 p-5 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.7)] backdrop-blur-sm sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-2 border-b border-white/15 pb-3">
        <h2 className="text-[15px] font-bold text-[#eff1f3]">حاسبة المرابحة — حساب فوري</h2>
        <span className="landing-figures-sm rounded border border-white/20 px-2 py-0.5 text-[#9db8d4]">
          {product.maxYears}Y
        </span>
      </div>

      <div className="space-y-3.5">
        <Field label="نوع التمويل">
          <select
            aria-label="نوع التمويل"
            value={input.productId}
            onChange={(e) => setProduct(e.target.value)}
            className={selectCls}
          >
            {LOAN_PRODUCTS.map((p) => (
              <option key={p.id} value={p.id} className="bg-[#062a4a] text-[#eff1f3]">
                {p.name}
              </option>
            ))}
          </select>
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="مبلغ التمويل" unit="JOD">
            <input
              type="number"
              min={0}
              step={50}
              inputMode="numeric"
              aria-label="مبلغ التمويل بالدينار"
              value={Number.isFinite(input.loanAmount) ? input.loanAmount : ''}
              onChange={(e) => set({ loanAmount: Number(e.target.value) })}
              className={inputCls}
            />
          </Field>
          <Field label="صافي الراتب" unit="JOD">
            <input
              type="number"
              min={0}
              step={10}
              inputMode="numeric"
              aria-label="صافي الراتب الشهري"
              value={Number.isFinite(input.netIncome) ? input.netIncome : ''}
              onChange={(e) => set({ netIncome: Number(e.target.value) })}
              className={inputCls}
            />
          </Field>
        </div>

        <Field label="المدة">
          <select
            aria-label="مدة التمويل بالسنوات"
            value={input.durationYears}
            onChange={(e) => set({ durationYears: Number(e.target.value) })}
            className={selectCls}
          >
            {yearsOptions.map((y) => (
              <option key={y} value={y} className="bg-[#062a4a] text-[#eff1f3]">
                {y} {y === 1 ? 'سنة' : 'سنوات'}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="mt-5 rounded-lg border border-white/15 bg-[#062a4a]/60 p-4">
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-[13px] font-medium text-[#cfe0f2]">القسط الشهري التقديري</span>
          <span className="landing-figures text-[28px] font-semibold leading-none text-[#bcebe5]">
            {formatJODNumber(result.monthlyInstallment)}
            <span className="ml-1 text-[15px] text-[#9db8d4]">JOD</span>
          </span>
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3 text-[13px]">
          <span className="text-[#cfe0f2]">إجمالي المستحق مع التقدير</span>
          <span className="landing-figures-sm font-semibold text-[#eff1f3]">
            {formatJODNumber(result.totalWithInsurance)} JOD
          </span>
        </div>
        <div className="mt-1.5 flex items-center justify-between text-[13px]">
          <span className="text-[#cfe0f2]">نسبة الالتزام الشهري</span>
          <span className="landing-figures-sm font-semibold text-[#eff1f3]">
            {result.dtiPercentage.toFixed(1)}%
          </span>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {certifiedTerms.map((t) => (
          <div
            key={t.label}
            className="flex flex-col items-center gap-1 rounded-md border border-white/10 bg-white/5 px-1 py-2 text-center"
          >
            <StarSeal certified={t.certified} size={18} />
            <span className="landing-figures-sm font-semibold text-[#eff1f3]">{t.value}</span>
            <span className="text-[11px] text-[#9db8d4]">{t.label}</span>
          </div>
        ))}
      </div>

      <p className="mt-3 text-center text-[11px] leading-relaxed text-[#9db8d4]">
        كل نجمة = بند أثبتته الحاسبة لك الآن. الحساب يطابق صيغ الجمعية المعتمدة.
      </p>

      <button
        type="button"
        onClick={onLaunchApp}
        className="mt-5 w-full rounded-md bg-[#bcebe5] py-3 text-[15px] font-bold text-[#062a4a] transition-colors hover:bg-[#d9f6f2] focus-visible:outline-[#bcebe5]"
      >
        احفظ واطّلع على الحاسبة الكاملة
      </button>
    </div>
  );
}
