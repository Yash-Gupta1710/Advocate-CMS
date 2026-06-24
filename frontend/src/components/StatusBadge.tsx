import React from 'react';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const STATUS_MAP: Record<string, { bg: string; label: string }> = {
  // Appointment statuses
  requested: { bg: 'bg-amber-50 text-amber-700 border-amber-200/60', label: 'Requested' },
  approved: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/60', label: 'Approved' },
  rejected: { bg: 'bg-rose-50 text-rose-700 border-rose-200/60', label: 'Rejected' },
  rescheduled: { bg: 'bg-sky-50 text-sky-700 border-sky-200/60', label: 'Rescheduled' },
  completed: { bg: 'bg-navy-50 text-navy-700 border-navy-200/60', label: 'Completed' },
  cancelled: { bg: 'bg-gray-100 text-gray-500 border-gray-200/60', label: 'Cancelled' },

  // Case statuses
  pending: { bg: 'bg-amber-50 text-amber-700 border-amber-200/60', label: 'Pending' },
  active: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/60', label: 'Active' },
  disposed: { bg: 'bg-purple-50 text-purple-700 border-purple-200/60', label: 'Disposed' },
  appealed: { bg: 'bg-indigo-50 text-indigo-700 border-indigo-200/60', label: 'Appealed' },

  // Generic
  confirmed: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/60', label: 'Confirmed' },
  inactive: { bg: 'bg-gray-50 text-gray-500 border-gray-200/60', label: 'Inactive' },

  // Hearing statuses
  scheduled: { bg: 'bg-blue-50 text-blue-700 border-blue-200/60', label: 'Scheduled' },
  adjourned: { bg: 'bg-amber-50 text-amber-700 border-amber-200/60', label: 'Adjourned' },
  concluded: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/60', label: 'Concluded' },

  // Availability statuses
  available: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/60', label: 'Available' },
  busy: { bg: 'bg-amber-50 text-amber-700 border-amber-200/60', label: 'Busy' },
  in_court: { bg: 'bg-red-50 text-red-700 border-red-200/60', label: 'In Court' },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const key = status.toLowerCase().replace(/\s+/g, '_');
  const mapped = STATUS_MAP[key] || { bg: 'bg-gray-50 text-gray-700 border-gray-200', label: status };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${mapped.bg} ${className}`}
    >
      <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-current" />
      {mapped.label}
    </span>
  );
};

export default StatusBadge;
