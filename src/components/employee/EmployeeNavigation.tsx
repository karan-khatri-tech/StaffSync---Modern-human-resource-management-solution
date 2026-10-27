import React from 'react';
import { Bell, Calendar, Clock, User as UserIcon } from 'lucide-react';

export type EmployeeTab = 'announcements' | 'leaves' | 'attendance' | 'profile';

interface EmployeeNavigationProps {
  activeTab: EmployeeTab;
  onTabChange: (tab: EmployeeTab) => void;
  pendingLeavesCount?: number;
}

export const EmployeeNavigation: React.FC<EmployeeNavigationProps> = ({
  activeTab,
  onTabChange,
  pendingLeavesCount = 0,
}) => {
  const tabs: Array<{ id: EmployeeTab; label: string; icon: React.ReactNode; badge?: number }> = [
    {
      id: 'announcements',
      label: 'Announcements',
      icon: <Bell className="w-4 h-4" />,
    },
    {
      id: 'leaves',
      label: 'Leaves',
      icon: <Calendar className="w-4 h-4" />,
      badge: pendingLeavesCount > 0 ? pendingLeavesCount : undefined,
    },
    {
      id: 'attendance',
      label: 'Attendance',
      icon: <Clock className="w-4 h-4" />,
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: <UserIcon className="w-4 h-4" />,
    },
  ];

  return (
    <div className="border-b border-[#2B3A50] mb-8">
      <nav className="flex space-x-2 sm:space-x-8 overflow-x-auto no-scrollbar" aria-label="Employee Tabs">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 py-3 px-3 sm:px-4 text-sm font-semibold whitespace-nowrap transition-all border-b-2 cursor-pointer ${
                isActive
                  ? 'border-[#3657FF] text-[#F8FAFC] bg-[#18253B]/40'
                  : 'border-transparent text-[#94A3B8] hover:text-[#CBD5E1] hover:border-[#2B3A50]'
              }`}
            >
              <span className={isActive ? 'text-[#3657FF]' : 'text-[#94A3B8]'}>{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span className="ml-1.5 px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/20 text-[#F59E0B] border border-amber-500/30">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};
