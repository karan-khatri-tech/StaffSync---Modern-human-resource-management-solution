import React, { useState } from 'react';
import { Clock, Calendar, Search, Filter, UserCheck, ShieldCheck } from 'lucide-react';
import { AttendanceRecord, EmployeeRecord } from '../../types/index.js';
import { DashboardCard } from '../common/DashboardCard.js';
import { StatusBadge } from '../common/StatusBadge.js';
import { EmptyState } from '../common/Feedback.js';

interface ManagerAttendanceTabProps {
  records: AttendanceRecord[];
  employees: EmployeeRecord[];
  todayDate: string;
  loading: boolean;
}

export const ManagerAttendanceTab: React.FC<ManagerAttendanceTabProps> = ({
  records,
  employees,
  todayDate,
  loading,
}) => {
  const [selectedEmployee, setSelectedEmployee] = useState<string>('All');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

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
          weekday: 'short',
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

  const filteredRecords = records.filter((rec) => {
    const matchesEmp = selectedEmployee === 'All' || rec.employeeId === selectedEmployee;
    const matchesDate = !selectedDate || rec.date === selectedDate;
    const matchesSearch =
      rec.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.employeeEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.department.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesEmp && matchesDate && matchesSearch;
  });

  const presentTodayCount = records.filter((r) => r.date === todayDate).length;

  return (
    <DashboardCard
      title={
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-emerald-500/15 text-[#22C55E]">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[#F8FAFC]">Attendance Records</h2>
            <p className="text-xs text-[#94A3B8]">
              {presentTodayCount} checked in today &bull; Verified employee shifts and working hours
            </p>
          </div>
        </div>
      }
      action={
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Employee search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
            <input
              type="text"
              placeholder="Filter employee name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-lg bg-[#334155] border border-[#2B3A50] text-xs text-[#F8FAFC] placeholder-[#94A3B8] outline-none focus:border-[#3657FF]"
            />
          </div>

          {/* Employee selector */}
          <select
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-[#111C32] border border-[#2B3A50] text-xs text-[#CBD5E1] outline-none cursor-pointer"
          >
            <option value="All">All Staff Members</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.name} ({emp.department})
              </option>
            ))}
          </select>

          {/* Date Picker */}
          <div className="flex items-center gap-1.5">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-[#111C32] border border-[#2B3A50] text-xs text-[#CBD5E1] outline-none cursor-pointer"
            />
            {selectedDate && (
              <button
                onClick={() => setSelectedDate('')}
                className="text-xs text-[#94A3B8] hover:text-[#F8FAFC] underline cursor-pointer"
              >
                Clear Date
              </button>
            )}
          </div>
        </div>
      }
    >
      {loading ? (
        <div className="py-12 text-center text-sm text-[#94A3B8]">Loading attendance logs...</div>
      ) : filteredRecords.length === 0 ? (
        <EmptyState
          icon={<Clock className="w-8 h-8 text-[#94A3B8]" />}
          title="No attendance records found"
          description={
            selectedDate || selectedEmployee !== 'All' || searchQuery
              ? 'No attendance records match the selected date or employee filter.'
              : 'No check-in or check-out sessions recorded yet.'
          }
        />
      ) : (
        <div className="overflow-x-auto -mx-6 px-6">
          <table className="w-full text-left text-sm border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-[#2B3A50] text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Check In</th>
                <th className="py-3 px-4">Check Out</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2B3A50]/60">
              {filteredRecords.map((rec) => (
                <tr key={rec.id} className="hover:bg-[#111C32]/40 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-[#F8FAFC]">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-[#102FF5]/30 text-[#3657FF] border border-[#3657FF]/40 flex items-center justify-center font-bold text-xs">
                        {rec.employeeName.charAt(0)}
                      </div>
                      <div>
                        <div>{rec.employeeName}</div>
                        <div className="text-[11px] font-normal text-[#94A3B8]">
                          {rec.department} &bull; {rec.employeeEmail}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-xs font-medium text-[#F8FAFC]">
                    {formatDisplayDate(rec.date)}
                  </td>
                  <td className="py-3.5 px-4 text-xs font-mono text-emerald-400">
                    {formatDisplayTime(rec.checkInTime)}
                  </td>
                  <td className="py-3.5 px-4 text-xs font-mono text-blue-400">
                    {formatDisplayTime(rec.checkOutTime)}
                  </td>
                  <td className="py-3.5 px-4 text-xs text-[#CBD5E1]">
                    {rec.durationMinutes
                      ? `${Math.floor(rec.durationMinutes / 60)}h ${rec.durationMinutes % 60}m`
                      : rec.checkOutTime
                      ? 'Completed'
                      : 'Active Shift'}
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
  );
};
