import React from 'react';
import { Settings, Bell, Sun, Moon } from 'lucide-react';
import { MemberProfile } from '../types';

interface HeaderProps {
  profile: MemberProfile;
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
      <div className="flex items-center gap-3 flex-row-reverse">
        <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg shadow-xs">
          م
        </div>
        <div className="flex flex-col text-right">
          <span className="font-bold text-base sm:text-lg text-primary dark:text-primary-soft leading-snug">
            جمعية موظفي بلدية مادبا الكبرى
          </span>
          <span className="text-xs text-ink-soft dark:text-gray-400 font-medium">
            نظام حاسبة المرابحة الإسلامية والخدمات الإلكترونية
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="w-11 h-11 flex items-center justify-center rounded-lg text-ink-soft dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors cursor-pointer"
          title={darkMode ? 'الوضع النهاري' : 'الوضع الليلي'}
          aria-label="تغيير المظهر"
        >
          {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
        </button>

        <button
          onClick={onOpenSettings}
          className="w-11 h-11 flex items-center justify-center rounded-lg text-ink-soft dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors cursor-pointer active:scale-95"
          title="الإعدادات والملف الشخصي"
          aria-label="الإعدادات"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};
