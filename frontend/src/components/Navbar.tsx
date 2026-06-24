import { useAuth } from '../context/AuthContext';
import { FiMenu, FiSearch } from 'react-icons/fi';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NotificationBell from './NotificationBell';

interface NavbarProps {
  onMenuClick: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Global search will be implemented in Milestone 3
      console.log('Search:', searchQuery);
    }
  };

  return (
    <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-gray-200/60 px-4 md:px-6 lg:px-8">
      <div className="flex items-center justify-between h-16">
        {/* Left: Menu button + Search */}
        <div className="flex items-center gap-4 flex-1">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 -ml-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
          >
            <FiMenu className="w-5 h-5" />
          </button>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden sm:flex items-center flex-1 max-w-md">
            <div className="relative w-full">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search clients, cases, documents..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-100 border border-transparent text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-gold-500/50 focus:bg-white focus:ring-2 focus:ring-gold-500/20 transition-all"
              />
            </div>
          </form>
        </div>

        {/* Right: Notifications + Profile */}
        <div className="flex items-center gap-2">
          {/* Notification Bell */}
          <NotificationBell />

          {/* Profile Avatar */}
          <button
            onClick={() => navigate('/settings')}
            className="flex items-center gap-2.5 ml-1 px-3 py-1.5 rounded-xl hover:bg-gray-100 transition-all"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-navy-700 to-navy-900 flex items-center justify-center text-white text-xs font-bold shadow-sm">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <span className="hidden md:block text-sm font-medium text-gray-700">{user?.name}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
