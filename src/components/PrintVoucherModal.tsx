import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Printer, X, CheckCircle2, AlertTriangle } from 'lucide-react';
import { CalculationInput, CalculationResult, MemberProfile } from '../types';
import { formatJODNumber } from '../utils/loanCalculator';

interface PrintVoucherModalProps {
  isOpen: boolean;
  onClose: () => void;
  input: CalculationInput;
  result: CalculationResult;
  profile: MemberProfile;
  productName: string;
  referenceNo?: string;
}

export const PrintVoucherModal: React.FC<PrintVoucherModalProps> = ({
  isOpen,
  onClose,
  input,
  result,
  profile,
  productName,
  referenceNo
}) => {
  // Generate a stable reference for the live-calculator case so it doesn't change on every re-render.
  // Regenerate on each open so two printouts in one session never share a reference number.
  const [generatedRefNo, setGeneratedRefNo] = useState(() => `MDB-CALC-${Math.floor(1000 + Math.random() * 9000)}`);
  const displayRefNo = referenceNo ?? generatedRefNo;

  useEffect(() => {
    if (isOpen && !referenceNo) {
      setGeneratedRefNo(`MDB-CALC-${Math.floor(1000 + Math.random() * 9000)}`);
    }
  }, [isOpen, referenceNo]);

  const dialogRef = useRef<HTMLDivElement>(null);
  // Keep onClose in a ref so the listener below doesn't tear down on parent re-renders
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  // Close on Escape, trap Tab focus inside the dialog, and restore focus on close
  useEffect(() => {
    if (!isOpen) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCloseRef.current();
        return;
      }
      if (e.key !== 'Tab' || !dialogRef.current) return;

      const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;

      // Trap from the dialog root (focus lands there on open via tabIndex={-1})
      if (e.shiftKey && (active === first || active === dialogRef.current)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (active === last || active === dialogRef.current)) {
        e.preventDefault();
        first.focus();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      previouslyFocused?.focus();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const currentDate = new Date().toLocaleDateString('ar-JO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

return createPortal(
     <div
       ref={dialogRef}
       tabIndex={-1}
       className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto print-modal-root"
       role="dialog"
       aria-modal="true"
       aria-label="معاينة طباعة نتيجة الحسبة"
     >
      <div className="bg-surface dark:bg-surface-dark text-ink dark:text-ink-light rounded-2xl max-w-[500px] w-full shadow-2xl border border-line dark:border-gray-800 overflow-hidden my-4 sm:my-6">
        
{/* Modal Controls Header */}
         <div className="flex justify-between items-center p-3 sm:p-4 bg-mist dark:bg-gray-800/80 border-b border-line dark:border-gray-700 no-print">
           <div className="flex items-center gap-3 sm:gap-2 text-primary dark:text-primary-soft font-bold">
             <Printer className="w-6 h-6" />
             <span>معاينة طباعة نتيجة الحسبة</span>
           </div>
           <button
             onClick={onClose}
             className="w-10 h-10 rounded-lg text-ink-soft hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer"
             aria-label="إغلاق النافذة"
           >
             <X className="w-6 h-6" />
           </button>
         </div>

{/* Printable Paper Voucher Content */}
         <div className="p-4 sm:p-6 space-y-5 sm:space-y-6 bg-surface text-ink" id="printable-voucher">
          
{/* Header Branding */}
           <div className="text-center border-b-2 border-primary pb-4 sm:pb-5 space-y-2 sm:space-y-3">
             <div className="inline-block px-3 py-1 bg-primary text-white text-xs font-bold rounded-full mb-1 sm:mb-2">
               جمعية موظفي بلدية مادبا الكبرى
             </div>
             <h2 className="text-xl sm:text-2xl font-bold text-primary">
               كشف حاسبة المرابحة الإسلامية والتمويل
             </h2>
             <p className="text-sm text-ink-soft">
               التاريخ: {currentDate} | الرقم المرجعي: {displayRefNo}
             </p>
           </div>

{/* Member Info Grid */}
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm bg-mist p-3 sm:p-4 rounded-xl border border-line">
             <div>
               <span className="text-ink-soft block text-xs">اسم العضو:</span>
               <span className="font-bold text-ink">{profile.fullName}</span>
             </div>
             <div>
               <span className="text-ink-soft block text-xs">رقم العضوية:</span>
               <span className="font-bold text-ink font-mono">{profile.membershipNo}</span>
             </div>
             <div>
               <span className="text-ink-soft block text-xs">القسم / المديرية:</span>
               <span className="font-bold text-ink">{profile.department}</span>
             </div>
             <div>
               <span className="text-ink-soft block text-xs">صافي الراتب المصرح:</span>
               <span className="font-bold text-ink">{formatJODNumber(input.netIncome)} دينار</span>
             </div>
           </div>

{/* Table Breakdown */}
           <div className="overflow-hidden rounded-xl border border-line">
             <table className="w-full text-right text-sm">
               <thead className="bg-primary text-white font-bold">
                 <tr>
                   <th className="py-2.5 px-4 sm:px-3">بيان الحسبة</th>
                   <th className="py-2.5 px-4 sm:px-3 text-left">القيمة (دينار)</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="py-2 px-4 text-ink">نوع المنتج التمويلي</td>
                  <td className="py-2 px-4 text-left font-bold text-ink">{productName}</td>
                </tr>
                <tr className="bg-mist">
                  <td className="py-2 px-4 text-ink">المبلغ المطلوب (صافي التمويل)</td>
                  <td className="py-2 px-4 text-left font-bold text-ink">{formatJODNumber(result.netFinancing)}</td>
                </tr>
                <tr>
                  <td className="py-2 px-4 text-ink">نسبة الربح المعتمدة</td>
                  <td className="py-2 px-4 text-left font-bold text-ink">{result.profitRate}%</td>
                </tr>
                <tr className="bg-mist">
                  <td className="py-2 px-4 text-ink">مدة السداد</td>
                  <td className="py-2 px-4 text-left font-bold text-ink">{input.durationYears} سنة ({input.durationYears * 12} شهر)</td>
                </tr>
                <tr>
                  <td className="py-2 px-4 text-ink">إجمالي الأرباح المستحقة</td>
                  <td className="py-2 px-4 text-left font-bold text-ink">{formatJODNumber(result.totalProfit)}</td>
                </tr>
                <tr className="bg-mist">
                  <td className="py-2 px-4 text-ink">إجمالي رسوم التأمين</td>
                  <td className="py-2 px-4 text-left font-bold text-ink">{formatJODNumber(result.totalInsurance)}</td>
                </tr>
                <tr>
                  <td className="py-2 px-4 text-ink">إجمالي المبلغ المطلوب سداده</td>
                  <td className="py-2 px-4 text-left font-bold text-ink">{formatJODNumber(result.totalWithInsurance)}</td>
                </tr>
                <tr className="bg-mist">
                  <td className="py-2 px-4 text-ink">الحد الأعلى المسموح للقسط (40%)</td>
                  <td className="py-2 px-4 text-left font-bold text-ink">{formatJODNumber(result.maxInstallment)}</td>
                </tr>
                <tr className="bg-primary text-white font-bold">
                  <td className="py-3 px-4 text-base">القسط الشهري النهائي</td>
                  <td className="py-3 px-4 text-left text-lg font-mono">{formatJODNumber(result.monthlyInstallment)} دينار</td>
                </tr>
              </tbody>
            </table>
          </div>

{/* Validation Status */}
           <div className={`p-3 rounded-xl border text-sm flex items-center gap-2 ${
             result.isEligible 
               ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
               : 'bg-rose-50 border-rose-200 text-rose-800'
           }`}>
             {result.isEligible ? (
               <>
                 <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                 <span>الحسبة متوافقة مع شروط الاقتطاع (القسط الشهري ضمن الحد الأعلى المسموح).</span>
               </>
             ) : (
               <>
                 <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                 <span>القسط الشهري يتجاوز الحد الأعلى المسموح به لنسبة الاقتطاع (40% من الراتب الصافي).</span>
               </>
             )}
           </div>

          {/* Signatures Footer */}
          <div className="pt-6 grid grid-cols-2 gap-8 text-center text-xs text-ink-soft border-t border-line mt-8">
            <div>
              <p className="font-bold text-ink mb-8">توقيع الموظف مقدم الطلب</p>
              <p className="border-t border-gray-400 pt-1 w-36 mx-auto">................................</p>
            </div>
            <div>
              <p className="font-bold text-ink mb-8">خاتم وتوقيع رئيس الدائرة المالية</p>
              <p className="border-t border-gray-400 pt-1 w-36 mx-auto">................................</p>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-ink-soft pt-2 border-t border-gray-100">
            تصميم وتطوير بواسطة Abdoo Coder (https://www.abdoocoder.dev/)
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="p-4 bg-mist dark:bg-gray-800/80 border-t border-line dark:border-gray-700 flex justify-end gap-3 no-print">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-xl border border-line dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer"
          >
            إغلاق
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-6 py-2 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary-hover transition-all cursor-pointer shadow-md active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>اطبع التقرير الآن</span>
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
};
