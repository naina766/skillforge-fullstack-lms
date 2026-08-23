import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { instructorApi } from '../../api/instructorApi';
import { Sidebar } from '../../components/layout/Sidebar';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { Rating } from '../../components/ui/Rating';
import { BookOpen, Users, DollarSign, PlusCircle, Star, BarChart2 } from 'lucide-react';

export const InstructorDashboard: React.FC = () => {
  const { data: analyticsResponse, isLoading } = useQuery({
    queryKey: ['instructor-analytics'],
    queryFn: () => instructorApi.getAnalytics(),
  });

  const analytics = analyticsResponse?.data;
  const metrics = analytics?.metrics;
  const courses = analytics?.courses || [];

  return (
    <div className="flex min-h-[calc(100vh-5rem)] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 gap-8">
      <Sidebar type="instructor" />

      <main className="flex-1 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Instructor Studio</h1>
            <p className="text-xs text-slate-400">Author programs, build curriculum modules, and monitor student metrics.</p>
          </div>
          <Link to="/instructor/courses/create">
            <Button variant="primary" leftIcon={<PlusCircle className="w-4 h-4" />}>
              Create New Course
            </Button>
          </Link>
        </div>

        {/* KPI Metrics */}
        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Skeleton className="h-24 w-full rounded-2xl" />
            <Skeleton className="h-24 w-full rounded-2xl" />
            <Skeleton className="h-24 w-full rounded-2xl" />
            <Skeleton className="h-24 w-full rounded-2xl" />
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400 font-medium">Total Authored Courses</span>
              <div className="text-2xl font-extrabold text-white">{metrics?.totalCourses || 0}</div>
            </div>
            <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400 font-medium">Total Students</span>
              <div className="text-2xl font-extrabold text-white">{metrics?.totalStudents || 0}</div>
            </div>
            <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400 font-medium">Avg Rating</span>
              <div className="text-2xl font-extrabold text-white">{metrics?.averageRating || 0} ★</div>
            </div>
            <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400 font-medium">Total Earnings</span>
              <div className="text-2xl font-extrabold text-emerald-400">${metrics?.totalRevenue || 0}</div>
            </div>
          </div>
        )}

        {/* Authored Courses Table */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white">Your Courses</h2>
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
              <tbody className="divide-y divide-slate-800/60">
                {courses.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-900/40">
                    <td className="p-4 font-bold text-white max-w-xs truncate">{c.title}</td>
                    <td className="p-4">
                      <Badge variant={c.type === 'WORKSHOP' ? 'cyan' : 'blue'}>{c.type}</Badge>
                    </td>
                    <td className="p-4 font-semibold text-slate-100">${c.price}</td>
                    <td className="p-4">{c.students}</td>
                    <td className="p-4">{c.rating} ★</td>
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
                    <td className="p-4 text-right space-x-2">
                      <Link to={`/instructor/courses/${c.id}/edit`}>
                        <Button variant="ghost" size="sm">
                          Edit
                        </Button>
                      </Link>
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
