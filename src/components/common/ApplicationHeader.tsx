import React, { useState } from 'react';
import {
  Users,
  LogOut,
  LayoutDashboard,
  Briefcase,
  Trello,
  Shield,
  UserCheck,
  ChevronDown,
  Building2,
} from 'lucide-react';
import { User } from '../../types/index.js';

interface ApplicationHeaderProps {
  currentUser: User;
  activeNav: 'overview' | 'workspace' | 'kanban';
  onNavigate: (view: 'overview' | 'workspace' | 'kanban') => void;
  onLogout: () => void;
  onSwitchUser: (email: string) => Promise<void>;
}

export const ApplicationHeader: React.FC<ApplicationHeaderProps> = ({
  currentUser,
  activeNav,
  onNavigate,
  onLogout,
  onSwitchUser,
}) => {
  const [showSwitchMenu, setShowSwitchMenu] = useState(false);
  const [switching, setSwitching] = useState(false);

  const demoAccounts = [
    {
      name: 'Sarah Jenkins',
      email: 'sarah.hr@staffsync.io',
      role: 'manager' as const,
      roleLabel: 'HR Director (Manager)',
      dept: 'Human Resources',
    },
    {
      name: 'John Doe',
      email: 'john.doe@staffsync.io',
      role: 'employee' as const,
      roleLabel: 'Sr. Software Engineer (Employee)',
      dept: 'Engineering',
    },
    {
      name: 'Emily Chen',
      email: 'emily.chen@staffsync.io',
      role: 'employee' as const,
      roleLabel: 'Lead Product Designer (Employee)',
      dept: 'Design',
    },
    {
      name: 'Marcus Vance',
      email: 'marcus.vance@staffsync.io',
      role: 'employee' as const,
      roleLabel: 'Marketing Lead (Employee)',
      dept: 'Marketing',
    },
  ];

  const handleSelectAccount = async (email: string) => {
    try {
      setSwitching(true);
      await onSwitchUser(email);
      setShowSwitchMenu(false);
    } finally {
      setSwitching(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0F172A]/90 backdrop-blur-md border-b border-[#2B3A50]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-6">
            <div
              onClick={() => onNavigate('workspace')}
              className="flex items-center gap-3 cursor-pointer group select-none"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#102FF5] to-[#3657FF] flex items-center justify-center text-white shadow-md shadow-[#102FF5]/30 group-hover:scale-105 transition-transform">
                <Users className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold tracking-tight text-[#F8FAFC]">
                  Staff<span className="text-[#3657FF]">Sync</span>
                </span>
                <span className="text-[10px] uppercase font-semibold tracking-wider text-[#94A3B8]">
                  {currentUser.role === 'manager' ? 'HR Portal' : 'Employee Portal'}
                </span>
              </div>
            </div>

            {/* Nav Items (Overview, Workspace, Kanban) */}
            <nav className="hidden md:flex items-center gap-1 ml-4 pl-4 border-l border-[#2B3A50]/60">
              <button
                onClick={() => onNavigate('overview')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeNav === 'overview'
                    ? 'bg-[#18253B] text-[#F8FAFC] border border-[#2B3A50]'
                    : 'text-[#94A3B8] hover:text-[#CBD5E1] hover:bg-[#18253B]/50'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-[#3657FF]" />
                Overview
              </button>

              <button
                onClick={() => onNavigate('workspace')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeNav === 'workspace'
                    ? 'bg-[#18253B] text-[#F8FAFC] border border-[#2B3A50]'
                    : 'text-[#94A3B8] hover:text-[#CBD5E1] hover:bg-[#18253B]/50'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5 text-[#3657FF]" />
                Workspace
              </button>

              <button
                onClick={() => onNavigate('kanban')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeNav === 'kanban'
                    ? 'bg-[#18253B] text-[#F8FAFC] border border-[#2B3A50]'
                    : 'text-[#94A3B8] hover:text-[#CBD5E1] hover:bg-[#18253B]/50'
                }`}
              >
                <Trello className="w-3.5 h-3.5 text-[#3657FF]" />
                Kanban
              </button>
            </nav>
          </div>

          {/* User profile & Quick Switcher + Logout */}
          <div className="flex items-center gap-3">
            {/* Quick Demo Role Switcher */}
            <div className="relative">
              <button
                onClick={() => setShowSwitchMenu(!showSwitchMenu)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#18253B] border border-[#2B3A50] hover:border-[#3657FF]/60 text-xs text-[#CBD5E1] hover:text-[#F8FAFC] transition-colors cursor-pointer"
                title="Switch demo persona for testing"
              >
                {currentUser.role === 'manager' ? (
                  <Shield className="w-3.5 h-3.5 text-[#3657FF]" />
                ) : (
                  <UserCheck className="w-3.5 h-3.5 text-[#22C55E]" />
                )}
                <span className="font-medium hidden sm:inline max-w-[130px] truncate">{currentUser.name}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#334155] font-semibold text-[#CBD5E1] uppercase tracking-wider">
                  {currentUser.role}
                </span>
                <ChevronDown className="w-3 h-3 text-[#94A3B8]" />
              </button>

              {showSwitchMenu && (
                <div className="absolute right-0 mt-2 w-72 bg-[#18253B] border border-[#2B3A50] rounded-xl shadow-2xl py-2 z-50 animate-scaleUp">
                  <div className="px-3.5 py-2 border-b border-[#2B3A50]/60">
                    <p className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider">
                      Switch Active User (Testing)
                    </p>
                    <p className="text-xs text-[#CBD5E1] mt-0.5">Test manager permissions vs employee portal</p>
                  </div>
                  <div className="py-1">
                    {demoAccounts.map((account) => {
                      const isActive = account.email.toLowerCase() === currentUser.email.toLowerCase();
                      return (
                        <button
                          key={account.email}
                          onClick={() => handleSelectAccount(account.email)}
                          disabled={switching}
                          className={`w-full text-left px-3.5 py-2.5 flex items-center justify-between text-xs transition-colors cursor-pointer ${
                            isActive
                              ? 'bg-[#3657FF]/15 text-[#F8FAFC] font-semibold'
                              : 'text-[#CBD5E1] hover:bg-[#111C32] hover:text-white'
                          }`}
                        >
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-medium text-sm">{account.name}</span>
                              {account.role === 'manager' && (
                                <span className="text-[9px] bg-[#3657FF] text-white px-1.5 py-0.2 rounded font-bold uppercase">
                                  HR Mgr
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1 text-[11px] text-[#94A3B8] mt-0.5">
                              <Building2 className="w-3 h-3" />
                              <span>{account.dept}</span>
                            </div>
                          </div>
                          {isActive && <div className="w-2 h-2 rounded-full bg-[#3657FF]" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Logout Button */}
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#CBD5E1] hover:text-[#EF4444] hover:bg-rose-500/10 border border-transparent hover:border-rose-500/30 transition-all cursor-pointer"
              title="Sign out of StaffSync"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>

        {/* Mobile secondary navigation */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-[#2B3A50]/40">
          <button
            onClick={() => onNavigate('overview')}
            className={`flex items-center gap-1 text-xs font-medium py-1 px-2 rounded ${
              activeNav === 'overview' ? 'text-[#3657FF]' : 'text-[#94A3B8]'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            Overview
          </button>
          <button
            onClick={() => onNavigate('workspace')}
            className={`flex items-center gap-1 text-xs font-medium py-1 px-2 rounded ${
              activeNav === 'workspace' ? 'text-[#3657FF]' : 'text-[#94A3B8]'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            Workspace
          </button>
          <button
            onClick={() => onNavigate('kanban')}
            className={`flex items-center gap-1 text-xs font-medium py-1 px-2 rounded ${
              activeNav === 'kanban' ? 'text-[#3657FF]' : 'text-[#94A3B8]'
            }`}
          >
            <Trello className="w-3.5 h-3.5" />
            Kanban
          </button>
        </div>
      </div>
    </header>
  );
};
