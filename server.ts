import express, { Request, Response, NextFunction } from 'express';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';
import { db } from './src/server/db.js';
import {
  User,
  EmployeeRecord,
  LeaveApplication,
  AttendanceRecord,
  Announcement,
  TrainingSession,
  KanbanTask,
} from './src/types/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '1mb' }));

// ----------------------------------------------------
// SECURITY: TOKEN SECRETS & CRYPTO VALIDATION
// ----------------------------------------------------

let TOKEN_SECRET = process.env.SESSION_SECRET;

if (!TOKEN_SECRET || TOKEN_SECRET.length < 16) {
  if (process.env.NODE_ENV === 'production') {
    console.error('FATAL: SESSION_SECRET environment variable is missing or too short for production.');
    process.exit(1);
  } else {
    // Generate an ephemeral cryptographic random secret for development to avoid predictable keys
    TOKEN_SECRET = crypto.randomBytes(32).toString('hex');
    console.warn('[StaffSync Security] SESSION_SECRET not provided in environment. Generated secure in-memory key for dev session.');
  }
}

function generateToken(user: User): string {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    department: user.department,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000,
  };
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', TOKEN_SECRET!).update(body).digest('base64url');
  return `${body}.${signature}`;
}

function verifyToken(token: string): any | null {
  try {
    const [body, signature] = token.split('.');
    if (!body || !signature) return null;
    const expected = crypto.createHmac('sha256', TOKEN_SECRET!).update(body).digest('base64url');
    if (signature !== expected) return null;
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf-8'));
    if (payload.exp && Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

// In-memory rate limiting map for login attempts
const loginAttempts = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = loginAttempts.get(ip);
  if (!record || now > record.resetTime) {
    loginAttempts.set(ip, { count: 1, resetTime: now + 15 * 60 * 1000 });
    return true;
  }
  if (record.count >= 15) {
    return false;
  }
  record.count += 1;
  return true;
}

interface AuthRequest extends Request {
  user?: User;
}

async function authenticate(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required. Missing Bearer token.' });
    return;
  }

  const token = authHeader.substring(7);
  const payload = verifyToken(token);
  if (!payload) {
    res.status(401).json({ error: 'Invalid or expired session token.' });
    return;
  }

  const user = await db.getUserById(payload.id);
  if (!user) {
    res.status(401).json({ error: 'User account no longer exists.' });
    return;
  }

  req.user = user;
  next();
}

function requireManager(req: AuthRequest, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required.' });
    return;
  }
  if (req.user.role !== 'manager') {
    res.status(403).json({ error: 'Forbidden: HR Manager role required.' });
    return;
  }
  next();
}

// ----------------------------------------------------
// AUTH ROUTES
// ----------------------------------------------------

app.post('/api/auth/login', async (req: Request, res: Response) => {
  const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
  if (!checkRateLimit(clientIp)) {
    res.status(429).json({ error: 'Too many login attempts. Please wait 15 minutes before retrying.' });
    return;
  }

  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required.' });
    return;
  }

  const userWithHash = await db.getUserByEmail(String(email));
  if (!userWithHash) {
    res.status(401).json({ error: 'Invalid email or password.' });
    return;
  }

  const isValid = db.verify(String(password), userWithHash.passwordHash);
  if (!isValid) {
    res.status(401).json({ error: 'Invalid email or password.' });
    return;
  }

  // Strip password hash from response
  const { passwordHash, ...safeUser } = userWithHash;
  const token = generateToken(safeUser);
  res.json({ token, user: safeUser });
});

