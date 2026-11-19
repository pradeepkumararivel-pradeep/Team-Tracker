import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  MessageSquare,
  Bot,
  Shield,
  LogOut,
  Sun,
  Moon,
  Bell,
  Menu,
  X,
  User as UserIcon
} from 'lucide-react';

export default function MainLayout() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [notificationsLoading, setNotificationsLoading] = useState(true);
  const [notificationsUpdating, setNotificationsUpdating] = useState(false);
  const [notificationError, setNotificationError] = useState('');
  const notificationsPanelRef = useRef(null);

  useEffect(() => {
    let active = true;
    setNotificationsLoading(true);
    setNotificationError('');
    api.get('/notifications')
      .then((res) => {
        if (active) setNotifications(res.data.data || []);
      })
      .catch((error) => {
        if (active) {
          setNotificationError(error.response?.data?.message || 'Unable to load notifications.');
        }
      })
      .finally(() => {
        if (active) setNotificationsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [location.pathname]);

  useEffect(() => {
    if (!showNotifs) return undefined;
    const handlePointerDown = (event) => {
      if (!notificationsPanelRef.current?.contains(event.target)) setShowNotifs(false);
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setShowNotifs(false);
    };
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showNotifs]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = async () => {
    if (unreadCount === 0 || notificationsUpdating) return;
    setNotificationsUpdating(true);
    setNotificationError('');
    try {
      await api.put('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (error) {
      setNotificationError(error.response?.data?.message || 'Unable to mark notifications as read.');
    } finally {
      setNotificationsUpdating(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Projects', path: '/projects', icon: FolderKanban },
    { label: 'Tasks', path: '/tasks', icon: CheckSquare },
    { label: 'Team Chat', path: '/chat', icon: MessageSquare },
    { label: 'AI Assistant', path: '/ai', icon: Bot },
    { label: 'Profile', path: '/profile', icon: UserIcon }
  ];

  if (user?.role === 'Admin') {
    navItems.push({ label: 'Admin Panel', path: '/admin', icon: Shield });
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="p-6 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold shadow">
              T
            </div>
            <span className="text-xl font-bold tracking-tight">TeamTracker</span>
          </div>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-2.5 rounded-xl font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <Icon size={19} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center space-x-3 mb-3 px-2">
            <div className="h-9 w-9 rounded-full bg-indigo-600/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="font-semibold text-sm truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 truncate">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 py-2 px-4 rounded-xl border border-red-500/30 text-red-500 hover:bg-red-500/10 text-sm font-medium transition-colors"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <h1 className="font-semibold text-lg capitalize">
              {navItems.find((i) => i.path === location.pathname)?.label || 'TeamTracker'}
            </h1>
          </div>

          <div ref={notificationsPanelRef} className="relative flex items-center space-x-3">
            <button
              onClick={() => setShowNotifs(!showNotifs)}
              className="relative p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Notifications"
              aria-expanded={showNotifs}
              aria-haspopup="dialog"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-bold">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifs && (
              <section
                role="dialog"
                aria-label="Recent notifications"
                className="absolute right-0 top-12 w-80 max-w-[calc(100vw-2rem)] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-sm">Notifications</span>
                  <button
                    onClick={handleMarkAllRead}
                    disabled={unreadCount === 0 || notificationsUpdating}
                    className="text-xs text-indigo-500 hover:underline disabled:opacity-50 disabled:no-underline"
                  >
                    {notificationsUpdating ? 'Marking...' : 'Mark all as read'}
                  </button>
                </div>
                {notificationError && (
                  <p role="alert" className="mb-2 text-xs text-red-500">{notificationError}</p>
                )}
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {notificationsLoading ? (
                    <p className="text-xs text-slate-500 py-4 text-center">Loading notifications...</p>
                  ) : notifications.length === 0 ? (
                    <p className="text-xs text-slate-500 py-4 text-center">No notifications yet</p>
                  ) : (
                    notifications.slice(0, 8).map((n) => (
                      <div
                        key={n._id}
                        className={`p-2.5 rounded-xl text-xs ${
                          n.read ? 'opacity-60' : 'bg-indigo-500/10 border border-indigo-500/20'
                        }`}
                      >
                        <p className="font-semibold">{n.title}</p>
                        <p className="text-slate-500 mt-0.5">{n.message}</p>
                        <time className="block mt-1 text-[10px] text-slate-400" dateTime={n.createdAt}>
                          {new Date(n.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                        </time>
                      </div>
                    ))
                  )}
                </div>
              </section>
            )}
          </div>
        </header>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
