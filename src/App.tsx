/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
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
import { Doc } from '../convex/_generated/dataModel';

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

  const profileDoc: Doc<'members'> | null | undefined = useQuery(api.members.getMyProfile);
  const recordDocs: Doc<'loanRecords'>[] = useQuery(api.loanRecords.listMy) ?? [];

  const profile: MemberProfile | null = profileDoc
    ? {
        id: profileDoc._id,
        membershipNo: profileDoc.membershipNo,
        fullName: profileDoc.fullName,
        nationalId: profileDoc.nationalId,
        department: profileDoc.department,
        jobTitle: profileDoc.jobTitle,
        netSalary: profileDoc.netSalary,
        currentDeductions: profileDoc.currentDeductions,
        phone: profileDoc.phone,
        joinDate: profileDoc.joinDate,
        activeLoanCount: profileDoc.activeLoanCount,
        totalLoansPaid: profileDoc.totalLoansPaid,
      }
    : null;

  const records: LoanRecord[] = recordDocs.map((doc) => ({
    id: doc._id,
    referenceNo: doc.referenceNo,
    date: doc.date,
    productName: doc.productName,
    loanAmount: doc.loanAmount,
    netIncome: doc.netIncome,
    durationYears: doc.durationYears,
    monthlyInstallment: doc.monthlyInstallment,
    totalWithInsurance: doc.totalWithInsurance,
    status: doc.status,
    notes: doc.notes,
    resultSnapshot: doc.resultSnapshot,
  }));

  const createRecord = useMutation(api.loanRecords.create);
  const updateRecordStatus = useMutation(api.loanRecords.updateStatus);
  const deleteRecord = useMutation(api.loanRecords.deleteDraft);
  const upsertProfile = useMutation(api.members.upsertMyProfile);

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
    await createRecord({
      record: {
        referenceNo: newRecord.referenceNo,
        date: newRecord.date,
        productName: newRecord.productName,
        loanAmount: newRecord.loanAmount,
        netIncome: newRecord.netIncome,
        durationYears: newRecord.durationYears,
        monthlyInstallment: newRecord.monthlyInstallment,
        totalWithInsurance: newRecord.totalWithInsurance,
        status: newRecord.status,
        notes: newRecord.notes,
        resultSnapshot: newRecord.resultSnapshot,
      },
    });
  };

  const handleDeleteRecord = async (id: string) => {
    await deleteRecord({ id });
  };

  const handleUpdateProfile = async (updatedProfile: MemberProfile) => {
    await upsertProfile({
      profile: {
        membershipNo: updatedProfile.membershipNo,
        fullName: updatedProfile.fullName,
        nationalId: updatedProfile.nationalId,
        department: updatedProfile.department,
        jobTitle: updatedProfile.jobTitle,
        netSalary: updatedProfile.netSalary,
        currentDeductions: updatedProfile.currentDeductions,
        phone: updatedProfile.phone,
        joinDate: updatedProfile.joinDate,
        activeLoanCount: updatedProfile.activeLoanCount,
        totalLoansPaid: updatedProfile.totalLoansPaid,
      },
    });
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
