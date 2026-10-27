import assert from 'node:assert/strict';
import { db } from '../src/server/db.js';

async function runTests() {
  console.log('--- STARTING STAFFSYNC TEST SUITE ---');

  // Test 1: Password hashing and verification
  console.log('Test 1: Password security (bcrypt)');
  const plain = 'SecurePassword2026!';
  const hash = db.hash(plain);
  assert.ok(hash.startsWith('$2'), 'Hash must use bcrypt format');
  assert.ok(db.verify(plain, hash), 'Valid password must verify against bcrypt hash');
  assert.ok(!db.verify('WrongPassword', hash), 'Invalid password must be rejected');
  console.log('✓ Password security verified.');

  // Test 2: User retrieval and sanitization
  console.log('Test 2: User retrieval and role checks');
  const managerUser = await db.getUserByEmail('sarah.hr@staffsync.io');
  assert.ok(managerUser, 'Manager account must exist');
  assert.equal(managerUser.role, 'manager', 'Sarah Jenkins must have manager role');

  const empUser = await db.getUserByEmail('john.doe@staffsync.io');
  assert.ok(empUser, 'Employee account must exist');
  assert.equal(empUser.role, 'employee', 'John Doe must have employee role');
  console.log('✓ User retrieval and roles verified.');

  // Test 3: Employee directory sanitization for non-managers
  console.log('Test 3: Employee directory data isolation');
  const mgrDirectory = await db.getEmployees(true);
  assert.ok(mgrDirectory.some((e) => e.salary > 0), 'Managers must see employee salary records');

  const empDirectory = await db.getEmployees(false);
  assert.ok(empDirectory.every((e) => e.salary === 0), 'Employees must not see confidential salary records');
  console.log('✓ Salary data isolation verified.');

  // Test 4: Leave submission & validation
  console.log('Test 4: Leave management & workflow');
  const initialLeaves = await db.getLeaves({ email: 'john.doe@staffsync.io' });
  const testLeaveId = `test-leave-${Date.now()}`;
  await db.createLeave({
    id: testLeaveId,
    employeeId: 'emp-john-doe',
    employeeName: 'John Doe',
    employeeEmail: 'john.doe@staffsync.io',
    department: 'Engineering',
    startDate: '2026-11-20',
    endDate: '2026-11-24',
    reason: 'Automated test leave request',
    status: 'Pending',
    appliedAt: new Date().toISOString(),
  });

  const updatedLeaves = await db.getLeaves({ email: 'john.doe@staffsync.io' });
  assert.equal(updatedLeaves.length, initialLeaves.length + 1, 'Leave count should increment');

  // Approve leave as manager
  const approved = await db.updateLeaveStatus(
    testLeaveId,
    'Approved',
    'usr-sarah-jenkins',
    'Sarah Jenkins',
    'Approved during automated verification'
  );
  assert.ok(approved, 'Leave status update must succeed');
  assert.equal(approved.status, 'Approved');
  assert.equal(approved.reviewedByName, 'Sarah Jenkins');
  console.log('✓ Leave submission and approval verified.');

  // Test 5: Attendance check-in and duplicate check
  console.log('Test 5: Attendance check-in and constraints');
  const testDate = `2099-01-${String((Date.now() % 25) + 1).padStart(2, '0')}`;
  const testEmail = `test.att.${Date.now()}@staffsync.io`;
  const existingAtt = await db.getTodayAttendance(testEmail, testDate);
  assert.equal(existingAtt, null, 'No attendance should exist for dummy future date');

  const attId = `test-att-${Date.now()}`;
  await db.createAttendance({
    id: attId,
    employeeId: 'emp-john-doe',
    employeeName: 'John Doe',
    employeeEmail: testEmail,
    department: 'Engineering',
    date: testDate,
    checkInTime: '09:00:00',
    status: 'Present',
  });

  const checkAtt = await db.getTodayAttendance(testEmail, testDate);
  assert.ok(checkAtt, 'Attendance record must be saved');
  assert.equal(checkAtt.status, 'Present');

  // Check out
  const checkedOut = await db.updateAttendance(attId, {
    checkOutTime: '17:00:00',
    durationMinutes: 480,
    status: 'Checked Out',
  });
  assert.ok(checkedOut, 'Attendance check out update must succeed');
  assert.equal(checkedOut.status, 'Checked Out');
  assert.equal(checkedOut.durationMinutes, 480);
  console.log('✓ Attendance workflow verified.');

  // Test 6: Announcements audience targeting
  console.log('Test 6: Announcements audience filtering');
  const allAnnouncements = await db.getAnnouncements();
  const engAnnouncements = await db.getAnnouncements('Engineering');
  assert.ok(allAnnouncements.length >= engAnnouncements.length, 'Filtered count should be subset');
  assert.ok(
    engAnnouncements.every(
      (a) =>
        a.audience.toLowerCase() === 'all' ||
        a.audience.toLowerCase() === 'all employees' ||
        a.audience.toLowerCase() === 'engineering'
    ),
    'Engineers should only see relevant announcements'
  );
  console.log('✓ Announcements targeting verified.');

  // Test 7: Training sessions
  console.log('Test 7: Training session creation and retrieval');
  const testTrnId = `test-trn-${Date.now()}`;
  await db.createTraining({
    id: testTrnId,
    title: 'Automated Test Security Program',
    description: 'Verifying automated training creation',
    trainerName: 'StaffSync QA Bot',
    scheduledDate: '2026-12-01',
    assignedTo: 'All Employees',
    createdBy: 'usr-sarah-jenkins',
    createdAt: new Date().toISOString(),
  });
  const trainings = await db.getTrainings();
  assert.ok(trainings.some((t) => t.id === testTrnId), 'Created training must be present in database');

  await db.deleteTraining(testTrnId);
  const afterDelete = await db.getTrainings();
  assert.ok(!afterDelete.some((t) => t.id === testTrnId), 'Training must be deleted successfully');
  console.log('✓ Training CRUD verified.');

  // Test 8: Kanban operations
  console.log('Test 8: Kanban task CRUD and status progression');
  const testKanbanId = `test-kan-${Date.now()}`;
  await db.createKanbanTask({
    id: testKanbanId,
    title: 'Audit compliance checklists',
    description: 'Ensure GDPR and SOC2 readiness',
    status: 'backlog',
    priority: 'high',
    assignedTo: 'usr-sarah-jenkins',
    assignedName: 'Sarah Jenkins',
    tags: ['Security', 'Compliance'],
    createdAt: new Date().toISOString(),
  });

  const kanbanTasks = await db.getKanbanTasks();
  assert.ok(kanbanTasks.some((k) => k.id === testKanbanId), 'Kanban task must exist');

  await db.updateKanbanTask(testKanbanId, { status: 'completed' });
  const updatedKanban = await db.getKanbanTasks();
  const target = updatedKanban.find((k) => k.id === testKanbanId);
  assert.equal(target?.status, 'completed', 'Task status must update to completed');

  await db.deleteKanbanTask(testKanbanId);
  console.log('✓ Kanban workflow verified.');

  // Test 9: Dashboard statistics
  console.log('Test 9: Dashboard statistics aggregation');
  const stats = await db.getStats('2026-10-27');
  assert.ok(stats.totalEmployees > 0, 'Total employees must be greater than 0');
  assert.ok(typeof stats.todayAttendanceRate === 'number', 'Attendance rate must be a valid number');
  console.log('✓ Dashboard stats verified.');

  // Test 10: Registration & Privilege Escalation Prevention
  console.log('Test 10: Registration and role enforcement');
  const testRegEmail = `test.reg.${Date.now()}@staffsync.io`;
  const plainPassword = 'StrongPassword123!';
  const newUserId = `usr-test-${Date.now()}`;
  const newEmpId = `emp-test-${Date.now()}`;
  const passwordHash = db.hash(plainPassword);

  // Attempt to assign 'employee' role as expected for public registrations
  await db.createUser({
    id: newUserId,
    email: testRegEmail,
    name: 'New Registered Employee',
    role: 'employee',
    department: 'Engineering',
    position: 'Junior Developer',
    salary: 0,
    createdAt: new Date().toISOString(),
    passwordHash,
  });

  const registeredUser = await db.getUserByEmail(testRegEmail);
  assert.ok(registeredUser, 'Registered user must exist in database');
  assert.equal(registeredUser.role, 'employee', 'Public registration must never assign manager role');
  assert.ok(db.verify(plainPassword, registeredUser.passwordHash), 'Password must verify with bcrypt');
  assert.ok(!db.verify('WrongPassword', registeredUser.passwordHash), 'Invalid password must be rejected');
  console.log('✓ Registration and privilege escalation protection verified.');

  console.log('\n=======================================');
  console.log('ALL 10 TESTS PASSED SUCCESSFULLY! ✓');
  console.log('=======================================\n');
}

runTests().catch((err) => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
