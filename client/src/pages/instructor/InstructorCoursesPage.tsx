import React, { useState } from 'react';
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
  PlusCircle,
  Search,
  CheckCircle2,
  FileEdit,
  ExternalLink,
  Users,
  Star,
  Layers,
  ArrowRight,
  SlidersHorizontal,
  Sparkles,
  Zap,
} from 'lucide-react';

export const InstructorCoursesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { addToast } = useUIStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);

  const { data: analyticsResponse, isLoading } = useQuery({
    queryKey: ['instructor-analytics'],
    queryFn: () => instructorApi.getAnalytics(),
  });

  const courses = analyticsResponse?.data?.courses || [];

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      courseApi.updateCourseStatus(id, status),
    onSuccess: (_, vars) => {
      addToast('success', `Course status updated to ${vars.status}.`);
      queryClient.invalidateQueries({ queryKey: ['instructor-analytics'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['instructor-courses'] });
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
      queryClient.invalidateQueries({ queryKey: ['course', vars.id] });
    },
    onError: (err: any) => {
      addToast('error', err.response?.data?.message || 'Failed to update course status.');
    },
  });

  const filteredCourses = courses.filter((c: any) => {
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !statusFilter || c.status === statusFilter;
    const matchesType = !typeFilter || c.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedCourseIds(filteredCourses.map((c: any) => c.id));
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
      addToast('success', `Successfully updated ${selectedCourseIds.length} authored courses to ${newStatus}.`);
      setSelectedCourseIds([]);
      queryClient.invalidateQueries({ queryKey: ['instructor-analytics'] });
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
    } catch (err: any) {
      addToast('error', err.response?.data?.message || 'Bulk status update encountered an error.');
    } finally {
      setIsBulkProcessing(false);
    }
  };

  const isAllSelected = filteredCourses.length > 0 && selectedCourseIds.length === filteredCourses.length;
  const isPartiallySelected = selectedCourseIds.length > 0 && selectedCourseIds.length < filteredCourses.length;

  return (
    <div className="flex min-h-[calc(100vh-5rem)] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 gap-8 w-full">
      <Sidebar type="instructor" />

      <main className="flex-1 min-w-0 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-brand-400" />
              <h1 className="text-2xl font-bold text-white tracking-tight">My Authored Courses</h1>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Manage, edit curriculum modules, publish live, and monitor enrollment metrics across your catalog.
            </p>
          </div>

          <Link to="/instructor/courses/create">
            <Button
              variant="primary"
              size="md"
              className="shadow-glow-blue hover:brightness-110 transition-all"
              leftIcon={<PlusCircle className="w-4 h-4" />}
            >
              Create New Course
            </Button>
          </Link>
        </div>

        {/* Enclosed Filter & Search Toolbar */}
        <div className="glass-panel p-4 rounded-2xl border border-slate-800/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search your courses by title or topic..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900/90 border border-slate-800 hover:border-brand-500/40 focus:border-brand-500 text-slate-200 text-xs rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all placeholder:text-slate-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-900/90 border border-slate-800 hover:border-brand-500/40 focus:border-brand-500 text-slate-200 text-xs rounded-xl px-3.5 py-2.5 focus:outline-none transition-all cursor-pointer appearance-none pr-8 font-medium"
              >
                <option value="">All Statuses</option>
                <option value="PUBLISHED">Published</option>
                <option value="DRAFT">Draft</option>
                <option value="PENDING_REVIEW">Pending Review</option>
                <option value="ARCHIVED">Archived</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-400 text-[10px]">
                ▼
              </div>
            </div>

            <div className="relative">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-slate-900/90 border border-slate-800 hover:border-brand-500/40 focus:border-brand-500 text-slate-200 text-xs rounded-xl px-3.5 py-2.5 focus:outline-none transition-all cursor-pointer appearance-none pr-8 font-medium"
              >
                <option value="">All Formats</option>
                <option value="COURSE">Courses</option>
                <option value="WORKSHOP">Workshops</option>
                <option value="BOOTCAMP">Bootcamps</option>
                <option value="WEBINAR">Webinars</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-400 text-[10px]">
                ▼
              </div>
            </div>

            {(search || statusFilter || typeFilter) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearch('');
                  setStatusFilter('');
                  setTypeFilter('');
                }}
              >
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Bulk Actions Floating Bar */}
        {selectedCourseIds.length > 0 && (
          <div className="glass-panel p-3.5 rounded-2xl border border-brand-500/40 bg-slate-900/95 flex flex-wrap items-center justify-between gap-3 shadow-glow-blue animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white px-2.5 py-1 rounded-lg bg-brand-500/20 text-brand-300 border border-brand-500/30">
                {selectedCourseIds.length} selected
              </span>
              <span className="text-xs text-slate-300">Choose a bulk course action:</span>
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

        {/* Courses Table / Enhanced Empty State */}
        {isLoading ? (
          <Skeleton className="h-64 w-full rounded-2xl" />
        ) : filteredCourses.length === 0 ? (
          /* Enhanced Empty State Card */
          <div className="glass-panel p-8 sm:p-14 text-center rounded-3xl border-2 border-dashed border-slate-700/80 hover:border-brand-500/40 bg-gradient-to-b from-slate-900/90 via-dark-900/70 to-brand-950/20 max-w-xl mx-auto my-8 shadow-2xl relative overflow-hidden transition-all">
            {/* Ambient Background Glow */}
            <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Concentric Icon Badge */}
            <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-tr from-brand-600/20 via-cyan-500/20 to-purple-500/20 border border-brand-500/30 flex items-center justify-center mx-auto mb-6 shadow-glow-blue">
              <Layers className="w-10 h-10 text-brand-400" />
            </div>

            {/* Typography */}
            <div className="space-y-2 mb-6">
              <h3 className="text-xl font-extrabold text-white tracking-tight">
                {search || statusFilter || typeFilter ? 'No Matching Courses Found' : 'No Authored Courses Yet'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                {search || statusFilter || typeFilter
                  ? 'No courses match your current search query or filter criteria. Try resetting the filters.'
                  : 'Start sharing your knowledge! Create multi-module curriculums, host live workshops, and monetize your technical expertise.'}
              </p>
            </div>

            {/* Value Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 max-w-md mx-auto mb-8 text-[11px] text-slate-300">
              <div className="flex items-center gap-1.5 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 justify-center">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Multi-Module Labs</span>
              </div>
              <div className="flex items-center gap-1.5 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 justify-center">
                <Zap className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>Live Workshops</span>
              </div>
              <div className="flex items-center gap-1.5 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 justify-center">
                <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span>Direct Tuition</span>
              </div>
            </div>

            {/* Action Button */}
            <div className="flex items-center justify-center gap-3">
              <Link to="/instructor/courses/create">
                <Button
                  variant="primary"
                  size="md"
                  className="shadow-glow-blue hover:brightness-110 transition-all"
                  leftIcon={<PlusCircle className="w-4 h-4" />}
                >
                  Create Your First Course
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="glass-panel rounded-2xl border border-slate-800 overflow-x-auto shadow-xl">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
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
                  <th className="p-4">Course Program</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Tuition</th>
                  <th className="p-4">Enrolled Learners</th>
                  <th className="p-4">Rating</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {filteredCourses.map((c: any) => {
                  const isSelected = selectedCourseIds.includes(c.id);
                  return (
                    <tr
                      key={c.id}
                      className={`transition-colors ${
                        isSelected ? 'bg-brand-500/10 hover:bg-brand-500/15' : 'hover:bg-slate-900/50'
                      }`}
                    >
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectOne(c.id)}
                          className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-brand-600 focus:ring-brand-500 focus:ring-offset-slate-900 cursor-pointer"
                        />
                      </td>
                      <td className="p-4 max-w-xs">
                        <div className="flex items-center gap-3">
                          <img
                            src={c.thumbnail || 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=80'}
                            alt={c.title}
                            className="w-11 h-11 rounded-xl object-cover bg-slate-900 shrink-0 border border-slate-800"
                          />
                          <div className="truncate">
                            <Link
                              to={`/courses/${c.slug}`}
                              target="_blank"
                              className="font-bold text-white hover:text-brand-300 transition-colors flex items-center gap-1"
                            >
                              <span className="truncate">{c.title}</span>
                              <ExternalLink className="w-3 h-3 text-slate-500 shrink-0" />
                            </Link>
                            <span className="text-[10px] text-slate-400 font-mono">ID: {c.id.slice(-6)}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant={c.type === 'WORKSHOP' ? 'cyan' : c.type === 'BOOTCAMP' ? 'purple' : 'blue'}>
                          {c.type}
                        </Badge>
                      </td>
                      <td className="p-4 font-bold text-slate-100">
                        {c.price === 0 ? <span className="text-emerald-400 font-extrabold">Free</span> : `$${c.price}`}
                      </td>
                      <td className="p-4 text-slate-300">
                        <div className="flex items-center gap-1 font-medium">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          <span>{c.students || 0}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1 text-amber-400 font-bold">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>{c.rating || 0}</span>
                          <span className="text-[10px] text-slate-500 font-normal">({c.reviewCount || 0})</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge
                          variant={
                            c.status === 'PUBLISHED'
                              ? 'emerald'
                              : c.status === 'PENDING_REVIEW'
                              ? 'amber'
                              : c.status === 'ARCHIVED'
                              ? 'rose'
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
