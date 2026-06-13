import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, Map, Key, Calendar, TreePine, 
  Newspaper, Settings, UserCircle, LogOut, Sun, Moon, Menu, X, Info
} from 'lucide-react';

export default function DashboardLayout({ children }) {
  const { user, logout, isPetani, isPengurus, isBPP, isAdmin } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Load and apply theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('farmers_portal_theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    if (darkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('farmers_portal_theme', 'light');
      setDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('farmers_portal_theme', 'dark');
      setDarkMode(true);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Menu items config with role filters
  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard, show: true },
    { name: 'Lahan Pertanian', path: '/lands', icon: Map, show: isPetani || isPengurus || isBPP },
    { name: 'Peralatan & Sewa', path: '/equipment', icon: Key, show: true },
    { name: 'Aktivitas Harian', path: '/activities', icon: Calendar, show: isPetani || isPengurus },
    { name: 'Struktur Organisasi', path: '/org', icon: TreePine, show: true },
    { name: 'Berita Tani', path: '/news', icon: Newspaper, show: true },
    { name: 'Manajemen Sistem', path: '/admin', icon: Settings, show: isAdmin },
  ];

  const getRoleBadge = (role) => {
    const badges = {
      petani: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
      pengurus: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800',
      bpp: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800',
      admin: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200 dark:border-rose-800'
    };
    return badges[role] || 'bg-slate-100 text-slate-800';
  };

  const currentPath = location.pathname;

  return (
    <div className="flex h-screen overflow-hidden bg-surface-bg text-ink-main">
      
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex md:flex-col md:w-64 bg-surface-card border-r border-border-subtle flex-shrink-0">
        {/* Brand Logo */}
        <div className="h-20 flex items-center px-6 border-b border-border-subtle gap-3">
          <span className="text-3xl">🌾</span>
          <span className="font-bold text-xl text-brand-primary tracking-wide">
            PORTAL PETANI
          </span>
        </div>

        {/* User profile Summary */}
        <div className="p-5 border-b border-border-subtle bg-surface-bg">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-brand-primary text-white flex items-center justify-center font-bold text-xl shadow-sm">
              {user?.name.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <h4 className="font-semibold text-sm truncate">{user?.name}</h4>
              <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full border mt-1 capitalize`}>
                {user?.role}
              </span>
            </div>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {menuItems.filter(item => item.show).map(item => {
            const isActive = currentPath === item.path || (item.path !== '/' && currentPath.startsWith(item.path));
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                  isActive 
                    ? 'bg-brand-primary text-white shadow-sm' 
                    : 'text-ink-muted hover:bg-surface-bg hover:text-ink-main'
                }`}
              >
                <Icon className={`w-6 h-6 ${isActive ? 'text-white' : 'text-ink-muted'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Theme and Logout Controls */}
        <div className="p-4 border-t border-border-subtle space-y-2">
          <button
            onClick={toggleTheme}
            className="flex items-center justify-between w-full px-4 py-3 rounded-lg text-base font-medium text-ink-muted hover:bg-surface-bg hover:text-ink-main transition-colors"
          >
            <span className="flex items-center gap-3">
              {darkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
              {darkMode ? 'Mode Terang' : 'Mode Gelap'}
            </span>
          </button>
          
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-base font-medium text-rose-700 hover:bg-rose-50 transition-colors"
          >
            <LogOut className="w-6 h-6" />
            Keluar Sesi
          </button>
        </div>
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile Drawer Menu */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-surface-card border-r border-border-subtle flex flex-col md:hidden transform transition-transform duration-200 ease-in-out ${
        isMobileOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="h-20 flex items-center justify-between px-6 border-b border-border-subtle">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🌾</span>
            <span className="font-bold text-xl text-brand-primary tracking-wide">
              PORTAL PETANI
            </span>
          </div>
          <button 
            onClick={() => setIsMobileOpen(false)}
            className="p-2 rounded-lg text-ink-muted hover:bg-surface-bg"
          >
            <X className="w-7 h-7" />
          </button>
        </div>

        <div className="p-6 border-b border-border-subtle bg-surface-bg">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-lg bg-brand-primary text-white flex items-center justify-center font-bold text-2xl">
              {user?.name.charAt(0)}
            </div>
            <div>
              <h4 className="font-bold text-lg text-ink-main">{user?.name}</h4>
              <span className="inline-block px-3 py-1 text-sm font-semibold rounded-full border border-border-subtle mt-1 capitalize text-ink-muted">
                {user?.role}
              </span>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {menuItems.filter(item => item.show).map(item => {
            const isActive = currentPath === item.path || (item.path !== '/' && currentPath.startsWith(item.path));
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setIsMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                  isActive 
                    ? 'bg-brand-primary text-white' 
                    : 'text-ink-muted hover:bg-surface-bg hover:text-ink-main'
                }`}
              >
                <Icon className={`w-6 h-6 ${isActive ? 'text-white' : 'text-ink-muted'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border-subtle space-y-2">
          <button
            onClick={toggleTheme}
            className="flex items-center justify-between w-full px-4 py-3 rounded-lg text-base font-medium text-ink-muted hover:bg-surface-bg hover:text-ink-main transition-colors"
          >
            <span className="flex items-center gap-3">
              {darkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
              {darkMode ? 'Mode Terang' : 'Mode Gelap'}
            </span>
          </button>
          
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-base font-medium text-rose-700 hover:bg-rose-50 transition-colors"
          >
            <LogOut className="w-6 h-6" />
            Keluar Sesi
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-20 flex items-center justify-between px-8 border-b border-border-subtle bg-surface-card">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="p-2 rounded-lg text-ink-muted hover:bg-surface-bg md:hidden"
            >
              <Menu className="w-7 h-7" />
            </button>
            <h1 className="text-xl md:text-2xl font-bold text-ink-main capitalize">
              {menuItems.find(item => item.path === currentPath)?.name || 'Halaman'}
            </h1>
          </div>

          <div className="flex items-center gap-6">
            <span className="hidden sm:inline-block text-sm font-medium text-ink-muted">
              Hari ini: {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
            
            <Link 
              to="/profile" 
              className={`p-2 rounded-full hover:bg-surface-bg transition-colors ${
                currentPath === '/profile' ? 'text-brand-primary bg-surface-bg' : 'text-ink-muted'
              }`}
            >
              <UserCircle className="w-8 h-8" />
            </Link>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-surface-bg">
          {children}
        </main>
      </div>

    </div>
  );
}
