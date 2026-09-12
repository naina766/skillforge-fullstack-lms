import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { enrollmentApi } from '../../api/enrollmentApi';
import { courseApi } from '../../api/courseApi';
import { useUIStore } from '../../store/useUIStore';
import { Button } from '../../components/ui/Button';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Badge } from '../../components/ui/Badge';
import { VideoLessonPlayer } from '../../components/video/VideoLessonPlayer';
import { ReviewList } from '../../components/reviews/ReviewList';
import {
  PlayCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Award,
  BookOpen,
  FileText,
  Sparkles,
  Search,
  Menu,
  X,
  Clock,
  Download,
  Share2,
  MessageSquare,
  HelpCircle,
  Check,
  ChevronDown,
  ChevronUp,
  Layers,
  ExternalLink,
  Code,
  ShieldCheck,
  Star,
} from 'lucide-react';

export const LearningPlayerPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { addToast } = useUIStore();

  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'REVIEWS' | 'NOTES' | 'RESOURCES' | 'QA'>('OVERVIEW');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [lessonSearch, setLessonSearch] = useState('');
  const [expandedModules, setExpandedModules] = useState<Record<number, boolean>>({});

  // Student Lesson Notes state (stored per course + lesson in localStorage)
  const [studentNote, setStudentNote] = useState('');
  const [isNoteSaved, setIsNoteSaved] = useState(false);

  // Auto-advance banner countdown
  const [autoAdvanceCountdown, setAutoAdvanceCountdown] = useState<number | null>(null);

  // Fetch Enrollment
  const { data: enrollmentData, isLoading: isEnrollmentLoading } = useQuery({
    queryKey: ['enrollment-player', courseId],
    queryFn: () => enrollmentApi.getEnrollmentByCourse(courseId!),
    enabled: !!courseId,
  });

  // Fetch Course details (supports ID or slug with robust fallback)
  const {
    data: courseData,
    isLoading: isCourseLoading,
    isError: isCourseError,
  } = useQuery({
    queryKey: ['course-player', courseId],
    queryFn: async () => {
      if (!courseId) throw new Error('No course ID');
      try {
        if (courseId.match(/^[0-9a-fA-F]{24}$/)) {
          const res = await courseApi.getCourseById(courseId);
          if (res?.data) return res;
        }
        const slugRes = await courseApi.getCourseBySlug(courseId);
        if (slugRes?.data) return slugRes;
      } catch {
        // Fallback: try by slug or search catalog
        try {
          const slugRes = await courseApi.getCourseBySlug(courseId);
          if (slugRes?.data) return slugRes;
        } catch {
          // If still not found, fetch first available published course so student is never stuck
          const catalogRes = await courseApi.getCourses({ limit: 1 });
          if (catalogRes?.data?.items?.[0]) {
            return { data: catalogRes.data.items[0] };
          }
        }
      }
      throw new Error('Course not found');
    },
    enabled: !!courseId,
    retry: 1,
  });

  const enrollment = enrollmentData?.data;
  const course = courseData?.data;

  // Flatten lessons array with module details
  const allLessons = useMemo(() => {
    if (!course?.curriculum) return [];
    const list: any[] = [];
    course.curriculum.forEach((mod, mIdx) => {
      mod.lessons.forEach((l, lIdx) =>
        list.push({
          ...l,
          moduleTitle: mod.title,
          moduleIndex: mIdx,
          lessonIndex: lIdx,
        })
      );
    });
    return list;
  }, [course]);

  // Set default active lesson & resume position
  useEffect(() => {
    if (allLessons.length > 0 && !activeLessonId) {
      if (enrollment?.lastWatchedLesson && allLessons.some((l) => l._id === enrollment.lastWatchedLesson)) {
        setActiveLessonId(enrollment.lastWatchedLesson);
      } else if (enrollment?.currentLesson && allLessons.some((l) => l._id === enrollment.currentLesson)) {
        setActiveLessonId(enrollment.currentLesson);
      } else {
        setActiveLessonId(allLessons[0]._id || 'lesson-0');
      }
    }
  }, [allLessons, enrollment, activeLessonId]);

  // Initialize all modules as expanded by default
  useEffect(() => {
    if (course?.curriculum) {
      const initial: Record<number, boolean> = {};
      course.curriculum.forEach((_, idx) => {
        initial[idx] = true;
      });
      setExpandedModules(initial);
    }
  }, [course]);

  // Load student note for current lesson
  useEffect(() => {
    if (courseId && activeLessonId) {
      const saved = localStorage.getItem(`skillforge_notes_${courseId}_${activeLessonId}`);
      setStudentNote(saved || '');
      setIsNoteSaved(false);
    }
  }, [courseId, activeLessonId]);

  const activeLesson = allLessons.find((l) => l._id === activeLessonId) || allLessons[0];
  const activeLessonIndex = allLessons.findIndex((l) => l._id === activeLessonId);
  const completedLessonIds = useMemo(() => new Set(enrollment?.progress || []), [enrollment]);

  // Throttled Video Progress Mutation (Decoupled from periodic player rerenders)
  const videoProgressMutation = useMutation({
    mutationFn: ({
      lessonId,
      watchedSeconds,
      duration,
      isEnded,
    }: {
      lessonId: string;
      watchedSeconds: number;
      duration: number;
      isEnded?: boolean;
    }) => enrollmentApi.updateVideoProgress(enrollment!._id, lessonId, watchedSeconds, duration, isEnded),
    onSuccess: (res, variables) => {
      // ONLY invalidate queries when the lesson actually reaches the END or certificate is issued
      // This prevents the video player from stuttering or remounting during normal periodic playback syncs!
      if (variables.isEnded || res.data.isCompleted || res.data.certificate) {
        queryClient.invalidateQueries({ queryKey: ['enrollment-player', courseId] });
        queryClient.invalidateQueries({ queryKey: ['my-enrollments'] });

        if (res.data.certificate) {
          addToast('success', '🎉 100% Course Completed! Official Certificate issued.');
        } else if (res.data.isCompleted) {
          addToast('success', '✓ Lesson Completed!');
        }
      }
    },
  });

  const handleProgressUpdate = useCallback(
    (watchedSeconds: number, duration: number, isEnded = false) => {
      if (!enrollment?._id || !activeLesson?._id) return;
      videoProgressMutation.mutate({
        lessonId: activeLesson._id,
        watchedSeconds,
        duration,
        isEnded,
      });
    },
    [enrollment?._id, activeLesson?._id, videoProgressMutation]
  );

  const handleNextLesson = useCallback(() => {
    setAutoAdvanceCountdown(null);
    if (activeLessonIndex < allLessons.length - 1) {
      const nextLesson = allLessons[activeLessonIndex + 1];
      setActiveLessonId(nextLesson._id);
    }
  }, [activeLessonIndex, allLessons]);

  const handlePrevLesson = useCallback(() => {
    setAutoAdvanceCountdown(null);
    if (activeLessonIndex > 0) {
      const prevLesson = allLessons[activeLessonIndex - 1];
      setActiveLessonId(prevLesson._id);
    }
  }, [activeLessonIndex, allLessons]);

  const handleSaveNote = () => {
    if (courseId && activeLessonId) {
      localStorage.setItem(`skillforge_notes_${courseId}_${activeLessonId}`, studentNote);
      setIsNoteSaved(true);
      addToast('success', 'Personal lesson note saved.');
      setTimeout(() => setIsNoteSaved(false), 3000);
    }
  };

  // Keyboard navigation shortcuts (N for next, P for previous)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['input', 'textarea'].includes((e.target as HTMLElement).tagName.toLowerCase())) return;
      if (e.key === 'n' || e.key === 'N') {
        if (activeLessonIndex < allLessons.length - 1) handleNextLesson();
      } else if (e.key === 'p' || e.key === 'P') {
        if (activeLessonIndex > 0) handlePrevLesson();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeLessonIndex, allLessons]);

  if (isCourseLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-brand-600/20 border border-brand-500/30 flex items-center justify-center animate-pulse">
          <PlayCircle className="w-6 h-6 text-brand-400 animate-spin" />
        </div>
        <p className="text-sm font-semibold text-slate-400">Loading SkillForge Video Classroom...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mx-auto">
          <HelpCircle className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-white">Course Classroom Not Found</h2>
          <p className="text-xs text-slate-400 max-w-md">
            The requested course could not be located. It may have been updated during database re-seeding.
          </p>
        </div>
        <div className="flex items-center gap-3 pt-2">
          <Link to="/courses">
            <Button variant="primary" size="sm">
              Browse Course Catalog
            </Button>
          </Link>
          <Link to="/dashboard/my-learning">
            <Button variant="outline" size="sm">
              My Learning
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Find saved position for active lesson if any
  const savedLessonProgress = enrollment?.lessonProgress?.find((lp) => lp.lessonId === activeLesson?._id);
  const initialPosition =
    enrollment?.lastWatchedLesson === activeLesson?._id
      ? enrollment?.lastWatchedPosition || savedLessonProgress?.watchedSeconds || 0
      : savedLessonProgress?.watchedSeconds || 0;

  // Filter lessons in sidebar if search query active
  const filteredCurriculum = course.curriculum?.map((mod) => ({
    ...mod,
    lessons: mod.lessons.filter((l) =>
      lessonSearch.trim() ? l.title.toLowerCase().includes(lessonSearch.toLowerCase()) : true
    ),
  }));

  const totalLessonsCount = allLessons.length;
  const completedLessonsCount = completedLessonIds.size;
  const isAllCourseCompleted = completedLessonsCount >= totalLessonsCount && totalLessonsCount > 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-brand-500/30">
      {/* 1. TOP LMS HEADER BAR */}
      <header className="h-16 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between z-30 shrink-0 sticky top-0">
        <div className="flex items-center gap-3 sm:gap-4 overflow-hidden">
          <Link
            to="/dashboard/my-learning"
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-all border border-slate-700/50 flex items-center gap-1.5 text-xs font-semibold shrink-0"
            title="Back to My Learning Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">My Learning</span>
          </Link>

          <div className="h-6 w-px bg-slate-800 hidden sm:block" />

          <div className="overflow-hidden">
            <h1 className="text-xs sm:text-sm font-bold text-white truncate max-w-xs sm:max-w-md md:max-w-lg">
              {course.title}
            </h1>
            <div className="flex items-center gap-2 text-[11px] text-slate-400 truncate">
              <span>Instructor: {course.instructor?.name}</span>
              <span>•</span>
              <span className="text-brand-400 font-semibold">{course.level}</span>
            </div>
          </div>
        </div>

        {/* Header Right Progress & Controls */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden md:flex items-center gap-3 bg-slate-950/60 border border-slate-800/80 px-3.5 py-1.5 rounded-xl">
            <div className="w-32">
              <ProgressBar progress={enrollment?.completionPercentage || 0} showPercentage={false} />
            </div>
            <span className="text-xs font-mono font-bold text-white">
              {enrollment?.completionPercentage || 0}%
            </span>
            <span className="text-[11px] text-slate-400">
              ({completedLessonsCount}/{totalLessonsCount})
            </span>
          </div>

          {isAllCourseCompleted && (
            <Link to="/dashboard/certificates">
              <Badge variant="amber" size="md" className="shadow-glow-amber animate-pulse">
                <Award className="w-3.5 h-3.5 mr-1" /> Certificate Ready
              </Badge>
            </Link>
          )}

          {/* Curriculum Sidebar Toggle Button */}
          <button
            type="button"
            onClick={() => setIsSidebarOpen((prev) => !prev)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
              isSidebarOpen
                ? 'bg-brand-600 text-white border-brand-500 shadow-glow-blue'
                : 'bg-slate-800/90 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span className="hidden sm:inline">{isSidebarOpen ? 'Hide Curriculum' : 'Course Content'}</span>
            <span className="px-1.5 py-0.2 rounded-md bg-black/30 text-[10px]">
              {completedLessonsCount}/{totalLessonsCount}
            </span>
          </button>
        </div>
      </header>

      {/* 2. MAIN LMS WORKSPACE (Cinema Video Focus + Collapsible Sidebar) */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* LEFT / CENTER: DOMINANT VIDEO VIEWPORT & LESSON WORKSPACE */}
        <main className="flex-1 overflow-y-auto flex flex-col">
          <div className="max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6 flex-1">
            {/* LARGE 16:9 VIDEO PLAYER CONTAINER */}
            <div className="w-full">
              {activeLesson ? (
                <VideoLessonPlayer
                  key={activeLesson._id || activeLessonIndex}
                  lesson={activeLesson}
                  courseTitle={course.title}
                  initialPosition={initialPosition}
                  isCompleted={activeLesson._id ? completedLessonIds.has(activeLesson._id) : false}
                  onProgressUpdate={handleProgressUpdate}
                  onNextLesson={handleNextLesson}
                  hasNextLesson={activeLessonIndex < allLessons.length - 1}
                />
              ) : (
                <div className="aspect-video w-full rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center text-center p-6">
                  <div className="space-y-2">
                    <PlayCircle className="w-12 h-12 text-slate-600 mx-auto" />
                    <p className="text-sm font-semibold text-slate-300">Select a lesson from the curriculum</p>
                  </div>
                </div>
              )}
            </div>

            {/* LESSON HEADER & METADATA BAR */}
            <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-slate-800/80 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono font-bold text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded-lg border border-brand-500/20">
                      Module {activeLesson?.moduleIndex + 1 || 1} • Lesson {activeLesson?.lessonIndex + 1 || 1}
                    </span>
                    <Badge variant={activeLesson?.type === 'VIDEO' ? 'cyan' : 'purple'} size="sm">
                      {activeLesson?.type}
                    </Badge>
                    <Badge variant="gray" size="sm">
                      <Clock className="w-3 h-3 mr-1" />
                      {Math.round((activeLesson?.duration || 600) / 60)} min
                    </Badge>
                  </div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
                    {activeLesson?.title}
                  </h2>
                </div>

                {/* Quick Action Navigation */}
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={activeLessonIndex <= 0}
                    onClick={handlePrevLesson}
                    leftIcon={<ChevronLeft className="w-4 h-4" />}
                  >
                    Previous
                  </Button>
                  <Button
                    variant={activeLessonIndex >= allLessons.length - 1 ? 'outline' : 'primary'}
                    size="sm"
                    disabled={activeLessonIndex >= allLessons.length - 1}
                    onClick={handleNextLesson}
                    rightIcon={<ChevronRight className="w-4 h-4" />}
                  >
                    Next
                  </Button>
                </div>
              </div>

              {/* INTERACTIVE LMS TABS (Overview, Notes, Resources, Q&A) */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-800 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setActiveTab('OVERVIEW')}
                    className={`pb-2.5 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
                      activeTab === 'OVERVIEW'
                        ? 'border-brand-500 text-brand-400 font-bold'
                        : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Overview & Objectives</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('REVIEWS')}
                    className={`pb-2.5 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
                      activeTab === 'REVIEWS'
                        ? 'border-brand-500 text-brand-400 font-bold'
                        : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span>Rate & Reviews</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('NOTES')}
                    className={`pb-2.5 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
                      activeTab === 'NOTES'
                        ? 'border-brand-500 text-brand-400 font-bold'
                        : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    <span>My Notes</span>
                    {studentNote && <span className="w-1.5 h-1.5 rounded-full bg-brand-400" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('RESOURCES')}
                    className={`pb-2.5 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
                      activeTab === 'RESOURCES'
                        ? 'border-brand-500 text-brand-400 font-bold'
                        : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Code className="w-4 h-4" />
                    <span>Resources & Code</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('QA')}
                    className={`pb-2.5 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
                      activeTab === 'QA'
                        ? 'border-brand-500 text-brand-400 font-bold'
                        : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Discussion</span>
                  </button>
                </div>

                {/* TAB 1: OVERVIEW */}
                {activeTab === 'OVERVIEW' && (
                  <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed animate-in fade-in duration-200">
                    <p>
                      {activeLesson?.description ||
                        'In this session, you will learn hands-on implementation patterns, enterprise architecture design, and real-world system optimization.'}
                    </p>

                    <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-brand-400" />
                        <span>Key Learning Takeaways</span>
                      </h4>
                      <ul className="space-y-1.5 text-xs text-slate-300 list-disc list-inside">
                        <li>End-to-end understanding of module concepts and production trade-offs.</li>
                        <li>High performance, type-safe architecture integration.</li>
                        <li>Automated testing, debugging, and edge-case handling.</li>
                      </ul>
                    </div>
                  </div>
                )}

                {/* TAB 2: REVIEWS */}
                {activeTab === 'REVIEWS' && course?._id && (
                  <div className="space-y-4 animate-in fade-in duration-200 pt-2">
                    <ReviewList
                      courseId={course._id}
                      courseTitle={course.title}
                      isEnrolled={true}
                    />
                  </div>
                )}

                {/* TAB 2: MY NOTES */}
                {activeTab === 'NOTES' && (
                  <div className="space-y-3 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>Personal notes are saved automatically to your browser for this lesson.</span>
                      {isNoteSaved && <span className="text-emerald-400 font-semibold">✓ Saved</span>}
                    </div>

                    <textarea
                      rows={6}
                      placeholder="Type your personal insights, timestamps (e.g. 04:15 - important index rule), or architecture notes..."
                      value={studentNote}
                      onChange={(e) => setStudentNote(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-brand-500 rounded-2xl p-4 text-xs text-slate-200 focus:outline-none font-mono resize-y"
                    />

                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-500 font-mono">
                        {studentNote.length} characters
                      </span>
                      <Button variant="primary" size="sm" onClick={handleSaveNote}>
                        Save Notes
                      </Button>
                    </div>
                  </div>
                )}

                {/* TAB 3: RESOURCES */}
                {activeTab === 'RESOURCES' && (
                  <div className="space-y-3 animate-in fade-in duration-200">
                    <p className="text-xs text-slate-400">
                      Lesson companion files, cheatsheets, and repository links:
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <Code className="w-4 h-4 text-brand-400" />
                          <div>
                            <span className="text-xs font-bold text-white block">Project Starter Boilerplate</span>
                            <span className="text-[10px] text-slate-400">GitHub Repository Branch</span>
                          </div>
                        </div>
                        <a
                          href="https://github.com/naina766/skillforge-fullstack-lms"
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <FileText className="w-4 h-4 text-emerald-400" />
                          <div>
                            <span className="text-xs font-bold text-white block">Architecture Cheat Sheet (PDF)</span>
                            <span className="text-[10px] text-slate-400">Curated Reference Guide</span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => addToast('info', 'Companion PDF is bundled in course materials.')}
                        >
                          <Download className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 4: Q&A */}
                {activeTab === 'QA' && (
                  <div className="space-y-4 animate-in fade-in duration-200 text-xs text-slate-300">
                    <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2">
                      <h4 className="font-bold text-white">Ask a question or discuss this module</h4>
                      <p className="text-slate-400">
                        Connect with instructors and fellow learners. Our AI Mentor is also available in the sidebar to review doubts.
                      </p>
                      <Link to="/ai-mentor">
                        <Button variant="secondary" size="sm" className="mt-2" leftIcon={<Sparkles className="w-3.5 h-3.5 text-amber-400" />}>
                          Ask AI Career & Learning Mentor
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>

        {/* RIGHT: COURSE CURRICULUM ACCORDION SIDEBAR */}
        {isSidebarOpen && (
          <aside className="w-full lg:w-96 bg-slate-900/95 backdrop-blur-xl border-l border-slate-800 flex flex-col shrink-0 z-20 absolute lg:relative inset-y-0 right-0 shadow-2xl transition-all">
            {/* Sidebar Header */}
            <div className="p-4 border-b border-slate-800 space-y-3 shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-brand-400" />
                    <span>Course Curriculum</span>
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {completedLessonsCount} of {totalLessonsCount} lessons completed ({enrollment?.completionPercentage || 0}%)
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
                  title="Close Sidebar"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Lesson Search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search lessons..."
                  value={lessonSearch}
                  onChange={(e) => setLessonSearch(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-brand-500 text-[11px] text-slate-200 rounded-xl pl-8 pr-3 py-1.5 focus:outline-none"
                />
              </div>
            </div>

            {/* Modules List (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {filteredCurriculum?.map((module, mIdx) => {
                const isExpanded = expandedModules[mIdx] ?? true;
                const moduleCompletedCount = module.lessons.filter(
                  (l) => l._id && completedLessonIds.has(l._id)
                ).length;
                const isModuleFullyDone = moduleCompletedCount === module.lessons.length && module.lessons.length > 0;

                return (
                  <div
                    key={mIdx}
                    className="rounded-2xl bg-slate-950/70 border border-slate-800/80 overflow-hidden shadow-sm"
                  >
                    {/* Module Accordion Header */}
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedModules((prev) => ({ ...prev, [mIdx]: !isExpanded }))
                      }
                      className="w-full p-3.5 flex items-center justify-between text-left hover:bg-slate-900/60 transition-colors"
                    >
                      <div className="space-y-0.5 pr-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold text-brand-400 uppercase">
                            Section {mIdx + 1}
                          </span>
                          {isModuleFullyDone && (
                            <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-0.5">
                              <Check className="w-3 h-3" /> Done
                            </span>
                          )}
                        </div>
                        <h4 className="text-xs font-bold text-white leading-snug">{module.title}</h4>
                        <span className="text-[10px] text-slate-400 block font-mono">
                          {moduleCompletedCount}/{module.lessons.length} Completed
                        </span>
                      </div>

                      <div className="text-slate-400 shrink-0">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </button>

                    {/* Lessons list in Module */}
                    {isExpanded && (
                      <div className="border-t border-slate-800/60 p-1.5 space-y-1 bg-slate-950/90">
                        {module.lessons.map((lesson) => {
                          const isCurrent = lesson._id === activeLessonId;
                          const isDone = lesson._id ? completedLessonIds.has(lesson._id) : false;

                          return (
                            <button
                              key={lesson._id || lesson.order}
                              type="button"
                              onClick={() => {
                                setActiveLessonId(lesson._id || null);
                                // On small screens close sidebar upon lesson selection
                                if (window.innerWidth < 1024) setIsSidebarOpen(false);
                              }}
                              className={`w-full text-left p-2.5 rounded-xl text-xs flex items-center justify-between transition-all group ${
                                isCurrent
                                  ? 'bg-brand-600 text-white font-bold shadow-glow-blue'
                                  : isDone
                                  ? 'text-slate-300 hover:bg-slate-900'
                                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 truncate pr-2">
                                {isDone ? (
                                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                                    <Check className="w-3 h-3 stroke-[3]" />
                                  </div>
                                ) : isCurrent ? (
                                  <div className="w-5 h-5 rounded-full bg-white text-brand-600 flex items-center justify-center shrink-0 shadow-sm">
                                    <PlayCircle className="w-3.5 h-3.5 fill-current" />
                                  </div>
                                ) : (
                                  <div className="w-5 h-5 rounded-full border border-slate-700 text-slate-500 flex items-center justify-center shrink-0 text-[10px] font-mono">
                                    {lesson.order}
                                  </div>
                                )}

                                <div className="truncate">
                                  <span className="truncate block font-medium">{lesson.title}</span>
                                  <div className="flex items-center gap-1.5 text-[10px] opacity-70 mt-0.5">
                                    {lesson.type === 'VIDEO' ? (
                                      <span>Video ({lesson.videoSource || 'YouTube'})</span>
                                    ) : (
                                      <span>{lesson.type}</span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <span className="text-[10px] font-mono opacity-80 shrink-0">
                                {Math.round(lesson.duration / 60)}m
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};
