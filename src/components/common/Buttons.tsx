import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const PrimaryButton: React.FC<ButtonProps> = ({
  children,
  isLoading,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 shadow-md bg-[#2563EB] hover:bg-[#1D4ED8] active:bg-[#1E40AF] text-white focus:outline-none focus:ring-2 focus:ring-[#3657FF] focus:ring-offset-2 focus:ring-offset-[#0F172A] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : icon}
      {children}
    </button>
  );
};

export const SecondaryButton: React.FC<ButtonProps> = ({
  children,
  isLoading,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 border border-[#2B3A50] bg-[#111C32] hover:bg-[#1E293B] active:bg-[#0F172A] text-[#CBD5E1] hover:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#3657FF] focus:ring-offset-2 focus:ring-offset-[#0F172A] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : icon}
      {children}
    </button>
  );
};

export const DangerButton: React.FC<ButtonProps> = ({
  children,
  isLoading,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-150 bg-rose-600/20 text-[#EF4444] border border-rose-500/40 hover:bg-rose-600/30 active:bg-rose-600/40 focus:outline-none focus:ring-2 focus:ring-[#EF4444] focus:ring-offset-2 focus:ring-offset-[#0F172A] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : icon}
      {children}
    </button>
  );
};

export const SuccessButton: React.FC<ButtonProps> = ({
  children,
  isLoading,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-150 bg-emerald-600/20 text-[#22C55E] border border-emerald-500/40 hover:bg-emerald-600/30 active:bg-emerald-600/40 focus:outline-none focus:ring-2 focus:ring-[#22C55E] focus:ring-offset-2 focus:ring-offset-[#0F172A] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : icon}
      {children}
    </button>
  );
};
