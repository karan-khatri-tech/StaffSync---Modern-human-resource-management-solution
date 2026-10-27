import React, { useState } from 'react';
import { Bell, Send, Trash2, Tag, Calendar, User, Sparkles } from 'lucide-react';
import { Announcement } from '../../types/index.js';
import { api } from '../../lib/api.js';
import { DashboardCard } from '../common/DashboardCard.js';
import { FormInput, FormTextarea, SelectInput } from '../common/FormControls.js';
import { PrimaryButton } from '../common/Buttons.js';
import { AlertBanner, EmptyState } from '../common/Feedback.js';

interface ManagerAnnouncementsTabProps {
  announcements: Announcement[];
  loading: boolean;
  onCreateAnnouncement: (ann: Partial<Announcement>) => Promise<void>;
  onDeleteAnnouncement: (id: string) => Promise<void>;
}

export const ManagerAnnouncementsTab: React.FC<ManagerAnnouncementsTabProps> = ({
  announcements,
  loading,
  onCreateAnnouncement,
  onDeleteAnnouncement,
}) => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [audience, setAudience] = useState('All Employees');
  const [pinned, setPinned] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const audienceOptions = [
    { value: 'All Employees', label: 'All Employees (Company-wide)' },
    { value: 'Engineering', label: 'Engineering' },
    { value: 'Design', label: 'Design' },
    { value: 'Marketing', label: 'Marketing' },
    { value: 'Sales', label: 'Sales' },
    { value: 'Operations', label: 'Operations' },
    { value: 'Human Resources', label: 'Human Resources' },
  ];

  const [draftingAi, setDraftingAi] = useState(false);

  const handleAiDraft = async () => {
    if (!title.trim()) {
      setFeedback({ type: 'error', message: 'Please provide a title or topic first for the AI to draft from.' });
      return;
    }
    try {
      setDraftingAi(true);
      setFeedback(null);
      const res = await api.draftAnnouncementWithAI(title.trim());
      if (res.title) setTitle(res.title);
      if (res.message) setMessage(res.message);
      setFeedback({
        type: 'success',
        message: res.note || 'AI draft generated successfully! You can review and edit before broadcasting.',
      });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to draft with AI.' });
    } finally {
      setDraftingAi(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!title.trim() || !message.trim()) {
      setFeedback({ type: 'error', message: 'Please enter both an announcement title and message.' });
      return;
    }

    try {
      setSubmitting(true);
      await onCreateAnnouncement({
        title: title.trim(),
        message: message.trim(),
        audience,
        pinned,
      });
      setFeedback({
        type: 'success',
        message: `Announcement "${title}" broadcast successfully to ${audience}.`,
      });
      setTitle('');
      setMessage('');
      setPinned(false);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to post announcement.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id);
      await onDeleteAnnouncement(id);
      setFeedback({ type: 'success', message: 'Announcement deleted.' });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to delete announcement.' });
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-8">
      {/* Creation Card */}
      <DashboardCard
        title={
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#3657FF]/15 text-[#3657FF]">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[#F8FAFC]">Announcements</h2>
              <p className="text-xs text-[#94A3B8]">
                Publish official news, policy updates, and broadcast messages
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
          <div className="flex flex-col sm:flex-row sm:items-end gap-3">
            <div className="flex-1">
              <FormInput
                label="Announcement Title or Topic"
                placeholder="e.g. Q4 All-Hands Meeting & Strategic Milestones"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <button
              type="button"
              onClick={handleAiDraft}
              disabled={draftingAi}
              className="px-3.5 py-2.5 rounded-lg bg-gradient-to-r from-[#102FF5]/20 to-[#3657FF]/20 border border-[#3657FF]/40 hover:border-[#3657FF] text-xs font-semibold text-[#CBD5E1] hover:text-white flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap self-stretch sm:self-auto justify-center"
              title="Use Gemini to generate a professional announcement draft from the title"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#3657FF]" />
              {draftingAi ? 'Drafting with AI...' : 'Draft with AI'}
            </button>
          </div>

          <FormTextarea
            label="Message"
            placeholder="Write the full announcement contents here..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end pt-1">
            <SelectInput
              label="Audience Selector"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              options={audienceOptions}
              required
            />

            <div className="flex items-center justify-between sm:justify-end gap-4 h-10">
              <label className="flex items-center gap-2 text-xs font-medium text-[#CBD5E1] cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={pinned}
                  onChange={(e) => setPinned(e.target.checked)}
                  className="rounded border-[#2B3A50] bg-[#334155] text-[#3657FF] focus:ring-[#3657FF]"
                />
                Pin to top
              </label>

              <PrimaryButton
                type="submit"
                isLoading={submitting}
                className="py-2.5 px-6"
                icon={<Send className="w-4 h-4" />}
              >
                Create Announcement
              </PrimaryButton>
            </div>
          </div>
        </form>
      </DashboardCard>

      {/* Published Announcements List */}
      <DashboardCard
        title={
          <div className="flex items-center justify-between w-full">
            <div>
              <h2 className="text-lg font-semibold text-[#F8FAFC]">Published Announcements</h2>
              <p className="text-xs text-[#94A3B8]">
                Currently live broadcasts across company and departmental portals
              </p>
            </div>
            <span className="text-xs text-[#94A3B8] font-medium bg-[#111C32] px-2.5 py-1 rounded-full border border-[#2B3A50]">
              Total: {announcements.length}
            </span>
          </div>
        }
      >
        {loading ? (
          <div className="py-12 text-center text-sm text-[#94A3B8]">Loading announcements...</div>
        ) : announcements.length === 0 ? (
          <EmptyState
            icon={<Bell className="w-8 h-8 text-[#94A3B8]" />}
            title="No announcements published"
            description="Use the broadcast form above to communicate with employees or specific departments."
          />
        ) : (
          <div className="space-y-4">
            {announcements.map((ann) => (
              <div
                key={ann.id}
                className="p-5 rounded-xl bg-[#111C32]/60 border border-[#2B3A50] hover:border-[#3657FF]/40 transition-all flex flex-col md:flex-row md:items-start justify-between gap-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    {ann.pinned && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#3657FF]/20 text-[#3657FF] border border-[#3657FF]/30">
                        <Sparkles className="w-3 h-3" /> Pinned
                      </span>
                    )}
                    <h3 className="text-base font-semibold text-[#F8FAFC]">{ann.title}</h3>
                    <span className="inline-flex items-center gap-1 text-xs bg-[#334155]/60 text-[#CBD5E1] px-2.5 py-0.5 rounded-full border border-[#2B3A50]">
                      <Tag className="w-3 h-3 text-[#3657FF]" />
                      Audience: {ann.audience}
                    </span>
                  </div>

                  <p className="text-sm text-[#CBD5E1] whitespace-pre-line leading-relaxed">
                    {ann.message}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-[#94A3B8] pt-2 border-t border-[#2B3A50]/40">
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5" />
                      Created by {ann.createdByName}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(ann.createdAt)}
                    </span>
                  </div>
                </div>

                <div className="self-end md:self-start">
                  <button
                    onClick={() => handleDelete(ann.id)}
                    disabled={deletingId === ann.id}
                    className="p-2 rounded-lg text-[#EF4444] bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 transition-colors cursor-pointer"
                    title="Delete announcement"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </DashboardCard>
    </div>
  );
};
