import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { courseApi } from '../../api/courseApi';
import { Sidebar } from '../../components/layout/Sidebar';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { useUIStore } from '../../store/useUIStore';
import { Course } from '../../types';
import {
  BookOpen,
  Search,
  CheckCircle2,
  FileEdit,
  Archive,
  ExternalLink,
  Users,
  Star,
  Layers,
} from 'lucide-react';

export const AdminCoursesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { addToast } = useUIStore();
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [search, setSearch] = useState('');

  const { data: coursesResponse, isLoading } = useQuery({
    queryKey: ['admin-courses', { statusFilter, search }],
    queryFn: () =>
      courseApi.getCourses({
        status: statusFilter || undefined,
        search: search || undefined,
        limit: 50,
      }),
  });

  const courses: Course[] = coursesResponse?.data?.items || [];

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      courseApi.updateCourseStatus(id, status),
    onSuccess: (_, vars) => {
      addToast('success', `Course status updated to ${vars.status}.`);
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
      queryClient.invalidateQueries({ queryKey: ['instructor-analytics'] });
    },
    onError: (err: any) => {
      addToast('error', err.response?.data?.message || 'Failed to update course status.');
    },
  });

  const handleStatusChange = (courseId: string, newStatus: string) => {
    updateStatusMutation.mutate({ id: courseId, status: newStatus });
  };

  return (
    <div className="flex min-h-[calc(100vh-5rem)] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 gap-8 w-full">
      <Sidebar type="admin" />

      <main className="flex-1 min-w-0 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-brand-400" />
              <h1 className="text-2xl font-bold text-white">Course Approval & Moderation</h1>
            </div>
            <p className="text-xs text-slate-400">Review, approve drafts, publish live courses, or archive programs.</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search courses..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-xl pl-8 pr-3 py-2 w-48 focus:outline-none focus:border-brand-500"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-brand-500"
            >
              <option value="">All Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="PENDING_REVIEW">Pending Review</option>
              <option value="PUBLISHED">Published</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
        </div>

        {/* Courses Table */}
        {isLoading ? (
          <Skeleton className="h-64 w-full rounded-2xl" />
        ) : courses.length === 0 ? (
          <div className="glass-panel p-12 text-center rounded-2xl border border-slate-800 space-y-3">
            <Layers className="w-10 h-10 text-slate-500 mx-auto" />
            <h3 className="text-sm font-bold text-white">No Courses Found</h3>
            <p className="text-xs text-slate-400">No courses match the current search or status filter.</p>
          </div>
        ) : (
          <div className="glass-panel rounded-2xl border border-slate-800 overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                <tr>
                  <th className="p-4">Course</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Instructor</th>
                  <th className="p-4">Tuition</th>
                  <th className="p-4">Enrolled</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {courses.map((course) => (
                  <tr key={course._id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="p-4 max-w-xs">
                      <div className="flex items-center gap-3">
                        <img
                          src={course.thumbnail || 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=80'}
                          alt={course.title}
                          className="w-10 h-10 rounded-lg object-cover bg-slate-900 shrink-0 border border-slate-800"
                        />
                        <div className="truncate">
                          <Link
                            to={`/courses/${course.slug}`}
                            target="_blank"
                            className="font-bold text-white hover:text-brand-400 transition-colors flex items-center gap-1"
                          >
                            <span className="truncate">{course.title}</span>
                            <ExternalLink className="w-3 h-3 text-slate-500 shrink-0" />
                          </Link>
                          <span className="text-[10px] text-slate-400 block truncate">
                            {course.category?.name || 'General'} • {course.level}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge variant={course.type === 'WORKSHOP' ? 'cyan' : course.type === 'BOOTCAMP' ? 'purple' : 'blue'}>
                        {course.type}
                      </Badge>
                    </td>
                    <td className="p-4 text-slate-300">
                      {course.instructor?.name || 'Unknown Instructor'}
                    </td>
                    <td className="p-4 font-bold text-slate-100">
                      {course.price === 0 ? <span className="text-emerald-400">Free</span> : `$${course.price}`}
                    </td>
                    <td className="p-4 text-slate-400">
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3 text-slate-500" />
                        <span>{course.enrollmentCount || 0}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge
                        variant={
                          course.status === 'PUBLISHED'
                            ? 'emerald'
                            : course.status === 'PENDING_REVIEW'
                            ? 'amber'
                            : course.status === 'ARCHIVED'
                            ? 'rose'
                            : 'gray'
                        }
                      >
                        {course.status}
                      </Badge>
                    </td>
                    <td className="p-4 text-right">
                      <div className="inline-flex items-center gap-1.5 justify-end">
                        {course.status !== 'PUBLISHED' && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleStatusChange(course._id, 'PUBLISHED')}
                            isLoading={updateStatusMutation.isPending && updateStatusMutation.variables?.id === course._id}
                            leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                          >
                            Publish
                          </Button>
                        )}
                        {course.status === 'PUBLISHED' && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleStatusChange(course._id, 'DRAFT')}
                            isLoading={updateStatusMutation.isPending && updateStatusMutation.variables?.id === course._id}
                            leftIcon={<FileEdit className="w-3.5 h-3.5" />}
                          >
                            Unpublish
                          </Button>
                        )}
                        {course.status !== 'ARCHIVED' && (
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleStatusChange(course._id, 'ARCHIVED')}
                            isLoading={updateStatusMutation.isPending && updateStatusMutation.variables?.id === course._id}
                            leftIcon={<Archive className="w-3.5 h-3.5" />}
                          >
                            Archive
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
};
