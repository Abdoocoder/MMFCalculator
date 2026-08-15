import React, { useMemo, useState } from 'react';
import {
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  Undo2,
  User,
} from 'lucide-react';
import type { AdminApplication } from '../types';
import { formatJODNumber } from '../utils/loanCalculator';

type Filter = 'all' | 'pending' | 'approved' | 'rejected';

const FILTER_CHIPS: Array<{ key: Filter; label: string }> = [
  { key: 'all', label: 'الكل' },
  { key: 'pending', label: 'قيد المراجعة' },
  { key: 'approved', label: 'المعتمدة' },
  { key: 'rejected', label: 'المرفوضة' },
];

interface AdminReviewProps {
  applications: AdminApplication[];
  onDecide: (id: string, status: 'approved' | 'rejected') => void;
  isSubmitting?: boolean;
}

export const AdminReview: React.FC<AdminReviewProps> = ({
  applications,
  onDecide,
  isSubmitting = false,
}) => {
  const [filter, setFilter] = useState<Filter>('all');

  const counts = useMemo(
    () => ({
      all: applications.length,
      pending: applications.filter((a) => a.record.status === 'pending').length,
      approved: applications.filter((a) => a.record.status === 'approved').length,
      rejected: applications.filter((a) => a.record.status === 'rejected').length,
    }),
    [applications],
  );

  const filtered = useMemo(
    () => applications.filter((a) => filter === 'all' || a.record.status === filter),
    [applications, filter],
  );

  const getStatusBadge = useMemo(
    () => (status: AdminApplication['record']['status']) => {
      switch (status) {
        case 'approved':
          return (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 rounded-full text-xs font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>معتمد</span>
            </span>
          );
        case 'rejected':
          return (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 rounded-full text-xs font-bold">
              <XCircle className="w-3.5 h-3.5" />
              <span>مرفوض</span>
            </span>
          );
        case 'pending':
        default:
          return (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 rounded-full text-xs font-bold">
              <Clock className="w-3.5 h-3.5" />
              <span>قيد المراجعة</span>
            </span>
          );
      }
    },
    [],
  );

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface dark:bg-surface-dark p-5 rounded-2xl border border-line dark:border-gray-800 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-primary dark:text-primary-soft flex items-center gap-2">
            <FileText className="w-6 h-6" />
            <span>مراجعة الطلبات</span>
          </h1>
          <p className="text-xs text-ink-soft dark:text-gray-400 mt-1">
            استعرض الطلبات المقدمة للجمعية واتخذ قراراً بشأنها
          </p>
        </div>

        <div
          role="group"
          aria-label="تصفية حسب حالة الطلب"
          className="flex gap-1 bg-mist dark:bg-gray-800 p-1 rounded-xl self-stretch sm:self-auto overflow-x-auto"
        >
          {FILTER_CHIPS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              aria-pressed={filter === key}
              className={`min-h-11 px-3 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                filter === key
                  ? 'bg-surface dark:bg-gray-700 text-primary dark:text-white shadow-xs'
                  : 'text-ink-soft dark:text-gray-400 hover:text-ink'
              }`}
            >
              {label} ({counts[key]})
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-surface dark:bg-surface-dark p-12 text-center rounded-2xl border border-line dark:border-gray-800 space-y-3">
          <FileText className="w-12 h-12 text-gray-300 dark:text-gray-400 mx-auto" />
          <h2 className="text-base font-bold text-ink dark:text-gray-300">لا توجد طلبات</h2>
          <p className="text-xs text-ink-soft dark:text-gray-400">
            لا توجد طلبات مطابقة للمعايير المحددة حالياً.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(({ record, member }) => {
            const decided = record.status === 'approved' || record.status === 'rejected';
            return (
              <div
                key={record.id}
                data-testid="admin-application"
                className="bg-surface dark:bg-surface-dark p-5 rounded-xl border border-line dark:border-gray-800 shadow-xs hover:border-primary dark:hover:border-primary-soft transition-all"
              >
                <div className="space-y-3 text-right">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-bold text-base text-primary dark:text-primary-soft">
                        {record.productName}
                      </span>
                      {getStatusBadge(record.status)}
                    </div>
                    <span className="font-mono text-xs text-ink-soft dark:text-gray-400">
                      {record.referenceNo}
                    </span>
                  </div>

                  {member ? (
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-soft dark:text-gray-300">
                      <span>
                        الاسم: <strong className="text-ink dark:text-white">{member.fullName}</strong>
                      </span>
                      <span>
                        رقم العضوية: <strong className="font-mono">{member.membershipNo}</strong>
                      </span>
                      <span>
                        القسم: <strong>{member.department}</strong>
                      </span>
                      <span>
                        الهاتف: <strong dir="ltr">{member.phone}</strong>
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-xs text-ink-soft dark:text-gray-400">
                      <User className="w-3.5 h-3.5" />
                      <span>عضو بدون ملف تعريف</span>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-x-4 text-xs font-mono pt-1 text-ink dark:text-gray-200">
                    <span>
                      مبلغ التمويل:{' '}
                      <strong className="text-primary dark:text-primary-soft">
                        {formatJODNumber(record.loanAmount)} د.أ
                      </strong>
                    </span>
                    <span>
                      القسط الشهري:{' '}
                      <strong className="text-emerald-700 dark:text-emerald-400">
                        {formatJODNumber(record.monthlyInstallment)} د.أ/شهر
                      </strong>
                    </span>
                    <span>مدة السداد: <strong>{record.durationYears} سنوات</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-line dark:border-gray-800">
                  {!decided ? (
                    <>
                      <button
                        onClick={() => onDecide(record.id, 'approved')}
                        disabled={isSubmitting}
                        className="flex items-center gap-1.5 px-4 min-h-11 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>موافقة</span>
                      </button>
                      <button
                        onClick={() => onDecide(record.id, 'rejected')}
                        disabled={isSubmitting}
                        className="flex items-center gap-1.5 px-4 min-h-11 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>رفض</span>
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() =>
                        onDecide(record.id, record.status === 'approved' ? 'rejected' : 'approved')
                      }
                      disabled={isSubmitting}
                      className="flex items-center gap-1.5 px-4 min-h-11 bg-mist dark:bg-gray-800 hover:bg-primary hover:text-white dark:hover:bg-primary-light text-ink dark:text-gray-200 rounded-lg text-xs font-bold transition-all cursor-pointer"
                    >
                      <Undo2 className="w-4 h-4" />
                      <span>تغيير القرار</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
