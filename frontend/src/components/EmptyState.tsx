import React from 'react';
import { HiOutlineInbox } from 'react-icons/hi2';
import Button from './Button';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  actionText?: string;
  onActionClick?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  actionText,
  onActionClick,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gold-50 text-gold-500 mb-4 border border-gold-100">
        {icon || <HiOutlineInbox className="w-6 h-6" />}
      </div>
      <h3 className="text-sm font-semibold text-navy-800 mb-1">{title}</h3>
      <p className="text-xs text-gray-500 max-w-sm mb-6 leading-relaxed">{description}</p>
      {actionText && onActionClick && (
        <Button variant="secondary" onClick={onActionClick}>
          {actionText}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
