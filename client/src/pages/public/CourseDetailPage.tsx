import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { courseApi } from '../../api/courseApi';
import { enrollmentApi } from '../../api/enrollmentApi';
import { reviewApi } from '../../api/reviewApi';
import { useAuthStore } from '../../store/useAuthStore';
import { useUIStore } from '../../store/useUIStore';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Rating } from '../../components/ui/Rating';
import { Skeleton } from '../../components/ui/Skeleton';
import {
  Clock,
  Users,
  CheckCircle2,
  Calendar,
  ChevronDown,
  ChevronUp,
  Bookmark,
  PlayCircle,
  Award,
  Sparkles,
} from 'lucide-react';

export const CourseDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthStore();
  const { addToast } = useUIStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'curriculum' | 'reviews'>('overview');
  const [expandedModules, setExpandedModules] = useState<Record<number, boolean>>({ 0: true });

  // Fetch course details
  const { data: courseResponse, isLoading } = useQuery({
    queryKey: ['course', slug],
    queryFn: () => courseApi.getCourseBySlug(slug!),
    enabled: !!slug,
  });

  const course = courseResponse?.data;

  // Check enrollment status
  const { data: enrollmentResponse } = useQuery({
    queryKey: ['enrollment-check', course?._id],
    queryFn: () => enrollmentApi.getEnrollmentByCourse(course!._id),
    enabled: isAuthenticated && !!course?._id,
  });

  const enrollment = enrollmentResponse?.data;

  // Fetch reviews
  const { data: reviewsResponse } = useQuery({
    queryKey: ['reviews', course?._id],
    queryFn: () => reviewApi.getCourseReviews(course!._id),
    enabled: !!course?._id,
  });

  const reviews = reviewsResponse?.data || [];

  // Enroll mutation
  const enrollMutation = useMutation({
    mutationFn: (courseId: string) => enrollmentApi.enroll(courseId),
    onSuccess: (res) => {
      addToast('success', 'Enrolled successfully! Redirecting to learning player...');
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
      navigate(`/learn/${res.data.course}`);
    },
    onError: (err: any) => {
      addToast('error', err.response?.data?.message || 'Failed to enroll in course.');
    },
  });

  const handleEnrollClick = () => {
    if (!isAuthenticated) {
      addToast('info', 'Please log in or register to enroll.');
      navigate('/login');
      return;
    }
    if (course?._id) {
      enrollMutation.mutate(course._id);
    }
  };

  const toggleModule = (idx: number) => {
    setExpandedModules((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  if (isLoading || !course) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <Skeleton className="h-64 w-full rounded-3xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-32 w-full" />
          </div>
          <Skeleton className="h-80 w-full" />
        </div>
      </div>
    );
  }

  const isWorkshop = course.type === 'WORKSHOP';

  return (
    <div className="space-y-12 pb-20">
      {/* Top Banner Header */}
      <section className="bg-gradient-to-b from-dark-900 via-dark-950 to-dark-950 border-b border-slate-800/80 pt-10 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
            {/* Left Content */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant={isWorkshop ? 'cyan' : 'blue'}>{course.type}</Badge>
                <Badge variant="purple">{course.category?.name}</Badge>
                <span className="text-xs text-slate-400 font-medium">Level: {course.level}</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight">
                {course.title}
              </h1>

              <p className="text-slate-300 text-base sm:text-lg leading-relaxed">{course.shortDescription}</p>

              {/* Author & Rating */}
              <div className="flex flex-wrap items-center gap-6 text-sm text-slate-300 pt-2 border-t border-slate-800/80">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-brand-600 flex items-center justify-center font-bold text-white">
                    {course.instructor?.name?.charAt(0) || 'I'}
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block">Created by</span>
                    <span className="font-semibold text-white">{course.instructor?.name}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Rating value={course.rating} count={course.reviewCount} size="md" />
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Users className="w-4 h-4 text-slate-400" />
                  <span>{course.enrollmentCount} students</span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>{Math.round(course.duration / 60)} hours total</span>
                </div>
              </div>
            </div>

            {/* Right Sticky Pricing & CTA Card */}
            <div className="lg:col-span-1 glass-panel p-6 rounded-3xl border border-slate-800 shadow-2xl space-y-6 sticky top-28">
              <div className="relative h-48 w-full rounded-2xl bg-slate-900 overflow-hidden">
                {course.thumbnail ? (
                  <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-900 text-slate-600">
                    <Sparkles className="w-12 h-12" />
                  </div>
                )}
              </div>

              <div className="flex items-baseline justify-between">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-white">
                    {course.price === 0 ? 'Free' : `$${course.price}`}
                  </span>
                  {course.discountedPrice && course.discountedPrice < course.price && (
                    <span className="text-sm text-slate-500 line-through">${course.discountedPrice}</span>
                  )}
                </div>
                {isWorkshop && course.capacity && (
                  <span className="text-xs text-cyan-400 font-semibold bg-cyan-500/10 px-2.5 py-1 rounded-md border border-cyan-500/20">
                    {course.capacity - course.enrollmentCount} seats left
                  </span>
                )}
              </div>

              {/* Enrollment CTA */}
              {enrollment ? (
                <Link to={`/learn/${course._id}`} className="block">
                  <Button variant="primary" size="lg" className="w-full" leftIcon={<PlayCircle className="w-5 h-5" />}>
                    Continue Learning
                  </Button>
                </Link>
              ) : (
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full"
                  isLoading={enrollMutation.isPending}
                  onClick={handleEnrollClick}
                >
                  Enroll Now
                </Button>
              )}

              {/* Guarantee points */}
              <div className="space-y-2 pt-2 text-xs text-slate-400 border-t border-slate-800">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Full lifetime access to all learning materials</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Shareable certificate of completion included</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Tabs Details */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-8">
            {/* Tabs Header */}
            <div className="flex border-b border-slate-800 space-x-8 text-sm font-semibold">
              <button
                onClick={() => setActiveTab('overview')}
                className={`pb-3 transition-colors ${
                  activeTab === 'overview' ? 'border-b-2 border-brand-500 text-brand-400' : 'text-slate-400 hover:text-white'
                }`}
              >
                Course Overview
              </button>
              <button
                onClick={() => setActiveTab('curriculum')}
                className={`pb-3 transition-colors ${
                  activeTab === 'curriculum' ? 'border-b-2 border-brand-500 text-brand-400' : 'text-slate-400 hover:text-white'
                }`}
              >
                Curriculum ({course.curriculum?.reduce((acc, m) => acc + m.lessons.length, 0) || 0} Lessons)
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`pb-3 transition-colors ${
                  activeTab === 'reviews' ? 'border-b-2 border-brand-500 text-brand-400' : 'text-slate-400 hover:text-white'
                }`}
              >
                Student Reviews ({reviews.length})
              </button>
            </div>

            {/* Tab: Overview */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Learning Outcomes */}
                {course.learningOutcomes && course.learningOutcomes.length > 0 && (
                  <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
                    <h3 className="text-lg font-bold text-white">What You Will Learn</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {course.learningOutcomes.map((outcome, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                          <CheckCircle2 className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
                          <span>{outcome}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Full Description */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-white">About This Course</h3>
                  <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                    {course.description}
                  </div>
                </div>

                {/* Skills Covered */}
                {course.skills && course.skills.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Skills You Will Master</h3>
                    <div className="flex flex-wrap gap-2">
                      {course.skills.map((skill, idx) => (
                        <Badge key={idx} variant="cyan" size="md">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab: Curriculum */}
            {activeTab === 'curriculum' && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white mb-2">Curriculum Breakdown</h3>
                {course.curriculum?.map((module, mIdx) => (
                  <div key={mIdx} className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
                    <button
                      onClick={() => toggleModule(mIdx)}
                      className="w-full flex items-center justify-between p-4 bg-slate-900/60 hover:bg-slate-900 transition-colors text-left"
                    >
                      <span className="font-bold text-slate-200 text-sm">{module.title}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-400">{module.lessons.length} lessons</span>
                        {expandedModules[mIdx] ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                      </div>
                    </button>

                    {expandedModules[mIdx] && (
                      <div className="divide-y divide-slate-800/60 bg-dark-950/40">
                        {module.lessons.map((lesson, lIdx) => (
                          <div key={lIdx} className="p-3.5 flex items-center justify-between text-xs text-slate-300 pl-6">
                            <div className="flex items-center gap-3">
                              <PlayCircle className="w-4 h-4 text-brand-400 shrink-0" />
                              <span>{lesson.title}</span>
                              {lesson.isPreview && <Badge variant="emerald" size="sm">Preview</Badge>}
                            </div>
                            <span className="text-slate-500 font-mono">{Math.round(lesson.duration / 60)} min</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Tab: Reviews */}
            {activeTab === 'reviews' && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-white">Student Feedback</h3>
                {reviews.length === 0 ? (
                  <p className="text-sm text-slate-400">No reviews submitted yet for this course.</p>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((rev) => (
                      <div key={rev._id} className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-brand-600 flex items-center justify-center font-bold text-white text-xs">
                              {rev.student?.name?.charAt(0) || 'U'}
                            </div>
                            <span className="text-xs font-bold text-slate-200">{rev.student?.name}</span>
                          </div>
                          <Rating value={rev.rating} showValue={false} />
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">{rev.comment}</p>
                        <span className="text-[10px] text-slate-500 block">{new Date(rev.createdAt).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
