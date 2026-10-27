import React, { useState, useEffect } from 'react';
import {
  Trello,
  Plus,
  Trash2,
  Calendar,
  User as UserIcon,
  CheckCircle,
  Clock,
  AlertCircle,
  Tag,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import { KanbanTask, KanbanStatus, KanbanPriority, User } from '../../types/index.js';
import { api } from '../../lib/api.js';
import { DashboardCard } from '../common/DashboardCard.js';
import { FormInput, FormTextarea, SelectInput } from '../common/FormControls.js';
import { PrimaryButton, SecondaryButton } from '../common/Buttons.js';
import { AlertBanner, EmptyState } from '../common/Feedback.js';

interface KanbanBoardProps {
  currentUser: User;
}

const COLUMNS: Array<{ id: KanbanStatus; title: string; color: string }> = [
  { id: 'backlog', title: 'Backlog & Requests', color: 'border-slate-500 text-slate-400' },
  { id: 'in_progress', title: 'In Progress', color: 'border-[#3657FF] text-[#3657FF]' },
  { id: 'review', title: 'Review & Approvals', color: 'border-amber-500 text-[#F59E0B]' },
  { id: 'completed', title: 'Completed', color: 'border-emerald-500 text-[#22C55E]' },
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ currentUser }) => {
  const [tasks, setTasks] = useState<KanbanTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New task form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<KanbanStatus>('backlog');
  const [priority, setPriority] = useState<KanbanPriority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await api.getKanbanTasks();
      setTasks(res.tasks);
    } catch (err) {
      console.error('Failed to load kanban tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      setSubmitting(true);
      const tags = tagInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      await api.createKanbanTask({
        title: title.trim(),
        description: description.trim(),
        status,
        priority,
        dueDate: dueDate || undefined,
        tags,
      });

      setFeedback({ type: 'success', message: 'Task added to board.' });
      setIsModalOpen(false);
      setTitle('');
      setDescription('');
      setTagInput('');
      setDueDate('');
      await fetchTasks();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to create task.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleMoveStatus = async (taskId: string, newStatus: KanbanStatus) => {
    try {
      // Optimistic update
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
      );
      await api.updateKanbanTask(taskId, { status: newStatus });
    } catch (err) {
      console.error('Failed to update task status:', err);
      await fetchTasks();
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      await api.deleteKanbanTask(taskId);
    } catch (err) {
      console.error('Failed to delete task:', err);
      await fetchTasks();
    }
  };

  const getPriorityBadge = (p: KanbanPriority) => {
    switch (p) {
      case 'urgent':
        return (
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-rose-500/15 text-[#EF4444] border border-rose-500/30">
            Urgent
          </span>
        );
      case 'high':
        return (
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-500/15 text-[#F59E0B] border border-amber-500/30">
            High
          </span>
        );
      case 'medium':
        return (
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-500/15 text-[#3657FF] border border-blue-500/30">
            Medium
          </span>
        );
      case 'low':
        return (
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-500/15 text-[#94A3B8] border border-slate-500/30">
            Low
          </span>
        );
    }
  };

  const getNextStatus = (current: KanbanStatus): KanbanStatus | null => {
    if (current === 'backlog') return 'in_progress';
    if (current === 'in_progress') return 'review';
    if (current === 'review') return 'completed';
    return null;
  };

  const getPrevStatus = (current: KanbanStatus): KanbanStatus | null => {
    if (current === 'completed') return 'review';
    if (current === 'review') return 'in_progress';
    if (current === 'in_progress') return 'backlog';
    return null;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-[#2B3A50] gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-[#3657FF]/15 text-[#3657FF]">
              <Trello className="w-5 h-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F8FAFC]">
              HR Operations Kanban
            </h1>
          </div>
          <p className="text-xs text-[#94A3B8] mt-1">
            Track onboarding pipelines, policy reviews, hiring milestones, and audits
          </p>
        </div>

        <PrimaryButton
          onClick={() => setIsModalOpen(true)}
          className="text-xs py-2 px-4 shadow-md"
          icon={<Plus className="w-4 h-4" />}
        >
          Add Kanban Task
        </PrimaryButton>
      </div>

      {feedback && (
        <AlertBanner
          type={feedback.type}
          message={feedback.message}
          onDismiss={() => setFeedback(null)}
          className="mb-6"
        />
      )}

      {/* Board columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
        {COLUMNS.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.id);

          return (
            <div
              key={col.id}
              className="bg-[#18253B] border border-[#2B3A50] rounded-xl flex flex-col max-h-[800px] overflow-hidden"
            >
              {/* Column header */}
              <div className="p-4 border-b border-[#2B3A50] flex items-center justify-between bg-[#111C32]/80">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${col.color.split(' ')[0]} bg-current`} />
                  <h3 className="text-sm font-semibold text-[#F8FAFC]">{col.title}</h3>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#334155] text-[#CBD5E1]">
                  {colTasks.length}
                </span>
              </div>

              {/* Tasks List */}
              <div className="p-3 space-y-3 overflow-y-auto min-h-[150px]">
                {colTasks.length === 0 ? (
                  <div className="py-8 text-center text-xs text-[#94A3B8] italic border border-dashed border-[#2B3A50]/60 rounded-lg">
                    No tasks in this lane
                  </div>
                ) : (
                  colTasks.map((task) => (
                    <div
                      key={task.id}
                      className="p-3.5 rounded-xl bg-[#111C32] border border-[#2B3A50] hover:border-[#3657FF]/60 transition-all shadow-sm group"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        {getPriorityBadge(task.priority)}
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="text-[#94A3B8] hover:text-[#EF4444] p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                          title="Delete task"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <h4 className="text-xs font-semibold text-[#F8FAFC] leading-snug mb-1">
                        {task.title}
                      </h4>

                      {task.description && (
                        <p className="text-[11px] text-[#94A3B8] line-clamp-2 leading-relaxed mb-2.5">
                          {task.description}
                        </p>
                      )}

                      {task.tags && task.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2.5">
                          {task.tags.map((t, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] px-1.5 py-0.5 rounded bg-[#334155]/60 text-[#CBD5E1]"
                            >
                              #{t}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between text-[11px] text-[#94A3B8] pt-2 border-t border-[#2B3A50]/50">
                        <div className="flex items-center gap-1">
                          <UserIcon className="w-3 h-3 text-[#3657FF]" />
                          <span className="truncate max-w-[90px]">{task.assignedName}</span>
                        </div>
                        {task.dueDate && (
                          <div className="flex items-center gap-1 font-mono text-[10px]">
                            <Calendar className="w-3 h-3" />
                            {task.dueDate}
                          </div>
                        )}
                      </div>

                      {/* Lane shift controls */}
                      <div className="flex items-center justify-between gap-1 pt-2.5 mt-2 border-t border-[#2B3A50]/40">
                        {getPrevStatus(task.status) ? (
                          <button
                            onClick={() => handleMoveStatus(task.id, getPrevStatus(task.status)!)}
                            className="text-[10px] font-medium text-[#94A3B8] hover:text-[#F8FAFC] flex items-center gap-0.5 cursor-pointer"
                            title="Move left"
                          >
                            <ArrowLeft className="w-3 h-3" /> Back
                          </button>
                        ) : (
                          <div />
                        )}

                        {getNextStatus(task.status) ? (
                          <button
                            onClick={() => handleMoveStatus(task.id, getNextStatus(task.status)!)}
                            className="text-[10px] font-medium text-[#3657FF] hover:text-blue-400 flex items-center gap-0.5 cursor-pointer ml-auto"
                            title="Move forward"
                          >
                            Next <ArrowRight className="w-3 h-3" />
                          </button>
                        ) : (
                          <span className="text-[10px] font-semibold text-emerald-400 flex items-center gap-0.5 ml-auto">
                            <CheckCircle className="w-3 h-3" /> Done
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#18253B] border border-[#2B3A50] rounded-2xl shadow-2xl p-6 relative">
            <h3 className="text-lg font-bold text-[#F8FAFC] mb-4">Create HR Task</h3>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <FormInput
                label="Task Title"
                placeholder="e.g. Schedule onboarding lunch for new engineers"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />

              <FormTextarea
                label="Description"
                placeholder="Task details and deliverables..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />

              <div className="grid grid-cols-2 gap-4">
                <SelectInput
                  label="Initial Status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as KanbanStatus)}
                  options={[
                    { value: 'backlog', label: 'Backlog' },
                    { value: 'in_progress', label: 'In Progress' },
                    { value: 'review', label: 'Review' },
                    { value: 'completed', label: 'Completed' },
                  ]}
                />

                <SelectInput
                  label="Priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as KanbanPriority)}
                  options={[
                    { value: 'low', label: 'Low' },
                    { value: 'medium', label: 'Medium' },
                    { value: 'high', label: 'High' },
                    { value: 'urgent', label: 'Urgent' },
                  ]}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormInput
                  label="Due Date"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />

                <FormInput
                  label="Tags (comma separated)"
                  placeholder="Onboarding, Compliance"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#2B3A50]">
                <SecondaryButton
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={submitting}
                >
                  Cancel
                </SecondaryButton>
                <PrimaryButton type="submit" isLoading={submitting}>
                  Add Task
                </PrimaryButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