app.post('/api/auth/register', async (req: Request, res: Response) => {
  const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
  if (!checkRateLimit(clientIp)) {
    res.status(429).json({ error: 'Too many registration attempts. Please wait 15 minutes before retrying.' });
    return;
  }

  const { name, email, password, department, position, phone, address } = req.body;

  if (!name?.trim() || !email?.trim() || !password) {
    res.status(400).json({ error: 'Full name, email, and password are required.' });
    return;
  }

  if (password.length < 8) {
    res.status(400).json({ error: 'Password must be at least 8 characters long.' });
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    res.status(400).json({ error: 'Please enter a valid email address.' });
    return;
  }

  const cleanEmail = email.trim().toLowerCase();
  const existingUser = await db.getUserByEmail(cleanEmail);
  if (existingUser) {
    res.status(400).json({ error: 'An account with this email address already exists.' });
    return;
  }

  // Security: Public registration always assigns the 'employee' role.
  // Manager/HR roles cannot be registered publicly to prevent privilege escalation.
  const newUserId = `usr-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const newEmpId = `emp-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const createdAt = new Date().toISOString();
  const passwordHash = db.hash(password);

  const cleanDepartment = department?.trim() || 'General';
  const cleanPosition = position?.trim() || 'Staff Member';

  const userRecord: User & { passwordHash: string } = {
    id: newUserId,
    email: cleanEmail,
    name: name.trim(),
    role: 'employee',
    department: cleanDepartment,
    position: cleanPosition,
    salary: 0,
    joinDate: new Date().toISOString().split('T')[0],
    phone: phone ? String(phone).trim() : '',
    address: address ? String(address).trim() : '',
    createdAt,
    passwordHash,
  };

  const employeeRecord: EmployeeRecord = {
    id: newEmpId,
    userId: newUserId,
    name: name.trim(),
    email: cleanEmail,
    department: cleanDepartment,
    position: cleanPosition,
    salary: 0,
    joinDate: userRecord.joinDate!,
    phone: userRecord.phone || '',
    address: userRecord.address || '',
    status: 'Active',
    createdAt,
  };

  await db.createUser(userRecord);
  await db.createEmployee(employeeRecord, password);

  const { passwordHash: _, ...safeUser } = userRecord;
  const token = generateToken(safeUser);

  res.status(201).json({
    message: 'Account registered successfully.',
    token,
    user: safeUser,
  });
});

// Demo switch route: strictly whitelisted and environment controlled
const DEMO_WHITELIST = new Set([
  'sarah.hr@staffsync.io',
  'john.doe@staffsync.io',
  'emily.chen@staffsync.io',
  'marcus.vance@staffsync.io',
  'david.kim@staffsync.io',
]);

app.post('/api/auth/demo-switch', async (req: Request, res: Response) => {
  const isDemoAllowed =
    process.env.ENABLE_DEMO_SWITCH === 'true' ||
    process.env.NODE_ENV !== 'production';

  if (!isDemoAllowed) {
    res.status(403).json({ error: 'Demo account switching is disabled in this environment.' });
    return;
  }

  const { email } = req.body;
  const cleanEmail = String(email || '').trim().toLowerCase();

  if (!DEMO_WHITELIST.has(cleanEmail)) {
    res.status(403).json({ error: 'Unauthorized demo account requested.' });
    return;
  }

  const userWithHash = await db.getUserByEmail(cleanEmail);
  if (!userWithHash) {
    res.status(404).json({ error: 'Demo user not found.' });
    return;
  }

  const { passwordHash, ...safeUser } = userWithHash;
  const token = generateToken(safeUser);
  res.json({ token, user: safeUser });
});

app.get('/api/auth/me', authenticate, (req: AuthRequest, res: Response) => {
  res.json({ user: req.user });
});

// ----------------------------------------------------
// LEAVES ROUTES
// ----------------------------------------------------

app.get('/api/leaves', authenticate, async (req: AuthRequest, res: Response) => {
  const user = req.user!;
  const { status, employeeId } = req.query;

  if (user.role === 'employee') {
    // Only return current employee's leaves
    const list = await db.getLeaves({ email: user.email });
    res.json({ leaves: list });
    return;
  }

  // Manager: filterable
  const list = await db.getLeaves({
    status: status ? String(status) : undefined,
    employeeId: employeeId ? String(employeeId) : undefined,
  });

  res.json({ leaves: list });
});

