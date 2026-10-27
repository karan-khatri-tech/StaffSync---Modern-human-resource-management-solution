import React, { useState, useEffect } from 'react';
import { User } from './types/index.js';
import {
  api,
  getStoredToken,
  getStoredUser,
  setStoredSession,
  clearStoredSession,
} from './lib/api.js';
import { ApplicationHeader } from './components/common/ApplicationHeader.js';
import { LoginView } from './components/auth/LoginView.js';
import { EmployeePortal } from './components/employee/EmployeePortal.js';
import { ManagerDashboard } from './components/manager/ManagerDashboard.js';
import { OverviewDashboard } from './components/overview/OverviewDashboard.js';
import { KanbanBoard } from './components/kanban/KanbanBoard.js';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeNav, setActiveNav] = useState<'overview' | 'workspace' | 'kanban'>('workspace');
  const [initialLoading, setInitialLoading] = useState(true);

  // Initialize session
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = getStoredToken();

      if (storedToken) {
        try {
          const res = await api.getMe();
          if (res.user) {
            setCurrentUser(res.user);
            setStoredSession(storedToken, res.user);
          } else {
            clearStoredSession();
            setCurrentUser(null);
          }
        } catch (err) {
          console.warn('Session verification failed, displaying login screen:', err);
          clearStoredSession();
          setCurrentUser(null);
        }
      } else {
        clearStoredSession();
        setCurrentUser(null);
      }
      setInitialLoading(false);
    };

    initAuth();
  }, []);

  const handleLoginSuccess = (token: string, user: User) => {
    setStoredSession(token, user);
    setCurrentUser(user);
    setActiveNav('workspace');
  };

  const handleLogout = () => {
    clearStoredSession();
    setCurrentUser(null);
  };

  const handleSwitchUser = async (email: string) => {
    const res = await api.demoSwitch(email);
    setStoredSession(res.token, res.user);
    setCurrentUser(res.user);
  };

  const handleRefreshUser = async () => {
    try {
      const res = await api.getMe();
      setCurrentUser(res.user);
      const token = getStoredToken();
      if (token) setStoredSession(token, res.user);
    } catch (err) {
      console.error('Failed to refresh user:', err);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#3657FF] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-[#94A3B8]">Starting StaffSync...</p>
        </div>
      </div>
    );
  }

  // Not logged in
  if (!currentUser) {
    return (
      <LoginView
        onLoginSuccess={handleLoginSuccess}
        onLogin={api.login}
        onRegister={api.register}
        onDemoSwitch={api.demoSwitch}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#0F172A] text-[#F8FAFC] flex flex-col font-sans selection:bg-[#3657FF] selection:text-white">
      {/* Universal StaffSync Application Header */}
      <ApplicationHeader
        currentUser={currentUser}
        activeNav={activeNav}
        onNavigate={setActiveNav}
        onLogout={handleLogout}
        onSwitchUser={handleSwitchUser}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {activeNav === 'overview' && (
          <OverviewDashboard
            currentUser={currentUser}
            onNavigateToWorkspace={() => setActiveNav('workspace')}
          />
        )}

        {activeNav === 'workspace' && (
          <>
            {currentUser.role === 'manager' ? (
              <ManagerDashboard
                currentUser={currentUser}
                onLogout={handleLogout}
              />
            ) : (
              <EmployeePortal
                currentUser={currentUser}
                onRefreshUser={handleRefreshUser}
              />
            )}
          </>
        )}

        {activeNav === 'kanban' && <KanbanBoard currentUser={currentUser} />}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#2B3A50] bg-[#0F172A] py-6 text-center text-xs text-[#94A3B8]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#F8FAFC]">StaffSync</span>
            <span>&bull;</span>
            <span>Enterprise Human Resource Management System</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Active Role: <strong className="text-[#3657FF] uppercase">{currentUser.role}</strong></span>
            <span>Security: AES-256 / SHA-256</span>
            <span>Version 2.4.0</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
