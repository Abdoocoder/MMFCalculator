import { useMemo } from 'react';
import { buildLedger, formatJOD } from './ledger';
import { calculateLoan } from '../utils/loanCalculator';
import { CalculationInput } from '../types';
import { StarSeal } from './StarField';

interface LedgerSectionProps {
  input: CalculationInput;
}

/**
 * The narrative ledger — the page's accounting-style double-entry that
 * "balances": debit (principal + profit + insurance) vs credit (installment ×
 * months). The balance row settles the account to zero when the math holds.
 */
export default function LedgerSection({ input }: LedgerSectionProps) {
  const result = useMemo(() => calculateLoan(input), [input]);
  const book = useMemo(() => buildLedger(input, result), [input, result]);

  return (
    <div className="rounded-xl border border-white/15 bg-[#0a3a66]/50 p-5 sm:p-6">
      <div className="mb-5 flex items-center justify-between gap-2 border-b border-white/15 pb-3">
        <div className="flex items-center gap-2">
          <StarSeal certified={book.isBalanced} size={20} />
          <h3 className="text-[15px] font-bold text-[#eff1f3]">دفتر التسوية</h3>
        </div>
        <span className="landing-figures-sm text-[#9db8d4]">{book.months} شهراً</span>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <p className="mb-2 text-[12px] font-semibold text-[#9db8d4]">المَدين — التزام العضو</p>
          <div className="divide-y divide-white/10 border-y border-white/15">
            {book.debitLines.map((line) => (
              <div key={line.id} className="flex items-center justify-between gap-3 py-2.5">
                <div>
                  <p className="text-[13.5px] font-medium text-[#eff1f3]">{line.label}</p>
                  {line.note ? <p className="text-xs text-[#9db8d4]">{line.note}</p> : null}
                </div>
                <span className="landing-figures-sm font-semibold text-[#eff1f3]">
                  {formatJOD(line.amount)} JOD
                </span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between gap-3 border-b border-white/15 py-2.5">
            <p className="text-[13.5px] font-bold text-[#bcebe5]">مجموع المَدين</p>
            <span className="landing-figures font-semibold text-[#bcebe5]">
              {formatJOD(book.debitTotal)} JOD
            </span>
          </div>
        </div>

        <div>
          <p className="mb-2 text-[12px] font-semibold text-[#9db8d4]">الدائن — سداد العضو</p>
          <div className="divide-y divide-white/10 border-y border-white/15">
            {book.creditLines.map((line) => (
              <div key={line.id} className="flex items-center justify-between gap-3 py-2.5">
                <div>
                  <p className="text-[13.5px] font-medium text-[#eff1f3]">{line.label}</p>
                  {line.note ? <p className="text-xs text-[#9db8d4]">{line.note}</p> : null}
                </div>
                <span className="landing-figures-sm font-semibold text-[#eff1f3]">
                  {formatJOD(line.amount)} JOD
                </span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between gap-3 border-b border-white/15 py-2.5">
            <p className="text-[13.5px] font-bold text-[#bcebe5]">مجموع الدائن</p>
            <span className="landing-figures font-semibold text-[#bcebe5]">
              {formatJOD(book.creditTotal)} JOD
            </span>
          </div>
        </div>
      </div>

      <div
        className={`mt-5 flex items-center justify-between gap-3 rounded-lg border px-4 py-3 ${
          book.isBalanced
            ? 'border-[#bcebe5]/40 bg-[#bcebe5]/10'
            : 'border-red-300/40 bg-red-400/10'
        }`}
      >
        <div className="flex items-center gap-2">
          <StarSeal certified={book.isBalanced} size={18} />
          <p className="text-[13.5px] font-semibold text-[#eff1f3]">
            {book.isBalanced ? 'الحساب مطابق — الدفاتر تتساوى' : 'الحساب غير مطابق'}
          </p>
        </div>
        <span className="landing-figures-sm font-semibold text-[#eff1f3]">
          الرصيد {formatJOD(book.balance)} JOD
        </span>
      </div>

      <p className="mt-3 text-xs leading-relaxed text-[#9db8d4]">
        الربح ثابت وفق سياسة الجمعية، والاقتطاع محدد بسقف نظامي، والتأمين تقدير تكلفة سنوي وليس رسوم
        بنكية.
      </p>
    </div>
  );
}
