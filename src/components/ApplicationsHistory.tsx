import React, { useState } from 'react';
import { FileText, Printer, Trash2, Clock, CheckCircle2, AlertCircle, Search, Filter } from 'lucide-react';
import { LoanRecord } from '../types';
import { formatJODNumber } from '../utils/loanCalculator';

interface ApplicationsHistoryProps {
  records: LoanRecord[];
  onDeleteRecord: (id: string) => void;
  onPrintRecord: (record: LoanRecord) => void;
}

export const ApplicationsHistory: React.FC<ApplicationsHistoryProps> = ({
  records,
  onDeleteRecord,
  onPrintRecord
}) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'draft'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRecords = records.filter(r => {
    const matchesFilter = filter === 'all' || r.status === filter;
    const matchesSearch =
      r.referenceNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.productName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (status: LoanRecord['status']) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 rounded-full text-xs font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>معتمد وموافق عليه</span>
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 rounded-full text-xs font-bold">
            <Clock className="w-3.5 h-3.5" />
            <span>قيد المراجعة والتدقيق</span>
          </span>
        );
      case 'draft':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 rounded-full text-xs font-bold">
            <FileText className="w-3.5 h-3.5" />
            <span>حسبة محفوظة (مسودة)</span>
          </span>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      
      {/* Title & Filter bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-surface-dark p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-primary dark:text-primary-soft flex items-center gap-2">
            <FileText className="w-6 h-6" />
            <span>سجل الطلبات والحسبات المحفوظة</span>
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            استعرض الطلبات المقدمة للجمعية والحسبات المحفوظة مسبقاً
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl self-stretch sm:self-auto overflow-x-auto">
          <button
            onClick={() => setFilter('all')}
            aria-pressed={filter === 'all'}
            className={`px-3 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              filter === 'all'
                ? 'bg-white dark:bg-gray-700 text-primary dark:text-white shadow-xs'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
            }`}
          >
            الكل ({records.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            aria-pressed={filter === 'pending'}
            className={`px-3 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              filter === 'pending'
                ? 'bg-white dark:bg-gray-700 text-primary dark:text-white shadow-xs'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
            }`}
          >
            قيد الدراسة
          </button>
          <button
            onClick={() => setFilter('approved')}
            aria-pressed={filter === 'approved'}
            className={`px-3 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              filter === 'approved'
                ? 'bg-white dark:bg-gray-700 text-primary dark:text-white shadow-xs'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
            }`}
          >
            المعتمدة
          </button>
          <button
            onClick={() => setFilter('draft')}
            aria-pressed={filter === 'draft'}
            className={`px-3 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              filter === 'draft'
                ? 'bg-white dark:bg-gray-700 text-primary dark:text-white shadow-xs'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
            }`}
          >
            المسودات
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-5 h-5 text-gray-400 absolute right-3.5 top-3" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ابحث بالرقم المرجعي أو نوع القرض..."
          aria-label="البحث في السجلات"
          className="w-full pr-11 pl-4 py-2.5 bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-800 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Records List */}
      {filteredRecords.length === 0 ? (
        <div className="bg-white dark:bg-surface-dark p-12 text-center rounded-2xl border border-gray-200 dark:border-gray-800 space-y-3">
          <FileText className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto" />
          <h3 className="text-base font-bold text-gray-700 dark:text-gray-300">لا توجد سجلات مطابقة</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            يمكنك إجراء حسبة جديدة من قسم حاسبة القروض وحفظها أو تقديمها.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRecords.map((rec) => (
            <div
              key={rec.id}
              className="bg-white dark:bg-surface-dark p-5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-xs flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:border-primary dark:hover:border-primary-soft transition-all"
            >
              <div className="space-y-2 text-right">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-base text-primary dark:text-primary-soft">
                    {rec.productName}
                  </span>
                  {getStatusBadge(rec.status)}
                </div>

                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600 dark:text-gray-300">
                  <span>الرقم المرجعي: <strong className="font-mono text-gray-900 dark:text-white">{rec.referenceNo}</strong></span>
                  <span>التاريخ: <strong>{rec.date}</strong></span>
                  <span>مدة السداد: <strong>{rec.durationYears} سنوات</strong></span>
                </div>

                <div className="flex flex-wrap gap-x-4 text-xs font-mono pt-1 text-gray-800 dark:text-gray-200">
                  <span>مبلغ التمويل: <strong className="text-primary dark:text-primary-soft">{formatJODNumber(rec.loanAmount)} د.أ</strong></span>
                  <span>القسط الشهري: <strong className="text-emerald-700 dark:text-emerald-400">{formatJODNumber(rec.monthlyInstallment)} د.أ/شهر</strong></span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  onClick={() => onPrintRecord(rec)}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-primary hover:text-white dark:hover:bg-primary-light text-gray-700 dark:text-gray-200 rounded-lg text-xs font-bold transition-all cursor-pointer"
                  title="طباعة كشف الحسبة"
                >
                  <Printer className="w-4 h-4" />
                  <span>طباعة</span>
                </button>

                {/* Drafts can be edited/deleted; submitted records are final */}
                {rec.status === 'draft' && (
                  <button
                    onClick={() => onDeleteRecord(rec.id)}
                    aria-label="حذف السجل"
                    title="حذف السجل"
                    className="p-3.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
