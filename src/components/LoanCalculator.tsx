import React, { useState, useEffect, useRef } from 'react';
import { Printer, Receipt, Info, CheckCircle2, AlertCircle, Save, Send } from 'lucide-react';
import { CalculationInput, CalculationResult, MemberProfile, LoanRecord } from '../types';
import { LOAN_PRODUCTS, calculateLoan, formatJODNumber, generateReferenceNo } from '../utils/loanCalculator';
import { PrintVoucherModal } from './PrintVoucherModal';

interface LoanCalculatorProps {
  profile: MemberProfile;
  onSaveRecord: (record: LoanRecord) => void;
}

export const LoanCalculator: React.FC<LoanCalculatorProps> = ({ profile, onSaveRecord }) => {
  const [input, setInput] = useState<CalculationInput>({
    productId: 'appliances',
    loanAmount: 500,
    netIncome: profile.netSalary || 200,
    currentDeductions: profile.currentDeductions || 0,
    durationYears: 1
  });

  const [result, setResult] = useState<CalculationResult>(() => calculateLoan(input));
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [saveNotification, setSaveNotification] = useState<string | null>(null);
  const notificationTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    return () => {
      notificationTimers.current.forEach((t) => clearTimeout(t));
    };
  }, []);

  const showNotification = (message: string, duration: number) => {
    setSaveNotification(message);
    notificationTimers.current.push(setTimeout(() => setSaveNotification(null), duration));
  };

  // Auto-recalculate whenever inputs change
  useEffect(() => {
    const res = calculateLoan(input);
    setResult(res);
  }, [input]);

  const selectedProduct = LOAN_PRODUCTS.find(p => p.id === input.productId) || LOAN_PRODUCTS[0];

  const handleInputChange = (field: keyof CalculationInput, value: string | number) => {
    setInput(prev => ({
      ...prev,
      [field]: field === 'productId' ? value : Number(value)
    }));
  };

  const handleCalculate = () => {
    const res = calculateLoan(input);
    setResult(res);
    showNotification('تم تحديث الحسبة بنجاح', 3000);
  };

  const handleSaveCalculation = () => {
    const newRecord: LoanRecord = {
      id: `rec_${Date.now()}`,
      referenceNo: generateReferenceNo(),
      date: new Date().toISOString().split('T')[0],
      productName: selectedProduct.name,
      loanAmount: result.netFinancing,
      netIncome: input.netIncome,
      durationYears: input.durationYears,
      monthlyInstallment: result.monthlyInstallment,
      totalWithInsurance: result.totalWithInsurance,
      status: 'draft',
      notes: 'حسبة محفوظة من قبل الموظف',
      resultSnapshot: result
    };

    onSaveRecord(newRecord);
    showNotification('تم حفظ الحسبة في قائمة السجلات بنجاح!', 4000);
  };

  const handleSubmitApplication = () => {
    const newApplication: LoanRecord = {
      id: `rec_${Date.now()}`,
      referenceNo: generateReferenceNo(),
      date: new Date().toISOString().split('T')[0],
      productName: selectedProduct.name,
      loanAmount: result.netFinancing,
      netIncome: input.netIncome,
      durationYears: input.durationYears,
      monthlyInstallment: result.monthlyInstallment,
      totalWithInsurance: result.totalWithInsurance,
      status: 'pending',
      notes: 'طلب تمويل مرابحة جديد قيد المراجعة والتدقيق لدى الجمعية',
      resultSnapshot: result
    };

    onSaveRecord(newApplication);
    showNotification('تم تقديم طلب المرابحة رسميًا إلى إدارة الجمعية بنجاح!', 5000);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 flex flex-col gap-5">
      
{/* Toast Notification */}
       {saveNotification && (
         <div role="status" className="p-3 bg-emerald-600 text-white font-medium rounded-xl shadow-lg flex items-center justify-between animate-fade-in text-sm">
           <div className="flex items-center gap-2">
             <CheckCircle2 className="w-5 h-5 shrink-0" />
             <span>{saveNotification}</span>
           </div>
           <button onClick={() => setSaveNotification(null)} className="text-white/80 hover:text-white cursor-pointer" aria-label="إغلاق الإشعار">
             ✕
           </button>
         </div>
       )}

{/* Header Profit Rate Card */}
       <div className="flex flex-col sm:flex-row justify-between items-center bg-surface dark:bg-surface-dark p-4 sm:p-5 rounded-xl border border-line dark:border-gray-800 shadow-xs gap-4 transition-colors">
         <div className="text-center sm:text-right w-full flex justify-between items-center">
           <div>
             <h1 className="text-lg font-bold text-primary dark:text-primary-soft mb-2">
               نسبة الربح المعتمدة
             </h1>
             <p className="text-sm text-ink-soft dark:text-gray-400">
               {selectedProduct.name} - {selectedProduct.description}
             </p>
           </div>
           <p className="text-3xl font-extrabold text-ink dark:text-white font-mono bg-mist dark:bg-gray-800 px-4 py-2 rounded-xl border border-line dark:border-gray-700">
             {result.profitRate}%
           </p>
         </div>
       </div>

{/* Grid Inputs & Results */}
       <div className="grid grid-cols-1 gap-5 sm:gap-6">
        
{/* Calculator Inputs Card */}
         <div className="flex flex-col gap-4 bg-surface dark:bg-surface-dark p-4 sm:p-5 rounded-xl border border-line dark:border-gray-800 shadow-xs transition-colors">
           <h2 className="text-xl font-bold text-primary dark:text-primary-soft border-b border-line dark:border-gray-800 pb-3 mb-2 flex items-center justify-between">
             <span>بيانات التمويل والمرابحة</span>
             <span className="text-sm font-normal text-ink-soft bg-mist dark:bg-gray-800 px-2.5 py-1 rounded-md">تغيير فوري</span>
           </h2>

{/* Product Select */}
           <div className="flex flex-col gap-2">
             <label htmlFor="loan-product" className="text-sm font-bold text-ink dark:text-gray-300 text-right">
               المنتج التمويلي
             </label>
             <select
               id="loan-product"
               value={input.productId}
               onChange={(e) => handleInputChange('productId', e.target.value)}
               className="w-full bg-surface dark:bg-gray-900 border border-line dark:border-gray-700 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary text-sm font-medium text-ink dark:text-gray-100 cursor-pointer"
             >
               {LOAN_PRODUCTS.map((prod) => (
                 <option key={prod.id} value={prod.id}>
                   {prod.name} ({prod.profitRate * 100}%)
                 </option>
               ))}
             </select>
           </div>

{/* Loan Amount Input */}
           <div className="flex flex-col gap-2">
             <label htmlFor="loan-amount" className="text-sm font-bold text-ink dark:text-gray-300 text-right">
               المبلغ المطلوب (دينار)
             </label>
             <input
               id="loan-amount"
               type="number"
               min="50"
               step="50"
               dir="ltr"
               value={input.loanAmount || ''}
               onChange={(e) => handleInputChange('loanAmount', e.target.value)}
               className="w-full bg-surface dark:bg-gray-900 border border-line dark:border-gray-700 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary text-sm text-right font-mono text-ink dark:text-gray-100"
               placeholder="500"
             />
           </div>

{/* Net Income Input */}
           <div className="flex flex-col gap-2">
             <label htmlFor="loan-net-income" className="text-sm font-bold text-ink dark:text-gray-300 text-right">
               صافي الراتب (دينار)
             </label>
             <input
               id="loan-net-income"
               type="number"
               min="0"
               step="10"
               dir="ltr"
               value={input.netIncome || ''}
               onChange={(e) => handleInputChange('netIncome', e.target.value)}
               className="w-full bg-surface dark:bg-gray-900 border border-line dark:border-gray-700 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary text-sm text-right font-mono text-ink dark:text-gray-100"
               placeholder="200"
             />
           </div>

{/* Current Deductions Input */}
           <div className="flex flex-col gap-2">
             <label htmlFor="loan-deductions" className="text-sm font-bold text-ink dark:text-gray-300 text-right">
               اقتطاعات حالية (دينار)
             </label>
             <input
               id="loan-deductions"
               type="number"
               min="0"
               step="5"
               dir="ltr"
               value={input.currentDeductions || ''}
               onChange={(e) => handleInputChange('currentDeductions', e.target.value)}
               className="w-full bg-surface dark:bg-gray-900 border border-line dark:border-gray-700 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary text-sm text-right font-mono text-ink dark:text-gray-100"
               placeholder="0"
             />
           </div>

{/* Duration Years Select */}
           <div className="flex flex-col gap-2">
             <label htmlFor="loan-duration" className="text-sm font-bold text-ink dark:text-gray-300 text-right">
               مدة السداد (سنوات)
             </label>
             <select
               id="loan-duration"
               value={input.durationYears}
               onChange={(e) => handleInputChange('durationYears', e.target.value)}
               className="w-full bg-surface dark:bg-gray-900 border border-line dark:border-gray-700 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary text-sm font-medium text-ink dark:text-gray-100 cursor-pointer"
             >
               {Array.from({ length: selectedProduct.maxYears }, (_, i) => i + 1).map((yr) => (
                 <option key={yr} value={yr}>
                   {yr} {yr === 1 ? 'سنة' : yr === 2 ? 'سنتان' : yr <= 10 ? 'سنوات' : 'سنة'}
                 </option>
               ))}
             </select>
           </div>

{/* Max Installment Display Box */}
           <div className="flex flex-col gap-2 mt-3">
             <span className="block text-sm font-bold text-ink dark:text-gray-300 text-right">
               الحد الأعلى للقسط الشهري المسموح (40%)
             </span>
             <div className="w-full bg-mist dark:bg-gray-800/80 border border-line dark:border-gray-700 rounded-lg p-3 text-sm text-ink dark:text-gray-100 flex justify-between items-center">
               <span className="font-bold text-base font-mono text-primary dark:text-primary-soft">
                 {formatJODNumber(result.maxInstallment)}
               </span>
               <span className="text-xs font-semibold text-ink-soft">دينار</span>
             </div>
           </div>

{/* Action Button: Calculate */}
           <button
             onClick={handleCalculate}
             className="mt-4 w-full bg-primary-light hover:bg-primary text-white py-3.5 rounded-lg font-bold text-base transition-all active:scale-95 shadow-md cursor-pointer flex items-center justify-center gap-3"
           >
             <span className="text-base">حساب</span>
           </button>
        </div>

{/* Results Panel */}
         <div className="flex flex-col gap-4">
           
           <div className="bg-surface dark:bg-surface-dark p-4 sm:p-5 rounded-xl border border-line dark:border-gray-800 shadow-xs transition-colors">
             
             <h2 className="text-xl font-bold text-primary dark:text-primary-soft mb-4 flex items-center gap-3">
               <Receipt className="w-6 h-6 text-primary dark:text-primary-soft" />
               <span>تفاصيل النتيجة الحسابية</span>
             </h2>

            <div className="overflow-x-auto rounded-xl border border-line dark:border-gray-800">
              <table className="w-full text-right border-collapse text-sm">
                <tbody>
                  
                  <tr className="bg-surface dark:bg-surface-dark border-b border-line dark:border-gray-800">
                    <th scope="row" className="py-3 px-4 text-right font-medium text-ink-soft dark:text-gray-300">صافي التمويل</th>
                    <td className="py-3 px-4 font-bold font-mono text-ink dark:text-white">
                      {formatJODNumber(result.netFinancing)}
                    </td>
                  </tr>

                  <tr className="bg-canvas dark:bg-gray-800/40 border-b border-line dark:border-gray-800">
                    <th scope="row" className="py-3 px-4 text-right font-medium text-ink-soft dark:text-gray-300">نسبة الربح</th>
                    <td className="py-3 px-4 font-bold font-mono text-ink dark:text-white">
                      {result.profitRate}%
                    </td>
                  </tr>

                  <tr className="bg-surface dark:bg-surface-dark border-b border-line dark:border-gray-800">
                    <th scope="row" className="py-3 px-4 text-right font-medium text-ink-soft dark:text-gray-300">الربح السنوي</th>
                    <td className="py-3 px-4 font-bold font-mono text-ink dark:text-white">
                      {formatJODNumber(result.annualProfit)}
                    </td>
                  </tr>

                  <tr className="bg-canvas dark:bg-gray-800/40 border-b border-line dark:border-gray-800">
                    <th scope="row" className="py-3 px-4 text-right font-medium text-ink-soft dark:text-gray-300">إجمالي الربح</th>
                    <td className="py-3 px-4 font-bold font-mono text-ink dark:text-white">
                      {formatJODNumber(result.totalProfit)}
                    </td>
                  </tr>

                  <tr className="bg-surface dark:bg-surface-dark border-b border-line dark:border-gray-800">
                    <th scope="row" className="py-3 px-4 text-right font-medium text-ink-soft dark:text-gray-300">المبلغ المطلوب سداده</th>
                    <td className="py-3 px-4 font-bold font-mono text-ink dark:text-white">
                      {formatJODNumber(result.totalPayable)}
                    </td>
                  </tr>

                  <tr className="bg-canvas dark:bg-gray-800/40 border-b border-line dark:border-gray-800">
                    <th scope="row" className="py-3 px-4 text-right font-medium text-ink-soft dark:text-gray-300">تأمين سنوي</th>
                    <td className="py-3 px-4 font-bold font-mono text-ink dark:text-white">
                      {formatJODNumber(result.annualInsurance)}
                    </td>
                  </tr>

                  <tr className="bg-surface dark:bg-surface-dark border-b border-line dark:border-gray-800">
                    <th scope="row" className="py-3 px-4 text-right font-medium text-ink-soft dark:text-gray-300">إجمالي التأمين</th>
                    <td className="py-3 px-4 font-bold font-mono text-ink dark:text-white">
                      {formatJODNumber(result.totalInsurance)}
                    </td>
                  </tr>

                  <tr className="bg-canvas dark:bg-gray-800/40 border-b border-line dark:border-gray-800">
                    <th scope="row" className="py-3 px-4 text-right font-medium text-ink-soft dark:text-gray-300">الإجمالي مع التأمين</th>
                    <td className="py-3 px-4 font-bold font-mono text-ink dark:text-white">
                      {formatJODNumber(result.totalWithInsurance)}
                    </td>
                  </tr>

                  {/* Monthly Installment Row - Highlights Red if exceeds max */}
                  <tr className={`border-b-0 transition-colors ${
                    result.isEligible
                      ? 'bg-primary-light text-white'
                      : 'bg-rose-600 text-white'
                  }`}>
                    <th scope="row" className="py-4 px-4 font-bold text-base text-right">القسط الشهري النهائي</th>
                    <td className="py-4 px-4 font-extrabold text-xl font-mono">
                      {formatJODNumber(result.monthlyInstallment)} دينار
                    </td>
                  </tr>

                </tbody>
              </table>
            </div>

{/* Eligibility Warning Alert */}
             {!result.isEligible && (
               <div className="mt-3 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-xl text-rose-800 dark:text-rose-300 text-sm flex items-center gap-2">
                 <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                 <span>
                   تنبيه: القسط الشهري ({formatJODNumber(result.monthlyInstallment)} دينار) يتجاوز الحد المسموح للاقتطاع ({formatJODNumber(result.maxInstallment)} دينار). يمكنك تقليل المبلغ المطلوب أو زيادة مدة السداد.
                 </span>
               </div>
             )}

{/* Action buttons */}
             <div className="mt-5 flex flex-col sm:flex-row sm:justify-end gap-3">
               
               <button
                 onClick={handleSaveCalculation}
                 className="w-full sm:w-auto flex items-center gap-3 bg-mist dark:bg-gray-800 border border-line dark:border-gray-700 text-ink dark:text-gray-200 px-4 sm:px-5 py-3 rounded-lg text-sm font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer"
               >
                 <Save className="w-5 h-5 text-ink-soft dark:text-gray-400" />
                 <span>حفظ الحسبة</span>
               </button>

               <button
                 onClick={handleSubmitApplication}
                 className="w-full sm:w-auto mt-3 sm:mt-0 flex items-center gap-3 bg-primary text-white px-5 py-3 rounded-lg text-sm font-bold hover:bg-primary-hover transition-all cursor-pointer shadow-sm active:scale-95"
               >
                 <Send className="w-5 h-5" />
                 <span>تقديم طلب المرابحة</span>
               </button>

               <button
                 onClick={() => setShowPrintModal(true)}
                 className="w-full sm:w-auto mt-3 sm:mt-0 flex items-center gap-3 bg-surface dark:bg-surface-dark border-2 border-primary text-primary dark:text-primary-soft dark:border-primary-soft px-5 py-3 rounded-lg text-sm font-bold hover:bg-primary/10 transition-colors cursor-pointer active:scale-95"
               >
                 <Printer className="w-5 h-5" />
                 <span>اطبع النتيجة</span>
               </button>

             </div>

          </div>

{/* Disclaimer Info Box */}
           <div className="bg-mist dark:bg-gray-800/60 p-4 rounded-xl border border-line dark:border-gray-700 flex items-start gap-3">
             <Info className="w-5 h-5 text-teal dark:text-teal-light mt-0.5 shrink-0" />
             <p className="text-sm text-ink-soft dark:text-gray-300 leading-relaxed">
               هذه الحسبة تقريبية وقد تختلف قليلاً عند التنفيذ الفعلي بناءً على سياسات الجمعية المحدثة. الحد الأعلى للاقتطاع هو 40% من الراتب الصافي.
             </p>
           </div>

        </div>

      </div>

      {/* Print Voucher Modal Component */}
      <PrintVoucherModal
        isOpen={showPrintModal}
        onClose={() => setShowPrintModal(false)}
        input={input}
        result={result}
        profile={profile}
        productName={selectedProduct.name}
      />

    </div>
  );
};
