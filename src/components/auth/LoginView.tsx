import React, { useState } from 'react';
import {
  Users,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  Sparkles,
  UserPlus,
  LogIn,
  Building2,
  Briefcase,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { PrimaryButton, SecondaryButton } from '../common/Buttons.js';
import { FormInput, SelectInput } from '../common/FormControls.js';
import { AlertBanner } from '../common/Feedback.js';
import { User } from '../../types/index.js';

interface LoginViewProps {
  onLoginSuccess: (token: string, user: User) => void;
  onLogin: (email: string, password: string) => Promise<{ token: string; user: User }>;
  onRegister: (data: {
    name: string;
    email: string;
    password: string;
    department?: string;
    position?: string;
    phone?: string;
    address?: string;
  }) => Promise<{ message: string; token: string; user: User }>;
  onDemoSwitch: (email: string) => Promise<{ token: string; user: User }>;
}

export const LoginView: React.FC<LoginViewProps> = ({
  onLoginSuccess,
  onLogin,
  onRegister,
  onDemoSwitch,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Login form state - starts empty as required
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Registration form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regDepartment, setRegDepartment] = useState('Engineering');
  const [regPosition, setRegPosition] = useState('');

  // Explicit demo controls
  const [showDemoSection, setShowDemoSection] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!email.trim() || !password) {
      setError('Please provide both your email address and password.');
      return;
    }

    try {
      setLoading(true);
      const res = await onLogin(email.trim(), password);
      onLoginSuccess(res.token, res.user);
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify your email and password.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!regName.trim() || !regEmail.trim() || !regPassword) {
      setError('Please fill in all required fields.');
      return;
    }

    if (regPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    try {
      setLoading(true);
      const res = await onRegister({
        name: regName.trim(),
        email: regEmail.trim(),
        password: regPassword,
        department: regDepartment,
        position: regPosition.trim() || 'Staff Member',
      });

      setSuccessMsg('Account registered successfully! Redirecting to your dashboard...');
      setTimeout(() => {
        onLoginSuccess(res.token, res.user);
      }, 500);
    } catch (err: any) {
      setError(err.message || 'Registration failed. An account with this email may already exist.');
    } finally {
      setLoading(false);
    }
  };

  const handleExplicitDemoAccess = async (demoEmail: string) => {
    setError(null);
    setSuccessMsg(null);
    try {
      setLoading(true);
      const res = await onDemoSwitch(demoEmail);
      onLoginSuccess(res.token, res.user);
    } catch (err: any) {
      setError(err.message || 'Demo access request failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemoCredentials = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('Password123!');
    setMode('login');
    setError(null);
  };

  const departmentOptions = [
    { value: 'Engineering', label: 'Engineering' },
    { value: 'Design', label: 'Design' },
    { value: 'Marketing', label: 'Marketing' },
    { value: 'Sales', label: 'Sales' },
    { value: 'Operations', label: 'Operations' },
    { value: 'Finance', label: 'Finance' },
  ];

  return (
    <div className="min-h-screen bg-[#0F172A] flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 selection:bg-[#3657FF] selection:text-white">
      {/* Background radial glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#102FF5]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 w-[400px] h-[400px] bg-[#3657FF]/10 rounded-full blur-2xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Brand header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#102FF5] to-[#3657FF] text-white shadow-xl shadow-[#102FF5]/25 mb-4">
            <Users className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#F8FAFC]">
            Staff<span className="text-[#3657FF]">Sync</span>
          </h1>
          <p className="text-xs text-[#94A3B8] mt-1">Enterprise Human Resource Management System</p>
        </div>

        {/* Card */}
        <div className="bg-[#18253B] border border-[#2B3A50] rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-sm">
          {/* Mode Tabs: Sign In / Create Account */}
          <div className="flex border-b border-[#2B3A50] mb-6">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-2.5 text-xs font-semibold text-center border-b-2 transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                mode === 'login'
                  ? 'border-[#3657FF] text-[#F8FAFC]'
                  : 'border-transparent text-[#94A3B8] hover:text-[#CBD5E1]'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              Sign In
            </button>

            <button
              type="button"
              onClick={() => {
                setMode('register');
                setError(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-2.5 text-xs font-semibold text-center border-b-2 transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                mode === 'register'
                  ? 'border-[#3657FF] text-[#F8FAFC]'
                  : 'border-transparent text-[#94A3B8] hover:text-[#CBD5E1]'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              Sign Up
            </button>
          </div>

          {/* Feedback alerts */}
          {error && (
            <AlertBanner
              type="error"
              message={error}
              onDismiss={() => setError(null)}
              className="mb-5"
            />
          )}

          {successMsg && (
            <AlertBanner
              type="success"
              message={successMsg}
              onDismiss={() => setSuccessMsg(null)}
              className="mb-5"
            />
          )}

          {/* Mode: Login */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <FormInput
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                required
                autoComplete="email"
                disabled={loading}
              />

              <FormInput
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                autoComplete="current-password"
                disabled={loading}
              />

              <PrimaryButton
                type="submit"
                isLoading={loading}
                className="w-full mt-2 py-3"
                icon={<ArrowRight className="w-4 h-4" />}
              >
                Sign In
              </PrimaryButton>
            </form>
          )}

          {/* Mode: Sign Up / Register */}
          {mode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="p-3 rounded-lg bg-[#111C32] border border-[#2B3A50] text-xs text-[#CBD5E1] flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-[#3657FF] flex-shrink-0 mt-0.5" />
                <span>
                  Public registration creates a standard <strong>Employee</strong> account. Manager & HR administrative privileges must be assigned by an existing HR Director.
                </span>
              </div>

              <FormInput
                label="Full Name"
                placeholder="e.g. Alex Morgan"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                required
                disabled={loading}
              />

              <FormInput
                label="Work Email Address"
                type="email"
                placeholder="alex.morgan@staffsync.io"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                required
                autoComplete="email"
                disabled={loading}
              />

              <FormInput
                label="Password (min 8 characters)"
                type="password"
                placeholder="Create a strong password"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                required
                autoComplete="new-password"
                disabled={loading}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <SelectInput
                  label="Department"
                  value={regDepartment}
                  onChange={(e) => setRegDepartment(e.target.value)}
                  options={departmentOptions}
                  disabled={loading}
                  required
                />

                <FormInput
                  label="Position / Role Title"
                  placeholder="e.g. Software Engineer"
                  value={regPosition}
                  onChange={(e) => setRegPosition(e.target.value)}
                  disabled={loading}
                />
              </div>

              <PrimaryButton
                type="submit"
                isLoading={loading}
                className="w-full mt-3 py-3"
                icon={<UserPlus className="w-4 h-4" />}
              >
                Create Employee Account
              </PrimaryButton>
            </form>
          )}

          {/* Explicit Demo Accounts Section (Kept separated and requires explicit user action) */}
          <div className="mt-8 pt-6 border-t border-[#2B3A50]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#94A3B8] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#3657FF]" />
                Demo Credentials & Testing
              </span>
              <button
                type="button"
                onClick={() => setShowDemoSection(!showDemoSection)}
                className="text-xs text-[#3657FF] hover:underline cursor-pointer"
              >
                {showDemoSection ? 'Hide' : 'View Demo Accounts'}
              </button>
            </div>

            {showDemoSection && (
              <div className="mt-3 space-y-2 animate-fadeIn">
                <p className="text-[11px] text-[#94A3B8] mb-2 leading-relaxed">
                  Click a persona to either pre-fill the form credentials or execute an explicit demo login.
                </p>

                <div className="p-3 rounded-xl bg-[#111C32] border border-[#2B3A50] flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-[#F8FAFC] flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#3657FF]" />
                      Sarah Jenkins
                      <span className="text-[9px] bg-[#3657FF]/20 text-[#3657FF] px-1.5 py-0.2 rounded font-bold uppercase">
                        HR Manager
                      </span>
                    </div>
                    <div className="text-[11px] text-[#94A3B8] font-mono truncate">
                      sarah.hr@staffsync.io
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => handleFillDemoCredentials('sarah.hr@staffsync.io')}
                      className="text-[11px] px-2 py-1 rounded bg-[#334155] hover:bg-[#475569] text-[#CBD5E1] transition-colors cursor-pointer"
                    >
                      Fill Form
                    </button>
                    <button
                      type="button"
                      onClick={() => handleExplicitDemoAccess('sarah.hr@staffsync.io')}
                      disabled={loading}
                      className="text-[11px] px-2 py-1 rounded bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium transition-colors cursor-pointer"
                    >
                      Try Demo
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#111C32] border border-[#2B3A50] flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-[#F8FAFC] flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-[#22C55E]" />
                      John Doe
                      <span className="text-[9px] bg-emerald-500/20 text-[#22C55E] px-1.5 py-0.2 rounded font-bold uppercase">
                        Employee
                      </span>
                    </div>
                    <div className="text-[11px] text-[#94A3B8] font-mono truncate">
                      john.doe@staffsync.io
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => handleFillDemoCredentials('john.doe@staffsync.io')}
                      className="text-[11px] px-2 py-1 rounded bg-[#334155] hover:bg-[#475569] text-[#CBD5E1] transition-colors cursor-pointer"
                    >
                      Fill Form
                    </button>
                    <button
                      type="button"
                      onClick={() => handleExplicitDemoAccess('john.doe@staffsync.io')}
                      disabled={loading}
                      className="text-[11px] px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition-colors cursor-pointer"
                    >
                      Try Demo
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-[#94A3B8] mt-6">
          StaffSync Secure Enterprise System &bull; Confidential &bull; Version 2.4.0
        </p>
      </div>
    </div>
  );
};