app.post('/api/leaves', authenticate, async (req: AuthRequest, res: Response) => {
  const user = req.user!;
  const { startDate, endDate, reason } = req.body;

  if (!startDate || !endDate || !reason?.trim()) {
    res.status(400).json({ error: 'Start date, end date, and reason are required.' });
    return;
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    res.status(400).json({ error: 'Invalid date values provided.' });
    return;
  }

  if (end < start) {
    res.status(400).json({ error: 'End date cannot be earlier than start date.' });
    return;
  }

  const employees = await db.getEmployees(true);
  const employee = employees.find((e) => e.email.toLowerCase() === user.email.toLowerCase());
  const employeeId = employee ? employee.id : user.id.replace('usr-', 'emp-');

  const newLeave: LeaveApplication = {
    id: `leave-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    employeeId,
    employeeName: user.name,
    employeeEmail: user.email,
    department: user.department || 'General',
    startDate: startDate.trim(),
    endDate: endDate.trim(),
    reason: reason.trim(),
    status: 'Pending',
    appliedAt: new Date().toISOString(),
  };

  await db.createLeave(newLeave);
  res.status(201).json({ message: 'Leave application submitted successfully.', leave: newLeave });
});

app.patch('/api/leaves/:id/status', authenticate, requireManager, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { status, decisionNote } = req.body;
  const manager = req.user!;

  if (!['Approved', 'Rejected'].includes(status)) {
    res.status(400).json({ error: 'Status must be Approved or Rejected.' });
    return;
  }

  const updated = await db.updateLeaveStatus(
    id,
    status as 'Approved' | 'Rejected',
    manager.id,
    manager.name,
    decisionNote ? String(decisionNote).trim() : undefined
  );

  if (!updated) {
    res.status(404).json({ error: 'Leave application not found.' });
    return;
  }

  res.json({
    message: `Leave application marked as ${status}.`,
    leave: updated,
  });
});

// ----------------------------------------------------
// ATTENDANCE ROUTES
// ----------------------------------------------------

function getTodayString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getTimeString(): string {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

app.get('/api/attendance', authenticate, async (req: AuthRequest, res: Response) => {
  const user = req.user!;
  const today = getTodayString();
  const { employeeId, date } = req.query;

  if (user.role === 'employee') {
    const records = await db.getAttendance({ email: user.email });
    const todayRecord = records.find((a) => a.date === today) || null;
    res.json({ records, todayRecord, todayDate: today });
    return;
  }

  // Manager: all records
  const records = await db.getAttendance({
    employeeId: employeeId ? String(employeeId) : undefined,
    date: date ? String(date) : undefined,
  });

  res.json({ records, todayDate: today });
});

app.post('/api/attendance/check-in', authenticate, async (req: AuthRequest, res: Response) => {
  const user = req.user!;
  const today = getTodayString();
  const time = getTimeString();

  const existing = await db.getTodayAttendance(user.email, today);
  if (existing) {
    res.status(400).json({ error: `Already checked in today at ${existing.checkInTime}` });
    return;
  }

  const employees = await db.getEmployees(true);
  const emp = employees.find((e) => e.email.toLowerCase() === user.email.toLowerCase());
  const empId = emp ? emp.id : user.id.replace('usr-', 'emp-');

  const record: AttendanceRecord = {
    id: `att-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    employeeId: empId,
    employeeName: user.name,
    employeeEmail: user.email,
    department: user.department || 'General',
    date: today,
    checkInTime: time,
    status: 'Present',
  };

  await db.createAttendance(record);
  res.status(201).json({ message: 'Check-in recorded successfully.', record });
});

app.post('/api/attendance/check-out', authenticate, async (req: AuthRequest, res: Response) => {
  const user = req.user!;
  const today = getTodayString();
  const time = getTimeString();

  const existing = await db.getTodayAttendance(user.email, today);
  if (!existing) {
    res.status(400).json({ error: 'Cannot check out before checking in.' });
    return;
  }

  if (existing.checkOutTime) {
    res.status(400).json({ error: `Already checked out for today at ${existing.checkOutTime}` });
    return;
  }

  let durationMinutes = 0;
  try {
    const [inH, inM] = existing.checkInTime.split(':').map(Number);
    const [outH, outM] = time.split(':').map(Number);
    durationMinutes = Math.max(0, outH * 60 + outM - (inH * 60 + inM));
  } catch {
    durationMinutes = 480;
  }

  const updated = await db.updateAttendance(existing.id, {
    checkOutTime: time,
    durationMinutes,
    status: 'Checked Out',
  });

  res.json({ message: 'Check-out recorded successfully.', record: updated });
});

