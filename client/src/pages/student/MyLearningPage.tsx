import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { enrollmentApi } from '../../api/enrollmentApi';
import { Sidebar } from '../../components/layout/Sidebar';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import {
  PlayCircle,
  Award,
  BookOpen,
  GraduationCap,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Compass,
  Clock,
} from 'lucide-react';

export const MyLearningPage: React.FC = () => {
  const [filterTab, setFilterTab] = useState<'all' | 'active' | 'completed'>('all');

  const { data: enrollmentsData, isLoading } = useQuery({
    queryKey: ['my-enrollments'],
    queryFn: () => enrollmentApi.getUserEnrollments(),
  });

  const enrollments = enrollmentsData?.data || [];

  const allCount = enrollments.length;
  const activeCount = enrollments.filter((e) => e.status === 'ACTIVE').length;
  const completedCount = enrollments.filter((e) => e.status === 'COMPLETED').length;

  const filteredEnrollments = enrollments.filter((e) => {
    if (filterTab === 'active') return e.status === 'ACTIVE';
    if (filterTab === 'completed') return e.status === 'COMPLETED';
    return true;
  });

  return (
    <div className="flex min-h-[calc(100vh-5rem)] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 gap-8 w-full">
      <Sidebar type="student" />

      <main className="flex-1 min-w-0 space-y-6">
        {/* Header and Filter Tab Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <GraduationCap className="w-6 h-6 text-brand-400" />
              <h1 className="text-2xl font-bold text-white tracking-tight">My Learning</h1>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Access your active courses, continue video lessons, and download earned certificates.
            </p>
          </div>

          {/* Enhanced Tab Navigation with Badges */}
          <div className="flex bg-slate-900/90 border border-slate-800 p-1.5 rounded-2xl text-xs font-semibold gap-1 shrink-0">
            <button
              onClick={() => setFilterTab('all')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl transition-all ${
                filterTab === 'all'
                  ? 'bg-brand-600 text-white shadow-glow-blue font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <span>All</span>
              <span
                className={`px-1.5 py-0.5 text-[10px] rounded-full font-bold ${
                  filterTab === 'all' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {allCount}
              </span>
            </button>

            <button
              onClick={() => setFilterTab('active')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl transition-all ${
                filterTab === 'active'
                  ? 'bg-brand-600 text-white shadow-glow-blue font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <span>In Progress</span>
              <span
                className={`px-1.5 py-0.5 text-[10px] rounded-full font-bold ${
                  filterTab === 'active' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {activeCount}
              </span>
            </button>

            <button
              onClick={() => setFilterTab('completed')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl transition-all ${
                filterTab === 'completed'
                  ? 'bg-brand-600 text-white shadow-glow-blue font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <span>Completed</span>
              <span
                className={`px-1.5 py-0.5 text-[10px] rounded-full font-bold ${
                  filterTab === 'completed' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {completedCount}
              </span>
            </button>
          </div>
        </div>

        {/* Loading Skeletons */}
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full rounded-2xl" />
            <Skeleton className="h-32 w-full rounded-2xl" />
          </div>
        ) : filteredEnrollments.length === 0 ? (
          /* Enhanced Empty State Card */
          <div className="glass-panel p-8 sm:p-14 text-center rounded-3xl border-2 border-dashed border-slate-700/80 hover:border-brand-500/40 bg-gradient-to-b from-slate-900/90 via-dark-900/70 to-brand-950/20 max-w-xl mx-auto my-8 shadow-2xl relative overflow-hidden transition-all">
            {/* Background Ambient Glow */}
            <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Concentric Icon Badge */}
            <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-tr from-brand-600/20 via-cyan-500/20 to-purple-500/20 border border-brand-500/30 flex items-center justify-center mx-auto mb-6 shadow-glow-blue">
              <Compass className="w-10 h-10 text-brand-400" />
            </div>

            {/* Typography */}
            <div className="space-y-2 mb-6">
              <h3 className="text-xl font-extrabold text-white tracking-tight">
                {filterTab === 'completed'
                  ? 'No Completed Courses Yet'
                  : filterTab === 'active'
                  ? 'No Courses In Progress'
                  : 'Your Learning Journey Awaits'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                {filterTab === 'completed'
                  ? 'Finish all curriculum lessons and modules in your active courses to unlock official verified certificates.'
                  : filterTab === 'active'
                  ? 'You do not have any ongoing courses. Choose from our catalog or let AI recommend a learning track.'
                  : 'You are not enrolled in any courses yet. Expand your skillset with hands-on curriculums, video lessons, and verified certifications.'}
              </p>
            </div>

            {/* Value Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 max-w-md mx-auto mb-8 text-[11px] text-slate-300">
              <div className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-900/80 border border-slate-800 justify-center">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Hands-on Labs</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-900/80 border border-slate-800 justify-center">
                <Award className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Certificates</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-900/80 border border-slate-800 justify-center">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>AI Mentor</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to="/courses">
                <Button variant="primary" size="md" className="w-full sm:w-auto shadow-glow-blue" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Explore Course Catalog
                </Button>
              </Link>
              <Link to="/ai-mentor">
                <Button variant="secondary" size="md" className="w-full sm:w-auto" leftIcon={<Sparkles className="w-4 h-4 text-cyan-400" />}>
                  Ask AI Mentor
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          /* Enrolled Course Cards List */
          <div className="space-y-4">
            {filteredEnrollments.map((item) => (
              <div
                key={item._id}
                className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-xl bg-slate-900 overflow-hidden shrink-0 border border-slate-800">
                    <img src={item.course.thumbnail} alt={item.course.title} className="w-full h-full object-cover" />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Badge variant={item.course.type === 'WORKSHOP' ? 'cyan' : item.course.type === 'BOOTCAMP' ? 'purple' : 'blue'}>
                        {item.course.type}
                      </Badge>
                      <span className="text-xs text-slate-400 font-medium">{item.course.category?.name}</span>
                    </div>
                    <h3 className="text-base font-bold text-white">{item.course.title}</h3>
                    <p className="text-xs text-slate-400">Instructor: {item.course.instructor?.name || 'Expert Instructor'}</p>
                  </div>
                </div>

                {/* Progress Bar & Action */}
                <div className="w-full md:w-64 space-y-3 shrink-0">
                  <ProgressBar progress={item.completionPercentage} />

                  {item.status === 'COMPLETED' ? (
                    <Link to="/dashboard/certificates" className="block">
                      <Button variant="outline" size="sm" className="w-full" leftIcon={<Award className="w-4 h-4 text-amber-400" />}>
                        View Certificate
                      </Button>
                    </Link>
                  ) : (
                    <Link to={`/learn/${item.course._id}`} className="block">
                      <Button variant="primary" size="sm" className="w-full shadow-glow-blue" leftIcon={<PlayCircle className="w-4 h-4" />}>
                        Continue Learning
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            ))}

            {/* Bottom Explore More Courses Banner */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-800/80 bg-gradient-to-r from-slate-900/90 via-dark-900 to-brand-950/30 flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
              <div className="space-y-1 text-center sm:text-left">
                <h4 className="text-sm font-bold text-white">Looking to acquire new skills?</h4>
                <p className="text-xs text-slate-400">Discover expert-led workshops, advanced bootcamps, and career certifications.</p>
              </div>
              <Link to="/courses" className="shrink-0">
                <Button variant="secondary" size="sm" leftIcon={<BookOpen className="w-4 h-4 text-brand-400" />}>
                  Explore More Courses
                </Button>
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
