import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Lesson } from '../../types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import {
  PlayCircle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Film,
  FileText,
  AlertCircle,
  Clock,
  Loader2,
} from 'lucide-react';

interface VideoLessonPlayerProps {
  lesson: Lesson;
  courseTitle?: string;
  initialPosition?: number;
  isCompleted?: boolean;
  onProgressUpdate: (watchedSeconds: number, duration: number, isEnded?: boolean) => void;
  onNextLesson?: () => void;
  hasNextLesson?: boolean;
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
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
  const [hasCompletedLocally, setHasCompletedLocally] = useState(isCompleted);
  const [localProgressPercent, setLocalProgressPercent] = useState<number>(isCompleted ? 100 : 0);
  const [playbackError, setPlaybackError] = useState<string | null>(null);
  const [isBuffering, setIsBuffering] = useState(false);

  // Keep parent callback stable in ref to prevent effect re-triggers
  const onProgressUpdateRef = useRef(onProgressUpdate);
  useEffect(() => {
    onProgressUpdateRef.current = onProgressUpdate;
  }, [onProgressUpdate]);

  // Playback refs to isolate rapid time updates and prevent React component re-renders
  const videoRef = useRef<HTMLVideoElement>(null);
  const ytPlayerRef = useRef<any>(null);
  const ytContainerId = useRef<string>(`yt-player-container-${Math.random().toString(36).substring(2, 9)}`);
  const initialPositionRef = useRef<number>(initialPosition);
  const currentTimeRef = useRef<number>(initialPosition);
  const durationRef = useRef<number>(lesson.duration || 600);
  const lastReportedTimeRef = useRef<number>(0);
  const hasRestoredPositionRef = useRef<boolean>(false);
  const hasReportedCompletionRef = useRef<boolean>(isCompleted);
  const periodicSyncIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Sync completion state from props
  useEffect(() => {
    setHasCompletedLocally(isCompleted);
    hasReportedCompletionRef.current = isCompleted;
    if (isCompleted) setLocalProgressPercent(100);
  }, [isCompleted]);

  // Reset playback lifecycle ONLY on lesson change
  useEffect(() => {
    hasRestoredPositionRef.current = false;
    hasReportedCompletionRef.current = isCompleted;
    lastReportedTimeRef.current = 0;
    initialPositionRef.current = initialPosition;
    currentTimeRef.current = initialPosition;
    durationRef.current = lesson.duration || 600;
    setPlaybackError(null);
    setIsBuffering(false);
    if (!isCompleted) setLocalProgressPercent(0);
  }, [lesson._id]);

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
  const isCloudinary =
    lesson.videoSource === 'CLOUDINARY' || (!isYouTube && Boolean(lesson.cloudinaryUrl || lesson.videoUrl));

  // Idempotent Completion Trigger (100% / END of Video)
  const triggerLessonEnded = useCallback(() => {
    if (hasReportedCompletionRef.current) return;
    hasReportedCompletionRef.current = true;

    const finalDur = Math.max(1, Math.floor(durationRef.current));
    console.log(`[VIDEO] ended: ${lesson.title} (${finalDur}s)`);
    setHasCompletedLocally(true);
    setLocalProgressPercent(100);
    lastReportedTimeRef.current = finalDur;
    onProgressUpdateRef.current(finalDur, finalDur, true);
  }, [lesson.title]);

  // Throttled Background Progress Reporter (every 5–10 seconds)
  const reportPeriodicProgress = useCallback(() => {
    if (hasReportedCompletionRef.current) return;

    const cur = Math.floor(currentTimeRef.current);
    const dur = Math.max(1, Math.floor(durationRef.current));

    if (dur <= 0) return;

    // Only report if time has progressed by at least 5 seconds
    if (Math.abs(cur - lastReportedTimeRef.current) >= 5) {
      lastReportedTimeRef.current = cur;
      const percent = Math.min(99, Math.round((cur / dur) * 100));
      console.log(`[VIDEO] progress persisted: ${cur}s / ${dur}s (${percent}%)`);
      setLocalProgressPercent(percent);
      onProgressUpdateRef.current(cur, dur, false);
    }
  }, []);

