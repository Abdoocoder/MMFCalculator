import React from 'react';
import { Home, Calculator, History, Menu } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  const items = [
    { id: 'home', label: 'الرئيسية', icon: Home },
    { id: 'calculator', label: 'الحاسبة', icon: Calculator },
    { id: 'records', label: 'السجلات', icon: History },
    { id: 'profile', label: 'المزيد', icon: Menu },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white dark:bg-[#121619] border-t border-[#c2c7ca] dark:border-gray-800 shadow-[0_-2px_10px_rgba(0,0,0,0.08)] flex justify-around items-center h-16 px-2">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center justify-center w-full py-1 cursor-pointer transition-all ${
              isActive
                ? 'text-[#0f4c81] dark:text-[#95ccff] font-bold'
                : 'text-[#434749] dark:text-gray-400 font-normal'
            }`}
          >
            <div
              className={`p-1.5 rounded-xl transition-all ${
                isActive ? 'bg-[#bcebe5]/60 dark:bg-[#23639a]/40 scale-105' : ''
              }`}
            >
              <Icon className="w-5 h-5" />
            </div>
            <span className="text-xs mt-0.5">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
