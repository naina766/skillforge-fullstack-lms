import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { useUIStore } from '../../store/useUIStore';
import { notificationApi } from '../../api/notificationApi';
import { courseApi } from '../../api/courseApi';
import { useQuery } from '@tanstack/react-query';
import {
  Sparkles,
  Search,
  Bell,
  User as UserIcon,
  LogOut,
  BookOpen,
  Bookmark,
  Award,
  Shield,
  LayoutDashboard,
  Menu,
  X,
  ChevronDown,
  ArrowRight,
  Clock,
  Layers,
} from 'lucide-react';
import { Button } from '../ui/Button';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { addToast } = useUIStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const searchContainerRef = React.useRef<HTMLDivElement>(null);

  // Quick live auto-suggest search query
  const trimmedSearch = searchQuery.trim();
  const { data: searchResultsData, isLoading: isSearchLoading } = useQuery({
    queryKey: ['quick-search', trimmedSearch],
    queryFn: () => courseApi.getCourses({ search: trimmedSearch, limit: 5 }),
    enabled: isSearchFocused && trimmedSearch.length >= 1,
    staleTime: 1000 * 30,
  });

  const matchingCourses = searchResultsData?.data?.items || [];

  // Close search popover on outside click
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Notifications query
  const { data: notifData } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationApi.getNotifications(),
    enabled: isAuthenticated,
    refetchInterval: 30000, // Poll every 30s
  });

  const unreadCount = notifData?.data?.unreadCount || 0;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (trimmedSearch) {
      setIsSearchFocused(false);
      navigate(`/courses?search=${encodeURIComponent(trimmedSearch)}`);
    }
  };

  const handleSelectCourse = (slug: string) => {
    setIsSearchFocused(false);
    setSearchQuery('');
    navigate(`/courses/${slug}`);
  };

  const handleLogout = async () => {
    try {
      await useAuthStore.getState().logout();
      addToast('info', 'Logged out successfully.');
      navigate('/login');
    } catch {
      logout();
      navigate('/login');
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-cyan-500 to-purple-500 flex items-center justify-center shadow-glow-blue group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-400">
              Skill<span className="text-brand-500">Forge</span>
            </span>
            <span className="block text-[10px] text-cyan-400 font-semibold tracking-widest uppercase -mt-1">
              EdTech Platform
            </span>
          </div>
        </Link>

        {/* Global Interactive Search Bar with Live Auto-Suggest */}
        <div ref={searchContainerRef} className="hidden md:block flex-1 max-w-md relative">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search courses, skills, workshops..."
              value={searchQuery}
              onFocus={() => setIsSearchFocused(true)}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchFocused(true);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Escape') setIsSearchFocused(false);
              }}
              className="w-full bg-slate-900/90 border border-slate-800 hover:border-slate-700 focus:border-brand-500 text-slate-200 text-sm rounded-xl pl-10 pr-9 py-2 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all placeholder:text-slate-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>

          {/* Live Auto-Suggest Dropdown Modal */}
          {isSearchFocused && trimmedSearch.length >= 1 && (
            <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl glass-panel border border-slate-700/80 shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
              <div className="p-3 border-b border-slate-800/80 bg-slate-900/50 flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold uppercase tracking-wider text-[10px]">Instant Results</span>
                <span>Press Enter to search all</span>
              </div>

              {isSearchLoading ? (
                <div className="p-4 space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3 animate-pulse">
                      <div className="w-10 h-10 rounded-lg bg-slate-800 shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-3 w-3/4 bg-slate-800 rounded" />
                        <div className="h-2.5 w-1/2 bg-slate-800 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : matchingCourses.length > 0 ? (
                <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/50">
                  {matchingCourses.map((course) => (
                    <button
                      key={course._id}
                      type="button"
                      onClick={() => handleSelectCourse(course.slug)}
                      className="w-full p-3 flex items-center gap-3 hover:bg-brand-500/10 transition-colors text-left group"
                    >
                      <div className="w-11 h-11 rounded-lg bg-slate-800 overflow-hidden shrink-0 border border-slate-700/60">
                        {course.thumbnail ? (
                          <img src={course.thumbnail} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-brand-400">
                            <Layers className="w-4 h-4" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-brand-400 uppercase tracking-wider">
                            {course.category?.name || course.type}
                          </span>
                          <span className="text-[10px] text-slate-500">•</span>
                          <span className="text-[10px] text-slate-400 capitalize">
                            {course.level.toLowerCase()}
                          </span>
                        </div>
                        <h4 className="text-xs font-semibold text-slate-100 group-hover:text-brand-300 transition-colors truncate">
                          {course.title}
                        </h4>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-bold text-slate-200">
                          {course.price === 0 ? <span className="text-emerald-400">Free</span> : `$${course.price}`}
                        </span>
                      </div>
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={handleSearchSubmit}
                    className="w-full p-3 bg-slate-900/80 hover:bg-slate-800 text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>View all matching courses for "{trimmedSearch}"</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="p-6 text-center space-y-2">
                  <p className="text-xs text-slate-400">No courses directly matching "{trimmedSearch}"</p>
                  <button
                    type="button"
                    onClick={handleSearchSubmit}
                    className="text-xs font-semibold text-brand-400 hover:underline inline-flex items-center gap-1"
                  >
                    Search entire course catalog →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-300">
          <Link to="/courses" className="hover:text-white transition-colors">
            Explore Courses
          </Link>
          <Link to="/courses?type=WORKSHOP" className="hover:text-white transition-colors">
            Workshops
          </Link>
          <Link to="/ai-mentor" className="flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 transition-colors font-semibold">
            <Sparkles className="w-4 h-4" />
            AI Mentor
          </Link>
        </nav>

        {/* Right Actions */}
        <div className="hidden sm:flex items-center gap-3">
          {isAuthenticated ? (
            <>
              {/* Notification Popover Icon */}
              <Link
                to="/dashboard/notifications"
                className="relative p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-all"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-brand-500 text-white text-[10px] font-extrabold flex items-center justify-center animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>

              {/* User Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 pl-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all text-left"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="hidden md:block">
                    <div className="text-xs font-bold text-slate-100 max-w-[100px] truncate">{user?.name}</div>
                    <div className="text-[10px] font-semibold text-brand-400 uppercase">{user?.role}</div>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {isUserDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 rounded-2xl glass-panel border border-slate-800 shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2"
                    onMouseLeave={() => setIsUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-slate-800/60 mb-1">
                      <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                      <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                    </div>

                    <Link
                      to="/dashboard"
                      onClick={() => setIsUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800/60 hover:text-white"
                    >
                      <LayoutDashboard className="w-4 h-4 text-brand-400" />
                      Student Dashboard
                    </Link>
                    <Link
                      to="/dashboard/my-learning"
                      onClick={() => setIsUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800/60 hover:text-white"
                    >
                      <BookOpen className="w-4 h-4 text-cyan-400" />
                      My Learning
                    </Link>
                    <Link
                      to="/dashboard/wishlist"
                      onClick={() => setIsUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800/60 hover:text-white"
                    >
                      <Bookmark className="w-4 h-4 text-purple-400" />
                      Wishlist
                    </Link>
                    <Link
                      to="/dashboard/certificates"
                      onClick={() => setIsUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800/60 hover:text-white"
                    >
                      <Award className="w-4 h-4 text-amber-400" />
                      Certificates
                    </Link>

                    {(user?.role === 'INSTRUCTOR' || user?.role === 'ADMIN') && (
                      <Link
                        to="/instructor"
                        onClick={() => setIsUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800/60 hover:text-white border-t border-slate-800/60 mt-1"
                      >
                        <UserIcon className="w-4 h-4 text-emerald-400" />
                        Instructor Studio
                      </Link>
                    )}

                    {user?.role === 'ADMIN' && (
                      <Link
                        to="/admin"
                        onClick={() => setIsUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800/60 hover:text-white"
                      >
                        <Shield className="w-4 h-4 text-rose-400" />
                        Admin Control Panel
                      </Link>
                    )}

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-400 hover:bg-red-950/40 hover:text-red-300 border-t border-slate-800/60 mt-1 text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Log Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Log In
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" size="sm">
                  Get Started Free
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer Navigation */}
      {isMobileMenuOpen && (
        <div className="lg:hidden glass-panel border-b border-slate-800 px-4 pt-2 pb-6 space-y-4">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-sm rounded-xl pl-10 pr-4 py-2"
            />
          </form>

          <nav className="flex flex-col space-y-3 font-medium text-slate-300">
            <Link to="/courses" onClick={() => setIsMobileMenuOpen(false)}>
              Explore Courses
            </Link>
            <Link to="/courses?type=WORKSHOP" onClick={() => setIsMobileMenuOpen(false)}>
              Workshops
            </Link>
            <Link to="/ai-mentor" className="text-cyan-400" onClick={() => setIsMobileMenuOpen(false)}>
              AI Mentor
            </Link>

            {isAuthenticated ? (
              <>
                <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                  Dashboard
                </Link>
                <Link to="/dashboard/my-learning" onClick={() => setIsMobileMenuOpen(false)}>
                  My Learning
                </Link>
                <button onClick={handleLogout} className="text-left text-red-400">
                  Log Out
                </button>
              </>
            ) : (
              <div className="pt-2 flex flex-col gap-2">
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="secondary" className="w-full">
                    Log In
                  </Button>
                </Link>
                <Link to="/register" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="primary" className="w-full">
                    Register
                  </Button>
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};
