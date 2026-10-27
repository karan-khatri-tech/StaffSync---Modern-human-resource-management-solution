import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { DangerButton, SecondaryButton } from './Buttons.js';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  isLoading = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div
        className="w-full max-w-md bg-[#18253B] border border-[#2B3A50] rounded-xl shadow-2xl p-6 overflow-hidden relative animate-scaleUp"
        role="dialog"
        aria-modal="true"
      >
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-[#94A3B8] hover:text-[#F8FAFC] p-1 rounded-lg hover:bg-[#334155]/50 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-4">
          <div className="p-3 rounded-full bg-rose-500/15 text-[#EF4444] border border-rose-500/30 flex-shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[#F8FAFC]">{title}</h3>
            <p className="text-sm text-[#94A3B8] mt-1.5 leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <SecondaryButton onClick={onCancel} disabled={isLoading}>
            {cancelLabel}
          </SecondaryButton>
          <DangerButton onClick={onConfirm} isLoading={isLoading}>
            {confirmLabel}
          </DangerButton>
        </div>
      </div>
    </div>
  );
};
