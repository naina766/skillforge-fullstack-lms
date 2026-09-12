import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { courseApi } from '../../api/courseApi';
import { enrollmentApi } from '../../api/enrollmentApi';
import { useAuthStore } from '../../store/useAuthStore';
import { useUIStore } from '../../store/useUIStore';
import { useSocketListener } from '../../hooks/useSocketListener';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { StarRating } from '../../components/reviews/StarRating';
import { ReviewList } from '../../components/reviews/ReviewList';
import { CourseImage } from '../../components/course/CourseImage';
import {
  Clock,
  Users,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  PlayCircle,
  Award,
  Sparkles,
  BookOpen,
  ShieldCheck,
  Calendar,
  GraduationCap,
} from 'lucide-react';

export const CourseDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthStore();
  const { addToast } = useUIStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'curriculum' | 'reviews'>('overview');
  const [expandedModules, setExpandedModules] = useState<Record<number, boolean>>({ 0: true, 1: true });

  // Fetch course details
  const { data: courseResponse, isLoading } = useQuery({
    queryKey: ['course', slug],
    queryFn: () => courseApi.getCourseBySlug(slug!),
    enabled: !!slug,
  });

  const course = courseResponse?.data;

  // Real-time socket listener for live rating updates
  useSocketListener(course?._id);

  // Check enrollment status
  const { data: enrollmentResponse } = useQuery({
    queryKey: ['enrollment-check', course?._id],
    queryFn: () => enrollmentApi.getEnrollmentByCourse(course!._id),
    enabled: isAuthenticated && !!course?._id,
  });

  const enrollment = enrollmentResponse?.data;

  // Enroll mutation
  const enrollMutation = useMutation({
    mutationFn: (courseId: string) => enrollmentApi.enroll(courseId),
    onSuccess: (res) => {
      addToast('success', 'Enrolled successfully! Redirecting to learning player...');
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
      queryClient.invalidateQueries({ queryKey: ['enrollment-check', course?._id] });
      queryClient.invalidateQueries({ queryKey: ['course', course?.slug] });
      queryClient.invalidateQueries({ queryKey: ['student-dashboard'] });
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

  const expandAllModules = () => {
    if (!course?.curriculum) return;
    const all: Record<number, boolean> = {};
    course.curriculum.forEach((_, idx) => {
      all[idx] = true;
    });
    setExpandedModules(all);
  };

  const collapseAllModules = () => {
    setExpandedModules({});
  };

  if (isLoading || !course) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <Skeleton className="h-56 w-full rounded-3xl" />
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px] gap-8">
          <div className="space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-32 w-full" />
          </div>
          <Skeleton className="h-72 w-full rounded-3xl" />
        </div>
      </div>
    );
  }

  const isWorkshop = course.type === 'WORKSHOP';

  // Dynamic Curriculum Statistics
  const totalModules = course.curriculum?.length || 0;
  const totalLessons = course.curriculum?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) || 0;
  const totalLessonDurationSeconds = course.curriculum?.reduce(
    (acc, m) => acc + (m.lessons?.reduce((lAcc, l) => lAcc + (l.duration || 0), 0) || 0),
    0
  ) || 0;
  const calculatedHours = totalLessonDurationSeconds > 0
    ? Math.round(totalLessonDurationSeconds / 3600)
    : Math.round(course.duration / 60) || 8;

  // Dynamic Pricing & Discount Calculation
  const originalPrice = course.price;
  const hasDiscount = !!course.discountedPrice && course.discountedPrice < originalPrice;
  const currentPrice = hasDiscount ? course.discountedPrice! : originalPrice;
  const savingsAmount = hasDiscount ? originalPrice - currentPrice : 0;
  const discountPercentage = hasDiscount && originalPrice > 0
    ? Math.round((savingsAmount / originalPrice) * 100)
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 pb-16">
      {/* UNIFIED 2-COLUMN CONTINUOUS LAYOUT (Zero Empty Voids) */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px] gap-8 items-start">
        
        {/* ========================================================= */}
        {/* LEFT COLUMN: HERO INFO -> TABS -> OVERVIEW / CURRICULUM   */}
        {/* ========================================================= */}
        <div className="space-y-6">
          {/* A. Course Information & Metadata */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={isWorkshop ? 'cyan' : course.type === 'BOOTCAMP' ? 'purple' : 'blue'}>
                {course.type}
              </Badge>
              <Badge variant="purple">{course.category?.name || 'Software Engineering'}</Badge>
              <span className="text-xs text-slate-400 font-medium">Level: {course.level}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white leading-tight tracking-tight">
              {course.title}
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-3xl">
              {course.shortDescription}
            </p>

            {/* Author, Rating, Students, Duration */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs sm:text-sm text-slate-300 pt-3 border-t border-slate-800/80">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-purple-600 flex items-center justify-center font-bold text-white shadow-sm text-xs shrink-0">
                  {course.instructor?.name?.charAt(0) || 'I'}
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-semibold">Instructor</span>
                  <span className="font-semibold text-white">{course.instructor?.name || 'SkillForge Faculty'}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-slate-900/70 px-3 py-1.5 rounded-xl border border-slate-800">
                <StarRating rating={course.rating || 0} size="sm" />
                <span className="font-bold text-white text-xs">{course.rating ? course.rating.toFixed(1) : '5.0'}</span>
                <span className="text-xs text-slate-400">({course.reviewCount || 0})</span>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                <span>{course.enrollmentCount || 0} students</span>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{calculatedHours}h total</span>
              </div>
            </div>
          </div>

          {/* B. Mobile-only Pricing Card (stacks neatly on mobile) */}
          <div className="block lg:hidden">
            <div className="glass-panel p-5 rounded-3xl border border-slate-800 shadow-2xl space-y-4 bg-slate-950/80">
              <CourseImage course={course} aspectRatio="aspect-video" />

              <div className="space-y-1.5">
                <div className="flex items-baseline gap-2.5 flex-wrap">
                  <span className="text-3xl font-black text-white tracking-tight">
                    {currentPrice === 0 ? 'Free' : `$${currentPrice}`}
                  </span>
                  {hasDiscount && (
                    <span className="text-base text-slate-500 line-through font-semibold">
                      ${originalPrice}
                    </span>
                  )}
                </div>

                {hasDiscount && (
                  <div className="flex items-center gap-2 pt-0.5">
                    <Badge variant="emerald" size="sm" className="font-bold tracking-wide text-[11px] py-0.5 px-2">
                      SAVE ${savingsAmount}
                    </Badge>
                    <Badge variant="purple" size="sm" className="font-bold text-[11px] py-0.5 px-2">
                      {discountPercentage}% OFF
                    </Badge>
                  </div>
                )}
              </div>

              {enrollment ? (
                <Link to={`/learn/${course._id}`} className="block">
                  <Button variant="primary" size="lg" className="w-full text-sm font-bold" leftIcon={<PlayCircle className="w-4 h-4" />}>
                    Continue Learning
                  </Button>
                </Link>
              ) : (
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full text-sm font-bold py-3"
                  isLoading={enrollMutation.isPending}
                  onClick={handleEnrollClick}
                >
                  Enroll Now
                </Button>
              )}
            </div>
          </div>

          {/* C. Left-Aligned Tabs (Immediately follows course info with small 24px transition) */}
          <div className="pt-2 border-t border-slate-800/80">
            <div className="flex items-center gap-8 border-b border-slate-800 text-sm font-bold overflow-x-auto pb-0">
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className={`pb-3 px-1 transition-all whitespace-nowrap ${
                  activeTab === 'overview'
                    ? 'text-brand-400 border-b-2 border-brand-500 font-extrabold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Course Overview
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('curriculum')}
                className={`pb-3 px-1 transition-all whitespace-nowrap ${
                  activeTab === 'curriculum'
                    ? 'text-brand-400 border-b-2 border-brand-500 font-extrabold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Curriculum ({totalLessons} Lessons)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('reviews')}
                className={`pb-3 px-1 transition-all whitespace-nowrap ${
                  activeTab === 'reviews'
                    ? 'text-brand-400 border-b-2 border-brand-500 font-extrabold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Reviews ({course.reviewCount || 0})
              </button>
            </div>
          </div>

          {/* D. Main Tab Content (Immediate compact flow below tabs) */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Compact Course Statistics Strip */}
              <div className="grid grid-cols-3 gap-3 glass-panel p-4 rounded-2xl border border-slate-800/80 bg-slate-950/40 text-center">
                <div>
                  <div className="text-lg sm:text-xl font-black text-white">{totalModules}</div>
                  <div className="text-[11px] text-slate-400 font-medium">Modules</div>
                </div>
                <div className="border-x border-slate-800">
                  <div className="text-lg sm:text-xl font-black text-white">{totalLessons}</div>
                  <div className="text-[11px] text-slate-400 font-medium">Lessons</div>
                </div>
                <div>
                  <div className="text-lg sm:text-xl font-black text-white">{calculatedHours}h</div>
                  <div className="text-[11px] text-slate-400 font-medium">Total Duration</div>
                </div>
              </div>

              {/* What You Will Learn */}
              {course.learningOutcomes && course.learningOutcomes.length > 0 && (
                <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-slate-800/80 bg-slate-950/60 space-y-3.5 shadow-md">
                  <h3 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-brand-400" />
                    <span>What You'll Learn</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                    {course.learningOutcomes.map((outcome, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{outcome}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Full Description */}
              <div className="space-y-2.5">
                <h3 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-brand-400" />
                  <span>About This Course</span>
                </h3>
                <div className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line bg-slate-950/40 p-5 sm:p-6 rounded-2xl border border-slate-800/60">
                  {course.description}
                </div>
              </div>

              {/* Prerequisites */}
              {course.prerequisites && course.prerequisites.length > 0 && (
                <div className="space-y-2.5">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Prerequisites</h3>
                  <ul className="list-disc list-inside text-xs sm:text-sm text-slate-400 space-y-1.5 bg-slate-950/30 p-4 rounded-xl border border-slate-800/40">
                    {course.prerequisites.map((req, idx) => (
                      <li key={idx}>{req}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Skills Covered */}
              {course.skills && course.skills.length > 0 && (
                <div className="space-y-2.5">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Skills You Will Master</h3>
                  <div className="flex flex-wrap gap-2">
                    {course.skills.map((skill, idx) => (
                      <Badge key={idx} variant="cyan" size="sm">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Compact Curriculum Breakdown */}
          {activeTab === 'curriculum' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-1">
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">Course Curriculum</h3>
                  <p className="text-xs text-slate-400">
                    {totalModules} Modules · {totalLessons} Lessons · {calculatedHours} Hours Total
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Button variant="ghost" size="sm" onClick={expandAllModules} className="text-xs text-slate-400 h-7 px-2">
                    Expand All
                  </Button>
                  <span className="text-slate-700">|</span>
                  <Button variant="ghost" size="sm" onClick={collapseAllModules} className="text-xs text-slate-400 h-7 px-2">
                    Collapse All
                  </Button>
                </div>
              </div>

              <div className="space-y-2.5">
                {course.curriculum?.map((module, mIdx) => {
                  const moduleMinutes = module.lessons.reduce((sum, l) => sum + Math.round((l.duration || 0) / 60), 0);

                  return (
                    <div key={mIdx} className="glass-panel rounded-2xl border border-slate-800/80 overflow-hidden shadow-sm">
                      <button
                        type="button"
                        onClick={() => toggleModule(mIdx)}
                        className="w-full flex items-center justify-between px-4 py-3 sm:px-5 sm:py-3.5 bg-slate-900/70 hover:bg-slate-900 transition-colors text-left"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 text-xs font-bold shrink-0">
                            {mIdx + 1}
                          </div>
                          <div>
                            <span className="font-bold text-slate-100 text-xs sm:text-sm">{module.title}</span>
                            <div className="text-[10px] text-slate-400">
                              {module.lessons.length} lessons · {moduleMinutes} min
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {expandedModules[mIdx] ? (
                            <ChevronUp className="w-4 h-4 text-slate-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                      </button>

                      {expandedModules[mIdx] && (
                        <div className="divide-y divide-slate-800/60 bg-slate-950/60">
                          {module.lessons.map((lesson, lIdx) => (
                            <div
                              key={lIdx}
                              className="px-4 py-2.5 sm:px-5 sm:py-3 flex items-center justify-between text-xs sm:text-sm text-slate-300 pl-6 sm:pl-8 hover:bg-slate-900/40 transition-colors"
                            >
                              <div className="flex items-center gap-2.5">
                                <PlayCircle className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                                <span className="text-slate-200">{lesson.title}</span>
                                {lesson.isPreview && (
                                    <Badge variant="emerald" size="sm" className="text-[10px] py-0 px-1.5">
                                    Preview
                                  </Badge>
                                )}
                              </div>
                              <span className="text-slate-500 font-mono text-[11px]">
                                {Math.round((lesson.duration || 0) / 60)} min
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab 3: Student Reviews */}
          {activeTab === 'reviews' && (
            <div className="animate-in fade-in duration-200">
              <ReviewList
                courseId={course._id}
                courseTitle={course.title}
                isEnrolled={!!enrollment}
                onEnrollClick={handleEnrollClick}
              />
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* RIGHT COLUMN: STICKY PRICING CARD & INSTRUCTOR PROFILE    */}
        {/* ========================================================= */}
        <div className="hidden lg:block space-y-5 sticky top-24">
          {/* 1. Desktop Pricing Card */}
          <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-slate-800 shadow-2xl space-y-4 bg-slate-950/80">
            <CourseImage course={course} aspectRatio="aspect-video" />

            {/* Dynamic Pricing Layout with SAVE Badge */}
            <div className="space-y-1.5">
              <div className="flex items-baseline gap-2.5 flex-wrap">
                <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                  {currentPrice === 0 ? 'Free' : `$${currentPrice}`}
                </span>
                {hasDiscount && (
                  <span className="text-base sm:text-lg text-slate-500 line-through font-semibold">
                    ${originalPrice}
                  </span>
                )}
              </div>

              {hasDiscount && (
                <div className="flex items-center gap-2 pt-0.5">
                  <Badge variant="emerald" size="sm" className="font-bold tracking-wide text-[11px] py-0.5 px-2">
                    SAVE ${savingsAmount}
                  </Badge>
                  <Badge variant="purple" size="sm" className="font-bold text-[11px] py-0.5 px-2">
                    {discountPercentage}% OFF
                  </Badge>
                </div>
              )}

              {isWorkshop && course.capacity && (
                <span className="text-xs text-cyan-400 font-semibold bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/20 inline-block mt-1">
                  {course.capacity - course.enrollmentCount} seats left
                </span>
              )}
            </div>

            {/* Enrollment CTA */}
            {enrollment ? (
              <Link to={`/learn/${course._id}`} className="block">
                <Button variant="primary" size="lg" className="w-full text-sm font-bold" leftIcon={<PlayCircle className="w-4 h-4" />}>
                  Continue Learning
                </Button>
              </Link>
            ) : (
              <Button
                variant="primary"
                size="lg"
                className="w-full text-sm font-bold py-3"
                isLoading={enrollMutation.isPending}
                onClick={handleEnrollClick}
              >
                Enroll Now
              </Button>
            )}

            {/* Course Benefits & Guarantees */}
            <div className="space-y-2 pt-2 text-xs text-slate-400 border-t border-slate-800/80">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Full lifetime access to all modules & code</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Verified shareable certificate of completion</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                <span>Access to AI Mentor & hands-on exercises</span>
              </div>
            </div>
          </div>

          {/* 2. Compact Instructor Card */}
          {course.instructor && (
            <div className="glass-panel p-5 rounded-3xl border border-slate-800/80 bg-slate-950/60 space-y-3 shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-brand-600 to-purple-600 flex items-center justify-center font-bold text-white text-xs shadow-sm shrink-0">
                  {course.instructor.name?.charAt(0) || 'I'}
                </div>
                <div>
                  <h4 className="font-bold text-white text-xs sm:text-sm">{course.instructor.name}</h4>
                  <p className="text-[10px] text-brand-400 font-medium">Senior Lead Instructor</p>
                </div>
              </div>

              {course.instructor.bio && (
                <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-3">
                  {course.instructor.bio}
                </p>
              )}

              <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                <span>⭐ {course.rating ? course.rating.toFixed(1) : '4.9'} Rating</span>
                <span>👥 {course.enrollmentCount || 100}+ Students</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
