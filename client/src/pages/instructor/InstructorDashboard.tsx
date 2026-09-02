import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { instructorApi } from '../../api/instructorApi';
import { courseApi } from '../../api/courseApi';
import { Sidebar } from '../../components/layout/Sidebar';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { useUIStore } from '../../store/useUIStore';
import {
  BookOpen,
  Users,
  DollarSign,
  PlusCircle,
  Star,
  BarChart3,
  CheckCircle2,
  FileEdit,
  ArrowRight,
  TrendingUp,
  Award,
  Sparkles,
} from 'lucide-react';

export const InstructorDashboard: React.FC = () => {
  const queryClient = useQueryClient();
  const { addToast } = useUIStore();

  const { data: analyticsResponse, isLoading } = useQuery({
    queryKey: ['instructor-analytics'],
    queryFn: () => instructorApi.getAnalytics(),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      courseApi.updateCourseStatus(id, status),
    onSuccess: (_, vars) => {
      addToast('success', `Course status updated to ${vars.status}.`);
      queryClient.invalidateQueries({ queryKey: ['instructor-analytics'] });
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
    },
    onError: (err: any) => {
      addToast('error', err.response?.data?.message || 'Failed to update course status.');
    },
  });

  const analytics = analyticsResponse?.data;
  const metrics = analytics?.metrics;
  const courses = analytics?.courses || [];

  return (
    <div className="flex min-h-[calc(100vh-5rem)] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 gap-8 w-full">
      <Sidebar type="instructor" />

      <main className="flex-1 min-w-0 space-y-8">
        {/* Studio Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-brand-400" />
              <h1 className="text-2xl font-bold text-white">Instructor Studio Overview</h1>
            </div>
            <p className="text-xs text-slate-400">Welcome to your creator command center. Monitor earnings, launch curriculum, and engage learners.</p>
          </div>

          <div className="flex items-center gap-2">
            <Link to="/instructor/analytics">
              <Button variant="secondary" size="sm" leftIcon={<BarChart3 className="w-4 h-4" />}>
                View Revenue
              </Button>
            </Link>
            <Link to="/instructor/courses/create">
              <Button variant="primary" size="sm" leftIcon={<PlusCircle className="w-4 h-4" />}>
                Create Course
              </Button>
            </Link>
          </div>
        </div>

        {/* KPI Metrics */}
        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Skeleton className="h-28 w-full rounded-2xl" />
            <Skeleton className="h-28 w-full rounded-2xl" />
            <Skeleton className="h-28 w-full rounded-2xl" />
            <Skeleton className="h-28 w-full rounded-2xl" />
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                <span>Authored Programs</span>
                <BookOpen className="w-4 h-4 text-brand-400" />
              </div>
              <div className="text-3xl font-extrabold text-white">{metrics?.totalCourses || 0}</div>
              <div className="flex items-center gap-1.5 text-[11px] text-cyan-400 font-medium">
                <Sparkles className="w-3 h-3" />
                <span>Live in platform catalog</span>
              </div>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                <span>Active Learners</span>
                <Users className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-3xl font-extrabold text-white">{metrics?.totalStudents || 0}</div>
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold">
                <TrendingUp className="w-3 h-3" />
                <span>+24% new enrollments</span>
              </div>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                <span>Average Rating</span>
                <Star className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-3xl font-extrabold text-amber-400">{metrics?.averageRating || 0} ★</div>
              <div className="flex items-center gap-1.5 text-[11px] text-amber-400/90 font-medium">
                <Award className="w-3 h-3" />
                <span>Top 5% Platform Instructor</span>
              </div>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-emerald-500/25 bg-gradient-to-br from-emerald-950/25 via-dark-900 to-slate-900 space-y-2 shadow-lg">
              <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                <span>Total Gross Earnings</span>
                <DollarSign className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-3xl font-black text-emerald-400">${metrics?.totalRevenue || 0}</div>
              <div className="text-[11px] text-emerald-400/90 font-bold flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                <span>+32% Revenue Trajectory</span>
              </div>
            </div>
          </div>
        )}

        {/* Quick Action Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/instructor/courses/create"
            className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-brand-500/40 transition-all group space-y-2"
          >
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <PlusCircle className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white group-hover:text-brand-300">Course Creation Wizard</h3>
            <p className="text-xs text-slate-400">Launch a multi-module course, live workshop, or coding bootcamp.</p>
          </Link>

          <Link
            to="/instructor/courses"
            className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-cyan-500/40 transition-all group space-y-2"
          >
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white group-hover:text-cyan-300">Manage Course Catalog</h3>
            <p className="text-xs text-slate-400">Edit curriculum content, update lesson videos, and toggle publishing.</p>
          </Link>

          <Link
            to="/instructor/analytics"
            className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-emerald-500/40 transition-all group space-y-2"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white group-hover:text-emerald-300">Financial & Learner Analytics</h3>
            <p className="text-xs text-slate-400">Explore monthly revenue charts, completion ratios, and breakdown.</p>
          </Link>
        </div>

        {/* Top Courses Snapshot Table */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Recent Authored Programs</h2>
            <Link to="/instructor/courses" className="text-xs font-bold text-brand-400 hover:underline flex items-center gap-1">
              <span>View All Courses ({courses.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="glass-panel rounded-2xl border border-slate-800 overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                <tr>
                  <th className="p-4">Course Title</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Students</th>
                  <th className="p-4">Rating</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {courses.slice(0, 5).map((c) => (
                  <tr key={c.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="p-4 font-bold text-white max-w-xs truncate">{c.title}</td>
                    <td className="p-4">
                      <Badge variant={c.type === 'WORKSHOP' ? 'cyan' : 'blue'}>{c.type}</Badge>
                    </td>
                    <td className="p-4 font-semibold text-slate-100">${c.price}</td>
                    <td className="p-4">{c.students || 0}</td>
                    <td className="p-4">{c.rating || 0} ★</td>
                    <td className="p-4">
                      <Badge
                        variant={
                          c.status === 'PUBLISHED'
                            ? 'emerald'
                            : c.status === 'PENDING_REVIEW'
                            ? 'amber'
                            : 'gray'
                        }
                      >
                        {c.status}
                      </Badge>
                    </td>
                    <td className="p-4 text-right">
                      <div className="inline-flex items-center gap-1.5 justify-end">
                        <Link to={`/instructor/courses/${c.id}/edit`}>
                          <Button variant="ghost" size="sm" leftIcon={<FileEdit className="w-3.5 h-3.5" />}>
                            Edit
                          </Button>
                        </Link>
                        {c.status !== 'PUBLISHED' ? (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => updateStatusMutation.mutate({ id: c.id, status: 'PUBLISHED' })}
                            isLoading={updateStatusMutation.isPending && updateStatusMutation.variables?.id === c.id}
                            leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                          >
                            Publish
                          </Button>
                        ) : (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => updateStatusMutation.mutate({ id: c.id, status: 'DRAFT' })}
                            isLoading={updateStatusMutation.isPending && updateStatusMutation.variables?.id === c.id}
                          >
                            Unpublish
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};
