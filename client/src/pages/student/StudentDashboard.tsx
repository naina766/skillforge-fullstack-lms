import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { enrollmentApi } from '../../api/enrollmentApi';
import { certificateApi } from '../../api/certificateApi';
import { aiApi } from '../../api/aiApi';
import { useAuthStore } from '../../store/useAuthStore';
import { Sidebar } from '../../components/layout/Sidebar';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { CourseCard } from '../../components/course/CourseCard';
import { Skeleton } from '../../components/ui/Skeleton';
import { Button } from '../../components/ui/Button';
import { BookOpen, Award, Sparkles, PlayCircle, Clock, CheckCircle } from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuthStore();

  const { data: enrollmentsData, isLoading: isEnrollmentsLoading } = useQuery({
    queryKey: ['my-enrollments'],
    queryFn: () => enrollmentApi.getUserEnrollments(),
  });

  const { data: certificatesData } = useQuery({
    queryKey: ['my-certificates'],
    queryFn: () => certificateApi.getUserCertificates(),
  });

  const { data: recommendedData } = useQuery({
    queryKey: ['ai-recommendations'],
    queryFn: () => aiApi.getRecommendations(),
  });

  const enrollments = enrollmentsData?.data || [];
  const certificates = certificatesData?.data || [];
  const recommendedCourses = recommendedData?.data || [];

  const completedCount = enrollments.filter((e) => e.status === 'COMPLETED').length;
  const activeEnrollments = enrollments.filter((e) => e.status === 'ACTIVE');
  const continueCourse = activeEnrollments[0] || enrollments[0];

  return (
    <div className="flex min-h-[calc(100vh-5rem)] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 gap-8">
      <Sidebar type="student" />

      <main className="flex-1 space-y-8 overflow-hidden">
        {/* Welcome Banner */}
        <div className="glass-panel p-8 rounded-3xl border border-slate-800 bg-gradient-to-r from-brand-950/60 via-dark-900 to-purple-950/40 relative overflow-hidden">
          <div className="relative z-10 space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Welcome back, {user?.name}! 👋
            </h1>
            <p className="text-sm text-slate-300 max-w-xl">
              Track your course progression, resume video lessons, and earn verifiable certificates.
            </p>
          </div>
        </div>

        {/* Overview Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Enrolled Courses</span>
              <BookOpen className="w-4 h-4 text-brand-400" />
            </div>
            <div className="text-2xl font-extrabold text-white">{enrollments.length}</div>
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Completed</span>
              <CheckCircle className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-extrabold text-white">{completedCount}</div>
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Learning Hours</span>
              <Clock className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-extrabold text-white">
              {Math.round(enrollments.reduce((acc, e) => acc + (e.course?.duration || 0), 0) / 60)} hrs
            </div>
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Certificates</span>
              <Award className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-extrabold text-white">{certificates.length}</div>
          </div>
        </div>

        {/* Continue Learning Banner */}
        {continueCourse && (
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-brand-400 uppercase tracking-wider">Continue Learning</span>
              <Link to={`/learn/${continueCourse.course._id}`}>
                <Button size="sm" leftIcon={<PlayCircle className="w-4 h-4" />}>
                  Resume Lesson
                </Button>
              </Link>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-slate-900 overflow-hidden shrink-0">
                <img src={continueCourse.course.thumbnail} alt={continueCourse.course.title} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 space-y-2">
                <h3 className="text-base font-bold text-white leading-snug">{continueCourse.course.title}</h3>
                <ProgressBar progress={continueCourse.completionPercentage} />
              </div>
            </div>
          </div>
        )}

        {/* Recommended Courses AI Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <h2 className="text-lg font-bold text-white">Recommended For You</h2>
            </div>
            <Link to="/ai-mentor" className="text-xs text-cyan-400 font-semibold hover:underline">
              Ask AI Mentor →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendedCourses.slice(0, 3).map((course) => (
              <CourseCard key={course._id} course={course} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};
