/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { LoanCalculator } from './components/LoanCalculator';
import { HomeDashboard } from './components/HomeDashboard';
import { ApplicationsHistory } from './components/ApplicationsHistory';
import { ProfileSettings } from './components/ProfileSettings';
import { AdminReview } from './components/AdminReview';
import { PrintVoucherModal } from './components/PrintVoucherModal';
import { MemberProfile, LoanRecord, CalculationInput, CalculationResult } from './types';
import { calculateLoan, LOAN_PRODUCTS } from './utils/loanCalculator';
import { useMemberData } from './hooks/useMemberData';
import { useMyRole } from './hooks/useMyRole';
import { useAdminData } from './hooks/useAdminData';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('calculator');
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    let stored: string | null = null;
    try {
      stored = localStorage.getItem('mmf-dark-mode');
    } catch {
      stored = null;
    }
    return stored !== null
      ? stored === 'true'
      : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const { profile, records, saveRecord, deleteRecord, updateProfile, lastError, clearError } =
    useMemberData();
  const { isAdmin } = useMyRole();
  const {
    applications: adminApplications,
    decide: decideApplication,
    lastError: adminError,
    clearError: clearAdminError,
  } = useAdminData();

  // Selected record for direct printing modal
  const [printModalRecord, setPrintModalRecord] = useState<LoanRecord | null>(null);

  // Move keyboard focus to the main content region whenever the active tab changes,
  // so screen-reader and keyboard users are not left on the stale nav element.
  const mainRef = useRef<HTMLElement>(null);
  useEffect(() => {
    mainRef.current?.focus({ preventScroll: true });
  }, [activeTab]);

  // Synchronize dark mode class on HTML root and persist it (local preference only)
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    try {
      localStorage.setItem('mmf-dark-mode', String(darkMode));
    } catch {
      /* storage blocked — fail silently */
    }
  }, [darkMode]);

  const handleSaveRecord = async (newRecord: LoanRecord) => {
    await saveRecord(newRecord);
  };

  const handleDeleteRecord = async (id: string) => {
    await deleteRecord(id);
  };

  const handleUpdateProfile = async (updatedProfile: MemberProfile) => {
    await updateProfile(updatedProfile);
  };

  // Convert a saved LoanRecord into temporary CalculationInput & CalculationResult for PrintVoucherModal.
  // Prefer the stored result snapshot so the voucher reflects the exact calculation that was saved;
  // fall back to a fresh calculation only for legacy records saved without a snapshot.
  const preparePrintData = (rec: LoanRecord) => {
    const input: CalculationInput = {
      productId: LOAN_PRODUCTS[0].id,
      loanAmount: rec.loanAmount,
      netIncome: rec.netIncome,
      currentDeductions: 0,
      durationYears: rec.durationYears
    };
    const result: CalculationResult = rec.resultSnapshot ?? calculateLoan(input);
    return { input, result };
  };

  const printData = printModalRecord ? preparePrintData(printModalRecord) : null;

  // An admin with no member profile must still reach the review tab, so the
  // loading gate only applies to non-admins.
  if (!profile && !isAdmin) {
    return (
      <div className="bg-canvas dark:bg-canvas-dark text-ink dark:text-ink-light min-h-screen flex items-center justify-center transition-colors font-tajawal">
        <p className="text-ink-soft dark:text-gray-400">جارٍ تحميل الملف الشخصي…</p>
      </div>
    );
  }

  return (
    <div className="bg-canvas dark:bg-canvas-dark text-ink dark:text-ink-light min-h-screen flex flex-col transition-colors font-tajawal">
      {/* Skip link for keyboard / screen-reader users — first focusable element */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:right-2 focus:z-[100] focus:bg-primary focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:font-bold focus:text-sm"
      >
        تخطي إلى المحتوى الرئيسي
      </a>

      {lastError && (
        <div
          role="alert"
          className="fixed inset-x-4 top-4 z-50 md:inset-x-auto md:right-6 bg-red-600 text-white px-4 py-3 rounded-lg shadow-lg text-sm flex items-center justify-between gap-4"
        >
          <span>{lastError}</span>
          <button
            type="button"
            onClick={clearError}
            aria-label="إغلاق رسالة الخطأ"
            className="shrink-0 rounded-md p-1 text-white/80 hover:text-white hover:bg-surface/10 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {adminError && (
        <div
          role="alert"
          className="fixed inset-x-4 top-4 z-50 md:inset-x-auto md:right-6 bg-red-600 text-white px-4 py-3 rounded-lg shadow-lg text-sm flex items-center justify-between gap-4"
        >
          <span>{adminError}</span>
          <button
            type="button"
            onClick={clearAdminError}
            aria-label="إغلاق رسالة الخطأ"
            className="shrink-0 rounded-md p-1 text-white/80 hover:text-white hover:bg-surface/10 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Navigation Header */}
      <Header
        profile={profile}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onOpenSettings={() => setActiveTab('profile')}
      />

      {/* Main Layout Grid */}
      <div className="flex flex-1 relative">
        
        {/* Desktop Sidebar Navigation */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          profile={profile}
          isAdmin={isAdmin}
        />

        {/* Main Content Area */}
        <main
          id="main-content"
          ref={mainRef}
          tabIndex={-1}
          className="flex-1 md:pr-72 pb-24 md:pb-12 pt-2 transition-all focus:outline-none"
        >
          {activeTab === 'home' && profile && (
            <HomeDashboard
              profile={profile}
              records={records}
              onNavigateToCalculator={() => setActiveTab('calculator')}
              onNavigateToRecords={() => setActiveTab('records')}
            />
          )}

          {activeTab === 'calculator' && profile && (
            <LoanCalculator
              profile={profile}
              onSaveRecord={handleSaveRecord}
            />
          )}

          {activeTab === 'records' && profile && (
            <ApplicationsHistory
              records={records}
              onDeleteRecord={handleDeleteRecord}
              onPrintRecord={(rec) => setPrintModalRecord(rec)}
            />
          )}

          {activeTab === 'admin' && isAdmin && (
            <AdminReview
              applications={adminApplications}
              onDecide={decideApplication}
            />
          )}

          {activeTab === 'profile' && profile && (
            <ProfileSettings
              profile={profile}
              onUpdateProfile={handleUpdateProfile}
            />
          )}
        </main>

      </div>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isAdmin={isAdmin}
      />

      {/* Footer for Desktop */}
      <footer className="bg-surface dark:bg-canvas-dark border-t border-line dark:border-gray-800 text-xs text-ink-soft dark:text-gray-400 py-5 mt-auto hidden md:block no-print">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row-reverse justify-between items-center gap-4 md:pr-72">
          <span>© 2026 جمعية موظفي بلدية مادبا الكبرى - جميع الحقوق محفوظة</span>
          <div className="flex items-center gap-6">
            <span className="text-ink-soft dark:text-gray-400">
              تصميم وتطوير بواسطة{' '}
              <a
                href="https://www.abdoocoder.dev/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-primary dark:text-primary-soft hover:underline"
              >
                Abdoo Coder
              </a>
            </span>
          </div>
        </div>
      </footer>

      {/* Mobile Footer Credit */}
      <div className="block md:hidden text-center py-3 text-xs text-ink-soft dark:text-gray-400 bg-surface/80 dark:bg-canvas-dark/80 border-t border-line dark:border-gray-800 mb-16 no-print">
        تصميم وتطوير بواسطة{' '}
        <a
          href="https://www.abdoocoder.dev/"
          target="_blank"
          rel="noopener noreferrer"
          className="font-bold text-primary dark:text-primary-soft hover:underline"
        >
          Abdoo Coder
        </a>
      </div>

      {/* Modal for printing saved records */}
      {printModalRecord && printData && profile && (
        <PrintVoucherModal
          isOpen
          onClose={() => setPrintModalRecord(null)}
          input={printData.input}
          result={printData.result}
          profile={profile}
          productName={printModalRecord.productName}
          referenceNo={printModalRecord.referenceNo}
        />
      )}

    </div>
  );
}
