import React from 'react';
import LoadingSpinner from './LoadingSpinner';
import EmptyState from './EmptyState';

export interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T, index: number) => React.ReactNode);
  className?: string;
  align?: 'left' | 'center' | 'right';
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  rowKey: (row: T, index: number) => string | number;
  emptyText?: string;
  emptyIcon?: React.ReactNode;
}

export function Table<T>({
  columns,
  data,
  isLoading = false,
  rowKey,
  emptyText = 'No data available',
  emptyIcon,
}: TableProps<T>) {
  return (
    <div className="w-full overflow-x-auto rounded-lg border border-gray-200">
      <table className="w-full border-collapse text-left text-sm text-gray-500">
        <thead className="bg-navy-800 text-xs uppercase text-white">
          <tr>
            {columns.map((column, index) => {
              const alignClass = 
                column.align === 'center' ? 'text-center' : 
                column.align === 'right' ? 'text-right' : 'text-left';
              return (
                <th
                  key={index}
                  scope="col"
                  className={`px-6 py-4 font-semibold ${alignClass} ${column.className || ''}`}
                >
                  {column.header}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {isLoading ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-12">
                <div className="flex justify-center items-center">
                  <LoadingSpinner size="md" />
                  <span className="ml-2 text-sm text-gray-500">Loading data...</span>
                </div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-12">
                <EmptyState
                  title="No Results"
                  description={emptyText}
                  icon={emptyIcon}
                />
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr key={rowKey(row, rowIndex)} className="hover:bg-gray-50/70 transition-colors">
                {columns.map((column, colIndex) => {
                  const alignClass = 
                    column.align === 'center' ? 'text-center' : 
                    column.align === 'right' ? 'text-right' : 'text-left';
                  
                  let cellContent: React.ReactNode = null;
                  if (typeof column.accessor === 'function') {
                    cellContent = column.accessor(row, rowIndex);
                  } else {
                    const value = row[column.accessor];
                    cellContent = (value !== undefined && value !== null) ? String(value) : '';
                  }

                  return (
                    <td
                      key={colIndex}
                      className={`px-6 py-4 font-medium text-gray-700 ${alignClass} ${column.className || ''}`}
                    >
                      {cellContent}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Table;
