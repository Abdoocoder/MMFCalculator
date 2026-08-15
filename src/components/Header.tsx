import React from 'react';
import { Settings, Bell, Sun, Moon } from 'lucide-react';
import { MemberProfile } from '../types';

interface HeaderProps {
  profile: MemberProfile | null;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  profile,
  darkMode,
  setDarkMode,
  onOpenSettings
}) => {
  return (
    <header className="bg-canvas dark:bg-surface-dark text-ink dark:text-ink-light w-full top-0 sticky border-b border-line dark:border-gray-800 shadow-xs flex flex-row-reverse justify-between items-center px-4 sm:px-6 h-16 z-40 transition-colors">
      <div className="flex items-center gap-4 flex-row-reverse">
        <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xl shadow-xs">
          م
        </div>
        <div className="flex flex-col text-right">
          <span className="font-bold text-base sm:text-lg text-primary dark:text-primary-soft leading-snug">
            جمعية موظفي بلدية مادبا الكبرى
          </span>
          <span className="text-sm text-ink-soft dark:text-gray-400 font-medium">
            نظام حاسبة المرابحة الإسلامية والخدمات الإلكترونية
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="w-12 h-12 flex items-center justify-center rounded-lg text-ink-soft dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors cursor-pointer"
          title={darkMode ? 'الوضع النهاري' : 'الوضع الليلي'}
          aria-label="تغيير المظهر"
        >
          {darkMode ? <Sun className="w-6 h-6 text-amber-400" /> : <Moon className="w-6 h-6" />}
        </button>

        <button
          onClick={onOpenSettings}
          className="w-12 h-12 flex items-center justify-center rounded-lg text-ink-soft dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors cursor-pointer active:scale-95"
          title="الإعدادات والملف الشخصي"
          aria-label="الإعدادات"
        >
          <Settings className="w-6 h-6" />
        </button>
      </div>
    </header>
  );
};
