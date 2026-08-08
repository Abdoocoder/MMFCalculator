import React from 'react';
import { Printer, X, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { CalculationInput, CalculationResult, MemberProfile } from '../types';
import { formatJODNumber } from '../utils/loanCalculator';

interface PrintVoucherModalProps {
  isOpen: boolean;
  onClose: () => void;
  input: CalculationInput;
  result: CalculationResult;
  profile: MemberProfile;
  productName: string;
}

export const PrintVoucherModal: React.FC<PrintVoucherModalProps> = ({
  isOpen,
  onClose,
  input,
  result,
  profile,
  productName
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const currentDate = new Date().toLocaleDateString('ar-JO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto no-print">
      <div className="bg-white dark:bg-[#191c1e] text-[#191c1e] dark:text-[#eff1f3] rounded-2xl max-w-2xl w-full shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden my-8">
        
        {/* Modal Controls Header */}
        <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 text-[#0f4c81] dark:text-[#95ccff] font-bold">
            <Printer className="w-5 h-5" />
            <span>معاينة طباعة نتيجة الحسبة</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Paper Voucher Content */}
        <div className="p-6 sm:p-8 space-y-6 print-card bg-white text-gray-900" id="printable-voucher">
          
          {/* Header Branding */}
          <div className="text-center border-b-2 border-[#0f4c81] pb-5 space-y-2">
            <div className="inline-block px-3 py-1 bg-[#0f4c81] text-white text-xs font-bold rounded-full mb-1">
              جمعية موظفي بلدية مادبا الكبرى
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#0f4c81]">
              كشف حاسبة المرابحة الإسلامية والتمويل
            </h2>
            <p className="text-xs text-gray-600">
              التاريخ: {currentDate} | الرقم المرجعي: MDB-CALC-{Math.floor(1000 + Math.random() * 9000)}
            </p>
          </div>

          {/* Member Info Grid */}
          <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 p-4 rounded-xl border border-gray-200">
            <div>
              <span className="text-gray-500 block text-xs">اسم العضو:</span>
              <span className="font-bold text-gray-800">{profile.fullName}</span>
            </div>
            <div>
              <span className="text-gray-500 block text-xs">رقم العضوية:</span>
              <span className="font-bold text-gray-800 font-mono">{profile.membershipNo}</span>
            </div>
            <div>
              <span className="text-gray-500 block text-xs">القسم / المديرية:</span>
              <span className="font-bold text-gray-800">{profile.department}</span>
            </div>
            <div>
              <span className="text-gray-500 block text-xs">صافي الراتب المصرح:</span>
              <span className="font-bold text-gray-800">{formatJODNumber(input.netIncome)} دينار</span>
            </div>
          </div>

          {/* Table Breakdown */}
          <div className="overflow-hidden rounded-xl border border-gray-300">
            <table className="w-full text-right text-sm">
              <thead className="bg-[#0f4c81] text-white font-bold">
                <tr>
                  <th className="py-2.5 px-4">بيان الحسبة</th>
                  <th className="py-2.5 px-4 text-left">القيمة (دينار)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="py-2 px-4 text-gray-700">نوع المنتج التمويلي</td>
                  <td className="py-2 px-4 text-left font-bold text-gray-900">{productName}</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="py-2 px-4 text-gray-700">المبلغ المطلوب (صافي التمويل)</td>
                  <td className="py-2 px-4 text-left font-bold text-gray-900">{formatJODNumber(result.netFinancing)}</td>
                </tr>
                <tr>
                  <td className="py-2 px-4 text-gray-700">نسبة الربح المعتمدة</td>
                  <td className="py-2 px-4 text-left font-bold text-gray-900">{result.profitRate}%</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="py-2 px-4 text-gray-700">مدة السداد</td>
                  <td className="py-2 px-4 text-left font-bold text-gray-900">{input.durationYears} سنة ({input.durationYears * 12} شهر)</td>
                </tr>
                <tr>
                  <td className="py-2 px-4 text-gray-700">إجمالي الأرباح المستحقة</td>
                  <td className="py-2 px-4 text-left font-bold text-gray-900">{formatJODNumber(result.totalProfit)}</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="py-2 px-4 text-gray-700">إجمالي رسوم التأمين</td>
                  <td className="py-2 px-4 text-left font-bold text-gray-900">{formatJODNumber(result.totalInsurance)}</td>
                </tr>
                <tr>
                  <td className="py-2 px-4 text-gray-700">إجمالي المبلغ المطلوب سداده</td>
                  <td className="py-2 px-4 text-left font-bold text-gray-900">{formatJODNumber(result.totalWithInsurance)}</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="py-2 px-4 text-gray-700">الحد الأعلى المسموح للقسط (40%)</td>
                  <td className="py-2 px-4 text-left font-bold text-gray-900">{formatJODNumber(result.maxInstallment)}</td>
                </tr>
                <tr className="bg-[#0f4c81] text-white font-bold">
                  <td className="py-3 px-4 text-base">القسط الشهري النهائي</td>
                  <td className="py-3 px-4 text-left text-lg font-mono">{formatJODNumber(result.monthlyInstallment)} دينار</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Validation Status */}
          <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
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
          <div className="pt-6 grid grid-cols-2 gap-8 text-center text-xs text-gray-600 border-t border-gray-200 mt-8">
            <div>
              <p className="font-bold text-gray-800 mb-8">توقيع الموظف مقدم الطلب</p>
              <p className="border-t border-gray-400 pt-1 w-36 mx-auto">................................</p>
            </div>
            <div>
              <p className="font-bold text-gray-800 mb-8">خاتم وتوقيع رئيس الدائرة المالية</p>
              <p className="border-t border-gray-400 pt-1 w-36 mx-auto">................................</p>
            </div>
          </div>

          <div className="mt-6 text-center text-[10px] text-gray-500 pt-2 border-t border-gray-100">
            تصميم وتطوير بواسطة Abdoo Coder (https://www.abdoocoder.dev/)
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800/80 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-xl border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer"
          >
            إغلاق
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-6 py-2 bg-[#0f4c81] text-white text-sm font-bold rounded-xl hover:bg-[#00355f] transition-all cursor-pointer shadow-md active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>اطبع التقرير الآن</span>
          </button>
        </div>

      </div>
    </div>
  );
};
