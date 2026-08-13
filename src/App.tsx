/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { LoanCalculator } from './components/LoanCalculator';
import { HomeDashboard } from './components/HomeDashboard';
import { ApplicationsHistory } from './components/ApplicationsHistory';
import { ProfileSettings } from './components/ProfileSettings';
import { PrintVoucherModal } from './components/PrintVoucherModal';
import { MemberProfile, LoanRecord, CalculationInput, CalculationResult } from './types';
import { calculateLoan, LOAN_PRODUCTS } from './utils/loanCalculator';
import { useMemberData } from './hooks/useMemberData';

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

  const { profile, records, saveRecord, deleteRecord, updateProfile, lastError } =
    useMemberData();

  // Selected record for direct printing modal
  const [printModalRecord, setPrintModalRecord] = useState<LoanRecord | null>(null);

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

  if (!profile) {
    return (
      <div className="bg-canvas dark:bg-canvas-dark text-ink dark:text-ink-light min-h-screen flex items-center justify-center transition-colors font-tajawal">
        <p className="text-ink-soft dark:text-gray-400">جارٍ تحميل الملف الشخصي…</p>
      </div>
    );
  }

  return (
    <div className="bg-canvas dark:bg-canvas-dark text-ink dark:text-ink-light min-h-screen flex flex-col transition-colors font-tajawal">
      {lastError && (
        <div
          role="alert"
          className="fixed inset-x-4 top-4 z-50 md:inset-x-auto md:right-6 bg-red-600 text-white px-4 py-3 rounded-lg shadow-lg text-sm"
        >
          {lastError}
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
        />

        {/* Main Content Area */}
        <main className="flex-1 md:pr-72 pb-24 md:pb-12 pt-2 transition-all">
          {activeTab === 'home' && (
            <HomeDashboard
              profile={profile}
              records={records}
              onNavigateToCalculator={() => setActiveTab('calculator')}
              onNavigateToRecords={() => setActiveTab('records')}
            />
          )}

          {activeTab === 'calculator' && (
            <LoanCalculator
              profile={profile}
              onSaveRecord={handleSaveRecord}
            />
          )}

          {activeTab === 'records' && (
            <ApplicationsHistory
              records={records}
              onDeleteRecord={handleDeleteRecord}
              onPrintRecord={(rec) => setPrintModalRecord(rec)}
            />
          )}

          {activeTab === 'profile' && (
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
      />

      {/* Footer for Desktop */}
      <footer className="bg-white dark:bg-canvas-dark border-t border-gray-200 dark:border-gray-800 text-xs text-gray-500 dark:text-gray-400 py-5 mt-auto hidden md:block no-print">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row-reverse justify-between items-center gap-4 md:pr-72">
          <span>© 2026 جمعية موظفي بلدية مادبا الكبرى - جميع الحقوق محفوظة</span>
          <div className="flex items-center gap-6">
            <span className="text-gray-600 dark:text-gray-400">
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
      <div className="block md:hidden text-center py-3 text-xs text-gray-500 dark:text-gray-400 bg-white/80 dark:bg-canvas-dark/80 border-t border-gray-200 dark:border-gray-800 mb-16 no-print">
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
      {printModalRecord && printData && (
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
