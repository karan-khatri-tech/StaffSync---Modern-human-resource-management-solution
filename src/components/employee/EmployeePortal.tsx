import React, { useState, useEffect } from 'react';
import { User, Announcement, TrainingSession, LeaveApplication, AttendanceRecord } from '../../types/index.js';
import { api } from '../../lib/api.js';
import { EmployeeNavigation, EmployeeTab } from './EmployeeNavigation.js';
import { EmployeeAnnouncementsTab } from './EmployeeAnnouncementsTab.js';
import { EmployeeLeavesTab } from './EmployeeLeavesTab.js';
import { EmployeeAttendanceTab } from './EmployeeAttendanceTab.js';
import { EmployeeProfileTab } from './EmployeeProfileTab.js';

interface EmployeePortalProps {
  currentUser: User;
  onRefreshUser: () => Promise<void>;
}

export const EmployeePortal: React.FC<EmployeePortalProps> = ({
  currentUser,
  onRefreshUser,
}) => {
  const [activeTab, setActiveTab] = useState<EmployeeTab>('announcements');

  // Announcements & Trainings
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [trainings, setTrainings] = useState<TrainingSession[]>([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(false);
  const [loadingTrainings, setLoadingTrainings] = useState(false);

  // Leaves
  const [leaves, setLeaves] = useState<LeaveApplication[]>([]);
  const [loadingLeaves, setLoadingLeaves] = useState(false);

  // Attendance
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null);
  const [todayDate, setTodayDate] = useState<string>('');
  const [loadingAttendance, setLoadingAttendance] = useState(false);

  // Load announcements
  const fetchAnnouncements = async () => {
    try {
      setLoadingAnnouncements(true);
      const res = await api.getAnnouncements();
      setAnnouncements(res.announcements);
    } catch (err) {
      console.error('Failed to load announcements:', err);
    } finally {
      setLoadingAnnouncements(false);
    }
  };

  // Load trainings
  const fetchTrainings = async () => {
    try {
      setLoadingTrainings(true);
      const res = await api.getTrainings();
      setTrainings(res.trainings);
    } catch (err) {
      console.error('Failed to load trainings:', err);
    } finally {
      setLoadingTrainings(false);
    }
  };

  // Load leaves
  const fetchLeaves = async () => {
    try {
      setLoadingLeaves(true);
      const res = await api.getLeaves();
      setLeaves(res.leaves);
    } catch (err) {
      console.error('Failed to load leaves:', err);
    } finally {
      setLoadingLeaves(false);
    }
  };

  // Load attendance
  const fetchAttendance = async () => {
    try {
      setLoadingAttendance(true);
      const res = await api.getAttendance();
      setAttendanceRecords(res.records);
      setTodayRecord(res.todayRecord || null);
      setTodayDate(res.todayDate);
    } catch (err) {
      console.error('Failed to load attendance:', err);
    } finally {
      setLoadingAttendance(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchAnnouncements();
    fetchTrainings();
    fetchLeaves();
    fetchAttendance();
  }, [currentUser.id]);

  // Handle applying for leave
  const handleApplyLeave = async (startDate: string, endDate: string, reason: string) => {
    await api.applyLeave(startDate, endDate, reason);
    await fetchLeaves();
  };

  // Handle check-in
  const handleCheckIn = async () => {
    await api.checkIn();
    await fetchAttendance();
  };

  // Handle check-out
  const handleCheckOut = async () => {
    await api.checkOut();
    await fetchAttendance();
  };

  // Handle updating profile
  const handleUpdateProfile = async (updates: { phone?: string; address?: string }) => {
    const empRes = await api.getEmployees();
    const myEmp = empRes.employees.find((e) => e.email.toLowerCase() === currentUser.email.toLowerCase());
    if (myEmp) {
      await api.updateEmployee(myEmp.id, updates);
    }
    await onRefreshUser();
  };

  const pendingLeavesCount = leaves.filter((l) => l.status === 'Pending').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      {/* Welcome banner */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#F8FAFC]">
            Welcome back, {currentUser.name}
          </h1>
          <p className="text-xs text-[#94A3B8] mt-1">
            {currentUser.position} &bull; {currentUser.department} Department
          </p>
        </div>
      </div>

      {/* Horizontal Tab Navigation */}
      <EmployeeNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        pendingLeavesCount={pendingLeavesCount}
      />

      {/* Active Tab View */}
      {activeTab === 'announcements' && (
        <EmployeeAnnouncementsTab
          announcements={announcements}
          trainings={trainings}
          loadingAnnouncements={loadingAnnouncements}
          loadingTrainings={loadingTrainings}
        />
      )}

      {activeTab === 'leaves' && (
        <EmployeeLeavesTab
          leaves={leaves}
          loadingLeaves={loadingLeaves}
          onApplyLeave={handleApplyLeave}
        />
      )}

      {activeTab === 'attendance' && (
        <EmployeeAttendanceTab
          records={attendanceRecords}
          todayRecord={todayRecord}
          todayDate={todayDate}
          loading={loadingAttendance}
          onCheckIn={handleCheckIn}
          onCheckOut={handleCheckOut}
        />
      )}

      {activeTab === 'profile' && (
        <EmployeeProfileTab
          currentUser={currentUser}
          onUpdateProfile={handleUpdateProfile}
        />
      )}
    </div>
  );
};
