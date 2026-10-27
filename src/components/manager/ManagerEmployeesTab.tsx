import React, { useState } from 'react';
import { Users, UserPlus, Edit2, Trash2, X, DollarSign, Search, Building2 } from 'lucide-react';
import { EmployeeRecord } from '../../types/index.js';
import { DashboardCard } from '../common/DashboardCard.js';
import { FormInput, SelectInput } from '../common/FormControls.js';
import { PrimaryButton, SecondaryButton, DangerButton } from '../common/Buttons.js';
import { StatusBadge } from '../common/StatusBadge.js';
import { ConfirmationModal } from '../common/ConfirmationModal.js';
import { AlertBanner, EmptyState } from '../common/Feedback.js';

interface ManagerEmployeesTabProps {
  employees: EmployeeRecord[];
  loading: boolean;
  onAddEmployee: (emp: Partial<EmployeeRecord>) => Promise<void>;
  onUpdateEmployee: (id: string, emp: Partial<EmployeeRecord>) => Promise<void>;
  onDeleteEmployee: (id: string) => Promise<void>;
}

export const ManagerEmployeesTab: React.FC<ManagerEmployeesTabProps> = ({
  employees,
  loading,
  onAddEmployee,
  onUpdateEmployee,
  onDeleteEmployee,
}) => {
  // Form states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [position, setPosition] = useState('');
  const [salary, setSalary] = useState('');
  const [joinDate, setJoinDate] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [status, setStatus] = useState<'Active' | 'On Leave' | 'Terminated'>('Active');

  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');

  // Action status
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Deletion modal state
  const [deletingEmployee, setDeletingEmployee] = useState<EmployeeRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setEmail('');
    setDepartment('Engineering');
    setPosition('');
    setSalary('');
    setJoinDate('');
    setPhone('');
    setAddress('');
    setStatus('Active');
  };

  const handleEditClick = (emp: EmployeeRecord) => {
    setEditingId(emp.id);
    setName(emp.name);
    setEmail(emp.email);
    setDepartment(emp.department);
    setPosition(emp.position);
    setSalary(emp.salary ? String(emp.salary) : '');
    setJoinDate(emp.joinDate || '');
    setPhone(emp.phone || '');
    setAddress(emp.address || '');
    setStatus(emp.status || 'Active');
    setFeedback(null);
    // Scroll to form smoothly
    window.scrollTo({ top: 180, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    // Validation
    if (!name.trim() || !email.trim() || !position.trim()) {
      setFeedback({ type: 'error', message: 'Name, email, and position are mandatory.' });
      return;
    }

    const numSalary = Number(salary);
    if (salary && (isNaN(numSalary) || numSalary < 0)) {
      setFeedback({ type: 'error', message: 'Salary must be a positive number.' });
      return;
    }

    try {
      setSubmitting(true);
      if (editingId) {
        await onUpdateEmployee(editingId, {
          name: name.trim(),
          email: email.trim(),
          department: department.trim(),
          position: position.trim(),
          salary: numSalary || 0,
          joinDate: joinDate || undefined,
          phone: phone.trim(),
          address: address.trim(),
          status,
        });
        setFeedback({ type: 'success', message: `Employee "${name}" updated successfully.` });
        resetForm();
      } else {
        await onAddEmployee({
          name: name.trim(),
          email: email.trim(),
          department: department.trim(),
          position: position.trim(),
          salary: numSalary || 80000,
          joinDate: joinDate || new Date().toISOString().split('T')[0],
          phone: phone.trim() || '+1 (555) 000-0000',
          address: address.trim() || 'San Francisco, CA',
          status: 'Active',
        });
        setFeedback({
          type: 'success',
          message: `Employee "${name}" added successfully. User account activated.`,
        });
        resetForm();
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Operation failed.' });
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deletingEmployee) return;
    try {
      setIsDeleting(true);
      await onDeleteEmployee(deletingEmployee.id);
      setFeedback({
        type: 'success',
        message: `Employee "${deletingEmployee.name}" was successfully removed.`,
      });
      setDeletingEmployee(null);
      if (editingId === deletingEmployee.id) {
        resetForm();
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to delete employee.' });
    } finally {
      setIsDeleting(false);
    }
  };

  const departmentOptions = [
    { value: 'Engineering', label: 'Engineering' },
    { value: 'Design', label: 'Design' },
    { value: 'Marketing', label: 'Marketing' },
    { value: 'Sales', label: 'Sales' },
    { value: 'Operations', label: 'Operations' },
    { value: 'Human Resources', label: 'Human Resources' },
    { value: 'Finance', label: 'Finance' },
  ];

  const formatCurrency = (amt: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amt);
  };

  const filteredEmployees = employees.filter((emp) => {
    const matchesDept = deptFilter === 'All' || emp.department === deptFilter;
    const matchesSearch =
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.department.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDept && matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* Top Portion: Employee Creation/Editing Form */}
      <DashboardCard
        title={
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-[#3657FF]/15 text-[#3657FF]">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[#F8FAFC]">
                  {editingId ? 'Edit Employee Details' : 'Add New Employee'}
                </h2>
                <p className="text-xs text-[#94A3B8]">
                  {editingId
                    ? 'Update employee record and system permissions'
                    : 'Fill in details below to onboard a new company employee'}
                </p>
              </div>
            </div>
            {editingId && (
              <SecondaryButton
                type="button"
                onClick={resetForm}
                className="text-xs py-1 px-3"
                icon={<X className="w-3.5 h-3.5" />}
              >
                Cancel Edit
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

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 3 cols on large, 2 cols on medium, 1 col on mobile as requested in Section 4.2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <FormInput
              label="Full Name"
              placeholder="e.g. Alexander Vance"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <FormInput
              label="Email Address"
              type="email"
              placeholder="e.g. alex.vance@staffsync.io"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <SelectInput
              label="Department"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              options={departmentOptions}
              required
            />

            <FormInput
              label="Position / Title"
              placeholder="e.g. Senior Cloud Architect"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              required
            />

            <FormInput
              label="Annual Salary ($ USD)"
              type="number"
              placeholder="e.g. 115000"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              min="0"
              required
            />

            <FormInput
              label="Join Date"
              type="date"
              value={joinDate}
              onChange={(e) => setJoinDate(e.target.value)}
            />

            <FormInput
              label="Phone Number"
              type="tel"
              placeholder="+1 (555) 123-4567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />

            <FormInput
              label="Address"
              placeholder="123 Tech Boulevard, San Francisco, CA"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="md:col-span-2 lg:col-span-2"
            />
          </div>

          <PrimaryButton
            type="submit"
            isLoading={submitting}
            className="w-full py-3 text-sm font-semibold shadow-lg shadow-[#2563EB]/20"
            icon={editingId ? <Edit2 className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
          >
            {editingId ? 'Update Employee' : 'Add Employee'}
          </PrimaryButton>
        </form>
      </DashboardCard>

      {/* Bottom Portion: Employee Table */}
      <DashboardCard
        title={
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/15 text-[#22C55E]">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[#F8FAFC]">Employee Directory</h2>
              <p className="text-xs text-[#94A3B8]">
                {employees.length} total staff member{employees.length === 1 ? '' : 's'} registered
              </p>
            </div>
          </div>
        }
        action={
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
              <input
                type="text"
                placeholder="Search by name, role, dept..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-lg bg-[#334155] border border-[#2B3A50] text-xs text-[#F8FAFC] placeholder-[#94A3B8] outline-none focus:border-[#3657FF]"
              />
            </div>

            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-[#111C32] border border-[#2B3A50] text-xs text-[#CBD5E1] outline-none cursor-pointer"
            >
              <option value="All">All Departments</option>
              {departmentOptions.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>
        }
      >
        {loading ? (
          <div className="py-12 text-center text-sm text-[#94A3B8]">Loading employee roster...</div>
        ) : filteredEmployees.length === 0 ? (
          <EmptyState
            icon={<Users className="w-8 h-8 text-[#94A3B8]" />}
            title="No employees found"
            description={
              searchQuery || deptFilter !== 'All'
                ? 'No employees match the applied filter terms.'
                : 'No employees recorded in the database.'
            }
          />
        ) : (
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full text-left text-sm border-collapse min-w-[960px]">
              <thead>
                <tr className="border-b border-[#2B3A50] text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Position</th>
                  <th className="py-3 px-4">Salary</th>
                  <th className="py-3 px-4">Join Date</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">Address</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2B3A50]/60">
                {filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-[#111C32]/40 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-[#F8FAFC]">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-[#102FF5]/30 text-[#3657FF] border border-[#3657FF]/40 flex items-center justify-center font-bold text-xs flex-shrink-0">
                          {emp.name.charAt(0)}
                        </div>
                        <span className="whitespace-nowrap">{emp.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-[#CBD5E1] font-mono whitespace-nowrap">
                      {emp.email}
                    </td>
                    <td className="py-3.5 px-4 text-xs">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[#334155]/60 text-[#CBD5E1]">
                        {emp.department}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-[#F8FAFC] font-medium whitespace-nowrap">
                      {emp.position}
                    </td>
                    <td className="py-3.5 px-4 text-xs font-mono font-medium text-emerald-400 whitespace-nowrap">
                      {formatCurrency(emp.salary)}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-[#CBD5E1] whitespace-nowrap">
                      {emp.joinDate}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-[#CBD5E1] whitespace-nowrap">
                      {emp.phone || '-'}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-[#94A3B8] max-w-[150px] truncate" title={emp.address}>
                      {emp.address || '-'}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleEditClick(emp)}
                          className="px-2.5 py-1 rounded text-xs font-medium bg-blue-500/15 text-[#3657FF] border border-blue-500/30 hover:bg-blue-500/25 transition-colors cursor-pointer flex items-center gap-1"
                          title="Edit employee"
                        >
                          <Edit2 className="w-3 h-3" /> Edit
                        </button>
                        <button
                          onClick={() => setDeletingEmployee(emp)}
                          className="px-2.5 py-1 rounded text-xs font-medium bg-rose-500/15 text-[#EF4444] border border-rose-500/30 hover:bg-rose-500/25 transition-colors cursor-pointer flex items-center gap-1"
                          title="Delete employee"
                        >
                          <Trash2 className="w-3 h-3" /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </DashboardCard>

      {/* Confirmation Dialog for Deletion */}
      <ConfirmationModal
        isOpen={Boolean(deletingEmployee)}
        title="Delete Employee Record?"
        message={`Are you sure you want to delete ${deletingEmployee?.name}? This action will permanently remove their records, attendance logs, and access credentials.`}
        confirmLabel="Yes, Delete Record"
        cancelLabel="Cancel"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeletingEmployee(null)}
      />
    </div>
  );
};
