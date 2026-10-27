import React from 'react';
import { Loader2, AlertCircle, CheckCircle, Info } from 'lucide-react';

interface LoadingIndicatorProps {
  message?: string;
  className?: string;
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  message = 'Loading...',
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center py-12 gap-3 text-[#94A3B8] ${className}`}>
      <Loader2 className="w-8 h-8 animate-spin text-[#3657FF]" />
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
};

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 border border-dashed border-[#2B3A50] rounded-xl bg-[#111C32]/50 ${className}`}
    >
      {icon && <div className="p-3 mb-3 rounded-full bg-[#18253B] text-[#3657FF] border border-[#2B3A50]">{icon}</div>}
      <h3 className="text-base font-semibold text-[#F8FAFC]">{title}</h3>
      <p className="text-xs text-[#94A3B8] max-w-sm mt-1 mb-4 leading-relaxed">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
};

interface AlertBannerProps {
  type: 'success' | 'error' | 'info';
  message: string;
  onDismiss?: () => void;
  className?: string;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({
  type,
  message,
  onDismiss,
  className = '',
}) => {
  if (!message) return null;

  const styles = {
    success: 'bg-emerald-500/15 border-emerald-500/40 text-[#22C55E]',
    error: 'bg-rose-500/15 border-rose-500/40 text-[#EF4444]',
    info: 'bg-blue-500/15 border-blue-500/40 text-[#3657FF]',
  }[type];

  const Icon = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info,
  }[type];

  return (
    <div
      className={`flex items-center justify-between gap-3 px-4 py-3 rounded-lg border text-sm font-medium shadow-md transition-all ${styles} ${className}`}
      role="alert"
    >
      <div className="flex items-center gap-2.5">
        <Icon className="w-4 h-4 flex-shrink-0" />
        <span>{message}</span>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-current opacity-70 hover:opacity-100 p-0.5 rounded cursor-pointer"
          aria-label="Dismiss alert"
        >
          &times;
        </button>
      )}
    </div>
  );
};
