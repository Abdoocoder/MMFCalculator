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
    <nav className="hidden md:flex flex-col rtl bg-white dark:bg-[#121619] text-[#34645d] dark:text-[#bcebe5] h-screen w-72 fixed right-0 top-0 z-30 border-l border-[#c2c7ca] dark:border-gray-800 shadow-md pt-16 transition-colors">
      <div className="p-5 border-b border-[#c2c7ca] dark:border-gray-800 bg-[#f7f9fb] dark:bg-[#1a1e22]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#0f4c81]/10 text-[#0f4c81] dark:text-[#95ccff] rounded-xl">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-[#0f4c81] dark:text-[#95ccff] text-base leading-tight">
              {profile.fullName}
            </h3>
            <p className="text-xs text-[#434749] dark:text-gray-400 mt-1">
              رقم العضوية: <span className="font-mono font-bold text-[#0f4c81] dark:text-[#95ccff]">{profile.membershipNo}</span>
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
                    ? 'bg-[#bcebe5] dark:bg-[#23639a]/30 text-[#0f4c81] dark:text-[#95ccff] font-bold border-r-4 border-[#0f4c81] dark:border-[#95ccff]'
                    : 'text-[#434749] dark:text-gray-300 hover:bg-[#f2f4f6] dark:hover:bg-gray-800'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-[#0f4c81] dark:text-[#95ccff]' : 'text-gray-500'}`} />
                <span className="text-base">{item.label}</span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="p-4 m-4 bg-[#f2f4f6] dark:bg-gray-800/60 rounded-xl border border-[#c2c7ca]/60 dark:border-gray-700/50">
        <div className="flex items-start gap-2.5 text-xs text-[#434749] dark:text-gray-300">
          <Info className="w-4 h-4 text-[#0f4c81] dark:text-[#95ccff] shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            لأي استفسارات بخصوص تمويلات المرابحة الإسلامية، يرجى التواصل مع الدائرة المالية في الجمعية.
          </p>
        </div>
      </div>
    </nav>
  );
};
