import React, { useState, useEffect, useRef } from 'react';
import { FiBell, FiCheckCircle } from 'react-icons/fi';
import { notificationService, Notification } from '../services/notificationService';
import { formatDistanceToNow } from 'date-fns';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadNotifications();

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadNotifications = async () => {
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.isRead).length);
    } catch (error) {
      console.error('Failed to load notifications', error);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark as read', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read', error);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-xl text-gray-500 hover:bg-gray-100 hover:text-navy-800 transition-all focus:outline-none"
      >
        <FiBell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden transform transition-all duration-200 origin-top-right">
          <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
            <h3 className="font-semibold text-navy-900">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={handleMarkAllAsRead}
                className="text-xs text-gold-600 hover:text-gold-700 font-medium"
              >
                Mark all as read
              </button>
            )}
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-sm text-gray-500">
                No notifications yet
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {notifications.map(notification => (
                  <div 
                    key={notification.id} 
                    className={`p-4 transition-colors ${notification.isRead ? 'bg-white' : 'bg-blue-50/30'}`}
                  >
                    <div className="flex gap-3">
                      <div className={`mt-0.5 flex-shrink-0 w-2 h-2 rounded-full ${notification.isRead ? 'bg-transparent' : 'bg-gold-500'}`} />
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${notification.isRead ? 'text-gray-600' : 'text-navy-900 font-medium'}`}>
                          {notification.message}
                        </p>
                        <div className="mt-1 flex items-center justify-between">
                          <p className="text-xs text-gray-400">
                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                          </p>
                          {!notification.isRead && (
                            <button 
                              onClick={() => handleMarkAsRead(notification.id)}
                              className="text-gray-400 hover:text-gold-500 transition-colors"
                              title="Mark as read"
                            >
                              <FiCheckCircle className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
