import React from 'react';

interface DashboardCardProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  headerClassName?: string;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  subtitle,
  action,
  children,
  className = '',
  headerClassName = '',
}) => {
  return (
    <div
      className={`bg-[#18253B] border border-[#2B3A50] rounded-xl shadow-lg transition-all duration-200 overflow-hidden ${className}`}
    >
      {(title || action) && (
        <div
          className={`px-6 py-4 border-b border-[#2B3A50] flex flex-wrap items-center justify-between gap-3 ${headerClassName}`}
        >
          <div>
            {typeof title === 'string' ? (
              <h2 className="text-lg font-semibold text-[#F8FAFC] tracking-tight">{title}</h2>
            ) : (
              title
            )}
            {subtitle && <p className="text-xs text-[#94A3B8] mt-0.5">{subtitle}</p>}
          </div>
          {action && <div className="flex items-center gap-2">{action}</div>}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
};
