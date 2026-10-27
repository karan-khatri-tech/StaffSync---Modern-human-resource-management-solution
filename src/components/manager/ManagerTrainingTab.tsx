import React, { useState } from 'react';
import { GraduationCap, PlusCircle, Edit2, Trash2, Calendar, User, Users, X } from 'lucide-react';
import { TrainingSession, EmployeeRecord } from '../../types/index.js';
import { DashboardCard } from '../common/DashboardCard.js';
import { FormInput, FormTextarea, SelectInput } from '../common/FormControls.js';
import { PrimaryButton, SecondaryButton } from '../common/Buttons.js';
import { ConfirmationModal } from '../common/ConfirmationModal.js';
import { AlertBanner, EmptyState } from '../common/Feedback.js';

interface ManagerTrainingTabProps {
  trainings: TrainingSession[];
  employees: EmployeeRecord[];
  loading: boolean;
  onCreateTraining: (trn: Partial<TrainingSession>) => Promise<void>;
  onUpdateTraining: (id: string, trn: Partial<TrainingSession>) => Promise<void>;
  onDeleteTraining: (id: string) => Promise<void>;
}

export const ManagerTrainingTab: React.FC<ManagerTrainingTabProps> = ({
  trainings,
  employees,
  loading,
  onCreateTraining,
  onUpdateTraining,
  onDeleteTraining,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [trainerName, setTrainerName] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [assignedTo, setAssignedTo] = useState('All Employees');

  const [submitting, setSubmitting] = useState(false);
  const [deletingSession, setDeletingSession] = useState<TrainingSession | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const audienceOptions = [
    { value: 'All Employees', label: 'All Employees' },
    { value: 'Engineering', label: 'Engineering Department' },
    { value: 'Design', label: 'Design Department' },
    { value: 'Marketing', label: 'Marketing Department' },
    { value: 'Sales', label: 'Sales Department' },
    { value: 'Operations', label: 'Operations Department' },
    { value: 'Human Resources', label: 'Human Resources' },
    ...employees.map((e) => ({
      value: e.name,
      label: `Specific: ${e.name} (${e.department})`,
    })),
  ];

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setDescription('');
    setTrainerName('');
    setScheduledDate('');
    setAssignedTo('All Employees');
  };

  const handleEditClick = (trn: TrainingSession) => {
    setEditingId(trn.id);
    setTitle(trn.title);
    setDescription(trn.description);
    setTrainerName(trn.trainerName);
    setScheduledDate(trn.scheduledDate);
    setAssignedTo(trn.assignedTo);
    setFeedback(null);
    window.scrollTo({ top: 180, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!title.trim() || !description.trim() || !trainerName.trim() || !scheduledDate.trim()) {
      setFeedback({ type: 'error', message: 'All fields are required to schedule a training program.' });
      return;
    }

    try {
      setSubmitting(true);
      if (editingId) {
        await onUpdateTraining(editingId, {
          title: title.trim(),
          description: description.trim(),
          trainerName: trainerName.trim(),
          scheduledDate: scheduledDate.trim(),
          assignedTo: assignedTo.trim(),
        });
        setFeedback({
          type: 'success',
          message: `Training session "${title}" updated successfully.`,
        });
        resetForm();
      } else {
        await onCreateTraining({
          title: title.trim(),
          description: description.trim(),
          trainerName: trainerName.trim(),
          scheduledDate: scheduledDate.trim(),
          assignedTo: assignedTo.trim(),
        });
        setFeedback({
          type: 'success',
          message: `Training session "${title}" created and scheduled for ${scheduledDate}.`,
        });
        resetForm();
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Operation failed.' });
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deletingSession) return;
    try {
      setIsDeleting(true);
      await onDeleteTraining(deletingSession.id);
      setFeedback({
        type: 'success',
        message: `Training session "${deletingSession.title}" deleted.`,
      });
      setDeletingSession(null);
      if (editingId === deletingSession.id) {
        resetForm();
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to delete training session.' });
    } finally {
      setIsDeleting(false);
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
    <div className="space-y-8">
      {/* Training Creation / Editing Form as in Section 5 */}
      <DashboardCard
        title={
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-emerald-500/15 text-[#22C55E]">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[#F8FAFC]">
                  {editingId ? 'Edit Training Session' : 'Create Training & Development Session'}
                </h2>
                <p className="text-xs text-[#94A3B8]">
                  Design and schedule learning sessions for employees and cohorts
                </p>
              </div>
            </div>
            {editingId && (
              <SecondaryButton onClick={resetForm} className="text-xs py-1 px-3" icon={<X className="w-3.5 h-3.5" />}>
                Cancel Edit
              </SecondaryButton>
            )}
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
          {/* Responsive grid for title, date, trainer, assigned */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <FormInput
              label="Training Title"
              placeholder="e.g. Zero-Trust Security & API Hardening"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <FormInput
              label="Training Date"
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              required
            />

            <FormInput
              label="Trainer Name"
              placeholder="e.g. Alex Rivera or External Instructor"
              value={trainerName}
              onChange={(e) => setTrainerName(e.target.value)}
              required
            />

            <SelectInput
              label="Assign To"
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              options={audienceOptions}
              className="sm:col-span-2 lg:col-span-3"
              required
            />
          </div>

          {/* Full-width description field */}
          <FormTextarea
            label="Description & Learning Objectives"
            placeholder="Outline curriculum topics, prerequisites, meeting links, or completion requirements..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            required
          />

          <PrimaryButton
            type="submit"
            isLoading={submitting}
            className="w-full py-3"
            icon={editingId ? <Edit2 className="w-4 h-4" /> : <PlusCircle className="w-4 h-4" />}
          >
            {editingId ? 'Update Training Session' : 'Create Training'}
          </PrimaryButton>
        </form>
      </DashboardCard>

      {/* Training List - Compact Cards as in Section 5 */}
      <DashboardCard
        title={
          <div className="flex items-center justify-between w-full">
            <div>
              <h2 className="text-lg font-semibold text-[#F8FAFC]">Active Training Curriculum</h2>
              <p className="text-xs text-[#94A3B8]">
                Upcoming and recurring learning programs assigned to staff
              </p>
            </div>
            <span className="text-xs text-[#94A3B8] font-medium bg-[#111C32] px-2.5 py-1 rounded-full border border-[#2B3A50]">
              Total: {trainings.length}
            </span>
          </div>
        }
      >
        {loading ? (
          <div className="py-12 text-center text-sm text-[#94A3B8]">Loading training programs...</div>
        ) : trainings.length === 0 ? (
          <EmptyState
            icon={<GraduationCap className="w-8 h-8 text-[#94A3B8]" />}
            title="No training sessions scheduled"
            description="Use the form above to create and assign training programs to your workforce."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {trainings.map((trn) => (
              <div
                key={trn.id}
                className="p-5 rounded-xl bg-[#111C32]/60 border border-[#2B3A50] hover:border-emerald-500/40 transition-all flex flex-col justify-between gap-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-base font-semibold text-[#F8FAFC] leading-snug">
                      {trn.title}
                    </h3>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-[#22C55E] border border-emerald-500/30 whitespace-nowrap">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(trn.scheduledDate)}
                    </span>
                  </div>

                  <p className="text-xs text-[#CBD5E1] line-clamp-3 mb-3 leading-relaxed">
                    {trn.description}
                  </p>

                  <div className="space-y-1.5 pt-3 border-t border-[#2B3A50]/60 text-xs text-[#94A3B8]">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-[#3657FF]" />
                      <span className="text-[#94A3B8]">Trainer:</span>
                      <span className="font-medium text-[#F8FAFC]">{trn.trainerName}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-[#94A3B8]">Assigned to:</span>
                      <span className="font-medium text-[#CBD5E1] bg-[#334155]/60 px-2 py-0.5 rounded text-[11px]">
                        {trn.assignedTo}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#2B3A50]/40">
                  <button
                    onClick={() => handleEditClick(trn)}
                    className="px-2.5 py-1 rounded text-xs font-medium bg-blue-500/15 text-[#3657FF] border border-blue-500/30 hover:bg-blue-500/25 transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Edit2 className="w-3 h-3" /> Edit
                  </button>
                  <button
                    onClick={() => setDeletingSession(trn)}
                    className="px-2.5 py-1 rounded text-xs font-medium bg-rose-500/15 text-[#EF4444] border border-rose-500/30 hover:bg-rose-500/25 transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </DashboardCard>

      {/* Confirmation Dialog */}
      <ConfirmationModal
        isOpen={Boolean(deletingSession)}
        title="Delete Training Session?"
        message={`Are you sure you want to delete "${deletingSession?.title}"? Employees will no longer see this scheduled training session.`}
        confirmLabel="Yes, Delete Session"
        cancelLabel="Cancel"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeletingSession(null)}
      />
    </div>
  );
};
