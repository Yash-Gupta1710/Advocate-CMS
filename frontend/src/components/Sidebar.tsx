import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FiHome, FiCalendar, FiBriefcase, FiFileText,
  FiSettings, FiLogOut, FiX, FiShield
} from 'react-icons/fi';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const lawyerNav = [
  { to: '/dashboard', label: 'Dashboard', icon: FiHome },
  { to: '/appointments', label: 'Appointments', icon: FiCalendar },
  { to: '/cases', label: 'Cases', icon: FiBriefcase },
  { to: '/documents', label: 'Documents', icon: FiFileText },
  { to: '/settings', label: 'Settings', icon: FiSettings },
];

const clientNav = [
  { to: '/dashboard', label: 'My Portal', icon: FiHome },
  { to: '/appointments', label: 'Appointments', icon: FiCalendar },
  { to: '/cases', label: 'My Cases', icon: FiBriefcase },
  { to: '/documents', label: 'Documents', icon: FiFileText },
  { to: '/settings', label: 'Profile', icon: FiSettings },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user, logout } = useAuth();
  const navItems = user?.role === 'lawyer' ? lawyerNav : clientNav;

  const linkClasses = (isActive: boolean) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'bg-gold-500/15 text-gold-500 shadow-sm'
        : 'text-navy-300 hover:bg-navy-700/60 hover:text-white'
    }`;

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } bg-navy-950 flex flex-col`}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-navy-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-lg">
            <FiShield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-wide">Lexora</h1>
            <p className="text-[0.65rem] text-navy-400 uppercase tracking-widest">Adv. CMS</p>
          </div>
        </div>
        <button onClick={onClose} className="lg:hidden text-navy-400 hover:text-white">
          <FiX className="w-5 h-5" />
        </button>
      </div>

      {/* User Badge */}
      <div className="px-5 py-4">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-navy-900/80 border border-navy-800">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-white text-xs font-bold shadow">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
            <p className="text-xs text-navy-400 capitalize">{user?.role}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/dashboard'}
            onClick={onClose}
            className={({ isActive }) => linkClasses(isActive)}
          >
            <item.icon className="w-[18px] h-[18px] flex-shrink-0" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-navy-800">
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all duration-200"
        >
          <FiLogOut className="w-[18px] h-[18px]" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
