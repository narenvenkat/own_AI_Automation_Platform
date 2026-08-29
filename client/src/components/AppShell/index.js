import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  LayoutDashboard,
  GitFork,
  Sparkles,
  PlayCircle,
  Puzzle,
  Settings,
  Bell,
  LogOut,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
  Shield,
  Activity,
  Menu,
  X
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore.js';
import { subscribeToNotifications } from '../../services/socket.js';
import api from '../../services/api.js';

export default function AppShell({ children }) {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [systemHealthy, setSystemHealthy] = useState(true);

  // Fetch notifications
  const loadNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      if (res.success) {
        setNotifications(res.data || []);
        setUnreadCount(res.unreadCount || 0);
      }
    } catch (e) {
      console.warn('Notification fetch warning:', e);
    }
  };

  useEffect(() => {
    loadNotifications();

    // Check system health
    api.get('/health')
      .then((res) => setSystemHealthy(res.status === 'healthy'))
      .catch(() => setSystemHealthy(false));

    // Subscribe to live notifications over Socket.IO
    const unsubscribe = subscribeToNotifications(user?.id, (newNotif) => {
      setNotifications((prev) => [newNotif, ...prev]);
      setUnreadCount((c) => c + 1);
    });

    return () => unsubscribe && unsubscribe();
  }, [user]);

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/mark-all-read');
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (e) {}
  };

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Workflows', href: '/workflows', icon: GitFork },
    { name: 'AI Builder', href: '/workflows/builder', icon: Sparkles, badge: 'Agent' },
    { name: 'Executions', href: '/executions', icon: PlayCircle },
    { name: 'Integrations', href: '/integrations', icon: Puzzle },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const getNotifIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'escalation':
      case 'failure':
        return <XCircle className="w-4 h-4 text-rose-400" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      default:
        return <Info className="w-4 h-4 text-cyan-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col antialiased">
      {/* Top Navigation Bar */}
      <header className="h-16 border-b border-slate-800/80 bg-[#0c1220]/90 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-6 flex items-center justify-between">
        {/* Brand / Logo */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link href="/dashboard" className="flex items-center space-x-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-base tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                  Agentflow<span className="text-indigo-400">_AI</span>
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-indigo-950/80 text-indigo-300 border border-indigo-700/50">
                  OPS
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* Topbar Right Controls */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          {/* Health Pulse */}
          <div className="hidden sm:flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-xs">
            <span className={`w-2 h-2 rounded-full ${systemHealthy ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            <span className="text-slate-400 font-mono text-[11px]">
              {systemHealthy ? '5 Agents Active' : 'System Degraded'}
            </span>
          </div>

          {/* Quick AI Generate Button */}
          <Link
            href="/workflows/builder"
            className="hidden sm:flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.02]"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate with AI</span>
          </Link>

          {/* Notification Trigger */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 relative transition-all"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notification Slide Drawer / Dropdown */}
            {notificationsOpen && (
              <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl glass-panel shadow-2xl border border-slate-700/60 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center space-x-2">
                    <Bell className="w-4 h-4 text-indigo-400" />
                    <h4 className="font-semibold text-sm text-slate-100">Live Agent Alerts</h4>
                    {unreadCount > 0 && (
                      <span className="text-[11px] px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded-full border border-indigo-500/30">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto py-2 space-y-2">
                  {notifications.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 text-xs">
                      No notifications yet. Agent runs will emit alerts here.
                    </div>
                  ) : (
                    notifications.map((n, i) => (
                      <div
                        key={n._id || i}
                        className={`p-3 rounded-xl border text-xs transition-colors ${
                          n.isRead
                            ? 'bg-slate-900/40 border-slate-800/60 text-slate-400'
                            : 'bg-indigo-950/30 border-indigo-800/50 text-slate-200 shadow-sm'
                        }`}
                      >
                        <div className="flex items-start space-x-2.5">
                          <div className="mt-0.5 flex-shrink-0">{getNotifIcon(n.type)}</div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-slate-200 truncate">{n.title}</p>
                            <p className="text-slate-400 mt-0.5 leading-relaxed">{n.message}</p>
                            <span className="text-[10px] text-slate-500 mt-1 block">
                              {n.createdAt ? new Date(n.createdAt).toLocaleTimeString() : 'Just now'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile / Logout */}
          <div className="flex items-center space-x-2.5 pl-2 border-l border-slate-800">
            <div className="hidden md:flex flex-col text-right">
              <span className="text-xs font-semibold text-slate-200 leading-tight">{user?.name || 'Operator'}</span>
              <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">{user?.role || 'Operator'}</span>
            </div>
            <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-indigo-400">
              {user?.name ? user.name[0].toUpperCase() : 'O'}
            </div>
            <button
              onClick={logout}
              title="Logout"
              className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800/60 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Body Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar (Desktop) */}
        <aside className="w-64 border-r border-slate-800/80 bg-[#0c1220]/60 backdrop-blur-sm hidden md:flex flex-col justify-between p-4">
          <nav className="space-y-1.5">
            <div className="px-3 py-2 text-[11px] font-mono text-slate-400 uppercase tracking-widest">
              Console Navigation
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = router.pathname === item.href || (item.href !== '/dashboard' && router.pathname.startsWith(item.href));

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-violet-950/80 text-violet-300 border border-violet-700/50">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Agent Subsystem Badge in Sidebar */}
          <div className="p-3.5 rounded-2xl glass-panel border border-slate-800">
            <div className="flex items-center space-x-2 text-xs font-semibold text-slate-300 mb-1.5">
              <Shield className="w-3.5 h-3.5 text-cyan-400" />
              <span>Orchestrator V1.0</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              LangGraph substrate ready. Multi-agent self-healing loop engaged.
            </p>
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden bg-black/80 backdrop-blur-sm flex">
            <div className="w-64 bg-[#0c1220] h-full p-4 flex flex-col justify-between border-r border-slate-800">
              <nav className="space-y-1.5 mt-8">
                <div className="px-3 py-2 text-xs font-mono text-slate-500 uppercase tracking-widest">
                  Menu
                </div>
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = router.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium ${
                        isActive
                          ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>

              <button
                onClick={logout}
                className="flex items-center space-x-2 px-4 py-3 rounded-xl bg-rose-950/30 text-rose-300 border border-rose-800/40 text-sm font-semibold"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
            <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
          </div>
        )}

        {/* Main Content Viewport */}
        <main className="flex-1 overflow-y-auto bg-[#090d16] relative flex flex-col">
          {children}
        </main>
      </div>
    </div>
  );
}