// ----------------------------------------------------
// EMPLOYEES CRUD ROUTES
// ----------------------------------------------------

app.get('/api/employees', authenticate, async (req: AuthRequest, res: Response) => {
  const user = req.user!;
  const isManager = user.role === 'manager';
  const list = await db.getEmployees(isManager);
  res.json({ employees: list });
});

app.post('/api/employees', authenticate, requireManager, async (req: AuthRequest, res: Response) => {
  const { name, email, department, position, salary, joinDate, phone, address } = req.body;

  if (!name?.trim() || !email?.trim() || !department?.trim() || !position?.trim()) {
    res.status(400).json({ error: 'Name, email, department, and position are required.' });
    return;
  }

  const cleanEmail = email.trim().toLowerCase();
  const existing = await db.getUserByEmail(cleanEmail);
  if (existing) {
    res.status(400).json({ error: `An employee with email ${cleanEmail} already exists.` });
    return;
  }

  const cleanSalary = Number(salary) || 60000;
  if (cleanSalary < 0) {
    res.status(400).json({ error: 'Salary must be a positive number.' });
    return;
  }

  const newEmpId = `emp-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const newUserId = `usr-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  const employee: EmployeeRecord = {
    id: newEmpId,
    userId: newUserId,
    name: name.trim(),
    email: cleanEmail,
    department: department.trim(),
    position: position.trim(),
    salary: cleanSalary,
    joinDate: joinDate ? String(joinDate).trim() : getTodayString(),
    phone: phone ? String(phone).trim() : '+1 (555) 000-0000',
    address: address ? String(address).trim() : 'San Francisco, CA',
    status: 'Active',
    createdAt: new Date().toISOString(),
  };

  await db.createEmployee(employee);
  res.status(201).json({ message: 'Employee registered and user account created.', employee });
});

app.put('/api/employees/:id', authenticate, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const user = req.user!;
  const currentEmp = await db.getEmployeeById(id);

  if (!currentEmp) {
    res.status(404).json({ error: 'Employee not found.' });
    return;
  }

  if (user.role === 'manager') {
    // Full update permitted for manager
    const { name, email, department, position, salary, joinDate, phone, address, status } = req.body;

    if (!name?.trim() || !email?.trim()) {
      res.status(400).json({ error: 'Name and email are required.' });
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    if (cleanEmail !== currentEmp.email.toLowerCase()) {
      const duplicate = await db.getUserByEmail(cleanEmail);
      if (duplicate && duplicate.id !== currentEmp.userId) {
        res.status(400).json({ error: 'Another employee already uses this email address.' });
        return;
      }
    }

    const updated = await db.updateEmployee(id, {
      name: name.trim(),
      email: cleanEmail,
      department: department?.trim() || currentEmp.department,
      position: position?.trim() || currentEmp.position,
      salary: salary !== undefined ? Number(salary) : currentEmp.salary,
      joinDate: joinDate || currentEmp.joinDate,
      phone: phone !== undefined ? String(phone).trim() : currentEmp.phone,
      address: address !== undefined ? String(address).trim() : currentEmp.address,
      status: status || currentEmp.status,
    });

    res.json({ message: 'Employee updated successfully.', employee: updated });
    return;
  }

  // Employee self-update: only phone and address allowed
  if (currentEmp.email.toLowerCase() !== user.email.toLowerCase() && currentEmp.userId !== user.id) {
    res.status(403).json({ error: 'Forbidden: You can only edit your own contact information.' });
    return;
  }

  const { phone, address } = req.body;
  const updated = await db.updateEmployee(id, {
    phone: phone !== undefined ? String(phone).trim() : currentEmp.phone,
    address: address !== undefined ? String(address).trim() : currentEmp.address,
  });

  res.json({ message: 'Profile updated successfully.', employee: updated });
});

app.delete('/api/employees/:id', authenticate, requireManager, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const success = await db.deleteEmployee(id);
  if (!success) {
    res.status(404).json({ error: 'Employee not found.' });
    return;
  }
  res.json({ message: 'Employee deleted successfully.', id });
});

// ----------------------------------------------------
// ANNOUNCEMENTS ROUTES
// ----------------------------------------------------

