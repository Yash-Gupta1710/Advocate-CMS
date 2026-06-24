import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'navy' | 'gold' | 'white';
  fullPage?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'gold',
  fullPage = false,
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
    xl: 'w-16 h-16 border-4',
  };

  const colorClasses = {
    navy: 'border-navy-200 border-t-navy-800',
    gold: 'border-gold-100 border-t-gold-500',
    white: 'border-white/20 border-t-white',
  };

  const spinner = (
    <div
      className={`rounded-full animate-spin ${sizeClasses[size]} ${colorClasses[color]}`}
      role="status"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-xs">
        {spinner}
      </div>
    );
  }

  return spinner;
};

export default LoadingSpinner;
