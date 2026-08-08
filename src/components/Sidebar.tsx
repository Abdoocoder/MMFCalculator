import React from 'react';
import { Home, Calculator, FileText, User, Info, Building2 } from 'lucide-react';
import { MemberProfile } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  profile: MemberProfile;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, profile }) => {
  const navItems = [
    { id: 'home', label: 'الرئيسية', icon: Home },
    { id: 'calculator', label: 'حاسبة المرابحة', icon: Calculator },
    { id: 'records', label: 'الطلبات والسجلات', icon: FileText },
    { id: 'profile', label: 'الملف الشخصي', icon: User },
  ];

  return (
    <nav className="hidden md:flex flex-col rtl bg-white dark:bg-canvas-dark text-teal dark:text-teal-light h-screen w-72 fixed right-0 top-0 z-30 border-l border-line dark:border-gray-800 shadow-md pt-16 transition-colors">
      <div className="p-5 border-b border-line dark:border-gray-800 bg-canvas dark:bg-surface-deep">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary/10 text-primary dark:text-primary-soft rounded-xl">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-primary dark:text-primary-soft text-base leading-tight">
              {profile.fullName}
            </h3>
            <p className="text-xs text-ink-soft dark:text-gray-400 mt-1">
              رقم العضوية: <span className="font-mono font-bold text-primary dark:text-primary-soft">{profile.membershipNo}</span>
            </p>
          </div>
        </div>
      </div>

      <ul className="flex flex-col py-4 gap-1 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <li key={item.id}>
              <button
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-4 px-6 py-3.5 transition-all duration-200 cursor-pointer text-right ${
                  isActive
                    ? 'bg-teal-light dark:bg-primary-light/30 text-primary dark:text-primary-soft font-bold'
                    : 'text-ink-soft dark:text-gray-300 hover:bg-mist dark:hover:bg-gray-800'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-primary dark:text-primary-soft' : 'text-gray-500'}`} />
                <span className="text-base">{item.label}</span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="p-4 m-4 bg-mist dark:bg-gray-800/60 rounded-xl border border-line/60 dark:border-gray-700/50">
        <div className="flex items-start gap-2.5 text-xs text-ink-soft dark:text-gray-300">
          <Info className="w-4 h-4 text-primary dark:text-primary-soft shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            لأي استفسارات بخصوص تمويلات المرابحة الإسلامية، يرجى التواصل مع الدائرة المالية في الجمعية.
          </p>
        </div>
      </div>
    </nav>
  );
};