  // 1. YouTube IFrame API Lifecycle
  useEffect(() => {
    if (!isYouTube || !youtubeId) return;

    let isMounted = true;

    const initYT = () => {
      if (!window.YT || !window.YT.Player) return;

      if (ytPlayerRef.current) {
        try {
          console.log(`[VIDEO] player destroyed: ${lesson.title}`);
          ytPlayerRef.current.destroy();
        } catch {
          // ignore
        }
      }

      const container = document.getElementById(ytContainerId.current);
      if (!container || !isMounted) return;

      console.log(`[VIDEO] player created: ${lesson.title} (ID: ${youtubeId})`);
      ytPlayerRef.current = new window.YT.Player(ytContainerId.current, {
        videoId: youtubeId,
        playerVars: {
          autoplay: 0,
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
          enablejsapi: 1,
          origin: typeof window !== 'undefined' ? window.location.origin : '',
        },
        events: {
          onReady: (event: any) => {
            if (!isMounted) return;
            const dur = event.target.getDuration();
            if (dur && dur > 0) durationRef.current = dur;

            // Restore position ONCE on player ready
            if (initialPositionRef.current > 0 && !hasRestoredPositionRef.current) {
              hasRestoredPositionRef.current = true;
              event.target.seekTo(initialPositionRef.current, true);
            }
          },
          onStateChange: (event: any) => {
            if (!isMounted) return;

            // YouTube Player States:
            // 0: ENDED, 1: PLAYING, 2: PAUSED, 3: BUFFERING, 5: CUED
            if (event.data === 0) {
              triggerLessonEnded();
            } else if (event.data === 3) {
              setIsBuffering(true);
            } else if (event.data === 1) {
              setIsBuffering(false);
            }
          },
          onError: () => {
            if (isMounted) setPlaybackError('This YouTube video stream is currently unavailable.');
          },
        },
      });
    };

    // Load YouTube API script if not present
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      window.onYouTubeIframeAPIReady = initYT;
      document.body.appendChild(tag);
    } else {
      initYT();
    }

    // Quiet background timer every 5 seconds to sync YouTube playback position without UI re-renders
    periodicSyncIntervalRef.current = setInterval(() => {
      if (ytPlayerRef.current && typeof ytPlayerRef.current.getCurrentTime === 'function') {
        try {
          const state = ytPlayerRef.current.getPlayerState();
          if (state === 1) {
            // Playing
            currentTimeRef.current = ytPlayerRef.current.getCurrentTime() || 0;
            const dur = ytPlayerRef.current.getDuration();
            if (dur && dur > 0) durationRef.current = dur;
            reportPeriodicProgress();
          }
        } catch {
          // Player not yet initialized
        }
      }
    }, 5000);

    return () => {
      isMounted = false;
      if (periodicSyncIntervalRef.current) clearInterval(periodicSyncIntervalRef.current);
      if (ytPlayerRef.current) {
        try {
          console.log(`[VIDEO] player destroyed: ${lesson.title}`);
          ytPlayerRef.current.destroy();
        } catch {
          // ignore
        }
      }
    };
  }, [lesson._id, youtubeId, isYouTube, triggerLessonEnded, reportPeriodicProgress]);

  // 2. HTML5 / Cloudinary Lifecycle
  useEffect(() => {
    if (isYouTube) return;

    // Periodic background sync for HTML5 video
    periodicSyncIntervalRef.current = setInterval(() => {
      if (videoRef.current && !videoRef.current.paused && !videoRef.current.ended) {
        currentTimeRef.current = videoRef.current.currentTime;
        reportPeriodicProgress();
      }
    }, 5000);

    return () => {
      if (periodicSyncIntervalRef.current) clearInterval(periodicSyncIntervalRef.current);
    };
  }, [lesson._id, isYouTube, reportPeriodicProgress]);

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    const dur = videoRef.current.duration || lesson.duration || 1;
    durationRef.current = dur;

    // Restore position ONCE on metadata ready
    if (initialPositionRef.current > 0 && initialPositionRef.current < dur && !hasRestoredPositionRef.current) {
      hasRestoredPositionRef.current = true;
      videoRef.current.currentTime = initialPositionRef.current;
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    // Store in ref to avoid re-rendering entire component on every microsecond
    currentTimeRef.current = videoRef.current.currentTime;
  };

  const handleVideoEnded = () => {
    triggerLessonEnded();
  };

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
                triggerLessonEnded();
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
      {/* 16:9 Aspect Video Viewport with Smooth Cinema Mount */}
      <div className="relative w-full aspect-video rounded-3xl bg-slate-950 border border-slate-800/90 overflow-hidden shadow-2xl group">
        {isYouTube && youtubeId ? (
          <div className="w-full h-full">
            <div id={ytContainerId.current} className="w-full h-full" />
          </div>
        ) : isCloudinary && (lesson.cloudinaryUrl || lesson.videoUrl) ? (
          <video
            ref={videoRef}
            src={lesson.cloudinaryUrl || lesson.videoUrl}
            controls
            playsInline
            preload="metadata"
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={handleVideoEnded}
            onWaiting={() => setIsBuffering(true)}
            onPlaying={() => setIsBuffering(false)}
            onError={() => setPlaybackError('Failed to load video stream from Cloudinary storage.')}
            className="w-full h-full object-contain bg-black"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
            <Film className="w-12 h-12 text-slate-600" />
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white">Video Stream Initializing</h4>
              <p className="text-xs text-slate-400 max-w-sm">
                This lesson is loading media stream metadata. Please wait...
              </p>
            </div>
          </div>
        )}

        {/* Buffering Indicator */}
        {isBuffering && (
          <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-black/70 backdrop-blur-sm border border-slate-700 text-white text-[11px] font-semibold flex items-center gap-1.5 shadow-md pointer-events-none">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-400" />
            <span>Buffering...</span>
          </div>
        )}

        {/* Playback Error Overlay */}
        {playbackError && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6 space-y-3">
            <AlertCircle className="w-10 h-10 text-rose-400" />
            <p className="text-xs text-rose-300 font-medium">{playbackError}</p>
          </div>
        )}
      </div>

      {/* Progress & Real-Time Completion Strip */}
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
                {hasCompletedLocally ? '✓ Lesson Completed' : 'Watching Lesson'}
              </span>
              <Badge variant={hasCompletedLocally ? 'emerald' : 'cyan'} size="sm">
                {localProgressPercent}%
              </Badge>
              <Badge variant="gray" size="sm">
                {isYouTube ? 'YouTube HD' : 'Cloudinary Video'}
              </Badge>
            </div>
            <p className="text-[11px] text-slate-400">
              {hasCompletedLocally
                ? 'Great work! You reached the end of this lesson. Course progress is saved.'
                : 'Watch to the very end of the video (100%) to automatically mark complete.'}
            </p>
          </div>
        </div>

        {/* Next Lesson Action */}
        <div className="flex items-center gap-2 shrink-0">
          {hasCompletedLocally && hasNextLesson && onNextLesson && (
            <Button
              variant="primary"
              size="sm"
              onClick={onNextLesson}
              className="shadow-glow-blue animate-pulse"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Start Next Lesson
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
