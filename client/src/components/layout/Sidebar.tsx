import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import {
  LayoutDashboard,
  BookOpen,
  Bookmark,
  Bell,
  Award,
  User,
  PlusCircle,
  BarChart3,
  Users,
  Shield,
  FileText,
  ListOrdered,
  Sparkles,
} from 'lucide-react';

interface SidebarProps {
  type: 'student' | 'instructor' | 'admin';
}

export const Sidebar: React.FC<SidebarProps> = ({ type }) => {
  const { user } = useAuthStore();

  interface SidebarLink {
    to: string;
    label: string;
    icon: any;
    badge?: string;
  }

  const studentLinks: SidebarLink[] = [
    { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { to: '/dashboard/my-learning', label: 'My Learning', icon: BookOpen },
    { to: '/dashboard/wishlist', label: 'Wishlist', icon: Bookmark },
    { to: '/dashboard/certificates', label: 'Certificates', icon: Award },
    { to: '/dashboard/notifications', label: 'Notifications', icon: Bell },
    { to: '/ai-mentor', label: 'AI Mentor', icon: Sparkles, badge: 'AI' },
  ];

  const instructorLinks: SidebarLink[] = [
    { to: '/instructor', label: 'Studio Overview', icon: LayoutDashboard },
    { to: '/instructor/courses', label: 'My Courses', icon: BookOpen },
    { to: '/instructor/courses/create', label: 'Create Course', icon: PlusCircle },
    { to: '/instructor/analytics', label: 'Analytics & Revenue', icon: BarChart3 },
  ];

  const adminLinks: SidebarLink[] = [
    { to: '/admin', label: 'Admin Dashboard', icon: LayoutDashboard },
    { to: '/admin/courses', label: 'Course Approval', icon: BookOpen },
    { to: '/admin/users', label: 'User Management', icon: Users },
    { to: '/admin/categories', label: 'Categories', icon: ListOrdered },
    { to: '/admin/reviews', label: 'Review Moderation', icon: Shield },
    { to: '/admin/audit-logs', label: 'Security Audit Logs', icon: FileText },
  ];

  const links = type === 'student' ? studentLinks : type === 'instructor' ? instructorLinks : adminLinks;

  return (
    <aside className="w-64 bg-dark-950/80 border-r border-slate-800/80 min-h-[calc(100vh-5rem)] p-4 flex flex-col gap-6 shrink-0">
      {/* Profile summary card */}
      <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-brand-600 to-purple-600 flex items-center justify-center text-white font-bold shrink-0">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <div className="overflow-hidden">
          <p className="text-sm font-bold text-slate-100 truncate">{user?.name}</p>
          <span className="inline-block px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded bg-brand-500/10 text-brand-400 border border-brand-500/20">
            {user?.role}
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              end
              className={({ isActive }) =>
                `group relative flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-brand-600 to-brand-700 text-white font-semibold shadow-glow-blue border-l-4 border-cyan-400 pl-3'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900/80 border-l-4 border-transparent'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
                <span>{link.label}</span>
              </div>
              {link.badge && (
                <span className="px-1.5 py-0.5 text-[10px] font-black rounded bg-cyan-500/20 text-cyan-300">
                  {link.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};
