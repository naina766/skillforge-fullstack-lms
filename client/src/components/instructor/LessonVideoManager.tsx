import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { videoApi } from '../../api/videoApi';
import { useUIStore } from '../../store/useUIStore';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import {
  Youtube,
  UploadCloud,
  Video,
  CheckCircle2,
  AlertCircle,
  Play,
  Pause,
  RotateCcw,
  Film,
  Camera,
  Mic,
  Sparkles,
  Loader2,
} from 'lucide-react';

interface LessonVideoManagerProps {
  initialSource?: 'YOUTUBE' | 'CLOUDINARY' | 'NONE';
  initialYoutubeId?: string;
  initialCloudinaryUrl?: string;
  initialDuration?: number;
  onVideoConfigured: (data: {
    videoSource: 'YOUTUBE' | 'CLOUDINARY' | 'NONE';
    videoStatus: 'READY' | 'UPLOADING' | 'FAILED';
    youtubeVideoId?: string;
    cloudinaryPublicId?: string;
    cloudinaryUrl?: string;
    thumbnailUrl?: string;
    videoUrl?: string;
    duration?: number;
  }) => void;
}

export const LessonVideoManager: React.FC<LessonVideoManagerProps> = ({
  initialSource = 'NONE',
  initialYoutubeId = '',
  initialCloudinaryUrl = '',
  initialDuration = 0,
  onVideoConfigured,
}) => {
  const { addToast } = useUIStore();
  const [activeTab, setActiveTab] = useState<'YOUTUBE' | 'UPLOAD' | 'RECORD'>(
    initialSource === 'CLOUDINARY' ? 'UPLOAD' : initialSource === 'YOUTUBE' ? 'YOUTUBE' : 'YOUTUBE'
  );

  // YouTube State
  const [youtubeUrl, setYoutubeUrl] = useState(
    initialYoutubeId ? `https://www.youtube.com/watch?v=${initialYoutubeId}` : ''
  );
  const [youtubePreviewId, setYoutubePreviewId] = useState<string | null>(initialYoutubeId || null);
  const [isValidatingYouTube, setIsValidatingYouTube] = useState(false);

  // Upload State
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string>(initialCloudinaryUrl);

  // Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [recordingError, setRecordingError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const liveVideoRef = useRef<HTMLVideoElement>(null);
  const recordedVideoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up streams on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // 1. YouTube Validation Flow
  const handleValidateYouTube = async () => {
    if (!youtubeUrl.trim()) {
      addToast('error', 'Please enter a YouTube video URL.');
      return;
    }

    try {
      setIsValidatingYouTube(true);
      const res = await videoApi.validateYouTube(youtubeUrl.trim());
      const data = res.data;

      setYoutubePreviewId(data.videoId);
      onVideoConfigured({
        videoSource: 'YOUTUBE',
        videoStatus: 'READY',
        youtubeVideoId: data.videoId,
        videoUrl: `https://www.youtube.com/watch?v=${data.videoId}`,
        thumbnailUrl: data.thumbnailUrl,
        duration: initialDuration || 600,
      });

      addToast('success', 'YouTube video validated and attached to lesson.');
    } catch (err: any) {
      addToast('error', err.response?.data?.message || 'Invalid YouTube URL.');
      setYoutubePreviewId(null);
    } finally {
      setIsValidatingYouTube(false);
    }
  };

  // 2. Direct Signed Cloudinary Upload Flow
  const handleUploadFile = async () => {
    if (!uploadFile) {
      addToast('error', 'Please select a video file to upload.');
      return;
    }

    // 100MB limit check
    if (uploadFile.size > 100 * 1024 * 1024) {
      addToast('error', 'Video file exceeds 100MB size limit.');
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);

      // Step 1: Request signed signature from backend
      const sigRes = await videoApi.getUploadSignature('skillforge/instructor-uploads');
      const sigData = sigRes.data;

      // Step 2: Direct upload to Cloudinary
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('api_key', sigData.apiKey);
      formData.append('timestamp', sigData.timestamp.toString());
      formData.append('signature', sigData.signature);
      formData.append('folder', sigData.folder);

      const cloudinaryRes = await axios.post(sigData.uploadUrl, formData, {
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percent);
          }
        },
      });

      const result = cloudinaryRes.data;
      setUploadedUrl(result.secure_url);

      onVideoConfigured({
        videoSource: 'CLOUDINARY',
        videoStatus: 'READY',
        cloudinaryPublicId: result.public_id,
        cloudinaryUrl: result.secure_url,
        videoUrl: result.secure_url,
        duration: Math.round(result.duration || 300),
      });

      addToast('success', 'Video successfully uploaded and configured for lesson.');
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error?.message ||
        'Failed to upload video to Cloudinary. Check server credentials.';
      addToast('error', msg);
    } finally {
      setIsUploading(false);
    }
  };

  // 3. Browser MediaRecorder Video Recording Flow
  const startCamera = async () => {
    try {
      setRecordingError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true,
      });

      streamRef.current = stream;
      if (liveVideoRef.current) {
        liveVideoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      setRecordingError('Camera or microphone permission denied. Please allow access.');
      addToast('error', 'Camera or microphone access denied.');
    }
  };

  const handleStartRecording = async () => {
    await startCamera();
    if (!streamRef.current) return;

    try {
      const chunks: BlobPart[] = [];
      const mediaRecorder = new MediaRecorder(streamRef.current, {
        mimeType: MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
          ? 'video/webm;codecs=vp9'
          : 'video/webm',
      });

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        setRecordedBlob(blob);
        const url = URL.createObjectURL(blob);
        setRecordedVideoUrl(url);

        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }
      };

      mediaRecorder.start(1000); // 1s slice
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
      setIsPaused(false);
      setRecordSeconds(0);
      setRecordedBlob(null);
      setRecordedVideoUrl(null);

      timerRef.current = setInterval(() => {
        setRecordSeconds((s) => s + 1);
      }, 1000);
    } catch (err) {
      addToast('error', 'Failed to start browser media recorder.');
    }
  };

  const handlePauseResume = () => {
    if (!mediaRecorderRef.current) return;
    if (isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      timerRef.current = setInterval(() => {
        setRecordSeconds((s) => s + 1);
      }, 1000);
    } else {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handleUploadRecording = async () => {
    if (!recordedBlob) {
      addToast('error', 'No recorded video available.');
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);

      const sigRes = await videoApi.getUploadSignature('skillforge/recorded-lessons');
      const sigData = sigRes.data;

      const recordingFile = new File([recordedBlob], `recording-${Date.now()}.webm`, {
        type: 'video/webm',
      });

      const formData = new FormData();
      formData.append('file', recordingFile);
      formData.append('api_key', sigData.apiKey);
      formData.append('timestamp', sigData.timestamp.toString());
      formData.append('signature', sigData.signature);
      formData.append('folder', sigData.folder);

      const cloudinaryRes = await axios.post(sigData.uploadUrl, formData, {
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percent);
          }
        },
      });

      const result = cloudinaryRes.data;
      setUploadedUrl(result.secure_url);

      onVideoConfigured({
        videoSource: 'CLOUDINARY',
        videoStatus: 'READY',
        cloudinaryPublicId: result.public_id,
        cloudinaryUrl: result.secure_url,
        videoUrl: result.secure_url,
        duration: recordSeconds || 120,
      });

      addToast('success', 'Recorded video uploaded and assigned to lesson!');
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error?.message ||
        'Failed to upload recording to Cloudinary.';
      addToast('error', msg);
    } finally {
      setIsUploading(false);
    }
  };

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remaining = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${remaining.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-5 rounded-2xl bg-slate-950/70 border border-slate-800 p-5">
      {/* Source Tab Selector */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Film className="w-4 h-4 text-brand-400" />
          <span>Lesson Video Source</span>
        </label>

        <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('YOUTUBE')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-semibold transition-all ${
              activeTab === 'YOUTUBE'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Youtube className="w-3.5 h-3.5" />
            <span>YouTube</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('UPLOAD')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-semibold transition-all ${
              activeTab === 'UPLOAD'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Upload Video</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('RECORD')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-semibold transition-all ${
              activeTab === 'RECORD'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Record Video</span>
          </button>
        </div>
      </div>

      {/* Tab 1: YouTube Video */}
      {activeTab === 'YOUTUBE' && (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">YouTube Video URL</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. https://www.youtube.com/watch?v=Oe421EPjeBE"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-800 focus:border-brand-500 text-slate-200 text-xs rounded-xl px-3.5 py-2.5"
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleValidateYouTube}
                isLoading={isValidatingYouTube}
                leftIcon={<Sparkles className="w-3.5 h-3.5 text-amber-400" />}
              >
                Validate & Preview
              </Button>
            </div>
          </div>

          {youtubePreviewId && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Validated YouTube Video (ID: {youtubePreviewId})</span>
              </div>
              <div className="relative aspect-video max-w-sm rounded-xl bg-slate-900 border border-slate-800 overflow-hidden shadow-lg">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${youtubePreviewId}`}
                  title="YouTube Preview"
                  className="w-full h-full border-0"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Upload Video (Cloudinary Direct) */}
      {activeTab === 'UPLOAD' && (
        <div className="space-y-4">
          <div className="border-2 border-dashed border-slate-800 hover:border-brand-500/40 rounded-2xl p-6 text-center space-y-3 bg-slate-900/40 transition-colors">
            <UploadCloud className="w-10 h-10 text-brand-400 mx-auto" />
            <div className="space-y-1">
              <p className="text-xs font-semibold text-white">Select a lesson video file to upload</p>
              <p className="text-[11px] text-slate-400">Supported formats: MP4, WebM, MOV (Max 100MB)</p>
            </div>

            <input
              type="file"
              accept="video/mp4,video/webm,video/quicktime"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setUploadFile(e.target.files[0]);
                }
              }}
              className="text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-brand-600 file:text-white hover:file:bg-brand-500 cursor-pointer"
            />
          </div>

          {uploadFile && !isUploading && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
              <div className="truncate">
                <span className="text-xs font-bold text-white truncate block">{uploadFile.name}</span>
                <span className="text-[10px] text-slate-400">{(uploadFile.size / (1024 * 1024)).toFixed(2)} MB</span>
              </div>
              <Button type="button" variant="primary" size="sm" onClick={handleUploadFile}>
                Upload to Cloudinary
              </Button>
            </div>
          )}

          {isUploading && (
            <div className="space-y-2 p-4 rounded-xl bg-slate-900 border border-slate-800">
              <div className="flex items-center justify-between text-xs text-slate-300 font-semibold">
                <span className="flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-400" />
                  Uploading Video Stream...
                </span>
                <span className="text-brand-400">{uploadProgress}%</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-brand-500 to-cyan-400 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {uploadedUrl && !isUploading && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Cloudinary Video Attached & Ready</span>
              </div>
              <div className="relative aspect-video max-w-sm rounded-xl bg-slate-900 border border-slate-800 overflow-hidden shadow-lg">
                <video src={uploadedUrl} controls className="w-full h-full object-contain bg-black" />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Record Video (Browser MediaRecorder) */}
      {activeTab === 'RECORD' && (
        <div className="space-y-4">
          {recordingError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{recordingError}</span>
            </div>
          )}

          {!isRecording && !recordedVideoUrl && (
            <div className="border border-slate-800 rounded-2xl p-6 text-center space-y-4 bg-slate-900/40">
              <Camera className="w-10 h-10 text-emerald-400 mx-auto" />
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-white">Record Video Lesson in Browser</h4>
                <p className="text-[11px] text-slate-400">
                  Record your camera and microphone directly. Preview your recording before uploading to Cloudinary.
                </p>
              </div>

              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={handleStartRecording}
                leftIcon={<Camera className="w-4 h-4" />}
              >
                Start Recording
              </Button>
            </div>
          )}

          {/* Live Recording Mode */}
          {isRecording && (
            <div className="space-y-3">
              <div className="relative aspect-video rounded-2xl bg-black border border-slate-800 overflow-hidden shadow-xl">
                <video ref={liveVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" />

                <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-rose-600/90 text-white text-xs font-bold flex items-center gap-2 animate-pulse shadow-md">
                  <div className="w-2 h-2 rounded-full bg-white" />
                  <span>REC {formatTimer(recordSeconds)}</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handlePauseResume}
                  leftIcon={isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                >
                  {isPaused ? 'Resume' : 'Pause'}
                </Button>
                <Button type="button" variant="primary" size="sm" onClick={handleStopRecording}>
                  Stop & Preview
                </Button>
              </div>
            </div>
          )}

          {/* Recorded Preview & Upload Confirmation */}
          {recordedVideoUrl && !isRecording && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">Recorded Lesson Preview ({formatTimer(recordSeconds)})</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setRecordedVideoUrl(null);
                    setRecordedBlob(null);
                  }}
                  leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                >
                  Record Again
                </Button>
              </div>

              <div className="relative aspect-video max-w-md rounded-2xl bg-black border border-slate-800 overflow-hidden shadow-xl">
                <video ref={recordedVideoRef} src={recordedVideoUrl} controls className="w-full h-full object-cover" />
              </div>

              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={handleUploadRecording}
                  isLoading={isUploading}
                  leftIcon={<UploadCloud className="w-4 h-4" />}
                >
                  Confirm & Upload to Cloudinary
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
