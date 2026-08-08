import React, { useState, useEffect } from 'react';
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
    setSaveNotification('تم تحديث الحسبة بنجاح');
    setTimeout(() => setSaveNotification(null), 3000);
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
    setSaveNotification('تم حفظ الحسبة في قائمة السجلات بنجاح!');
    setTimeout(() => setSaveNotification(null), 4000);
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
    setSaveNotification('تم تقديم طلب المرابحة رسميًا إلى إدارة الجمعية بنجاح!');
    setTimeout(() => setSaveNotification(null), 5000);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 flex flex-col gap-6 mt-2">
      
      {/* Toast Notification */}
      {saveNotification && (
        <div className="p-4 bg-emerald-600 text-white font-medium rounded-xl shadow-lg flex items-center justify-between animate-fade-in text-sm">
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
      <div className="flex flex-col sm:flex-row justify-between items-center bg-white dark:bg-surface-dark p-6 rounded-xl border border-line dark:border-gray-800 shadow-xs gap-4 transition-colors">
        <div className="text-center sm:text-right w-full flex justify-between items-center">
          <div>
            <h1 className="text-lg font-bold text-primary dark:text-primary-soft mb-0.5">
              نسبة الربح المعتمدة
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {selectedProduct.name} - {selectedProduct.description}
            </p>
          </div>
          <p className="text-3xl font-extrabold text-ink dark:text-white font-mono bg-mist dark:bg-gray-800 px-5 py-2 rounded-xl border border-gray-200 dark:border-gray-700">
            {result.profitRate}%
          </p>
        </div>
      </div>

      {/* Grid Inputs & Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Calculator Inputs Card */}
        <div className="lg:col-span-5 flex flex-col gap-4 bg-white dark:bg-surface-dark p-6 rounded-xl border border-line dark:border-gray-800 shadow-xs transition-colors">
          <h2 className="text-xl font-bold text-primary dark:text-primary-soft border-b border-gray-200 dark:border-gray-800 pb-3 mb-1 flex items-center justify-between">
            <span>بيانات التمويل والمرابحة</span>
            <span className="text-xs font-normal text-gray-500 bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-md">تغيير فوري</span>
          </h2>

          {/* Product Select */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="loan-product" className="text-xs font-bold text-gray-700 dark:text-gray-300 text-right">
              المنتج التمويلي
            </label>
            <select
              id="loan-product"
              value={input.productId}
              onChange={(e) => handleInputChange('productId', e.target.value)}
              className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary text-sm font-medium text-gray-900 dark:text-gray-100 cursor-pointer"
            >
              {LOAN_PRODUCTS.map((prod) => (
                <option key={prod.id} value={prod.id}>
                  {prod.name} ({prod.profitRate * 100}%)
                </option>
              ))}
            </select>
          </div>

          {/* Loan Amount Input */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="loan-amount" className="text-xs font-bold text-gray-700 dark:text-gray-300 text-right">
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
              className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary text-sm text-right font-mono text-gray-900 dark:text-gray-100"
              placeholder="500"
            />
          </div>

          {/* Net Income Input */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="loan-net-income" className="text-xs font-bold text-gray-700 dark:text-gray-300 text-right">
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
              className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary text-sm text-right font-mono text-gray-900 dark:text-gray-100"
              placeholder="200"
            />
          </div>

          {/* Current Deductions Input */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="loan-deductions" className="text-xs font-bold text-gray-700 dark:text-gray-300 text-right">
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
              className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary text-sm text-right font-mono text-gray-900 dark:text-gray-100"
              placeholder="0"
            />
          </div>

          {/* Duration Years Select */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="loan-duration" className="text-xs font-bold text-gray-700 dark:text-gray-300 text-right">
              مدة السداد (سنوات)
            </label>
            <select
              id="loan-duration"
              value={input.durationYears}
              onChange={(e) => handleInputChange('durationYears', e.target.value)}
              className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary text-sm font-medium text-gray-900 dark:text-gray-100 cursor-pointer"
            >
              {Array.from({ length: selectedProduct.maxYears }, (_, i) => i + 1).map((yr) => (
                <option key={yr} value={yr}>
                  {yr} {yr === 1 ? 'سنة' : yr === 2 ? 'سنتان' : yr <= 10 ? 'سنوات' : 'سنة'}
                </option>
              ))}
            </select>
          </div>

          {/* Max Installment Display Box */}
          <div className="flex flex-col gap-1.5 mt-2">
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 text-right">
              الحد الأعلى للقسط الشهري المسموح (40%)
            </label>
            <div className="w-full bg-mist dark:bg-gray-800/80 border border-gray-300 dark:border-gray-700 rounded-lg p-3 text-sm text-gray-900 dark:text-gray-100 flex justify-between items-center">
              <span className="font-bold text-base font-mono text-primary dark:text-primary-soft">
                {formatJODNumber(result.maxInstallment)}
              </span>
              <span className="text-xs font-semibold text-gray-500">دينار</span>
            </div>
          </div>

          {/* Action Button: Calculate */}
          <button
            onClick={handleCalculate}
            className="mt-3 w-full bg-primary-light hover:bg-primary text-white py-3 rounded-lg font-bold text-base transition-all active:scale-95 shadow-md cursor-pointer flex items-center justify-center gap-2"
          >
            <span>حساب</span>
          </button>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          
          <div className="bg-white dark:bg-surface-dark p-6 rounded-xl border border-line dark:border-gray-800 shadow-xs transition-colors">
            
            <h2 className="text-xl font-bold text-primary dark:text-primary-soft mb-5 flex items-center gap-2">
              <Receipt className="w-6 h-6 text-primary dark:text-primary-soft" />
              <span>تفاصيل النتيجة الحسابية</span>
            </h2>

            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
              <table className="w-full text-right border-collapse text-sm">
                <tbody>
                  
                  <tr className="bg-white dark:bg-surface-dark border-b border-gray-200 dark:border-gray-800">
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-300">صافي التمويل</td>
                    <td className="py-3 px-4 font-bold font-mono text-gray-900 dark:text-white">
                      {formatJODNumber(result.netFinancing)}
                    </td>
                  </tr>

                  <tr className="bg-canvas dark:bg-gray-800/40 border-b border-gray-200 dark:border-gray-800">
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-300">نسبة الربح</td>
                    <td className="py-3 px-4 font-bold font-mono text-gray-900 dark:text-white">
                      {result.profitRate}%
                    </td>
                  </tr>

                  <tr className="bg-white dark:bg-surface-dark border-b border-gray-200 dark:border-gray-800">
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-300">الربح السنوي</td>
                    <td className="py-3 px-4 font-bold font-mono text-gray-900 dark:text-white">
                      {formatJODNumber(result.annualProfit)}
                    </td>
                  </tr>

                  <tr className="bg-canvas dark:bg-gray-800/40 border-b border-gray-200 dark:border-gray-800">
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-300">إجمالي الربح</td>
                    <td className="py-3 px-4 font-bold font-mono text-gray-900 dark:text-white">
                      {formatJODNumber(result.totalProfit)}
                    </td>
                  </tr>

                  <tr className="bg-white dark:bg-surface-dark border-b border-gray-200 dark:border-gray-800">
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-300">المبلغ المطلوب سداده</td>
                    <td className="py-3 px-4 font-bold font-mono text-gray-900 dark:text-white">
                      {formatJODNumber(result.totalPayable)}
                    </td>
                  </tr>

                  <tr className="bg-canvas dark:bg-gray-800/40 border-b border-gray-200 dark:border-gray-800">
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-300">تأمين سنوي</td>
                    <td className="py-3 px-4 font-bold font-mono text-gray-900 dark:text-white">
                      {formatJODNumber(result.annualInsurance)}
                    </td>
                  </tr>

                  <tr className="bg-white dark:bg-surface-dark border-b border-gray-200 dark:border-gray-800">
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-300">إجمالي التأمين</td>
                    <td className="py-3 px-4 font-bold font-mono text-gray-900 dark:text-white">
                      {formatJODNumber(result.totalInsurance)}
                    </td>
                  </tr>

                  <tr className="bg-canvas dark:bg-gray-800/40 border-b border-gray-200 dark:border-gray-800">
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-300">الإجمالي مع التأمين</td>
                    <td className="py-3 px-4 font-bold font-mono text-gray-900 dark:text-white">
                      {formatJODNumber(result.totalWithInsurance)}
                    </td>
                  </tr>

                  {/* Monthly Installment Row - Highlights Red if exceeds max */}
                  <tr className={`border-b-0 transition-colors ${
                    result.isEligible
                      ? 'bg-primary-light text-white'
                      : 'bg-rose-600 text-white'
                  }`}>
                    <td className="py-4 px-4 font-bold text-base">القسط الشهري النهائي</td>
                    <td className="py-4 px-4 font-extrabold text-xl font-mono">
                      {formatJODNumber(result.monthlyInstallment)} دينار
                    </td>
                  </tr>

                </tbody>
              </table>
            </div>

            {/* Eligibility Warning Alert */}
            {!result.isEligible && (
              <div className="mt-4 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-xl text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                <span>
                  تنبيه: القسط الشهري ({formatJODNumber(result.monthlyInstallment)} دينار) يتجاوز الحد المسموح للاقتطاع ({formatJODNumber(result.maxInstallment)} دينار). يمكنك تقليل المبلغ المطلوب أو زيادة مدة السداد.
                </span>
              </div>
            )}

            {/* Action buttons */}
            <div className="mt-6 flex flex-wrap justify-end gap-3">
              
              <button
                onClick={handleSaveCalculation}
                className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer"
              >
                <Save className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                <span>حفظ الحسبة</span>
              </button>

              <button
                onClick={handleSubmitApplication}
                className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-primary-hover transition-all cursor-pointer shadow-sm active:scale-95"
              >
                <Send className="w-4 h-4" />
                <span>تقديم طلب المرابحة</span>
              </button>

              <button
                onClick={() => setShowPrintModal(true)}
                className="flex items-center gap-2 bg-white dark:bg-surface-dark border-2 border-primary text-primary dark:text-primary-soft dark:border-primary-soft px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-primary/10 transition-colors cursor-pointer active:scale-95"
              >
                <Printer className="w-4 h-4" />
                <span>اطبع النتيجة</span>
              </button>

            </div>

          </div>

          {/* Disclaimer Info Box */}
          <div className="bg-mist dark:bg-gray-800/60 p-4 rounded-xl border border-line dark:border-gray-700 flex items-start gap-3">
            <Info className="w-5 h-5 text-teal dark:text-teal-light mt-0.5 shrink-0" />
            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
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
