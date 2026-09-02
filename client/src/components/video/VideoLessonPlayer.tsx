import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Lesson } from '../../types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import {
  PlayCircle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Film,
  FileText,
  AlertCircle,
  Clock,
} from 'lucide-react';

interface VideoLessonPlayerProps {
  lesson: Lesson;
  courseTitle?: string;
  initialPosition?: number;
  isCompleted?: boolean;
  onProgressUpdate: (watchedSeconds: number, duration: number) => void;
  onNextLesson?: () => void;
  hasNextLesson?: boolean;
}

export const VideoLessonPlayer: React.FC<VideoLessonPlayerProps> = ({
  lesson,
  courseTitle,
  initialPosition = 0,
  isCompleted = false,
  onProgressUpdate,
  onNextLesson,
  hasNextLesson = false,
}) => {
  const [currentSeconds, setCurrentSeconds] = useState(initialPosition);
  const [videoDuration, setVideoDuration] = useState(lesson.duration || 0);
  const [hasCompletedLocally, setHasCompletedLocally] = useState(isCompleted);
  const [playbackError, setPlaybackError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const lastReportedTimeRef = useRef<number>(0);

  // Sync completion state from props
  useEffect(() => {
    setHasCompletedLocally(isCompleted);
  }, [isCompleted, lesson._id]);

  // Reset playback position on lesson change
  useEffect(() => {
    setCurrentSeconds(initialPosition);
    setVideoDuration(lesson.duration || 0);
    setPlaybackError(null);
    lastReportedTimeRef.current = 0;
  }, [lesson._id, initialPosition, lesson.duration]);

  // Extract YouTube ID
  const getYouTubeId = useCallback((): string | null => {
    if (lesson.youtubeVideoId) return lesson.youtubeVideoId;
    if (lesson.videoUrl) {
      const match = lesson.videoUrl.match(
        /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|live\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
      );
      if (match && match[1]) return match[1];
    }
    return null;
  }, [lesson]);

  const youtubeId = getYouTubeId();
  const isYouTube = lesson.videoSource === 'YOUTUBE' || Boolean(youtubeId);
  const isCloudinary = lesson.videoSource === 'CLOUDINARY' || (!isYouTube && Boolean(lesson.cloudinaryUrl || lesson.videoUrl));

  // Progress reporter (throttled every 5 seconds)
  const reportProgress = useCallback(
    (seconds: number, duration: number) => {
      if (duration <= 0) return;
      const now = Math.floor(seconds);

      // Throttled: report every 5s or at 90% threshold
      if (Math.abs(now - lastReportedTimeRef.current) >= 5 || (now / duration >= 0.9 && !hasCompletedLocally)) {
        lastReportedTimeRef.current = now;
        onProgressUpdate(now, duration);

        if (now / duration >= 0.9 && !hasCompletedLocally) {
          setHasCompletedLocally(true);
        }
      }
    },
    [hasCompletedLocally, onProgressUpdate]
  );

  // YouTube simulation progress timer (since embedded iframes without postMessage API track elapsed time)
  useEffect(() => {
    if (!isYouTube || !youtubeId) return;

    const estimatedDuration = lesson.duration > 0 ? lesson.duration : 600; // Default 10 min
    setVideoDuration(estimatedDuration);

    const interval = setInterval(() => {
      setCurrentSeconds((prev) => {
        const next = Math.min(estimatedDuration, prev + 1);
        reportProgress(next, estimatedDuration);
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isYouTube, youtubeId, lesson.duration, reportProgress]);

  // HTML5 / Cloudinary video event handlers
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const currentTime = videoRef.current.currentTime;
    const duration = videoRef.current.duration || lesson.duration || 1;

    setCurrentSeconds(currentTime);
    setVideoDuration(duration);
    reportProgress(currentTime, duration);
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    const duration = videoRef.current.duration;
    if (duration && !isNaN(duration)) {
      setVideoDuration(duration);
    }
    if (initialPosition > 0 && initialPosition < (duration || 99999)) {
      videoRef.current.currentTime = initialPosition;
    }
  };

  const progressPercent =
    videoDuration > 0 ? Math.min(100, Math.round((currentSeconds / videoDuration) * 100)) : 0;

  // Render non-video lesson (e.g. ARTICLE or QUIZ)
  if (lesson.type === 'ARTICLE' || lesson.type === 'QUIZ') {
    return (
      <div className="space-y-6">
        <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-slate-800 space-y-6 bg-slate-900/60">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-brand-400" />
              <Badge variant="purple">{lesson.type}</Badge>
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <Clock className="w-4 h-4" />
              <span>{Math.round(lesson.duration / 60) || 5} min read</span>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white">{lesson.title}</h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              {lesson.description ||
                'This module covers technical architecture documentation, reference cheat sheets, and practical exercises. Review the concepts carefully to master the curriculum outcomes.'}
            </p>

            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs font-mono text-cyan-300">
              // Reference module notes & architectural checklist
              <br />
              1. Master design patterns and modular component architecture.
              <br />
              2. Implement end-to-end type safety across backend and client layers.
              <br />
              3. Test edge-cases with automated integration test suites.
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between border-t border-slate-800">
            <Button
              variant={hasCompletedLocally ? 'outline' : 'primary'}
              size="sm"
              onClick={() => {
                setHasCompletedLocally(true);
                onProgressUpdate(lesson.duration || 300, lesson.duration || 300);
              }}
              leftIcon={<CheckCircle2 className="w-4 h-4 text-emerald-400" />}
            >
              {hasCompletedLocally ? 'Article Completed' : 'Mark as Read & Completed'}
            </Button>

            {hasNextLesson && onNextLesson && (
              <Button variant="secondary" size="sm" onClick={onNextLesson} rightIcon={<ArrowRight className="w-4 h-4" />}>
                Next Lesson
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Video Viewport */}
      <div className="relative w-full aspect-video rounded-3xl bg-slate-950 border border-slate-800/90 overflow-hidden shadow-2xl group">
        {isYouTube && youtubeId ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${youtubeId}?rel=0&modestbranding=1&playsinline=1&start=${Math.floor(initialPosition)}`}
            title={lesson.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="w-full h-full border-0"
          />
        ) : isCloudinary && (lesson.cloudinaryUrl || lesson.videoUrl) ? (
          <video
            ref={videoRef}
            src={lesson.cloudinaryUrl || lesson.videoUrl}
            controls
            playsInline
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onError={() => setPlaybackError('Failed to load video stream from Cloudinary storage.')}
            className="w-full h-full object-contain bg-black"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
            <Film className="w-12 h-12 text-slate-600" />
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white">Video Source Processing</h4>
              <p className="text-xs text-slate-400 max-w-sm">
                This lesson is waiting for video stream transcoding or a valid YouTube / Cloudinary URL.
              </p>
            </div>
          </div>
        )}

        {/* Error Overlay if any */}
        {playbackError && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6 space-y-3">
            <AlertCircle className="w-10 h-10 text-rose-400" />
            <p className="text-xs text-rose-300 font-medium">{playbackError}</p>
          </div>
        )}
      </div>

      {/* Progress & Completion Feedback Banner */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
            {hasCompletedLocally ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            ) : (
              <PlayCircle className="w-5 h-5 text-brand-400" />
            )}
          </div>

          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white">
                {hasCompletedLocally ? 'Lesson Completed' : 'Watching Lesson'}
              </span>
              <Badge variant={hasCompletedLocally ? 'emerald' : 'cyan'} size="sm">
                {progressPercent}%
              </Badge>
              <Badge variant="gray" size="sm">
                {isYouTube ? 'YouTube Source' : 'Cloudinary HD'}
              </Badge>
            </div>
            <p className="text-[11px] text-slate-400">
              {hasCompletedLocally
                ? 'Great job! 90%+ completed. Your course progress has been saved.'
                : 'Progress automatically updates every few seconds. Reach 90% to mark complete.'}
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2 shrink-0">
          {!hasCompletedLocally && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setHasCompletedLocally(true);
                onProgressUpdate(videoDuration || 300, videoDuration || 300);
              }}
              leftIcon={<CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
            >
              Mark Complete
            </Button>
          )}

          {hasNextLesson && onNextLesson && (
            <Button
              variant="primary"
              size="sm"
              onClick={onNextLesson}
              className="shadow-glow-blue"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Next Lesson
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
