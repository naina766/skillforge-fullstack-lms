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
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);

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

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedCourseIds(courses.map((c) => c._id));
    } else {
      setSelectedCourseIds([]);
    }
  };

  const handleSelectOne = (courseId: string) => {
    setSelectedCourseIds((prev) =>
      prev.includes(courseId) ? prev.filter((id) => id !== courseId) : [...prev, courseId]
    );
  };

  const handleBulkStatusChange = async (newStatus: string) => {
    if (selectedCourseIds.length === 0) return;
    setIsBulkProcessing(true);
    try {
      await Promise.all(
        selectedCourseIds.map((id) => courseApi.updateCourseStatus(id, newStatus))
      );
      addToast('success', `Successfully updated ${selectedCourseIds.length} courses to ${newStatus}.`);
      setSelectedCourseIds([]);
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
      queryClient.invalidateQueries({ queryKey: ['instructor-analytics'] });
    } catch (err: any) {
      addToast('error', err.response?.data?.message || 'Bulk status update encountered an error.');
    } finally {
      setIsBulkProcessing(false);
    }
  };

  const isAllSelected = courses.length > 0 && selectedCourseIds.length === courses.length;
  const isPartiallySelected = selectedCourseIds.length > 0 && selectedCourseIds.length < courses.length;

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

        {/* Bulk Actions Floating Bar */}
        {selectedCourseIds.length > 0 && (
          <div className="glass-panel p-3.5 rounded-2xl border border-brand-500/40 bg-slate-900/95 flex flex-wrap items-center justify-between gap-3 shadow-glow-blue animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white px-2.5 py-1 rounded-lg bg-brand-500/20 text-brand-300 border border-brand-500/30">
                {selectedCourseIds.length} selected
              </span>
              <span className="text-xs text-slate-300">Choose a bulk moderation action:</span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleBulkStatusChange('PUBLISHED')}
                isLoading={isBulkProcessing}
                leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
              >
                Publish All
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleBulkStatusChange('DRAFT')}
                isLoading={isBulkProcessing}
                leftIcon={<FileEdit className="w-3.5 h-3.5" />}
              >
                Set to Draft
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleBulkStatusChange('ARCHIVED')}
                isLoading={isBulkProcessing}
                leftIcon={<Archive className="w-3.5 h-3.5" />}
              >
                Archive All
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedCourseIds([])}
                disabled={isBulkProcessing}
              >
                Clear
              </Button>
            </div>
          </div>
        )}

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
          <div className="glass-panel rounded-2xl border border-slate-800 overflow-x-auto shadow-xl">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                <tr>
                  <th className="p-4 w-10">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = isPartiallySelected;
                      }}
                      onChange={handleSelectAll}
                      className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-brand-600 focus:ring-brand-500 focus:ring-offset-slate-900 cursor-pointer"
                    />
                  </th>
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
                {courses.map((course) => {
                  const isSelected = selectedCourseIds.includes(course._id);
                  return (
                    <tr
                      key={course._id}
                      className={`transition-colors ${
                        isSelected ? 'bg-brand-500/10 hover:bg-brand-500/15' : 'hover:bg-slate-900/40'
                      }`}
                    >
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectOne(course._id)}
                          className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-brand-600 focus:ring-brand-500 focus:ring-offset-slate-900 cursor-pointer"
                        />
                      </td>
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
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
};
