import React from 'react';
import { CheckCircle2, Clock, XCircle, UserCheck, AlertCircle } from 'lucide-react';
import { LeaveStatus, AttendanceStatus } from '../../types/index.js';

interface StatusBadgeProps {
  status: LeaveStatus | AttendanceStatus | 'Active' | 'On Leave' | 'Terminated' | string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const norm = String(status).toLowerCase();

  if (norm === 'approved' || norm === 'present' || norm === 'active') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-[#22C55E] border border-emerald-500/30 ${className}`}
      >
        {norm === 'approved' && <CheckCircle2 className="w-3.5 h-3.5" />}
        {norm === 'present' && <UserCheck className="w-3.5 h-3.5" />}
        {status}
      </span>
    );
  }

  if (norm === 'rejected' || norm === 'terminated' || norm === 'absent') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/15 text-[#EF4444] border border-rose-500/30 ${className}`}
      >
        <XCircle className="w-3.5 h-3.5" />
        {status}
      </span>
    );
  }

  if (norm === 'pending' || norm === 'on leave') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-[#F59E0B] border border-amber-500/30 ${className}`}
      >
        <Clock className="w-3.5 h-3.5" />
        {status}
      </span>
    );
  }

  if (norm === 'checked out' || norm === 'in progress') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/15 text-[#3657FF] border border-blue-500/30 ${className}`}
      >
        <Clock className="w-3.5 h-3.5" />
        {status}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-700/50 text-[#CBD5E1] border border-[#2B3A50] ${className}`}
    >
      <AlertCircle className="w-3.5 h-3.5" />
      {status}
    </span>
  );
};
