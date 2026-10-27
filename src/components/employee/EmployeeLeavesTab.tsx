import React, { useState } from 'react';
import { Calendar, PlusCircle, CheckCircle2, AlertCircle, FileText, Clock } from 'lucide-react';
import { LeaveApplication } from '../../types/index.js';
import { DashboardCard } from '../common/DashboardCard.js';
import { FormInput, FormTextarea } from '../common/FormControls.js';
import { PrimaryButton } from '../common/Buttons.js';
import { StatusBadge } from '../common/StatusBadge.js';
import { AlertBanner, EmptyState } from '../common/Feedback.js';

interface EmployeeLeavesTabProps {
  leaves: LeaveApplication[];
  loadingLeaves: boolean;
  onApplyLeave: (startDate: string, endDate: string, reason: string) => Promise<void>;
}

export const EmployeeLeavesTab: React.FC<EmployeeLeavesTabProps> = ({
  leaves,
  loadingLeaves,
  onApplyLeave,
}) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    // Validation
    if (!startDate) {
      setFeedback({ type: 'error', message: 'Please select a start date.' });
      return;
    }
    if (!endDate) {
      setFeedback({ type: 'error', message: 'Please select an end date.' });
      return;
    }
    if (!reason.trim()) {
      setFeedback({ type: 'error', message: 'Please provide a reason for your leave request.' });
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      setFeedback({ type: 'error', message: 'Invalid date values provided.' });
      return;
    }

    if (end < start) {
      setFeedback({
        type: 'error',
        message: 'End date cannot be earlier than start date.',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await onApplyLeave(startDate, endDate, reason);
      setFeedback({
        type: 'success',
        message: 'Your leave application was submitted successfully and is pending review.',
      });
      // Reset form
      setStartDate('');
      setEndDate('');
      setReason('');
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'Failed to submit leave application.',
      });
    } finally {
      setIsSubmitting(false);
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

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Card A: Apply for Leave */}
      <DashboardCard
        title={
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#3657FF]/15 text-[#3657FF]">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[#F8FAFC]">Apply for Leave</h2>
              <p className="text-xs text-[#94A3B8]">
                Submit a new time-off request for HR manager review
              </p>
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
            <FormInput
              label="End Date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
          </div>

          <FormTextarea
            label="Reason"
            placeholder="Please detail your reason for leave (e.g. Annual PTO, Medical, Family Emergency)..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            required
          />

          <PrimaryButton
            type="submit"
            isLoading={isSubmitting}
            className="w-full py-3"
            icon={<Calendar className="w-4 h-4" />}
          >
            Apply Leave
          </PrimaryButton>
        </form>
      </DashboardCard>

      {/* Card B: My Leaves */}
      <DashboardCard
        title={
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-emerald-500/15 text-[#22C55E]">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[#F8FAFC]">My Leaves</h2>
                <p className="text-xs text-[#94A3B8]">History and real-time status of your submissions</p>
              </div>
            </div>
            <span className="text-xs text-[#94A3B8] font-medium bg-[#111C32] px-2.5 py-1 rounded-full border border-[#2B3A50]">
              Total: {leaves.length}
            </span>
          </div>
        }
      >
        {loadingLeaves ? (
          <div className="py-8 text-center text-sm text-[#94A3B8]">Loading leave history...</div>
        ) : leaves.length === 0 ? (
          <EmptyState
            icon={<Calendar className="w-6 h-6 text-[#94A3B8]" />}
            title="No leave applications found"
            description="You haven't submitted any leave applications yet. Use the form above to request time off."
          />
        ) : (
          <div className="space-y-3">
            {leaves.map((leave) => (
              <div
                key={leave.id}
                className="p-4 rounded-xl bg-[#111C32]/60 border border-[#2B3A50] hover:border-[#3657FF]/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="text-sm font-semibold text-[#F8FAFC]">
                      {formatDate(leave.startDate)} &mdash; {formatDate(leave.endDate)}
                    </span>
                    <StatusBadge status={leave.status} />
                  </div>
                  <p className="text-xs text-[#CBD5E1] leading-relaxed">{leave.reason}</p>
                  {leave.reviewedByName && (
                    <div className="text-[11px] text-[#94A3B8] pt-1 flex items-center gap-1.5">
                      <Clock className="w-3 h-3" />
                      <span>
                        Reviewed by {leave.reviewedByName} on {formatDate(leave.reviewedAt || '')}
                      </span>
                      {leave.decisionNote && (
                        <span className="italic text-[#CBD5E1]"> &bull; Note: &quot;{leave.decisionNote}&quot;</span>
                      )}
                    </div>
                  )}
                </div>

                <div className="text-right text-[11px] text-[#94A3B8] whitespace-nowrap self-start sm:self-center">
                  Submitted: {formatDate(leave.appliedAt)}
                </div>
              </div>
            ))}
          </div>
        )}
      </DashboardCard>
    </div>
  );
};