app.get('/api/announcements', authenticate, async (req: AuthRequest, res: Response) => {
  const user = req.user!;
  const filter = user.role === 'employee' ? user.department : undefined;
  const list = await db.getAnnouncements(filter);
  res.json({ announcements: list });
});

app.post('/api/announcements', authenticate, requireManager, async (req: AuthRequest, res: Response) => {
  const user = req.user!;
  const { title, message, audience, pinned } = req.body;

  if (!title?.trim() || !message?.trim()) {
    res.status(400).json({ error: 'Title and message are required.' });
    return;
  }

  const announcement: Announcement = {
    id: `ann-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    title: title.trim(),
    message: message.trim(),
    audience: audience ? audience.trim() : 'All Employees',
    createdBy: user.id,
    createdByName: user.name,
    createdAt: new Date().toISOString(),
    pinned: Boolean(pinned),
  };

  await db.createAnnouncement(announcement);
  res.status(201).json({ message: 'Announcement published successfully.', announcement });
});

app.delete('/api/announcements/:id', authenticate, requireManager, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const success = await db.deleteAnnouncement(id);
  if (!success) {
    res.status(404).json({ error: 'Announcement not found.' });
    return;
  }
  res.json({ message: 'Announcement deleted successfully.', id });
});

// ----------------------------------------------------
// TRAINING SESSIONS ROUTES
// ----------------------------------------------------

app.get('/api/trainings', authenticate, async (req: AuthRequest, res: Response) => {
  const user = req.user!;
  const filter =
    user.role === 'employee'
      ? { department: user.department, name: user.name }
      : undefined;

  const list = await db.getTrainings(filter);
  res.json({ trainings: list });
});

app.post('/api/trainings', authenticate, requireManager, async (req: AuthRequest, res: Response) => {
  const user = req.user!;
  const { title, description, trainerName, scheduledDate, assignedTo } = req.body;

  if (!title?.trim() || !description?.trim() || !trainerName?.trim() || !scheduledDate?.trim()) {
    res.status(400).json({ error: 'Title, description, trainer name, and scheduled date are required.' });
    return;
  }

  const session: TrainingSession = {
    id: `trn-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    title: title.trim(),
    description: description.trim(),
    trainerName: trainerName.trim(),
    scheduledDate: scheduledDate.trim(),
    assignedTo: assignedTo?.trim() || 'All Employees',
    createdBy: user.id,
    createdAt: new Date().toISOString(),
  };

  await db.createTraining(session);
  res.status(201).json({ message: 'Training session created successfully.', training: session });
});

app.put('/api/trainings/:id', authenticate, requireManager, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { title, description, trainerName, scheduledDate, assignedTo } = req.body;

  const updated = await db.updateTraining(id, {
    title: title ? title.trim() : undefined,
    description: description ? description.trim() : undefined,
    trainerName: trainerName ? trainerName.trim() : undefined,
    scheduledDate: scheduledDate ? scheduledDate.trim() : undefined,
    assignedTo: assignedTo ? assignedTo.trim() : undefined,
  });

  if (!updated) {
    res.status(404).json({ error: 'Training session not found.' });
    return;
  }

  res.json({ message: 'Training session updated.', training: updated });
});

app.delete('/api/trainings/:id', authenticate, requireManager, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const success = await db.deleteTraining(id);
  if (!success) {
    res.status(404).json({ error: 'Training session not found.' });
    return;
  }
  res.json({ message: 'Training session deleted.', id });
});

// ----------------------------------------------------
// KANBAN TASKS ROUTES
// ----------------------------------------------------

app.get('/api/kanban', authenticate, async (_req: AuthRequest, res: Response) => {
  const list = await db.getKanbanTasks();
  res.json({ tasks: list });
});

