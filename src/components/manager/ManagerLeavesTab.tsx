import React, { useState } from 'react';
import { FileCheck, Check, X, Filter, Clock, Search } from 'lucide-react';
import { LeaveApplication } from '../../types/index.js';
import { DashboardCard } from '../common/DashboardCard.js';
import { SuccessButton, DangerButton } from '../common/Buttons.js';
import { StatusBadge } from '../common/StatusBadge.js';
import { AlertBanner, EmptyState } from '../common/Feedback.js';

interface ManagerLeavesTabProps {
  leaves: LeaveApplication[];
  loading: boolean;
  onUpdateStatus: (id: string, status: 'Approved' | 'Rejected', note?: string) => Promise<void>;
}

export const ManagerLeavesTab: React.FC<ManagerLeavesTabProps> = ({
  leaves,
  loading,
  onUpdateStatus,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleDecision = async (id: string, status: 'Approved' | 'Rejected') => {
    setFeedback(null);
    try {
      setProcessingId(id);
      await onUpdateStatus(id, status);
      setFeedback({
        type: 'success',
        message: `Leave application successfully marked as ${status}.`,
      });
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || `Failed to update status to ${status}.`,
      });
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const filteredLeaves = leaves.filter((leave) => {
    const matchesStatus = filterStatus === 'All' || leave.status === filterStatus;
    const matchesSearch =
      leave.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      leave.employeeEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      leave.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      leave.reason.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const pendingCount = leaves.filter((l) => l.status === 'Pending').length;

  return (
    <DashboardCard
      title={
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-[#3657FF]/15 text-[#3657FF]">
            <FileCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[#F8FAFC]">Leave Applications</h2>
            <p className="text-xs text-[#94A3B8]">
              Review, approve, or reject employee time-off requests
            </p>
          </div>
        </div>
      }
      action={
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
            <input
              type="text"
              placeholder="Filter employee or reason..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-lg bg-[#334155] border border-[#2B3A50] text-xs text-[#F8FAFC] placeholder-[#94A3B8] outline-none focus:border-[#3657FF]"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center rounded-lg bg-[#111C32] p-1 border border-[#2B3A50]">
            {['All', 'Pending', 'Approved', 'Rejected'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  filterStatus === status
                    ? 'bg-[#3657FF] text-white'
                    : 'text-[#94A3B8] hover:text-[#CBD5E1]'
                }`}
              >
                {status} {status === 'Pending' && pendingCount > 0 && `(${pendingCount})`}
              </button>
            ))}
          </div>
        </div>
      }
    >
      {feedback && (
        <AlertBanner
          type={feedback.type}
          message={feedback.message}
          onDismiss={() => setFeedback(null)}
          className="mb-5"
        />
      )}

      {loading ? (
        <div className="py-12 text-center text-sm text-[#94A3B8]">Loading leave applications...</div>
      ) : filteredLeaves.length === 0 ? (
        <EmptyState
          icon={<FileCheck className="w-8 h-8 text-[#94A3B8]" />}
          title="No applications found"
          description={
            searchQuery || filterStatus !== 'All'
              ? 'No leave applications match the selected filter criteria.'
              : 'There are currently no employee leave applications submitted.'
          }
        />
      ) : (
        <div className="overflow-x-auto -mx-6 px-6">
          <table className="w-full text-left text-sm border-collapse min-w-[760px]">
            <thead>
              <tr className="border-b border-[#2B3A50] text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Start Date</th>
                <th className="py-3 px-4">End Date</th>
                <th className="py-3 px-4 min-w-[180px]">Reason</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2B3A50]/60">
              {filteredLeaves.map((leave) => {
                const isPending = leave.status === 'Pending';
                const isBusy = processingId === leave.id;

                return (
                  <tr key={leave.id} className="hover:bg-[#111C32]/40 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-[#F8FAFC]">
                      <div>{leave.employeeName}</div>
                      <div className="text-[11px] font-normal text-[#94A3B8]">{leave.department}</div>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-[#CBD5E1] font-mono">
                      {leave.employeeEmail}
                    </td>
                    <td className="py-3.5 px-4 text-xs font-medium text-[#F8FAFC]">
                      {formatDate(leave.startDate)}
                    </td>
                    <td className="py-3.5 px-4 text-xs font-medium text-[#F8FAFC]">
                      {formatDate(leave.endDate)}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-[#CBD5E1]">
                      <p className="line-clamp-2">{leave.reason}</p>
                      {leave.reviewedByName && (
                        <span className="text-[10px] text-[#94A3B8] block mt-1">
                          Decided by {leave.reviewedByName}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={leave.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {isPending ? (
                        <div className="flex items-center justify-end gap-2">
                          <SuccessButton
                            onClick={() => handleDecision(leave.id, 'Approved')}
                            isLoading={isBusy}
                            className="px-2.5 py-1 text-xs"
                            icon={<Check className="w-3.5 h-3.5" />}
                          >
                            Approve
                          </SuccessButton>
                          <DangerButton
                            onClick={() => handleDecision(leave.id, 'Rejected')}
                            isLoading={isBusy}
                            className="px-2.5 py-1 text-xs"
                            icon={<X className="w-3.5 h-3.5" />}
                          >
                            Reject
                          </DangerButton>
                        </div>
                      ) : (
                        <div className="text-[11px] text-[#94A3B8] italic">
                          Decided {formatDate(leave.reviewedAt || '')}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </DashboardCard>
  );
};
