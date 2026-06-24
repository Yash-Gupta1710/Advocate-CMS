import React from 'react';
import { HiMagnifyingGlass, HiXMark } from 'react-icons/hi2';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  onClear?: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = 'Search...',
  className = '',
  onClear,
}) => {
  return (
    <div className={`relative flex items-center w-full max-w-md ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <HiMagnifyingGlass className="h-5 h-5 text-gray-400" aria-hidden="true" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="block w-full pl-10 pr-10 py-2 border border-gray-200 rounded-lg text-sm bg-white placeholder-gray-400 focus:outline-none focus:border-navy-500 focus:ring-1 focus:ring-navy-500 transition-all duration-200"
        placeholder={placeholder}
      />
      {value && (
        <button
          type="button"
          onClick={onClear || (() => onChange(''))}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
        >
          <HiXMark className="h-5 h-5" aria-hidden="true" />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
