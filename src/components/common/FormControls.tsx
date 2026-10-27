import React from 'react';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const FormInput: React.FC<FormInputProps> = ({
  label,
  error,
  helperText,
  id,
  className = '',
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={inputId} className="text-xs font-semibold text-[#CBD5E1] tracking-wide">
          {label} {props.required && <span className="text-[#EF4444]">*</span>}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full px-3.5 py-2.5 rounded-lg bg-[#334155] border ${
          error ? 'border-[#EF4444] focus:ring-1 focus:ring-[#EF4444]' : 'border-[#2B3A50] focus:border-[#3657FF] focus:ring-1 focus:ring-[#3657FF]'
        } text-[#F8FAFC] placeholder-[#94A3B8] text-sm outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        {...props}
      />
      {error ? (
        <p className="text-xs text-[#EF4444] font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-[#94A3B8]">{helperText}</p>
      ) : null}
    </div>
  );
};

interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const FormTextarea: React.FC<FormTextareaProps> = ({
  label,
  error,
  helperText,
  id,
  className = '',
  rows = 3,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={inputId} className="text-xs font-semibold text-[#CBD5E1] tracking-wide">
          {label} {props.required && <span className="text-[#EF4444]">*</span>}
        </label>
      )}
      <textarea
        id={inputId}
        rows={rows}
        className={`w-full px-3.5 py-2.5 rounded-lg bg-[#334155] border ${
          error ? 'border-[#EF4444] focus:ring-1 focus:ring-[#EF4444]' : 'border-[#2B3A50] focus:border-[#3657FF] focus:ring-1 focus:ring-[#3657FF]'
        } text-[#F8FAFC] placeholder-[#94A3B8] text-sm outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed resize-y ${className}`}
        {...props}
      />
      {error ? (
        <p className="text-xs text-[#EF4444] font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-[#94A3B8]">{helperText}</p>
      ) : null}
    </div>
  );
};

interface SelectOption {
  value: string;
  label: string;
}

interface SelectInputProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
}

export const SelectInput: React.FC<SelectInputProps> = ({
  label,
  options,
  error,
  id,
  className = '',
  ...props
}) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={selectId} className="text-xs font-semibold text-[#CBD5E1] tracking-wide">
          {label} {props.required && <span className="text-[#EF4444]">*</span>}
        </label>
      )}
      <select
        id={selectId}
        className={`w-full px-3.5 py-2.5 rounded-lg bg-[#334155] border ${
          error ? 'border-[#EF4444] focus:ring-1 focus:ring-[#EF4444]' : 'border-[#2B3A50] focus:border-[#3657FF] focus:ring-1 focus:ring-[#3657FF]'
        } text-[#F8FAFC] text-sm outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-[#18253B] text-[#F8FAFC]">
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-[#EF4444] font-medium">{error}</p>}
    </div>
  );
};
