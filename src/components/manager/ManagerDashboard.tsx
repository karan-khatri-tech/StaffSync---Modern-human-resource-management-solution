import React, { useState, useEffect } from 'react';
import {
  User,
  LeaveApplication,
  EmployeeRecord,
  Announcement,
  AttendanceRecord,
  TrainingSession,
} from '../../types/index.js';
import { api } from '../../lib/api.js';
import { ManagerNavigation, ManagerTab } from './ManagerNavigation.js';
import { ManagerLeavesTab } from './ManagerLeavesTab.js';
import { ManagerEmployeesTab } from './ManagerEmployeesTab.js';
import { ManagerAnnouncementsTab } from './ManagerAnnouncementsTab.js';
import { ManagerAttendanceTab } from './ManagerAttendanceTab.js';
import { ManagerTrainingTab } from './ManagerTrainingTab.js';

interface ManagerDashboardProps {
  currentUser: User;
  onLogout: () => void;
}

export const ManagerDashboard: React.FC<ManagerDashboardProps> = ({
  currentUser,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<ManagerTab>('leaves');

  // Leaves
  const [leaves, setLeaves] = useState<LeaveApplication[]>([]);
  const [loadingLeaves, setLoadingLeaves] = useState(false);

  // Employees
  const [employees, setEmployees] = useState<EmployeeRecord[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);

  // Announcements
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(false);

  // Attendance
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [todayDate, setTodayDate] = useState<string>('');
  const [loadingAttendance, setLoadingAttendance] = useState(false);

  // Training
  const [trainings, setTrainings] = useState<TrainingSession[]>([]);
  const [loadingTrainings, setLoadingTrainings] = useState(false);

  // Fetch functions
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

  const fetchEmployees = async () => {
    try {
      setLoadingEmployees(true);
      const res = await api.getEmployees();
      setEmployees(res.employees);
    } catch (err) {
      console.error('Failed to load employees:', err);
    } finally {
      setLoadingEmployees(false);
    }
  };

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

  const fetchAttendance = async () => {
    try {
      setLoadingAttendance(true);
      const res = await api.getAttendance();
      setAttendance(res.records);
      setTodayDate(res.todayDate);
    } catch (err) {
      console.error('Failed to load attendance:', err);
    } finally {
      setLoadingAttendance(false);
    }
  };

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

  useEffect(() => {
    fetchLeaves();
    fetchEmployees();
    fetchAnnouncements();
    fetchAttendance();
    fetchTrainings();
  }, [currentUser.id]);

  // Actions
  const handleUpdateLeaveStatus = async (
    id: string,
    status: 'Approved' | 'Rejected',
    note?: string
  ) => {
    await api.updateLeaveStatus(id, status, note);
    await fetchLeaves();
  };

  const handleAddEmployee = async (emp: Partial<EmployeeRecord>) => {
    await api.addEmployee(emp);
    await fetchEmployees();
  };

  const handleUpdateEmployee = async (id: string, emp: Partial<EmployeeRecord>) => {
    await api.updateEmployee(id, emp);
    await fetchEmployees();
  };

  const handleDeleteEmployee = async (id: string) => {
    await api.deleteEmployee(id);
    await fetchEmployees();
  };

  const handleCreateAnnouncement = async (ann: Partial<Announcement>) => {
    await api.createAnnouncement(ann);
    await fetchAnnouncements();
  };

  const handleDeleteAnnouncement = async (id: string) => {
    await api.deleteAnnouncement(id);
    await fetchAnnouncements();
  };

  const handleCreateTraining = async (trn: Partial<TrainingSession>) => {
    await api.createTraining(trn);
    await fetchTrainings();
  };

  const handleUpdateTraining = async (id: string, trn: Partial<TrainingSession>) => {
    await api.updateTraining(id, trn);
    await fetchTrainings();
  };

  const handleDeleteTraining = async (id: string) => {
    await api.deleteTraining(id);
    await fetchTrainings();
  };

  const pendingLeavesCount = leaves.filter((l) => l.status === 'Pending').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      {/* Top Header as instructed in Section 4 */}
      <div className="flex items-center justify-between pb-6 mb-6 border-b border-[#2B3A50]">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-[#3657FF] bg-[#3657FF]/10 px-2.5 py-1 rounded">
            HR Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F8FAFC] mt-2">
            HR Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-[#94A3B8] mt-1">
            Logged in as {currentUser.name} &bull; {currentUser.position}
          </p>
        </div>

        <button
          onClick={onLogout}
          className="text-xs font-semibold px-3.5 py-2 rounded-lg bg-[#18253B] border border-[#2B3A50] text-[#CBD5E1] hover:text-[#EF4444] hover:border-rose-500/40 transition-colors cursor-pointer"
        >
          Logout
        </button>
      </div>

      {/* Horizontal Tabs */}
      <ManagerNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        pendingLeavesCount={pendingLeavesCount}
      />

      {/* Tab Panels */}
      {activeTab === 'leaves' && (
        <ManagerLeavesTab
          leaves={leaves}
          loading={loadingLeaves}
          onUpdateStatus={handleUpdateLeaveStatus}
        />
      )}

      {activeTab === 'employees' && (
        <ManagerEmployeesTab
          employees={employees}
          loading={loadingEmployees}
          onAddEmployee={handleAddEmployee}
          onUpdateEmployee={handleUpdateEmployee}
          onDeleteEmployee={handleDeleteEmployee}
        />
      )}

      {activeTab === 'announcements' && (
        <ManagerAnnouncementsTab
          announcements={announcements}
          loading={loadingAnnouncements}
          onCreateAnnouncement={handleCreateAnnouncement}
          onDeleteAnnouncement={handleDeleteAnnouncement}
        />
      )}

      {activeTab === 'attendance' && (
        <ManagerAttendanceTab
          records={attendance}
          employees={employees}
          todayDate={todayDate}
          loading={loadingAttendance}
        />
      )}

      {activeTab === 'training' && (
        <ManagerTrainingTab
          trainings={trainings}
          employees={employees}
          loading={loadingTrainings}
          onCreateTraining={handleCreateTraining}
          onUpdateTraining={handleUpdateTraining}
          onDeleteTraining={handleDeleteTraining}
        />
      )}
    </div>
  );
};
