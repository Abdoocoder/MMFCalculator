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
import { INITIAL_MEMBER_PROFILE, INITIAL_LOAN_RECORDS } from './data/mockData';
import { calculateLoan } from './utils/loanCalculator';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('calculator');
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [profile, setProfile] = useState<MemberProfile>(INITIAL_MEMBER_PROFILE);
  const [records, setRecords] = useState<LoanRecord[]>(INITIAL_LOAN_RECORDS);

  // Selected record for direct printing modal
  const [printModalRecord, setPrintModalRecord] = useState<LoanRecord | null>(null);

  // Synchronize dark mode class on HTML body
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleSaveRecord = (newRecord: LoanRecord) => {
    setRecords(prev => [newRecord, ...prev]);
  };

  const handleDeleteRecord = (id: string) => {
    setRecords(prev => prev.filter(r => r.id !== id));
  };

  const handleUpdateProfile = (updatedProfile: MemberProfile) => {
    setProfile(updatedProfile);
  };

  // Convert a saved LoanRecord into temporary CalculationInput & CalculationResult for PrintVoucherModal
  const preparePrintData = (rec: LoanRecord) => {
    const input: CalculationInput = {
      productId: 'personal',
      loanAmount: rec.loanAmount,
      netIncome: rec.netIncome,
      currentDeductions: 0,
      durationYears: rec.durationYears
    };
    const result: CalculationResult = calculateLoan(input);
    return { input, result };
  };

  return (
    <div className="bg-[#f7f9fb] dark:bg-[#121619] text-[#191c1e] dark:text-[#eff1f3] min-h-screen flex flex-col transition-colors font-tajawal">
      
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
      <footer className="bg-white dark:bg-[#121619] border-t border-gray-200 dark:border-gray-800 text-xs text-gray-500 dark:text-gray-400 py-5 mt-auto hidden md:block no-print">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row-reverse justify-between items-center gap-4 md:pr-72">
          <span>© 2026 جمعية موظفي بلدية مادبا الكبرى - جميع الحقوق محفوظة</span>
          <div className="flex items-center gap-6">
            <span className="text-gray-600 dark:text-gray-400">
              تصميم وتطوير بواسطة{' '}
              <a
                href="https://www.abdoocoder.dev/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-[#0f4c81] dark:text-[#95ccff] hover:underline"
              >
                Abdoo Coder
              </a>
            </span>
          </div>
        </div>
      </footer>

      {/* Mobile Footer Credit */}
      <div className="block md:hidden text-center py-3 text-xs text-gray-500 dark:text-gray-400 bg-white/80 dark:bg-[#121619]/80 border-t border-gray-200 dark:border-gray-800 mb-16 no-print">
        تصميم وتطوير بواسطة{' '}
        <a
          href="https://www.abdoocoder.dev/"
          target="_blank"
          rel="noopener noreferrer"
          className="font-bold text-[#0f4c81] dark:text-[#95ccff] hover:underline"
        >
          Abdoo Coder
        </a>
      </div>

      {/* Modal for printing saved records */}
      {printModalRecord && (
        <PrintVoucherModal
          isOpen={!!printModalRecord}
          onClose={() => setPrintModalRecord(null)}
          input={preparePrintData(printModalRecord).input}
          result={preparePrintData(printModalRecord).result}
          profile={profile}
          productName={printModalRecord.productName}
        />
      )}

    </div>
  );
}
