import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { enrollmentApi } from '../../api/enrollmentApi';
import { courseApi } from '../../api/courseApi';
import { useUIStore } from '../../store/useUIStore';
import { Button } from '../../components/ui/Button';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Badge } from '../../components/ui/Badge';
import { VideoLessonPlayer } from '../../components/video/VideoLessonPlayer';
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
  Lock,
} from 'lucide-react';

export const LearningPlayerPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { addToast } = useUIStore();

  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);

  // Fetch Enrollment
  const { data: enrollmentData, isLoading: isEnrollmentLoading } = useQuery({
    queryKey: ['enrollment-player', courseId],
    queryFn: () => enrollmentApi.getEnrollmentByCourse(courseId!),
    enabled: !!courseId,
  });

  // Fetch Course details
  const { data: courseData, isLoading: isCourseLoading } = useQuery({
    queryKey: ['course-player', courseId],
    queryFn: async () => {
      if (!courseId) throw new Error('No course ID');
      try {
        if (courseId.match(/^[0-9a-fA-F]{24}$/)) {
          return await courseApi.getCourseById(courseId);
        }
        return await courseApi.getCourseBySlug(courseId);
      } catch {
        return await courseApi.getCourseBySlug(courseId).catch(() => courseApi.getCourseById(courseId));
      }
    },
    enabled: !!courseId,
  });

  const enrollment = enrollmentData?.data;
  const course = courseData?.data;

  // Flatten lessons array
  const allLessons = React.useMemo(() => {
    if (!course?.curriculum) return [];
    const list: any[] = [];
    course.curriculum.forEach((mod) => {
      mod.lessons.forEach((l) => list.push({ ...l, moduleTitle: mod.title }));
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

  const activeLesson = allLessons.find((l) => l._id === activeLessonId) || allLessons[0];
  const activeLessonIndex = allLessons.findIndex((l) => l._id === activeLessonId);

  const completedLessonIds = new Set(enrollment?.progress || []);

  // Throttled Video Progress Mutation
  const videoProgressMutation = useMutation({
    mutationFn: ({
      lessonId,
      watchedSeconds,
      duration,
    }: {
      lessonId: string;
      watchedSeconds: number;
      duration: number;
    }) => enrollmentApi.updateVideoProgress(enrollment!._id, lessonId, watchedSeconds, duration),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['enrollment-player', courseId] });
      queryClient.invalidateQueries({ queryKey: ['my-enrollments'] });

      if (res.data.certificate) {
        addToast('success', '🎉 100% Course Completed! Official Certificate issued.');
      }
    },
  });

  const handleProgressUpdate = (watchedSeconds: number, duration: number) => {
    if (!enrollment?._id || !activeLesson?._id) return;
    videoProgressMutation.mutate({
      lessonId: activeLesson._id,
      watchedSeconds,
      duration,
    });
  };

  const handleNextLesson = () => {
    if (activeLessonIndex < allLessons.length - 1) {
      const nextLesson = allLessons[activeLessonIndex + 1];
      setActiveLessonId(nextLesson._id);
    }
  };

  const handlePrevLesson = () => {
    if (activeLessonIndex > 0) {
      const prevLesson = allLessons[activeLessonIndex - 1];
      setActiveLessonId(prevLesson._id);
    }
  };

  if (isEnrollmentLoading || isCourseLoading || !course) {
    return (
      <div className="min-h-screen bg-dark-950 text-white flex items-center justify-center">
        <p className="text-slate-400 animate-pulse">Loading SkillForge Interactive Player...</p>
      </div>
    );
  }

  // Find saved position for active lesson if any
  const savedLessonProgress = enrollment?.lessonProgress?.find((lp) => lp.lessonId === activeLesson?._id);
  const initialPosition =
    enrollment?.lastWatchedLesson === activeLesson?._id
      ? enrollment?.lastWatchedPosition || savedLessonProgress?.watchedSeconds || 0
      : savedLessonProgress?.watchedSeconds || 0;

  return (
    <div className="min-h-screen bg-dark-950 text-slate-100 flex flex-col">
      {/* Top Header */}
      <header className="h-16 bg-slate-900 border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-4">
          <Link
            to="/dashboard/my-learning"
            className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="overflow-hidden">
            <h1 className="text-sm font-bold text-white truncate max-w-md">{course.title}</h1>
            <span className="text-[11px] text-slate-400 truncate block">Instructor: {course.instructor?.name}</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:block w-48">
            <ProgressBar progress={enrollment?.completionPercentage || 0} showPercentage={true} />
          </div>

          {enrollment?.status === 'COMPLETED' && (
            <Link to="/dashboard/certificates">
              <Badge variant="amber" size="md">
                <Award className="w-3.5 h-3.5" /> Certificate Earned
              </Badge>
            </Link>
          )}
        </div>
      </header>

      {/* Main Content & Sidebar Layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Main Player Area */}
        <div className="flex-1 flex flex-col overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {activeLesson && (
            <VideoLessonPlayer
              key={activeLesson._id}
              lesson={activeLesson}
              courseTitle={course.title}
              initialPosition={initialPosition}
              isCompleted={activeLesson._id ? completedLessonIds.has(activeLesson._id) : false}
              onProgressUpdate={handleProgressUpdate}
              onNextLesson={handleNextLesson}
              hasNextLesson={activeLessonIndex < allLessons.length - 1}
            />
          )}

          {/* Lesson Navigation Controls */}
          <div className="flex items-center justify-between pb-6 border-b border-slate-800">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>Lesson {activeLessonIndex + 1} of {allLessons.length}</span>
              <span>•</span>
              <span className="text-brand-400 font-semibold">{activeLesson?.moduleTitle}</span>
            </div>

            <div className="flex items-center gap-2">
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
                variant="secondary"
                size="sm"
                disabled={activeLessonIndex >= allLessons.length - 1}
                onClick={handleNextLesson}
                rightIcon={<ChevronRight className="w-4 h-4" />}
              >
                Next
              </Button>
            </div>
          </div>

          {/* Lesson Notes & Architecture Overview */}
          <div className="space-y-4 max-w-4xl">
            <h2 className="text-lg font-bold text-white">Lesson Notes & Implementation Guide</h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {activeLesson?.description ||
                'In this module, you will master practical implementation patterns, architecture logic, and code optimization.'}
            </p>
          </div>
        </div>

        {/* Sidebar Lesson Tree */}
        <div className="w-full lg:w-84 bg-slate-900/70 border-l border-slate-800 p-4 space-y-4 overflow-y-auto shrink-0">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Course Curriculum</h3>
            <span className="text-xs text-slate-400 font-mono">
              {completedLessonIds.size}/{allLessons.length} Done
            </span>
          </div>

          <div className="space-y-4">
            {course.curriculum?.map((module, mIdx) => (
              <div key={mIdx} className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 px-2 uppercase tracking-wider">{module.title}</h4>
                <div className="space-y-1">
                  {module.lessons.map((lesson) => {
                    const isCurrent = lesson._id === activeLessonId;
                    const isDone = lesson._id ? completedLessonIds.has(lesson._id) : false;

                    return (
                      <button
                        key={lesson._id || lesson.order}
                        onClick={() => setActiveLessonId(lesson._id || null)}
                        className={`w-full text-left p-2.5 rounded-xl text-xs flex items-center justify-between transition-all ${
                          isCurrent
                            ? 'bg-brand-600 text-white font-bold shadow-glow-blue'
                            : 'text-slate-300 hover:bg-slate-800/60'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          {isDone ? (
                            <CheckCircle2 className={`w-4 h-4 ${isCurrent ? 'text-white' : 'text-emerald-400'} shrink-0`} />
                          ) : (
                            <PlayCircle className={`w-4 h-4 ${isCurrent ? 'text-white' : 'text-slate-400'} shrink-0`} />
                          )}
                          <span className="truncate">{lesson.title}</span>
                        </div>

                        <span className="text-[10px] opacity-70 font-mono shrink-0 ml-2">
                          {Math.round(lesson.duration / 60)}m
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
