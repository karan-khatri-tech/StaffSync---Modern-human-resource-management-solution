import React, { useState } from 'react';
import {
  Clock,
  LogIn,
  LogOut,
  CalendarCheck,
  CheckCircle2,
  AlertCircle,
  History,
  Timer,
} from 'lucide-react';
import { AttendanceRecord } from '../../types/index.js';
import { DashboardCard } from '../common/DashboardCard.js';
import { PrimaryButton, DangerButton, SuccessButton } from '../common/Buttons.js';
import { StatusBadge } from '../common/StatusBadge.js';
import { AlertBanner, EmptyState } from '../common/Feedback.js';

interface EmployeeAttendanceTabProps {
  records: AttendanceRecord[];
  todayRecord: AttendanceRecord | null;
  todayDate: string;
  loading: boolean;
  onCheckIn: () => Promise<void>;
  onCheckOut: () => Promise<void>;
}

export const EmployeeAttendanceTab: React.FC<EmployeeAttendanceTabProps> = ({
  records,
  todayRecord,
  todayDate,
  loading,
  onCheckIn,
  onCheckOut,
}) => {
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleCheckIn = async () => {
    setMessage(null);
    try {
      setActionLoading(true);
      await onCheckIn();
      setMessage({ type: 'success', text: 'Checked in successfully for today!' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to check in.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setMessage(null);
    try {
      setActionLoading(true);
      await onCheckOut();
      setMessage({ type: 'success', text: 'Checked out successfully. Have a great evening!' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to check out.' });
    } finally {
      setActionLoading(false);
    }
  };

  const isCheckedIn = Boolean(todayRecord && todayRecord.checkInTime);
  const isCheckedOut = Boolean(todayRecord && todayRecord.checkOutTime);

  const formatDisplayTime = (timeStr?: string) => {
    if (!timeStr) return '--:--:--';
    return timeStr;
  };

  const formatDisplayDate = (dateStr: string) => {
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        return d.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Current Attendance Status Card */}
      <DashboardCard
        title={
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/15 text-[#22C55E]">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[#F8FAFC]">Today's Attendance</h2>
              <p className="text-xs text-[#94A3B8]">{formatDisplayDate(todayDate)}</p>
            </div>
          </div>
        }
      >
        {message && (
          <AlertBanner
            type={message.type}
            message={message.text}
            onDismiss={() => setMessage(null)}
            className="mb-5"
          />
        )}

        <div className="p-5 rounded-2xl bg-[#111C32] border border-[#2B3A50] mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* Status indicator */}
            <div className="flex flex-col items-start md:items-center text-left md:text-center pb-4 md:pb-0 border-b md:border-b-0 md:border-r border-[#2B3A50]">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8] mb-1.5">
                Current Status
              </span>
              {isCheckedOut ? (
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-sm font-semibold bg-emerald-500/15 text-[#22C55E] border border-emerald-500/30">
                  <CheckCircle2 className="w-4 h-4" />
                  Checked Out (Present)
                </div>
              ) : isCheckedIn ? (
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-sm font-semibold bg-[#3657FF]/15 text-[#3657FF] border border-[#3657FF]/30 animate-pulse">
                  <Clock className="w-4 h-4" />
                  Currently Checked In
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-sm font-semibold bg-slate-700/50 text-[#CBD5E1] border border-[#2B3A50]">
                  <AlertCircle className="w-4 h-4" />
                  Not Checked In Today
                </div>
              )}
            </div>

            {/* Check-In Details */}
            <div className="flex flex-col items-start md:items-center text-left md:text-center pb-4 md:pb-0 border-b md:border-b-0 md:border-r border-[#2B3A50]">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8] mb-1.5 flex items-center gap-1.5">
                <LogIn className="w-3.5 h-3.5 text-[#22C55E]" /> Check In Time
              </span>
              <span className="text-xl font-mono font-bold text-[#F8FAFC]">
                {formatDisplayTime(todayRecord?.checkInTime)}
              </span>
              {isCheckedIn && (
                <span className="text-[11px] text-emerald-400 mt-1">Verified on premise</span>
              )}
            </div>

            {/* Check-Out Details */}
            <div className="flex flex-col items-start md:items-center text-left md:text-center">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8] mb-1.5 flex items-center gap-1.5">
                <LogOut className="w-3.5 h-3.5 text-blue-400" /> Check Out Time
              </span>
              <span className="text-xl font-mono font-bold text-[#F8FAFC]">
                {formatDisplayTime(todayRecord?.checkOutTime)}
              </span>
              {todayRecord?.durationMinutes ? (
                <span className="text-[11px] text-[#94A3B8] mt-1 flex items-center gap-1">
                  <Timer className="w-3 h-3 text-[#3657FF]" />
                  Duration: {Math.floor(todayRecord.durationMinutes / 60)}h{' '}
                  {todayRecord.durationMinutes % 60}m
                </span>
              ) : isCheckedIn ? (
                <span className="text-[11px] text-amber-400 mt-1">Active working shift</span>
              ) : null}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <PrimaryButton
            onClick={handleCheckIn}
            isLoading={actionLoading}
            disabled={isCheckedIn}
            className="flex-1 py-3 text-sm font-semibold"
            icon={<LogIn className="w-4 h-4" />}
          >
            {isCheckedIn ? 'Checked In for Today' : 'Check In Now'}
          </PrimaryButton>

          <button
            onClick={handleCheckOut}
            disabled={!isCheckedIn || isCheckedOut || actionLoading}
            className={`flex-1 py-3 px-4 rounded-lg text-sm font-semibold inline-flex items-center justify-center gap-2 transition-all cursor-pointer border ${
              isCheckedOut
                ? 'bg-emerald-600/20 text-[#22C55E] border-emerald-500/30 opacity-80 cursor-not-allowed'
                : !isCheckedIn
                ? 'bg-[#111C32] text-[#94A3B8] border-[#2B3A50] opacity-50 cursor-not-allowed'
                : 'bg-rose-600/20 text-[#EF4444] border-rose-500/40 hover:bg-rose-600/30 active:bg-rose-600/40 shadow-md'
            }`}
          >
            <LogOut className="w-4 h-4" />
            {isCheckedOut
              ? 'Completed Session (Checked Out)'
              : !isCheckedIn
              ? 'Check In First'
              : 'Check Out Now'}
          </button>
        </div>
      </DashboardCard>

      {/* Attendance History */}
      <DashboardCard
        title={
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#3657FF]/15 text-[#3657FF]">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[#F8FAFC]">Attendance History</h2>
              <p className="text-xs text-[#94A3B8]">Your recorded presence and working hours</p>
            </div>
          </div>
        }
      >
        {loading ? (
          <div className="py-8 text-center text-sm text-[#94A3B8]">Loading attendance records...</div>
        ) : records.length === 0 ? (
          <EmptyState
            icon={<Clock className="w-6 h-6 text-[#94A3B8]" />}
            title="No past attendance records"
            description="Your check-in and check-out logs will appear here once recorded."
          />
        ) : (
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full text-left text-sm border-collapse min-w-[500px]">
              <thead>
                <tr className="border-b border-[#2B3A50] text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Check In</th>
                  <th className="py-3 px-4">Check Out</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2B3A50]/60">
                {records.map((rec) => (
                  <tr key={rec.id} className="hover:bg-[#111C32]/40 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-[#F8FAFC]">
                      {formatDisplayDate(rec.date)}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-emerald-400 text-xs">
                      {rec.checkInTime}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-blue-400 text-xs">
                      {rec.checkOutTime || '--:--:--'}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-[#CBD5E1]">
                      {rec.durationMinutes
                        ? `${Math.floor(rec.durationMinutes / 60)}h ${rec.durationMinutes % 60}m`
                        : rec.checkOutTime
                        ? 'Completed'
                        : 'In Progress'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <StatusBadge status={rec.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </DashboardCard>
    </div>
  );
};
