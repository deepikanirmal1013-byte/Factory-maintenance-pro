import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, Check, AlertCircle, Info, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Notification } from '../types';

export const NotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toast, setToast] = useState<Notification | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const prevUnreadCount = useRef(0);

  const fetchNotifications = async (retries = 5) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    try {
      const response = await fetch('/api/notifications', { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with ${response.status}`);
      }
      const data = await response.json();
      setNotifications(data);
      const newUnreadCount = data.filter((n: Notification) => !n.is_read).length;
      
      // Show toast if unread count increased
      if (newUnreadCount > prevUnreadCount.current) {
        const latest = data.find((n: Notification) => !n.is_read);
        if (latest) {
          setToast(latest);
          // Vibrate on new notification
          if ('vibrate' in navigator) {
            navigator.vibrate([200, 100, 200]);
          }
          setTimeout(() => setToast(null), 5000);
        }
      }
      
      setUnreadCount(newUnreadCount);
      prevUnreadCount.current = newUnreadCount;
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        console.warn('Notification fetch timed out');
      }
      
      if (retries > 0) {
        // Silent retry with exponential backoff
        const delay = (6 - retries) * 2000;
        setTimeout(() => fetchNotifications(retries - 1), delay);
      } else {
        console.error('Failed to fetch notifications after multiple attempts. Last error:', error.message || error);
      }
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAsRead = async (id: number) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: 'POST' });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications/read-all', { method: 'POST' });
      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'error': return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'warning': return <AlertCircle className="w-4 h-4 text-amber-500" />;
      default: return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/10"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-[#0a0a0a]">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.9 }}
            className="fixed top-20 right-6 w-72 bg-[#141414] border border-white/10 rounded-xl shadow-2xl z-[100] p-4 flex gap-3 cursor-pointer"
            onClick={() => {
              setIsOpen(true);
              setToast(null);
            }}
          >
            <div className="mt-1">{getIcon(toast.type)}</div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{toast.title}</p>
              <p className="text-[10px] text-gray-400 line-clamp-2 mt-0.5">{toast.message}</p>
            </div>
            <button onClick={(e) => { e.stopPropagation(); setToast(null); }} className="text-gray-500 hover:text-white">
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-2 w-80 bg-[#141414] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden"
          >
            <div className="p-4 border-bottom border-white/10 flex items-center justify-between bg-white/5">
              <h3 className="text-sm font-semibold text-white">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-[10px] uppercase tracking-wider text-gray-400 hover:text-white transition-colors"
                >
                  Mark all as read
                </button>
              )}
            </div>

            <div className="max-h-[400px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="w-8 h-8 text-gray-600 mx-auto mb-2 opacity-20" />
                  <p className="text-sm text-gray-500 italic">No notifications yet</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border-bottom border-white/5 hover:bg-white/5 transition-colors relative group ${!notification.is_read ? 'bg-white/[0.02]' : ''}`}
                  >
                    <div className="flex gap-3">
                      <div className="mt-1">{getIcon(notification.type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className={`text-xs font-bold truncate ${!notification.is_read ? 'text-white' : 'text-gray-400'}`}>
                            {notification.title}
                          </p>
                          <span className="text-[10px] text-gray-600 whitespace-nowrap ml-2">
                            {notification.created_at ? new Date(notification.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                          </span>
                        </div>
                        <p className={`text-xs leading-relaxed ${!notification.is_read ? 'text-gray-300' : 'text-gray-500'}`}>
                          {notification.message}
                        </p>
                      </div>
                    </div>
                    {!notification.is_read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="absolute right-2 bottom-2 opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded transition-all"
                        title="Mark as read"
                      >
                        <Check className="w-3 h-3 text-emerald-500" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>

            {notifications.length > 0 && (
              <div className="p-3 text-center border-top border-white/10 bg-white/5">
                <p className="text-[10px] text-gray-500 uppercase tracking-widest">
                  Showing last 50 notifications
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
