import React from 'react';
import { Calculator, ArrowRightLeft, Award, FileSpreadsheet, Bell, Sparkles, Building, ChevronLeft } from 'lucide-react';
import { MemberProfile, LoanRecord } from '../types';
import { ASSOCIATION_ANNOUNCEMENTS } from '../data/mockData';
import { formatJODNumber } from '../utils/loanCalculator';

interface HomeDashboardProps {
  profile: MemberProfile;
  records: LoanRecord[];
  onNavigateToCalculator: () => void;
  onNavigateToRecords: () => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  profile,
  records,
  onNavigateToCalculator,
  onNavigateToRecords
}) => {
  const pendingCount = records.filter(r => r.status === 'pending').length;
  const approvedCount = records.filter(r => r.status === 'approved').length;

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      
      {/* Member Welcome Hero Banner */}
      <div className="bg-gradient-to-r from-primary to-primary-light text-white p-6 sm:p-8 rounded-2xl shadow-lg relative overflow-hidden">
        <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 text-right">
            <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md text-xs font-bold rounded-full text-white">
              أهلاً بك، {profile.fullName}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight">
              جمعية موظفي بلدية مادبا الكبرى
            </h1>
            <p className="text-sm text-blue-100 max-w-lg leading-relaxed">
              احسب تمويلك بالمرابحة الإسلامية لشراء البضائع والسلع بسهولة وفق نسبة ربح ثابتة 15% سنوياً.
            </p>
          </div>

          <button
            onClick={onNavigateToCalculator}
            className="flex items-center justify-center gap-2 bg-white text-primary px-6 py-3.5 rounded-xl font-bold text-sm shadow-md hover:bg-blue-50 transition-all cursor-pointer shrink-0 active:scale-95"
          >
            <Calculator className="w-5 h-5 text-primary" />
            <span>ابدأ حاسبة المرابحة</span>
          </button>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        
        <div className="bg-white dark:bg-surface-dark p-4 rounded-xl border border-gray-200 dark:border-gray-800 shadow-xs space-y-1">
          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium block">رقم العضوية</span>
          <span className="text-lg font-bold font-mono text-primary dark:text-primary-soft">
            {profile.membershipNo}
          </span>
        </div>

        <div className="bg-white dark:bg-surface-dark p-4 rounded-xl border border-gray-200 dark:border-gray-800 shadow-xs space-y-1">
          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium block">صافي الراتب المصرح</span>
          <span className="text-lg font-bold font-mono text-gray-900 dark:text-white">
            {formatJODNumber(profile.netSalary)} د.أ
          </span>
        </div>

        <div className="bg-white dark:bg-surface-dark p-4 rounded-xl border border-gray-200 dark:border-gray-800 shadow-xs space-y-1">
          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium block">طلبات قيد المراجعة</span>
          <span className="text-lg font-bold font-mono text-amber-600 dark:text-amber-400">
            {pendingCount} طلب
          </span>
        </div>

        <div className="bg-white dark:bg-surface-dark p-4 rounded-xl border border-gray-200 dark:border-gray-800 shadow-xs space-y-1">
          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium block">سلف معتمدة سابقة</span>
          <span className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">
            {approvedCount} سلفة
          </span>
        </div>

      </div>

      {/* Announcements & Recent Activity */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* News Card */}
        <div className="md:col-span-7 bg-white dark:bg-surface-dark p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
            <h3 className="font-bold text-primary dark:text-primary-soft text-base flex items-center gap-2">
              <Bell className="w-5 h-5" />
              <span>إعلانات وتعليمات الجمعية</span>
            </h3>
            <span className="text-xs text-gray-500 dark:text-gray-400">أغسطس 2026</span>
          </div>

          <div className="space-y-3">
            {ASSOCIATION_ANNOUNCEMENTS.map((ann) => (
              <div
                key={ann.id}
                className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200/80 dark:border-gray-700/60 space-y-1.5 text-right"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-gray-800 dark:text-gray-200">{ann.title}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{ann.date}</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                  {ann.content}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="md:col-span-5 bg-white dark:bg-surface-dark p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-xs space-y-4">
          <h3 className="font-bold text-primary dark:text-primary-soft text-base border-b border-gray-100 dark:border-gray-800 pb-3">
            روابط وخدمات سريعة
          </h3>

          <div className="space-y-3">
            <button
              onClick={onNavigateToCalculator}
              className="w-full flex items-center justify-between p-3.5 bg-mist dark:bg-gray-800/80 hover:bg-teal-light/50 dark:hover:bg-gray-700 rounded-xl transition-all text-right cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary text-white rounded-lg">
                  <Calculator className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-900 dark:text-white">حاسبة المرابحة الإسلامية</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">احسب الأقساط ونسبة المرابحة الثابتة (15%)</p>
                </div>
              </div>
              <ChevronLeft className="w-5 h-5 text-gray-400 group-hover:translate-x-[-4px] transition-transform" />
            </button>

            <button
              onClick={onNavigateToRecords}
              className="w-full flex items-center justify-between p-3.5 bg-mist dark:bg-gray-800/80 hover:bg-teal-light/50 dark:hover:bg-gray-700 rounded-xl transition-all text-right cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-teal text-white rounded-lg">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-900 dark:text-white">استعراض السجلات والطلبات</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">تابع حالة القروض المحفوظة والسابقة</p>
                </div>
              </div>
              <ChevronLeft className="w-5 h-5 text-gray-400 group-hover:translate-x-[-4px] transition-transform" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
