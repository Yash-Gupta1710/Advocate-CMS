import React from 'react';
import Modal from './Modal';
import Button from './Button';
import { HiExclamationTriangle } from 'react-icons/hi2';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  type?: 'danger' | 'warning' | 'info';
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isLoading = false,
  type = 'warning',
}) => {
  const iconColors = {
    danger: 'bg-red-50 text-red-600 border-red-100',
    warning: 'bg-amber-50 text-amber-600 border-amber-100',
    info: 'bg-navy-50 text-navy-600 border-navy-100',
  };

  const confirmVariants = {
    danger: 'danger' as const,
    warning: 'primary' as const,
    info: 'primary' as const,
  };

  const footer = (
    <>
      <Button variant="outline" onClick={onClose} disabled={isLoading}>
        {cancelText}
      </Button>
      <Button
        variant={confirmVariants[type]}
        onClick={async () => {
          await onConfirm();
          onClose();
        }}
        isLoading={isLoading}
      >
        {confirmText}
      </Button>
    </>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} footer={footer} size="sm">
      <div className="flex items-start gap-4">
        <div className={`flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full border ${iconColors[type]}`}>
          <HiExclamationTriangle className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <p className="text-sm text-gray-600 leading-relaxed">{message}</p>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
