import React, { useState, useEffect } from 'react';
import {
  Users,
  CalendarCheck,
  GraduationCap,
  Clock,
  ArrowRight,
  TrendingUp,
  Shield,
  CheckCircle2,
  FileCheck,
} from 'lucide-react';
import { DashboardStats, User } from '../../types/index.js';
import { api } from '../../lib/api.js';
import { DashboardCard } from '../common/DashboardCard.js';

interface OverviewDashboardProps {
  currentUser: User;
  onNavigateToWorkspace: () => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  currentUser,
  onNavigateToWorkspace,
}) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    api.getStats()
      .then((data) => {
        if (mounted) setStats(data);
      })
      .catch((err) => console.error(err))
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      {/* Hero Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#18253B] border border-[#2B3A50] mb-8 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#3657FF]/15 text-[#3657FF] border border-[#3657FF]/30 mb-3">
            <Shield className="w-3.5 h-3.5" /> StaffSync Operational Pulse
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#F8FAFC] tracking-tight">
            Workforce Overview & Analytics
          </h1>
          <p className="text-sm text-[#94A3B8] mt-2 leading-relaxed">
            Real-time synchronization of employee leave requests, daily attendance logs, upcoming training cohorts, and company communications.
          </p>
          <div className="mt-5 flex items-center gap-3">
            <button
              onClick={onNavigateToWorkspace}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
            >
              Open HR Workspace <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="p-5 rounded-xl bg-[#18253B] border border-[#2B3A50] shadow-md flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">
              Total Workforce
            </p>
            <p className="text-2xl font-bold text-[#F8FAFC] mt-1">
              {loading ? '--' : stats?.totalEmployees ?? 0}
            </p>
            <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Active team members
            </p>
          </div>
          <div className="p-3 rounded-xl bg-blue-500/15 text-[#3657FF] border border-blue-500/30">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-xl bg-[#18253B] border border-[#2B3A50] shadow-md flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">
              Pending Leave Reviews
            </p>
            <p className="text-2xl font-bold text-[#F59E0B] mt-1">
              {loading ? '--' : stats?.pendingLeaves ?? 0}
            </p>
            <p className="text-[11px] text-[#94A3B8] mt-1 flex items-center gap-1">
              <Clock className="w-3 h-3" /> Awaiting approval
            </p>
          </div>
          <div className="p-3 rounded-xl bg-amber-500/15 text-[#F59E0B] border border-amber-500/30">
            <FileCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-xl bg-[#18253B] border border-[#2B3A50] shadow-md flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">
              Today Attendance Rate
            </p>
            <p className="text-2xl font-bold text-emerald-400 mt-1">
              {loading ? '--' : `${stats?.todayAttendanceRate ?? 0}%`}
            </p>
            <p className="text-[11px] text-[#CBD5E1] mt-1 flex items-center gap-1">
              <CalendarCheck className="w-3 h-3 text-emerald-400" />
              {stats?.presentToday ?? 0} checked in today
            </p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <CalendarCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-xl bg-[#18253B] border border-[#2B3A50] shadow-md flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">
              Training Curriculum
            </p>
            <p className="text-2xl font-bold text-[#F8FAFC] mt-1">
              {loading ? '--' : stats?.activeTrainings ?? 0}
            </p>
            <p className="text-[11px] text-[#3657FF] mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Scheduled cohorts
            </p>
          </div>
          <div className="p-3 rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/30">
            <GraduationCap className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Role specific quick-actions and overview information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DashboardCard
          title="StaffSync System Architecture"
          subtitle="Enterprise-grade HR automation principles"
        >
          <div className="space-y-3.5 text-xs text-[#CBD5E1] leading-relaxed">
            <div className="p-3.5 rounded-lg bg-[#111C32] border border-[#2B3A50]">
              <span className="font-semibold text-[#F8FAFC] block mb-1">
                Role-Based Access Control (RBAC)
              </span>
              Strict separation between Employee Self-Service and HR Manager Dashboards. Employees access personalized leaves, verify attendance, and view departmental news. Managers maintain complete administrative oversight.
            </div>

            <div className="p-3.5 rounded-lg bg-[#111C32] border border-[#2B3A50]">
              <span className="font-semibold text-[#F8FAFC] block mb-1">
                Audited Leave Lifecycle
              </span>
              Every leave application passes from Pending to Approved or Rejected with audit logging of the reviewing manager and timestamp.
            </div>

            <div className="p-3.5 rounded-lg bg-[#111C32] border border-[#2B3A50]">
              <span className="font-semibold text-[#F8FAFC] block mb-1">
                Zero-Trust Attendance Integrity
              </span>
              Guards against duplicate check-ins, early check-outs, and unauthorized status tampering while calculating accurate shift durations.
            </div>
          </div>
        </DashboardCard>

        <DashboardCard
          title="Quick Navigation & Shortcuts"
          subtitle="Jump directly into your daily HR tasks"
        >
          <div className="space-y-3">
            <button
              onClick={onNavigateToWorkspace}
              className="w-full p-3.5 rounded-xl bg-[#111C32] hover:bg-[#1E293B] border border-[#2B3A50] hover:border-[#3657FF] flex items-center justify-between text-left transition-all cursor-pointer group"
            >
              <div>
                <span className="text-xs font-semibold text-[#F8FAFC] block">
                  {currentUser.role === 'manager'
                    ? 'Review Pending Leave Applications'
                    : 'Apply for Leave Time Off'}
                </span>
                <span className="text-[11px] text-[#94A3B8]">
                  {currentUser.role === 'manager'
                    ? `${stats?.pendingLeaves ?? 0} request(s) waiting for decision`
                    : 'Submit dates, duration, and reason for manager approval'}
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-[#3657FF] group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={onNavigateToWorkspace}
              className="w-full p-3.5 rounded-xl bg-[#111C32] hover:bg-[#1E293B] border border-[#2B3A50] hover:border-[#3657FF] flex items-center justify-between text-left transition-all cursor-pointer group"
            >
              <div>
                <span className="text-xs font-semibold text-[#F8FAFC] block">
                  {currentUser.role === 'manager'
                    ? 'Workforce Attendance Logs'
                    : 'Daily Attendance Check In / Out'}
                </span>
                <span className="text-[11px] text-[#94A3B8]">
                  Verified check-in timestamps and shift duration tracking
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-[#3657FF] group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={onNavigateToWorkspace}
              className="w-full p-3.5 rounded-xl bg-[#111C32] hover:bg-[#1E293B] border border-[#2B3A50] hover:border-[#3657FF] flex items-center justify-between text-left transition-all cursor-pointer group"
            >
              <div>
                <span className="text-xs font-semibold text-[#F8FAFC] block">
                  Company Announcements & Training Programs
                </span>
                <span className="text-[11px] text-[#94A3B8]">
                  View targeted announcements and upcoming development workshops
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-[#3657FF] group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </DashboardCard>
      </div>
    </div>
  );
};
