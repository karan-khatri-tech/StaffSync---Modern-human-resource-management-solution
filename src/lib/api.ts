import {
  User,
  EmployeeRecord,
  LeaveApplication,
  AttendanceRecord,
  Announcement,
  TrainingSession,
  KanbanTask,
  DashboardStats,
} from '../types/index.js';

const TOKEN_KEY = 'staffsync_auth_token';
const USER_KEY = 'staffsync_auth_user';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): User | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setStoredSession(token: string, user: User): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearStoredSession(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.error || data.message || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data as T;
}

export const api = {
  // Auth
  login: (email: string, password: string) =>
    request<{ token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (data: {
    name: string;
    email: string;
    password: string;
    department?: string;
    position?: string;
    phone?: string;
    address?: string;
  }) =>
    request<{ message: string; token: string; user: User }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  demoSwitch: (email: string) =>
    request<{ token: string; user: User }>('/api/auth/demo-switch', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  getMe: () => request<{ user: User }>('/api/auth/me'),

  // Leaves
  getLeaves: (status?: string, employeeId?: string) => {
    const params = new URLSearchParams();
    if (status && status !== 'All') params.append('status', status);
    if (employeeId && employeeId !== 'All') params.append('employeeId', employeeId);
    const query = params.toString() ? `?${params.toString()}` : '';
    return request<{ leaves: LeaveApplication[] }>(`/api/leaves${query}`);
  },

  applyLeave: (startDate: string, endDate: string, reason: string) =>
    request<{ message: string; leave: LeaveApplication }>('/api/leaves', {
      method: 'POST',
      body: JSON.stringify({ startDate, endDate, reason }),
    }),

  updateLeaveStatus: (id: string, status: 'Approved' | 'Rejected', decisionNote?: string) =>
    request<{ message: string; leave: LeaveApplication }>(`/api/leaves/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, decisionNote }),
    }),

  // Attendance
  getAttendance: (employeeId?: string, date?: string) => {
    const params = new URLSearchParams();
    if (employeeId && employeeId !== 'All') params.append('employeeId', employeeId);
    if (date) params.append('date', date);
    const query = params.toString() ? `?${params.toString()}` : '';
    return request<{
      records: AttendanceRecord[];
      todayRecord?: AttendanceRecord | null;
      todayDate: string;
    }>(`/api/attendance${query}`);
  },

  checkIn: () =>
    request<{ message: string; record: AttendanceRecord }>('/api/attendance/check-in', {
      method: 'POST',
    }),

  checkOut: () =>
    request<{ message: string; record: AttendanceRecord }>('/api/attendance/check-out', {
      method: 'POST',
    }),

  // Employees
  getEmployees: () => request<{ employees: EmployeeRecord[] }>('/api/employees'),

  addEmployee: (employee: Partial<EmployeeRecord>) =>
    request<{ message: string; employee: EmployeeRecord }>('/api/employees', {
      method: 'POST',
      body: JSON.stringify(employee),
    }),

  updateEmployee: (id: string, employee: Partial<EmployeeRecord>) =>
    request<{ message: string; employee: EmployeeRecord }>(`/api/employees/${id}`, {
      method: 'PUT',
      body: JSON.stringify(employee),
    }),

  deleteEmployee: (id: string) =>
    request<{ message: string; id: string }>(`/api/employees/${id}`, {
      method: 'DELETE',
    }),

  // Announcements
  getAnnouncements: () => request<{ announcements: Announcement[] }>('/api/announcements'),

  createAnnouncement: (announcement: Partial<Announcement>) =>
    request<{ message: string; announcement: Announcement }>('/api/announcements', {
      method: 'POST',
      body: JSON.stringify(announcement),
    }),

  deleteAnnouncement: (id: string) =>
    request<{ message: string; id: string }>(`/api/announcements/${id}`, {
      method: 'DELETE',
    }),

  // Training Sessions
  getTrainings: () => request<{ trainings: TrainingSession[] }>('/api/trainings'),

  createTraining: (training: Partial<TrainingSession>) =>
    request<{ message: string; training: TrainingSession }>('/api/trainings', {
      method: 'POST',
      body: JSON.stringify(training),
    }),

  updateTraining: (id: string, training: Partial<TrainingSession>) =>
    request<{ message: string; training: TrainingSession }>(`/api/trainings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(training),
    }),

  deleteTraining: (id: string) =>
    request<{ message: string; id: string }>(`/api/trainings/${id}`, {
      method: 'DELETE',
    }),

  // Kanban
  getKanbanTasks: () => request<{ tasks: KanbanTask[] }>('/api/kanban'),

  createKanbanTask: (task: Partial<KanbanTask>) =>
    request<{ message: string; task: KanbanTask }>('/api/kanban', {
      method: 'POST',
      body: JSON.stringify(task),
    }),

  updateKanbanTask: (id: string, updates: Partial<KanbanTask>) =>
    request<{ message: string; task: KanbanTask }>(`/api/kanban/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }),

  deleteKanbanTask: (id: string) =>
    request<{ message: string; id: string }>(`/api/kanban/${id}`, {
      method: 'DELETE',
    }),

  // Stats
  getStats: () => request<DashboardStats>('/api/stats'),

  // AI Assistant (Gemini)
  draftAnnouncementWithAI: (topic: string, tone?: string) =>
    request<{ title: string; message: string; isFallback?: boolean; note?: string }>(
      '/api/ai/draft-announcement',
      {
        method: 'POST',
        body: JSON.stringify({ topic, tone }),
      }
    ),
};
