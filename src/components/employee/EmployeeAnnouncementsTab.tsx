import React from 'react';
import { Bell, GraduationCap, Calendar, User, Tag, Sparkles } from 'lucide-react';
import { Announcement, TrainingSession } from '../../types/index.js';
import { DashboardCard } from '../common/DashboardCard.js';
import { EmptyState } from '../common/Feedback.js';

interface EmployeeAnnouncementsTabProps {
  announcements: Announcement[];
  trainings: TrainingSession[];
  loadingAnnouncements: boolean;
  loadingTrainings: boolean;
}

export const EmployeeAnnouncementsTab: React.FC<EmployeeAnnouncementsTabProps> = ({
  announcements,
  trainings,
  loadingAnnouncements,
  loadingTrainings,
}) => {
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      {/* Left Card: Announcements */}
      <DashboardCard
        title={
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#3657FF]/15 text-[#3657FF]">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[#F8FAFC]">Announcements</h2>
              <p className="text-xs text-[#94A3B8]">Company-wide updates & departmental notices</p>
            </div>
          </div>
        }
      >
        {loadingAnnouncements ? (
          <div className="py-8 text-center text-sm text-[#94A3B8]">Loading announcements...</div>
        ) : announcements.length === 0 ? (
          <EmptyState
            icon={<Bell className="w-6 h-6 text-[#94A3B8]" />}
            title="No announcements yet"
            description="All new company updates and departmental announcements will appear right here."
          />
        ) : (
          <div className="space-y-4">
            {announcements.map((ann) => (
              <div
                key={ann.id}
                className={`p-4 rounded-xl border transition-all ${
                  ann.pinned
                    ? 'bg-[#111C32] border-[#3657FF]/40 shadow-md shadow-[#3657FF]/5'
                    : 'bg-[#111C32]/60 border-[#2B3A50] hover:border-[#3657FF]/40'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {ann.pinned && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#3657FF]/20 text-[#3657FF] border border-[#3657FF]/30">
                        <Sparkles className="w-3 h-3" /> Pinned
                      </span>
                    )}
                    <h3 className="text-base font-semibold text-[#F8FAFC] leading-snug">{ann.title}</h3>
                  </div>
                  <span className="text-[11px] text-[#94A3B8] whitespace-nowrap">
                    {formatDate(ann.createdAt)}
                  </span>
                </div>

                <p className="text-sm text-[#CBD5E1] leading-relaxed whitespace-pre-line mb-3">
                  {ann.message}
                </p>

                <div className="flex items-center justify-between text-xs text-[#94A3B8] pt-2 border-t border-[#2B3A50]/60">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#94A3B8]" />
                    <span>Posted by {ann.createdByName}</span>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-[#334155]/60 text-[#CBD5E1]">
                    <Tag className="w-3 h-3 text-[#3657FF]" />
                    {ann.audience}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </DashboardCard>

      {/* Right Card: Training */}
      <DashboardCard
        title={
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/15 text-[#22C55E]">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[#F8FAFC]">Training & Development</h2>
              <p className="text-xs text-[#94A3B8]">Scheduled programs and skill workshops</p>
            </div>
          </div>
        }
      >
        {loadingTrainings ? (
          <div className="py-8 text-center text-sm text-[#94A3B8]">Loading training sessions...</div>
        ) : trainings.length === 0 ? (
          <EmptyState
            icon={<GraduationCap className="w-6 h-6 text-[#94A3B8]" />}
            title="No training sessions scheduled"
            description="Upcoming webinars, skills training, and compliance sessions will be listed here."
          />
        ) : (
          <div className="space-y-3.5">
            {trainings.map((trn) => (
              <div
                key={trn.id}
                className="p-4 rounded-xl bg-[#111C32]/60 border border-[#2B3A50] hover:border-emerald-500/40 transition-all"
              >
                <div className="flex items-start justify-between gap-3 mb-1.5">
                  <h3 className="text-sm font-semibold text-[#F8FAFC] leading-snug">
                    {trn.title}
                  </h3>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/15 text-[#22C55E] border border-emerald-500/30 whitespace-nowrap">
                    <Calendar className="w-3 h-3" />
                    {formatDate(trn.scheduledDate)}
                  </span>
                </div>

                <p className="text-xs text-[#CBD5E1] line-clamp-2 mb-3 leading-relaxed">
                  {trn.description}
                </p>

                <div className="flex items-center justify-between text-xs text-[#94A3B8] pt-2 border-t border-[#2B3A50]/60">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[#94A3B8]">Trainer:</span>
                    <span className="font-medium text-[#F8FAFC]">{trn.trainerName}</span>
                  </div>
                  <span className="text-[11px] bg-[#334155]/60 text-[#CBD5E1] px-2 py-0.5 rounded">
                    {trn.assignedTo}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </DashboardCard>
    </div>
  );
};
