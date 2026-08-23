import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { enrollmentApi } from '../../api/enrollmentApi';
import { courseApi } from '../../api/courseApi';
import { useUIStore } from '../../store/useUIStore';
import { Button } from '../../components/ui/Button';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Badge } from '../../components/ui/Badge';
import {
  PlayCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Award,
  BookOpen,
  FileText,
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
    queryFn: () => courseApi.getCourseBySlug(courseId!).catch(() => courseApi.getCourses({ limit: 1 }).then((r) => ({ data: r.data.items[0] }))),
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

  // Set default active lesson
  useEffect(() => {
    if (allLessons.length > 0 && !activeLessonId) {
      if (enrollment?.currentLesson) {
        setActiveLessonId(enrollment.currentLesson);
      } else {
        setActiveLessonId(allLessons[0]._id || 'lesson-0');
      }
    }
  }, [allLessons, enrollment, activeLessonId]);

  const activeLesson = allLessons.find((l) => l._id === activeLessonId) || allLessons[0];
  const activeLessonIndex = allLessons.findIndex((l) => l._id === activeLessonId);

  const completedLessonIds = new Set(enrollment?.progress || []);

  // Update progress mutation
  const progressMutation = useMutation({
    mutationFn: ({ lessonId, isCompleted }: { lessonId: string; isCompleted: boolean }) =>
      enrollmentApi.updateProgress(enrollment!._id, lessonId, isCompleted),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['enrollment-player', courseId] });
      queryClient.invalidateQueries({ queryKey: ['my-enrollments'] });

      if (res.data.certificate) {
        addToast('success', '🎉 Course Completed! Certificate generated.');
      }
    },
  });

  const handleToggleComplete = (lessonId: string) => {
    if (!enrollment?._id) return;
    const isCompleted = !completedLessonIds.has(lessonId);
    progressMutation.mutate({ lessonId, isCompleted });
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

  return (
    <div className="min-h-screen bg-dark-950 text-slate-100 flex flex-col">
      {/* Top Header */}
      <header className="h-16 bg-slate-900 border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-4">
          <Link to="/dashboard/my-learning" className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="overflow-hidden">
            <h1 className="text-sm font-bold text-white truncate max-w-md">{course.title}</h1>
            <span className="text-[11px] text-slate-400 truncate block">Instructor: {course.instructor?.name}</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:block w-48">
            <ProgressBar progress={enrollment?.completionPercentage || 0} showPercentage={false} />
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
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Mock / Video Frame */}
          <div className="relative w-full aspect-video rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-2xl flex items-center justify-center group">
            <div className="text-center p-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-brand-600/20 text-brand-400 border border-brand-500/30 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                <PlayCircle className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">{activeLesson?.title}</h3>
                <p className="text-xs text-slate-400 mt-1">Interactive Video Lesson Stream</p>
              </div>
            </div>
          </div>

          {/* Lesson Action Controls */}
          <div className="flex items-center justify-between pb-6 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <Button
                variant={completedLessonIds.has(activeLesson?._id) ? 'outline' : 'primary'}
                size="sm"
                onClick={() => handleToggleComplete(activeLesson?._id || '')}
                leftIcon={<CheckCircle2 className="w-4 h-4" />}
              >
                {completedLessonIds.has(activeLesson?._id) ? 'Completed' : 'Mark as Complete'}
              </Button>
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

          {/* Lesson Notes / Resources */}
          <div className="space-y-4 max-w-4xl">
            <h2 className="text-lg font-bold text-white">Lesson Overview</h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {activeLesson?.description || 'In this lesson, you will master practical implementation patterns, architecture logic, and code optimization.'}
            </p>
          </div>
        </div>

        {/* Sidebar Lesson Tree */}
        <div className="w-full lg:w-80 bg-slate-900/60 border-l border-slate-800 p-4 space-y-4 overflow-y-auto shrink-0">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Course Modules</h3>
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
                        key={lesson._id}
                        onClick={() => setActiveLessonId(lesson._id!)}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs transition-all text-left ${
                          isCurrent
                            ? 'bg-brand-600 text-white font-bold shadow-glow-blue'
                            : 'text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          {isDone ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          ) : (
                            <PlayCircle className="w-4 h-4 text-slate-500 shrink-0" />
                          )}
                          <span className="truncate">{lesson.title}</span>
                        </div>
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
