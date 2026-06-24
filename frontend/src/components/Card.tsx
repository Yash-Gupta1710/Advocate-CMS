import React from 'react';

interface CardProps {
  children: React.ReactNode;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  extra?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  extra,
  footer,
  className = '',
  bodyClassName = '',
  onClick,
}) => {
  const isClickable = !!onClick;
  
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border border-gray-200/80 shadow-xs transition-all duration-200 ${
        isClickable ? 'hover:shadow-md hover:border-gold-300 cursor-pointer' : ''
      } ${className}`}
    >
      {(title || subtitle || extra) && (
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            {title && (
              <h3 className="text-base font-semibold text-navy-800">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="mt-1 text-xs text-gray-500">
                {subtitle}
              </p>
            )}
          </div>
          {extra && <div className="flex-shrink-0">{extra}</div>}
        </div>
      )}
      
      <div className={`px-6 py-5 ${bodyClassName}`}>
        {children}
      </div>

      {footer && (
        <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 rounded-b-xl flex items-center justify-end gap-3">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
