import fs from 'node:fs';
import path from 'node:path';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
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
import { UserModel } from './models/User.js';
import { EmployeeModel } from './models/Employee.js';
import { LeaveModel } from './models/Leave.js';
import { AttendanceModel } from './models/Attendance.js';
import { AnnouncementModel } from './models/Announcement.js';
import { TrainingModel } from './models/Training.js';
import { KanbanModel } from './models/Kanban.js';

interface DatabaseSchema {
  users: Array<User & { passwordHash: string }>;
  employees: EmployeeRecord[];
  leaves: LeaveApplication[];
  attendance: AttendanceRecord[];
  announcements: Announcement[];
  trainings: TrainingSession[];
  kanban: KanbanTask[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'staffsync_db.json');

function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

function verifyPassword(password: string, hash: string): boolean {
  try {
    return bcrypt.compareSync(password, hash);
  } catch {
    return false;
  }
}

function generateInitialData(): DatabaseSchema {
  const defaultPassword = 'Password123!';
  const passwordHash = hashPassword(defaultPassword);

  const users: DatabaseSchema['users'] = [
    {
      id: 'usr-sarah-jenkins',
      email: 'sarah.hr@staffsync.io',
      name: 'Sarah Jenkins',
      role: 'manager',
      department: 'Human Resources',
      position: 'HR Director',
      salary: 115000,
      joinDate: '2021-03-15',
      phone: '+1 (555) 234-5678',
      address: '742 Evergreen Terrace, San Francisco, CA',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      createdAt: '2021-03-15T09:00:00Z',
      passwordHash,
    },
    {
      id: 'usr-john-doe',
      email: 'john.doe@staffsync.io',
      name: 'John Doe',
      role: 'employee',
      department: 'Engineering',
      position: 'Senior Software Engineer',
      salary: 135000,
      joinDate: '2022-06-01',
      phone: '+1 (555) 345-6789',
      address: '120 Market St, Apt 4B, San Francisco, CA',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      createdAt: '2022-06-01T09:00:00Z',
      passwordHash,
    },
    {
      id: 'usr-emily-chen',
      email: 'emily.chen@staffsync.io',
      name: 'Emily Chen',
      role: 'employee',
      department: 'Design',
      position: 'Lead UI/UX Designer',
      salary: 120000,
      joinDate: '2023-01-10',
      phone: '+1 (555) 456-7890',
      address: '450 Pine Street, Berkeley, CA',
      avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
      createdAt: '2023-01-10T09:00:00Z',
      passwordHash,
    },
    {
      id: 'usr-marcus-vance',
      email: 'marcus.vance@staffsync.io',
      name: 'Marcus Vance',
      role: 'employee',
      department: 'Marketing',
      position: 'Product Marketing Manager',
      salary: 105000,
      joinDate: '2023-08-15',
      phone: '+1 (555) 567-8901',
      address: '880 Howard Blvd, Oakland, CA',
      avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
      createdAt: '2023-08-15T09:00:00Z',
      passwordHash,
    },
    {
      id: 'usr-david-kim',
      email: 'david.kim@staffsync.io',
      name: 'David Kim',
      role: 'employee',
      department: 'Operations',
      position: 'Operations Specialist',
      salary: 92000,
      joinDate: '2024-02-01',
      phone: '+1 (555) 678-9012',
      address: '320 4th Street, San Jose, CA',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      createdAt: '2024-02-01T09:00:00Z',
      passwordHash,
    },
  ];

  const employees: EmployeeRecord[] = users.map((u) => ({
    id: u.id.replace('usr-', 'emp-'),
    userId: u.id,
    name: u.name,
    email: u.email,
    department: u.department,
    position: u.position,
    salary: u.salary || 90000,
    joinDate: u.joinDate || '2023-01-01',
    phone: u.phone || '+1 (555) 000-0000',
    address: u.address || 'San Francisco, CA',
    status: 'Active',
    createdAt: u.createdAt,
  }));

  const leaves: LeaveApplication[] = [
    {
      id: 'leave-101',
      employeeId: 'emp-john-doe',
      employeeName: 'John Doe',
      employeeEmail: 'john.doe@staffsync.io',
      department: 'Engineering',
      startDate: '2026-11-10',
      endDate: '2026-11-14',
      reason: 'Annual family vacation and rest period.',
      status: 'Pending',
      appliedAt: '2026-10-25T14:30:00Z',
    },
    {
      id: 'leave-102',
      employeeId: 'emp-emily-chen',
      employeeName: 'Emily Chen',
      employeeEmail: 'emily.chen@staffsync.io',
      department: 'Design',
      startDate: '2026-11-02',
      endDate: '2026-11-04',
      reason: 'Attending Design Systems Global Conference in New York.',
      status: 'Approved',
      appliedAt: '2026-10-20T10:15:00Z',
      reviewedBy: 'usr-sarah-jenkins',
      reviewedByName: 'Sarah Jenkins',
      reviewedAt: '2026-10-21T09:00:00Z',
      decisionNote: 'Approved. Enjoy the conference!',
    },
    {
      id: 'leave-103',
      employeeId: 'emp-marcus-vance',
      employeeName: 'Marcus Vance',
      employeeEmail: 'marcus.vance@staffsync.io',
      department: 'Marketing',
      startDate: '2026-10-28',
      endDate: '2026-10-29',
      reason: 'Personal medical appointment and recovery.',
      status: 'Pending',
      appliedAt: '2026-10-26T16:45:00Z',
    },
    {
      id: 'leave-104',
      employeeId: 'emp-john-doe',
      employeeName: 'John Doe',
      employeeEmail: 'john.doe@staffsync.io',
      department: 'Engineering',
      startDate: '2026-09-15',
      endDate: '2026-09-17',
      reason: 'Personal dental surgery and care.',
      status: 'Approved',
      appliedAt: '2026-09-02T11:20:00Z',
      reviewedBy: 'usr-sarah-jenkins',
      reviewedByName: 'Sarah Jenkins',
      reviewedAt: '2026-09-03T08:45:00Z',
      decisionNote: 'Medical leave approved.',
    },
  ];

  const todayStr = '2026-10-27';
  const attendance: AttendanceRecord[] = [
    {
      id: 'att-201',
      employeeId: 'emp-john-doe',
      employeeName: 'John Doe',
      employeeEmail: 'john.doe@staffsync.io',
      department: 'Engineering',
      date: todayStr,
      checkInTime: '08:52:14',
      status: 'Present',
    },
    {
      id: 'att-202',
      employeeId: 'emp-emily-chen',
      employeeName: 'Emily Chen',
      employeeEmail: 'emily.chen@staffsync.io',
      department: 'Design',
      date: todayStr,
      checkInTime: '09:04:30',
      status: 'Present',
    },
    {
      id: 'att-203',
      employeeId: 'emp-marcus-vance',
      employeeName: 'Marcus Vance',
      employeeEmail: 'marcus.vance@staffsync.io',
      department: 'Marketing',
      date: todayStr,
      checkInTime: '08:45:00',
      checkOutTime: '17:15:20',
      durationMinutes: 510,
      status: 'Checked Out',
    },
    {
      id: 'att-204',
      employeeId: 'emp-sarah-jenkins',
      employeeName: 'Sarah Jenkins',
      employeeEmail: 'sarah.hr@staffsync.io',
      department: 'Human Resources',
      date: todayStr,
      checkInTime: '08:30:10',
      status: 'Present',
    },
    {
      id: 'att-205',
      employeeId: 'emp-john-doe',
      employeeName: 'John Doe',
      employeeEmail: 'john.doe@staffsync.io',
      department: 'Engineering',
      date: '2026-10-26',
      checkInTime: '08:55:00',
      checkOutTime: '17:30:00',
      durationMinutes: 515,
      status: 'Checked Out',
    },
    {
      id: 'att-206',
      employeeId: 'emp-emily-chen',
      employeeName: 'Emily Chen',
      employeeEmail: 'emily.chen@staffsync.io',
      department: 'Design',
      date: '2026-10-26',
      checkInTime: '09:10:00',
      checkOutTime: '17:45:00',
      durationMinutes: 515,
      status: 'Checked Out',
    },
  ];

  const announcements: Announcement[] = [
    {
      id: 'ann-301',
      title: 'StaffSync Annual Benefits Open Enrollment 2026-2027',
      message: 'Open enrollment for medical, dental, and vision insurance begins November 1st. Please review plan options in your benefits portal before November 20th.',
      audience: 'All Employees',
      createdBy: 'usr-sarah-jenkins',
      createdByName: 'Sarah Jenkins',
      createdAt: '2026-10-24T10:00:00Z',
      pinned: true,
    },
    {
      id: 'ann-302',
      title: 'Q4 Company All-Hands & Product Roadmap',
      message: 'Join us this Thursday at 2:00 PM PST in the Town Hall auditorium or via virtual stream for our Q4 milestone review and 2027 roadmap unveiling.',
      audience: 'All Employees',
      createdBy: 'usr-sarah-jenkins',
      createdByName: 'Sarah Jenkins',
      createdAt: '2026-10-25T13:15:00Z',
    },
    {
      id: 'ann-303',
      title: 'Engineering Architecture Summit & Hack Week',
      message: 'The annual Engineering Summit kicks off next month. Submissions for hack projects and lightning tech talks are open through Friday.',
      audience: 'Engineering',
      createdBy: 'usr-sarah-jenkins',
      createdByName: 'Sarah Jenkins',
      createdAt: '2026-10-26T09:30:00Z',
    },
    {
      id: 'ann-304',
      title: 'Design System Tokens v3.0 Workshop',
      message: 'Join the Design and Frontend sync to review updated typography scales, dark mode contrast tokens, and Tailwind v4 component presets.',
      audience: 'Design',
      createdBy: 'usr-sarah-jenkins',
      createdByName: 'Sarah Jenkins',
      createdAt: '2026-10-26T15:00:00Z',
    },
  ];

  const trainings: TrainingSession[] = [
    {
      id: 'trn-401',
      title: 'Cybersecurity Awareness & Zero-Trust Best Practices',
      description: 'Mandatory annual refresher covering phishing defense, password hygiene, credential stuffing prevention, and multi-factor authentication policies.',
      trainerName: 'Alex Rivera (Chief Security Officer)',
      scheduledDate: '2026-11-05',
      assignedTo: 'All Employees',
      createdBy: 'usr-sarah-jenkins',
      createdAt: '2026-10-20T08:00:00Z',
    },
    {
      id: 'trn-402',
      title: 'Agile Velocity & High-Impact Sprint Planning',
      description: 'Hands-on workshop exploring estimation accuracy, reducing sprint carryover, effective grooming rituals, and cross-functional alignment.',
      trainerName: 'Sarah Jenkins (HR Director)',
      scheduledDate: '2026-11-12',
      assignedTo: 'Engineering',
      createdBy: 'usr-sarah-jenkins',
      createdAt: '2026-10-22T11:00:00Z',
    },
    {
      id: 'trn-403',
      title: 'Accessibility (a11y) & WCAG 2.2 Design Standards',
      description: 'Deep dive into color contrast ratios, screen reader testing, semantic landmarks, and building universally accessible product interfaces.',
      trainerName: 'Emily Chen (Lead Designer)',
      scheduledDate: '2026-11-18',
      assignedTo: 'Design',
      createdBy: 'usr-sarah-jenkins',
      createdAt: '2026-10-24T14:30:00Z',
    },
    {
      id: 'trn-404',
      title: 'Effective Cross-Functional Leadership & Feedback',
      description: 'Strategies for leading peer initiatives, giving constructive radical candor feedback, and running productive retrospectives.',
      trainerName: 'Marcus Vance',
      scheduledDate: '2026-11-25',
      assignedTo: 'All Employees',
      createdBy: 'usr-sarah-jenkins',
      createdAt: '2026-10-25T16:00:00Z',
    },
  ];

  const kanban: KanbanTask[] = [
    {
      id: 'kan-501',
      title: 'Onboarding packet for Senior Cloud Architect',
      description: 'Prepare laptop provisioning, GitHub org invites, Slack channels, and mentor assignment for new hire.',
      status: 'in_progress',
      priority: 'high',
      assignedTo: 'usr-sarah-jenkins',
      assignedName: 'Sarah Jenkins',
      dueDate: '2026-11-01',
      tags: ['Onboarding', 'HR Ops'],
      createdAt: '2026-10-24T10:00:00Z',
    },
    {
      id: 'kan-502',
      title: 'Audit Q3 Overtime & Time-off Balances',
      description: 'Ensure accurate rollover calculations and review outstanding leave approval queues across engineering.',
      status: 'backlog',
      priority: 'medium',
      assignedTo: 'usr-sarah-jenkins',
      assignedName: 'Sarah Jenkins',
      dueDate: '2026-11-08',
      tags: ['Payroll', 'Compliance'],
      createdAt: '2026-10-25T11:30:00Z',
    },
    {
      id: 'kan-503',
      title: 'Update remote-work expense stipend guidelines',
      description: 'Publish refreshed hardware reimbursement limits and updated monitor/ergonomic chair allowance doc.',
      status: 'review',
      priority: 'urgent',
      assignedTo: 'usr-david-kim',
      assignedName: 'David Kim',
      dueDate: '2026-10-30',
      tags: ['Policy', 'Facilities'],
      createdAt: '2026-10-22T09:00:00Z',
    },
    {
      id: 'kan-504',
      title: 'Annual Employee Engagement Survey Launch',
      description: 'Send anonymous survey to all staff measuring psychological safety, tooling satisfaction, and career growth.',
      status: 'completed',
      priority: 'high',
      assignedTo: 'usr-sarah-jenkins',
      assignedName: 'Sarah Jenkins',
      dueDate: '2026-10-20',
      tags: ['Culture', 'Engagement'],
      createdAt: '2026-10-15T14:00:00Z',
    },
  ];

  return {
    users,
    employees,
    leaves,
    attendance,
    announcements,
    trainings,
    kanban,
  };
}

class UnifiedDatabase {
  private localData: DatabaseSchema;
  private mongoConnected = false;
  private isConnecting = false;

