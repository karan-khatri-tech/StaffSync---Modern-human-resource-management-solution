export type Role = 'employee' | 'manager';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  department: string;
  position: string;
  salary?: number;
  joinDate?: string;
  phone?: string;
  address?: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface EmployeeRecord {
  id: string;
  userId?: string;
  name: string;
  email: string;
  department: string;
  position: string;
  salary: number;
  joinDate: string;
  phone: string;
  address: string;
  status: 'Active' | 'On Leave' | 'Terminated';
  createdAt: string;
}

export type LeaveStatus = 'Pending' | 'Approved' | 'Rejected';

export interface LeaveApplication {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  department: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: LeaveStatus;
  appliedAt: string;
  reviewedBy?: string;
  reviewedByName?: string;
  reviewedAt?: string;
  decisionNote?: string;
}

export type AttendanceStatus = 'Present' | 'In Progress' | 'Checked Out' | 'Absent';

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  department: string;
  date: string;
  checkInTime: string;
  checkOutTime?: string;
  durationMinutes?: number;
  status: AttendanceStatus;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  audience: string;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  pinned?: boolean;
}

export interface TrainingSession {
  id: string;
  title: string;
  description: string;
  trainerName: string;
  scheduledDate: string;
  assignedTo: string;
  createdBy: string;
  createdAt: string;
}

export type KanbanStatus = 'backlog' | 'in_progress' | 'review' | 'completed';
export type KanbanPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface KanbanTask {
  id: string;
  title: string;
  description: string;
  status: KanbanStatus;
  priority: KanbanPriority;
  assignedTo?: string;
  assignedName?: string;
  dueDate?: string;
  tags?: string[];
  createdAt: string;
}

export interface DashboardStats {
  totalEmployees: number;
  pendingLeaves: number;
  approvedLeavesThisMonth: number;
  presentToday: number;
  todayAttendanceRate: number;
  activeTrainings: number;
  announcementsCount: number;
}