app.post('/api/kanban', authenticate, async (req: AuthRequest, res: Response) => {
  const user = req.user!;
  const { title, description, status, priority, assignedTo, assignedName, dueDate, tags } = req.body;

  if (!title?.trim()) {
    res.status(400).json({ error: 'Task title is required.' });
    return;
  }

  const validStatuses = ['backlog', 'in_progress', 'review', 'completed'];
  const validPriorities = ['low', 'medium', 'high', 'urgent'];

  const cleanStatus = validStatuses.includes(status) ? status : 'backlog';
  const cleanPriority = validPriorities.includes(priority) ? priority : 'medium';

  const task: KanbanTask = {
    id: `kan-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    title: title.trim(),
    description: description ? description.trim() : '',
    status: cleanStatus,
    priority: cleanPriority,
    assignedTo: assignedTo || user.id,
    assignedName: assignedName || user.name,
    dueDate: dueDate || undefined,
    tags: Array.isArray(tags) ? tags : [],
    createdAt: new Date().toISOString(),
  };

  await db.createKanbanTask(task);
  res.status(201).json({ message: 'Task created.', task });
});

app.patch('/api/kanban/:id', authenticate, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const updated = await db.updateKanbanTask(id, req.body);
  if (!updated) {
    res.status(404).json({ error: 'Task not found.' });
    return;
  }
  res.json({ message: 'Task updated.', task: updated });
});

app.delete('/api/kanban/:id', authenticate, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const success = await db.deleteKanbanTask(id);
  if (!success) {
    res.status(404).json({ error: 'Task not found.' });
    return;
  }
  res.json({ message: 'Task deleted.', id });
});

// ----------------------------------------------------
// DASHBOARD STATS ROUTE
// ----------------------------------------------------

app.get('/api/stats', authenticate, async (_req: AuthRequest, res: Response) => {
  const today = getTodayString();
  const stats = await db.getStats(today);
  res.json(stats);
});

// ----------------------------------------------------
// GEMINI AI INTEGRATION (SERVER-SIDE)
// ----------------------------------------------------

app.post('/api/ai/draft-announcement', authenticate, requireManager, async (req: AuthRequest, res: Response) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const { topic, tone } = req.body;

  if (!topic || typeof topic !== 'string') {
    res.status(400).json({ error: 'Announcement topic is required.' });
    return;
  }

  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    // Graceful helpful message if GEMINI_API_KEY is not configured
    res.json({
      title: `Company Update: ${topic}`,
      message: `We are pleased to announce updates regarding ${topic}. Please review the portal guidelines for further instructions.`,
      isFallback: true,
      note: 'Gemini API key is not configured on the server. Delivered default template.',
    });
    return;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are an HR Director drafting a professional company announcement.
Topic: "${topic}"
Tone: "${tone || 'professional and engaging'}"
Provide your output as a JSON object with two fields:
{
  "title": "A concise headline",
  "message": "A 2-3 paragraph announcement message"
}`,
    });

    const text = response.text || '';
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      const parsed = JSON.parse(match[0]);
      res.json(parsed);
      return;
    }

    res.json({
      title: `Announcement: ${topic}`,
      message: text,
    });
  } catch (err: any) {
    console.error('[Gemini AI] Error drafting announcement:', err);
    res.status(500).json({ error: 'Failed to generate announcement using Gemini API.' });
  }
});

// ----------------------------------------------------
// VITE DEV SERVER OR STATIC SERVE
// ----------------------------------------------------

/**
 * initializeApp: Initializes the database connection.
 * Called once per cold-start in the Vercel serverless function (api/index.ts).
 * Also called by startServer() for local development.
 * Safe to call multiple times — db.init() is idempotent.
 */
export async function initializeApp(): Promise<void> {
  await db.init();
}

/**
 * startServer: Used exclusively for local development (npm run dev / npm start).
 * Mounts static files or Vite middleware, then starts the HTTP listener.
 * Never called in the Vercel serverless environment.
 */
async function startServer() {
  await initializeApp();

  if (process.env.NODE_ENV === 'production') {
    // Serve built Vite frontend for `npm start` local production mode
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`StaffSync Server listening on http://0.0.0.0:${PORT} [${process.env.NODE_ENV || 'development'}]`);
    console.log(`MongoDB Status: ${db.isConnectedToMongo ? 'Connected' : 'Local Persistent Storage Mode'}`);
  });
}

// Only start the listener when this file is run directly (local dev/production)
// In the Vercel serverless environment, api/index.ts imports `app` and `initializeApp` without calling startServer().
const isDirectRun = process.argv[1] &&
  (process.argv[1].endsWith('server.js') || process.argv[1].endsWith('server.ts'));

if (isDirectRun) {
  startServer().catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
}