  constructor() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.localData = JSON.parse(raw);
        // Ensure passwords use bcrypt hashes
        this.ensureBcryptHashes();
      } catch (err) {
        console.error('Error reading db file, regenerating initial state:', err);
        this.localData = generateInitialData();
        this.saveLocal();
      }
    } else {
      this.localData = generateInitialData();
      this.saveLocal();
    }
  }

  private ensureBcryptHashes(): void {
    let updated = false;
    for (const u of this.localData.users) {
      if (!u.passwordHash || !u.passwordHash.startsWith('$2')) {
        u.passwordHash = hashPassword('Password123!');
        updated = true;
      }
    }
    if (updated) this.saveLocal();
  }

  public async init(): Promise<void> {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri || mongoUri.trim() === '') {
      console.log('[StaffSync DB] MONGODB_URI not configured. Operating in robust persistent JSON storage mode.');
      return;
    }

    if (this.mongoConnected || this.isConnecting) return;

    try {
      this.isConnecting = true;
      console.log(`[StaffSync DB] Connecting to MongoDB: ${mongoUri.replace(/:[^:@]+@/, ':****@')}`);
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 5000,
      });

      this.mongoConnected = true;
      this.isConnecting = false;
      console.log('[StaffSync DB] Successfully connected to MongoDB.');

      // Check if MongoDB needs seeding
      const count = await UserModel.countDocuments();
      if (count === 0) {
        console.log('[StaffSync DB] Seeding initial data into MongoDB...');
        await this.seedMongo();
      }
    } catch (err: any) {
      this.isConnecting = false;
      this.mongoConnected = false;
      console.warn(`[StaffSync DB] Could not connect to MongoDB (${err.message}). Seamlessly running on persistent local storage.`);
    }
  }

  private async seedMongo(): Promise<void> {
    try {
      for (const u of this.localData.users) {
        await UserModel.findOneAndUpdate({ email: u.email }, u, { upsert: true, new: true });
      }
      for (const e of this.localData.employees) {
        await EmployeeModel.findOneAndUpdate({ email: e.email }, e, { upsert: true, new: true });
      }
      for (const l of this.localData.leaves) {
        await LeaveModel.findOneAndUpdate({ id: l.id }, l, { upsert: true, new: true });
      }
      for (const a of this.localData.attendance) {
        await AttendanceModel.findOneAndUpdate({ id: a.id }, a, { upsert: true, new: true });
      }
      for (const an of this.localData.announcements) {
        await AnnouncementModel.findOneAndUpdate({ id: an.id }, an, { upsert: true, new: true });
      }
      for (const t of this.localData.trainings) {
        await TrainingModel.findOneAndUpdate({ id: t.id }, t, { upsert: true, new: true });
      }
      for (const k of this.localData.kanban) {
        await KanbanModel.findOneAndUpdate({ id: k.id }, k, { upsert: true, new: true });
      }
      console.log('[StaffSync DB] MongoDB seeding completed successfully.');
    } catch (seedErr) {
      console.error('[StaffSync DB] Error during MongoDB seeding:', seedErr);
    }
  }

  private saveLocal(): void {
    try {
      const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
      fs.writeFileSync(tempFile, JSON.stringify(this.localData, null, 2), 'utf-8');
      fs.renameSync(tempFile, DB_FILE);
    } catch (err) {
      console.error('[StaffSync DB] Failed to persist database:', err);
    }
  }

  public get isConnectedToMongo(): boolean {
    return this.mongoConnected;
  }

  public hash(password: string): string {
    return hashPassword(password);
  }

  public verify(password: string, hash: string): boolean {
    return verifyPassword(password, hash);
  }

  // ---------------- User Queries ----------------
  public async getUserByEmail(email: string): Promise<(User & { passwordHash: string }) | null> {
    const cleanEmail = email.trim().toLowerCase();
    if (this.mongoConnected) {
      try {
        const doc = await UserModel.findOne({ email: cleanEmail }).lean();
        if (doc) return doc as any;
      } catch (err) {
        console.error('[StaffSync DB] Mongo getUserByEmail error:', err);
      }
    }
    const found = this.localData.users.find((u) => u.email.toLowerCase() === cleanEmail);
    return found ? { ...found } : null;
  }

  public async getUserById(id: string): Promise<User | null> {
    if (this.mongoConnected) {
      try {
        const doc = await UserModel.findOne({ id }).lean();
        if (doc) {
          const { passwordHash, salt, ...rest } = doc as any;
          return rest as User;
        }
      } catch (err) {
        console.error('[StaffSync DB] Mongo getUserById error:', err);
      }
    }
    const found = this.localData.users.find((u) => u.id === id);
    if (!found) return null;
    const { passwordHash, salt, ...rest } = found as any;
    return { ...rest };
  }

  public async createUser(user: User & { passwordHash: string }): Promise<void> {
    this.localData.users.push(user);
    this.saveLocal();

    if (this.mongoConnected) {
      try {
        await UserModel.create(user);
      } catch (err) {
        console.error('[StaffSync DB] Mongo createUser error:', err);
      }
    }
  }

  // ---------------- Employees Queries ----------------
  public async getEmployees(isManager: boolean): Promise<EmployeeRecord[]> {
    let list: EmployeeRecord[] = [];
    if (this.mongoConnected) {
      try {
        list = (await EmployeeModel.find().sort({ createdAt: -1 }).lean()) as any;
      } catch (err) {
        console.error('[StaffSync DB] Mongo getEmployees error:', err);
        list = [...this.localData.employees];
      }
    } else {
      list = [...this.localData.employees];
    }

    if (isManager) return list;

    // Sanitize salary for non-manager callers
    return list.map(({ salary, ...rest }) => ({ ...rest, salary: 0 }));
  }

  public async getEmployeeById(id: string): Promise<EmployeeRecord | null> {
    if (this.mongoConnected) {
      try {
        const doc = await EmployeeModel.findOne({ id }).lean();
        if (doc) return doc as any;
      } catch (err) {
        console.error('[StaffSync DB] Mongo getEmployeeById error:', err);
      }
    }
    const found = this.localData.employees.find((e) => e.id === id);
    return found ? { ...found } : null;
  }

  public async createEmployee(emp: EmployeeRecord, initialPassword = 'Password123!'): Promise<void> {
    this.localData.employees.unshift(emp);

    const userAccount: User & { passwordHash: string } = {
      id: emp.userId || `usr-${Date.now()}`,
      email: emp.email,
      name: emp.name,
      role: 'employee',
      department: emp.department,
      position: emp.position,
      salary: emp.salary,
      joinDate: emp.joinDate,
      phone: emp.phone,
      address: emp.address,
      createdAt: emp.createdAt,
      passwordHash: hashPassword(initialPassword),
    };

    this.localData.users.push(userAccount);
    this.saveLocal();

    if (this.mongoConnected) {
      try {
        await EmployeeModel.create(emp);
        await UserModel.create(userAccount);
      } catch (err) {
        console.error('[StaffSync DB] Mongo createEmployee error:', err);
      }
    }
  }

  public async updateEmployee(id: string, updates: Partial<EmployeeRecord>): Promise<EmployeeRecord | null> {
    const idx = this.localData.employees.findIndex((e) => e.id === id);
    if (idx === -1) return null;

    const updated = { ...this.localData.employees[idx], ...updates };
    this.localData.employees[idx] = updated;

    // Sync corresponding user record
    const userIdx = this.localData.users.findIndex(
      (u) => u.email.toLowerCase() === updated.email.toLowerCase() || u.id === updated.userId
    );
    if (userIdx !== -1) {
      if (updates.name) this.localData.users[userIdx].name = updates.name;
      if (updates.email) this.localData.users[userIdx].email = updates.email;
      if (updates.department) this.localData.users[userIdx].department = updates.department;
      if (updates.position) this.localData.users[userIdx].position = updates.position;
      if (updates.salary !== undefined) this.localData.users[userIdx].salary = updates.salary;
      if (updates.phone !== undefined) this.localData.users[userIdx].phone = updates.phone;
      if (updates.address !== undefined) this.localData.users[userIdx].address = updates.address;
    }

    this.saveLocal();

    if (this.mongoConnected) {
      try {
        await EmployeeModel.findOneAndUpdate({ id }, { $set: updates });
        if (userIdx !== -1) {
          await UserModel.findOneAndUpdate(
            { id: this.localData.users[userIdx].id },
            { $set: updates }
          );
        }
      } catch (err) {
        console.error('[StaffSync DB] Mongo updateEmployee error:', err);
      }
    }

    return updated;
  }

  public async deleteEmployee(id: string): Promise<boolean> {
    const idx = this.localData.employees.findIndex((e) => e.id === id);
    if (idx === -1) return false;

    const [removed] = this.localData.employees.splice(idx, 1);
    const userIdx = this.localData.users.findIndex(
      (u) => u.email.toLowerCase() === removed.email.toLowerCase() || u.id === removed.userId
    );
    if (userIdx !== -1) {
      this.localData.users.splice(userIdx, 1);
    }
    this.saveLocal();

    if (this.mongoConnected) {
      try {
        await EmployeeModel.findOneAndDelete({ id });
        await UserModel.findOneAndDelete({ email: removed.email });
      } catch (err) {
        console.error('[StaffSync DB] Mongo deleteEmployee error:', err);
      }
    }

    return true;
  }

  // ---------------- Leaves Queries ----------------
  public async getLeaves(filter?: {
    email?: string;
    employeeId?: string;
    status?: string;
  }): Promise<LeaveApplication[]> {
    let list: LeaveApplication[] = [];
    if (this.mongoConnected) {
      try {
        const query: any = {};
        if (filter?.email) query.employeeEmail = filter.email.toLowerCase();
        if (filter?.employeeId && filter.employeeId !== 'All') query.employeeId = filter.employeeId;
        if (filter?.status && filter.status !== 'All') query.status = filter.status;
        list = (await LeaveModel.find(query).sort({ appliedAt: -1 }).lean()) as any;
      } catch (err) {
        console.error('[StaffSync DB] Mongo getLeaves error:', err);
        list = [...this.localData.leaves];
      }
    } else {
      list = [...this.localData.leaves];
      if (filter?.email) {
        list = list.filter((l) => l.employeeEmail.toLowerCase() === filter.email!.toLowerCase());
      }
      if (filter?.employeeId && filter.employeeId !== 'All') {
        list = list.filter((l) => l.employeeId === filter.employeeId);
      }
      if (filter?.status && filter.status !== 'All') {
        list = list.filter((l) => l.status === filter.status);
      }
      list.sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime());
    }

    return list;
  }

  public async createLeave(leave: LeaveApplication): Promise<void> {
    this.localData.leaves.unshift(leave);
    this.saveLocal();

    if (this.mongoConnected) {
      try {
        await LeaveModel.create(leave);
      } catch (err) {
        console.error('[StaffSync DB] Mongo createLeave error:', err);
      }
    }
  }

  public async updateLeaveStatus(
    id: string,
    status: 'Approved' | 'Rejected',
    reviewedBy: string,
    reviewedByName: string,
    decisionNote?: string
  ): Promise<LeaveApplication | null> {
    const idx = this.localData.leaves.findIndex((l) => l.id === id);
    if (idx === -1) return null;

    const updated: LeaveApplication = {
      ...this.localData.leaves[idx],
      status,
      reviewedBy,
      reviewedByName,
      reviewedAt: new Date().toISOString(),
      decisionNote: decisionNote !== undefined ? decisionNote : this.localData.leaves[idx].decisionNote,
    };

    this.localData.leaves[idx] = updated;
    this.saveLocal();

    if (this.mongoConnected) {
      try {
        await LeaveModel.findOneAndUpdate({ id }, { $set: updated });
      } catch (err) {
        console.error('[StaffSync DB] Mongo updateLeaveStatus error:', err);
      }
    }

    return updated;
  }

  // ---------------- Attendance Queries ----------------
  public async getAttendance(filter?: {
    email?: string;
    employeeId?: string;
    date?: string;
  }): Promise<AttendanceRecord[]> {
    let list: AttendanceRecord[] = [];
    if (this.mongoConnected) {
      try {
        const query: any = {};
        if (filter?.email) query.employeeEmail = filter.email.toLowerCase();
        if (filter?.employeeId && filter.employeeId !== 'All') query.employeeId = filter.employeeId;
        if (filter?.date) query.date = filter.date;
        list = (await AttendanceModel.find(query).sort({ date: -1, checkInTime: -1 }).lean()) as any;
      } catch (err) {
        console.error('[StaffSync DB] Mongo getAttendance error:', err);
        list = [...this.localData.attendance];
      }
    } else {
      list = [...this.localData.attendance];
      if (filter?.email) {
        list = list.filter((a) => a.employeeEmail.toLowerCase() === filter.email!.toLowerCase());
      }
      if (filter?.employeeId && filter.employeeId !== 'All') {
        list = list.filter((a) => a.employeeId === filter.employeeId);
      }
      if (filter?.date) {
        list = list.filter((a) => a.date === filter.date);
      }
      list.sort((a, b) => {
        if (b.date !== a.date) return b.date.localeCompare(a.date);
        return (b.checkInTime || '').localeCompare(a.checkInTime || '');
      });
    }

    return list;
  }

  public async getTodayAttendance(email: string, date: string): Promise<AttendanceRecord | null> {
    const cleanEmail = email.toLowerCase();
    if (this.mongoConnected) {
      try {
        const doc = await AttendanceModel.findOne({
          employeeEmail: cleanEmail,
          date,
        }).lean();
        if (doc) return doc as any;
      } catch (err) {
        console.error('[StaffSync DB] Mongo getTodayAttendance error:', err);
      }
    }
    const found = this.localData.attendance.find(
      (a) => a.employeeEmail.toLowerCase() === cleanEmail && a.date === date
    );
    return found ? { ...found } : null;
  }

  public async createAttendance(att: AttendanceRecord): Promise<void> {
    this.localData.attendance.unshift(att);
    this.saveLocal();

    if (this.mongoConnected) {
      try {
        await AttendanceModel.create(att);
      } catch (err) {
        console.error('[StaffSync DB] Mongo createAttendance error:', err);
      }
    }
  }

  public async updateAttendance(id: string, updates: Partial<AttendanceRecord>): Promise<AttendanceRecord | null> {
    const idx = this.localData.attendance.findIndex((a) => a.id === id);
    if (idx === -1) return null;

    const updated = { ...this.localData.attendance[idx], ...updates };
    this.localData.attendance[idx] = updated;
    this.saveLocal();

    if (this.mongoConnected) {
      try {
        await AttendanceModel.findOneAndUpdate({ id }, { $set: updates });
      } catch (err) {
        console.error('[StaffSync DB] Mongo updateAttendance error:', err);
      }
    }

    return updated;
  }

  // ---------------- Announcements Queries ----------------
  public async getAnnouncements(audienceFilter?: string): Promise<Announcement[]> {
    let list: Announcement[] = [];
    if (this.mongoConnected) {
      try {
        list = (await AnnouncementModel.find().sort({ createdAt: -1 }).lean()) as any;
      } catch (err) {
        console.error('[StaffSync DB] Mongo getAnnouncements error:', err);
        list = [...this.localData.announcements];
      }
    } else {
      list = [...this.localData.announcements];
    }

    if (audienceFilter) {
      const lower = audienceFilter.toLowerCase();
      list = list.filter((a) => {
        const aud = a.audience.toLowerCase();
        return aud === 'all' || aud === 'all employees' || aud === lower;
      });
    }

    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return list;
  }

  public async createAnnouncement(ann: Announcement): Promise<void> {
    this.localData.announcements.unshift(ann);
    this.saveLocal();

    if (this.mongoConnected) {
      try {
        await AnnouncementModel.create(ann);
      } catch (err) {
        console.error('[StaffSync DB] Mongo createAnnouncement error:', err);
      }
    }
  }

  public async deleteAnnouncement(id: string): Promise<boolean> {
    const idx = this.localData.announcements.findIndex((a) => a.id === id);
    if (idx === -1) return false;

    this.localData.announcements.splice(idx, 1);
    this.saveLocal();

    if (this.mongoConnected) {
      try {
        await AnnouncementModel.findOneAndDelete({ id });
      } catch (err) {
        console.error('[StaffSync DB] Mongo deleteAnnouncement error:', err);
      }
    }

    return true;
  }

  // ---------------- Training Sessions Queries ----------------
  public async getTrainings(audienceFilter?: { department?: string; name?: string }): Promise<TrainingSession[]> {
    let list: TrainingSession[] = [];
    if (this.mongoConnected) {
      try {
        list = (await TrainingModel.find().sort({ scheduledDate: 1 }).lean()) as any;
      } catch (err) {
        console.error('[StaffSync DB] Mongo getTrainings error:', err);
        list = [...this.localData.trainings];
      }
    } else {
      list = [...this.localData.trainings];
    }

    if (audienceFilter) {
      const deptLower = (audienceFilter.department || '').toLowerCase();
      const nameLower = (audienceFilter.name || '').toLowerCase();

      list = list.filter((t) => {
        const aud = t.assignedTo.toLowerCase();
        return (
          aud === 'all' ||
          aud === 'all employees' ||
          aud === deptLower ||
          aud.includes(nameLower)
        );
      });
    }

    return list;
  }

  public async createTraining(trn: TrainingSession): Promise<void> {
    this.localData.trainings.unshift(trn);
    this.saveLocal();

    if (this.mongoConnected) {
      try {
        await TrainingModel.create(trn);
      } catch (err) {
        console.error('[StaffSync DB] Mongo createTraining error:', err);
      }
    }
  }

  public async updateTraining(id: string, updates: Partial<TrainingSession>): Promise<TrainingSession | null> {
    const idx = this.localData.trainings.findIndex((t) => t.id === id);
    if (idx === -1) return null;

    const updated = { ...this.localData.trainings[idx], ...updates };
    this.localData.trainings[idx] = updated;
    this.saveLocal();

    if (this.mongoConnected) {
      try {
        await TrainingModel.findOneAndUpdate({ id }, { $set: updates });
      } catch (err) {
        console.error('[StaffSync DB] Mongo updateTraining error:', err);
      }
    }

    return updated;
  }

  public async deleteTraining(id: string): Promise<boolean> {
    const idx = this.localData.trainings.findIndex((t) => t.id === id);
    if (idx === -1) return false;

    this.localData.trainings.splice(idx, 1);
    this.saveLocal();

    if (this.mongoConnected) {
      try {
        await TrainingModel.findOneAndDelete({ id });
      } catch (err) {
        console.error('[StaffSync DB] Mongo deleteTraining error:', err);
      }
    }

    return true;
  }

  // ---------------- Kanban Tasks Queries ----------------
  public async getKanbanTasks(): Promise<KanbanTask[]> {
    let list: KanbanTask[] = [];
    if (this.mongoConnected) {
      try {
        list = (await KanbanModel.find().sort({ createdAt: -1 }).lean()) as any;
      } catch (err) {
        console.error('[StaffSync DB] Mongo getKanbanTasks error:', err);
        list = [...this.localData.kanban];
      }
    } else {
      list = [...this.localData.kanban];
    }
    return list;
  }

  public async createKanbanTask(task: KanbanTask): Promise<void> {
    this.localData.kanban.unshift(task);
    this.saveLocal();

    if (this.mongoConnected) {
      try {
        await KanbanModel.create(task);
      } catch (err) {
        console.error('[StaffSync DB] Mongo createKanbanTask error:', err);
      }
    }
  }

  public async updateKanbanTask(id: string, updates: Partial<KanbanTask>): Promise<KanbanTask | null> {
    const idx = this.localData.kanban.findIndex((k) => k.id === id);
    if (idx === -1) return null;

    const updated = { ...this.localData.kanban[idx], ...updates };
    this.localData.kanban[idx] = updated;
    this.saveLocal();

    if (this.mongoConnected) {
      try {
        await KanbanModel.findOneAndUpdate({ id }, { $set: updates });
      } catch (err) {
        console.error('[StaffSync DB] Mongo updateKanbanTask error:', err);
      }
    }

    return updated;
  }

  public async deleteKanbanTask(id: string): Promise<boolean> {
    const idx = this.localData.kanban.findIndex((k) => k.id === id);
    if (idx === -1) return false;

    this.localData.kanban.splice(idx, 1);
    this.saveLocal();

    if (this.mongoConnected) {
      try {
        await KanbanModel.findOneAndDelete({ id });
      } catch (err) {
        console.error('[StaffSync DB] Mongo deleteKanbanTask error:', err);
      }
    }

    return true;
  }

  // ---------------- Dashboard Stats ----------------
  public async getStats(todayStr: string): Promise<DashboardStats> {
    const employees = await this.getEmployees(true);
    const leaves = await this.getLeaves();
    const attendance = await this.getAttendance({ date: todayStr });
    const trainings = await this.getTrainings();
    const announcements = await this.getAnnouncements();

    const totalEmployees = employees.length;
    const pendingLeaves = leaves.filter((l) => l.status === 'Pending').length;
    const approvedLeavesThisMonth = leaves.filter((l) => l.status === 'Approved').length;
    const presentToday = attendance.length;
    const todayAttendanceRate = totalEmployees > 0 ? Math.round((presentToday / totalEmployees) * 100) : 0;
    const activeTrainings = trainings.length;
    const announcementsCount = announcements.length;

    return {
      totalEmployees,
      pendingLeaves,
      approvedLeavesThisMonth,
      presentToday,
      todayAttendanceRate,
      activeTrainings,
      announcementsCount,
    };
  }
}

export const db = new UnifiedDatabase();
