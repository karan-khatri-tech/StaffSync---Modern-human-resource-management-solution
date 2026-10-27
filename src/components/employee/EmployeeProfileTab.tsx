import React, { useState } from 'react';
import { User as UserIcon, Mail, Briefcase, Building2, Phone, MapPin, Calendar, Edit3, Check } from 'lucide-react';
import { User } from '../../types/index.js';
import { DashboardCard } from '../common/DashboardCard.js';
import { FormInput } from '../common/FormControls.js';
import { PrimaryButton, SecondaryButton } from '../common/Buttons.js';
import { AlertBanner } from '../common/Feedback.js';

interface EmployeeProfileTabProps {
  currentUser: User;
  onUpdateProfile: (updates: { phone?: string; address?: string }) => Promise<void>;
}

export const EmployeeProfileTab: React.FC<EmployeeProfileTabProps> = ({
  currentUser,
  onUpdateProfile,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [address, setAddress] = useState(currentUser.address || '');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    try {
      setSaving(true);
      await onUpdateProfile({ phone, address });
      setFeedback({ type: 'success', message: 'Profile contact details updated successfully.' });
      setIsEditing(false);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to update profile.' });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setPhone(currentUser.phone || '');
    setAddress(currentUser.address || '');
    setIsEditing(false);
    setFeedback(null);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <DashboardCard
        title={
          <div className="flex items-center justify-between w-full">
            <h2 className="text-xl font-bold text-[#F8FAFC]">My Profile</h2>
            {!isEditing && (
              <SecondaryButton
                onClick={() => setIsEditing(true)}
                className="text-xs py-1.5 px-3"
                icon={<Edit3 className="w-3.5 h-3.5 text-[#3657FF]" />}
              >
                Edit Contact Info
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

        {/* Minimal clean vertical card as specified in Section 3.4 */}
        <div className="space-y-6">
          <div className="flex items-center gap-4 pb-6 border-b border-[#2B3A50]">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#102FF5] to-[#3657FF] flex items-center justify-center text-white font-bold text-xl shadow-lg border-2 border-[#2B3A50]">
              {currentUser.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .substring(0, 2)
                .toUpperCase()}
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#F8FAFC]">{currentUser.name}</h3>
              <p className="text-xs text-[#94A3B8]">{currentUser.position}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#334155] text-[#CBD5E1]">
                  Role: {currentUser.role}
                </span>
                <span className="text-[10px] font-semibold text-[#3657FF] bg-[#3657FF]/10 px-2 py-0.5 rounded">
                  {currentUser.department}
                </span>
              </div>
            </div>
          </div>

          {!isEditing ? (
            <div className="space-y-4 text-sm divide-y divide-[#2B3A50]/40">
              <div className="flex items-center justify-between py-2">
                <span className="text-[#94A3B8] font-medium flex items-center gap-2">
                  <UserIcon className="w-4 h-4 text-[#94A3B8]" /> Name:
                </span>
                <span className="font-semibold text-[#F8FAFC]">{currentUser.name}</span>
              </div>

              <div className="flex items-center justify-between py-2">
                <span className="text-[#94A3B8] font-medium flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#94A3B8]" /> Email:
                </span>
                <span className="font-medium text-[#CBD5E1]">{currentUser.email}</span>
              </div>

              <div className="flex items-center justify-between py-2">
                <span className="text-[#94A3B8] font-medium flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-[#94A3B8]" /> Role:
                </span>
                <span className="font-semibold text-[#3657FF] capitalize">{currentUser.role}</span>
              </div>

              <div className="flex items-center justify-between py-2">
                <span className="text-[#94A3B8] font-medium flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#94A3B8]" /> Department:
                </span>
                <span className="font-medium text-[#F8FAFC]">{currentUser.department}</span>
              </div>

              <div className="flex items-center justify-between py-2">
                <span className="text-[#94A3B8] font-medium flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#94A3B8]" /> Phone:
                </span>
                <span className="font-medium text-[#F8FAFC]">{currentUser.phone || 'Not provided'}</span>
              </div>

              <div className="flex items-center justify-between py-2">
                <span className="text-[#94A3B8] font-medium flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#94A3B8]" /> Address:
                </span>
                <span className="font-medium text-[#F8FAFC] text-right max-w-xs">{currentUser.address || 'Not provided'}</span>
              </div>

              {currentUser.joinDate && (
                <div className="flex items-center justify-between py-2">
                  <span className="text-[#94A3B8] font-medium flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#94A3B8]" /> Joined:
                  </span>
                  <span className="font-medium text-[#CBD5E1]">{currentUser.joinDate}</span>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-4">
              <div className="p-3 rounded-lg bg-[#111C32] border border-[#2B3A50] text-xs text-[#94A3B8]">
                Role, Email, and Department are secured by HR policy and can only be altered by an authorized administrator. You can update your contact phone and mailing address below.
              </div>

              <FormInput
                label="Phone Number"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
              />

              <FormInput
                label="Mailing Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="123 Main Street, Suite 400"
              />

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#2B3A50]">
                <SecondaryButton type="button" onClick={handleCancel} disabled={saving}>
                  Cancel
                </SecondaryButton>
                <PrimaryButton type="submit" isLoading={saving} icon={<Check className="w-4 h-4" />}>
                  Save Changes
                </PrimaryButton>
              </div>
            </form>
          )}
        </div>
      </DashboardCard>
    </div>
  );
};
