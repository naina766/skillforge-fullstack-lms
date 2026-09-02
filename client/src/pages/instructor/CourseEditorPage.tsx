import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { courseApi } from '../../api/courseApi';
import { Sidebar } from '../../components/layout/Sidebar';
import { Button } from '../../components/ui/Button';
import { useUIStore } from '../../store/useUIStore';
import { Plus, Trash2, CheckCircle2, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';

import { Module, Lesson } from '../../types';
import { LessonVideoManager } from '../../components/instructor/LessonVideoManager';
import { Badge } from '../../components/ui/Badge';
import { Youtube, UploadCloud, Camera, Film, ChevronDown, ChevronUp } from 'lucide-react';

export const CourseEditorPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEditMode = Boolean(id);
  const queryClient = useQueryClient();
  const { addToast } = useUIStore();
  const [step, setStep] = useState(1);
  const [editingLessonKey, setEditingLessonKey] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'COURSE' | 'WORKSHOP' | 'BOOTCAMP' | 'WEBINAR'>('COURSE');
  const [category, setCategory] = useState('');
  const [level, setLevel] = useState('BEGINNER');
  const [price, setPrice] = useState('49');
  const [thumbnail, setThumbnail] = useState('https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80');

  // Workshop fields
  const [startDate, setStartDate] = useState('');
  const [meetingUrl, setMeetingUrl] = useState('');
  const [capacity, setCapacity] = useState('100');

  // Curriculum State
  const [modules, setModules] = useState<Module[]>([
    {
      title: 'Module 1: Introduction & Environment Setup',
      order: 1,
      lessons: [
        {
          title: '1. Orientation & Project Overview',
          duration: 600,
          order: 1,
          isPreview: true,
          type: 'VIDEO',
          videoSource: 'YOUTUBE',
          videoStatus: 'READY',
          youtubeVideoId: 'Oe421EPjeBE',
        },
        {
          title: '2. Workspace & Environment Configuration',
          duration: 1200,
          order: 2,
          isPreview: false,
          type: 'VIDEO',
          videoSource: 'YOUTUBE',
          videoStatus: 'READY',
          youtubeVideoId: 'bMknfKXIFA8',
        },
      ],
    },
  ]);

  // Learning outcomes
  const [learningOutcomes, setLearningOutcomes] = useState(['Master full-stack software architecture', 'Build portfolio-ready projects']);
  const [newOutcome, setNewOutcome] = useState('');

  // Fetch categories
  const { data: categoryData, isLoading: isLoadingCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => courseApi.getCategories(),
  });

  const categories = categoryData?.data || [];

  // Fetch course for editing
  const { data: existingCourseData, isLoading: isLoadingCourse } = useQuery({
    queryKey: ['course-edit', id],
    queryFn: () => courseApi.getCourseById(id!),
    enabled: isEditMode,
  });

  const existingCourse = existingCourseData?.data;

  // Pre-fill form when existingCourse is loaded
  useEffect(() => {
    if (existingCourse) {
      setTitle(existingCourse.title || '');
      setShortDescription(existingCourse.shortDescription || '');
      setDescription(existingCourse.description || '');
      setType(existingCourse.type || 'COURSE');
      const catId = typeof existingCourse.category === 'object' && existingCourse.category?._id
        ? existingCourse.category._id
        : typeof existingCourse.category === 'string'
        ? existingCourse.category
        : '';
      setCategory(catId);
      setLevel(existingCourse.level || 'BEGINNER');
      setPrice(existingCourse.price !== undefined ? existingCourse.price.toString() : '0');
      setThumbnail(existingCourse.thumbnail || '');
      setStartDate(existingCourse.startDate ? new Date(existingCourse.startDate).toISOString().slice(0, 16) : '');
      setMeetingUrl(existingCourse.meetingUrl || '');
      setCapacity(existingCourse.capacity !== undefined ? existingCourse.capacity.toString() : '100');
      if (existingCourse.curriculum && existingCourse.curriculum.length > 0) {
        setModules(existingCourse.curriculum);
      }
      if (existingCourse.learningOutcomes && existingCourse.learningOutcomes.length > 0) {
        setLearningOutcomes(existingCourse.learningOutcomes);
      }
    }
  }, [existingCourse]);

  useEffect(() => {
    if (!isEditMode && categories.length > 0 && !category) {
      setCategory(categories[0]._id);
    }
  }, [categories, category, isEditMode]);

  const createMutation = useMutation({
    mutationFn: (data: any) => courseApi.createCourse(data),
    onSuccess: (res: any) => {
      const isPublished = res?.data?.status === 'PUBLISHED';
      addToast('success', isPublished ? '🎉 Course published live successfully!' : 'Course draft saved successfully!');
      queryClient.invalidateQueries({ queryKey: ['instructor-analytics'] });
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
      navigate('/instructor');
    },
    onError: (err: any) => {
      addToast('error', err.response?.data?.message || 'Failed to create course.');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => courseApi.updateCourse(id!, data),
    onSuccess: (res: any) => {
      const isPublished = res?.data?.status === 'PUBLISHED';
      addToast('success', isPublished ? '🎉 Course updated and published live!' : 'Course updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['instructor-analytics'] });
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
      queryClient.invalidateQueries({ queryKey: ['course-edit', id] });
      navigate('/instructor');
    },
    onError: (err: any) => {
      addToast('error', err.response?.data?.message || 'Failed to update course.');
    },
  });

  const handleAddModule = () => {
    setModules((prev) => [
      ...prev,
      {
        title: `Module ${prev.length + 1}: New Module Title`,
        order: prev.length + 1,
        lessons: [{ title: 'Lesson 1', duration: 900, order: 1, isPreview: false, type: 'VIDEO' }],
      },
    ]);
  };

  const handleAddOutcome = () => {
    if (newOutcome.trim()) {
      setLearningOutcomes((prev) => [...prev, newOutcome.trim()]);
      setNewOutcome('');
    }
  };

  const handleSubmitCourse = (publishDirectly: boolean = false) => {
    if (!title || !shortDescription || !description || !category) {
      addToast('error', 'Please fill in all required basic fields.');
      setStep(1);
      return;
    }

    const payload = {
      title,
      shortDescription,
      description,
      type,
      category,
      level,
      status: publishDirectly ? 'PUBLISHED' : 'DRAFT',
      price: parseFloat(price) || 0,
      thumbnail,
      curriculum: modules,
      learningOutcomes,
      skills: ['TypeScript', 'Full-Stack', 'Node.js'],
      ...(type === 'WORKSHOP' ? { startDate, meetingUrl, capacity: parseInt(capacity, 10) } : {}),
    };

    if (isEditMode) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="flex min-h-[calc(100vh-5rem)] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 gap-8">
      <Sidebar type="instructor" />

      <main className="flex-1 space-y-8 max-w-4xl">
        <div className="border-b border-slate-800 pb-4">
          <h1 className="text-2xl font-bold text-white">
            {isEditMode ? `Edit Course: ${title || 'Loading...'}` : 'Multi-Step Course Creation Wizard'}
          </h1>
          <p className="text-xs text-slate-400">
            {isEditMode
              ? `Step ${step} of 5 — Update specifications, pricing, and curriculum modules.`
              : `Step ${step} of 5 — Author course specifications, pricing, and curriculum modules.`}
          </p>
        </div>

        {/* Step Indicator Bar */}
        <div className="flex items-center justify-between glass-panel p-3 rounded-2xl border border-slate-800 text-xs font-semibold">
          {[
            { id: 1, label: '1. Basic Info' },
            { id: 2, label: '2. Pricing & Schedule' },
            { id: 3, label: '3. Curriculum Builder' },
            { id: 4, label: '4. Outcomes' },
            { id: 5, label: '5. Review & Publish' },
          ].map((item) => (
            <div
              key={item.id}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                step === item.id
                  ? 'bg-brand-600 text-white shadow-glow-blue'
                  : step > item.id
                  ? 'text-emerald-400 font-bold'
                  : 'text-slate-400'
              }`}
            >
              {item.label}
            </div>
          ))}
        </div>

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-5">
            <h2 className="text-lg font-bold text-white mb-2">Step 1: Course Basic Information</h2>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">Course Title *</label>
                <span className="text-[10px] text-slate-500 font-mono">Required</span>
              </div>
              <input
                type="text"
                placeholder="e.g. Master Production Node.js & Microservices"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={`w-full bg-slate-900 border ${!title.trim() && step > 1 ? 'border-rose-500' : 'border-slate-800 focus:border-brand-500'} text-slate-200 text-sm rounded-xl px-4 py-2.5 transition-all`}
              />
              {/* Real-time slug generation preview */}
              <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1 pt-0.5">
                <span className="text-slate-500">Live URL Slug:</span>
                <span className="text-cyan-400 font-semibold">
                  /courses/{title ? title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') : 'your-course-slug'}
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">Short Description (Tagline) *</label>
                <span className="text-[10px] text-slate-500 font-mono">Required</span>
              </div>
              <input
                type="text"
                placeholder="Brief 1-2 sentence compelling summary for catalog cards..."
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 focus:border-brand-500 text-slate-200 text-sm rounded-xl px-4 py-2.5 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">Full Curriculum Description *</label>
                <span className="text-[10px] text-slate-500 font-mono">Required (min 20 chars)</span>
              </div>
              <textarea
                rows={4}
                placeholder="Detailed curriculum overview, prerequisites, target audience, and architecture..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 focus:border-brand-500 text-slate-200 text-sm rounded-xl p-4 transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Type Format</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-sm rounded-xl px-3 py-2.5"
                >
                  <option value="COURSE">Standard Course</option>
                  <option value="WORKSHOP">Live Workshop</option>
                  <option value="BOOTCAMP">Bootcamp</option>
                  <option value="WEBINAR">Webinar</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  disabled={isLoadingCategories}
                  className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-brand-500"
                >
                  <option value="">{isLoadingCategories ? 'Loading categories...' : 'Select Category'}</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Level</label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-sm rounded-xl px-3 py-2.5"
                >
                  <option value="BEGINNER">Beginner</option>
                  <option value="INTERMEDIATE">Intermediate</option>
                  <option value="ADVANCED">Advanced</option>
                  <option value="ALL_LEVELS">All Levels</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Pricing & Workshop Schedule */}
        {step === 2 && (
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <h2 className="text-lg font-bold text-white mb-4">Step 2: Pricing & Schedule</h2>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Enrollment Price ($ USD) *</label>
              <input
                type="number"
                placeholder="49"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-sm rounded-xl px-4 py-2.5"
              />
            </div>

            {type === 'WORKSHOP' && (
              <div className="space-y-4 pt-4 border-t border-slate-800">
                <h3 className="text-sm font-bold text-cyan-400">Live Workshop Specific Fields</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Start Date & Time *</label>
                    <input
                      type="datetime-local"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-sm rounded-xl px-4 py-2.5"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Live Meeting URL (e.g. Zoom)</label>
                    <input
                      type="text"
                      placeholder="https://zoom.us/j/..."
                      value={meetingUrl}
                      onChange={(e) => setMeetingUrl(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-sm rounded-xl px-4 py-2.5"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Curriculum Builder */}
        {step === 3 && (
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">Step 3: Curriculum & Multi-Source Video Lessons</h2>
                <p className="text-xs text-slate-400">
                  Structure modules and configure lessons using YouTube embeds, direct Cloudinary uploads, or live browser recording.
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={handleAddModule} leftIcon={<Plus className="w-4 h-4" />}>
                Add Module
              </Button>
            </div>

            <div className="space-y-6">
              {modules.map((mod, modIdx) => (
                <div key={modIdx} className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-md">
                  <div className="flex items-center justify-between gap-3">
                    <input
                      type="text"
                      value={mod.title}
                      onChange={(e) => {
                        const updated = [...modules];
                        updated[modIdx].title = e.target.value;
                        setModules(updated);
                      }}
                      className="flex-1 bg-slate-950 border border-slate-800 focus:border-brand-500 font-bold text-sm text-brand-300 rounded-xl px-3.5 py-2"
                      placeholder="Module Title..."
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const updated = [...modules];
                        updated[modIdx].lessons.push({
                          title: `New Lesson ${updated[modIdx].lessons.length + 1}`,
                          duration: 600,
                          order: updated[modIdx].lessons.length + 1,
                          isPreview: false,
                          type: 'VIDEO',
                          videoSource: 'YOUTUBE',
                          videoStatus: 'READY',
                          youtubeVideoId: 'Oe421EPjeBE',
                        });
                        setModules(updated);
                      }}
                      leftIcon={<Plus className="w-3.5 h-3.5" />}
                    >
                      Add Lesson
                    </Button>
                  </div>

                  {/* Lessons List in Module */}
                  <div className="space-y-3 pl-2 sm:pl-4 border-l-2 border-slate-800">
                    {mod.lessons.map((lesson, lIdx) => {
                      const lessonKey = `${modIdx}-${lIdx}`;
                      const isEditingVideo = editingLessonKey === lessonKey;

                      return (
                        <div
                          key={lIdx}
                          className="rounded-xl bg-slate-950/80 border border-slate-800/90 p-4 space-y-3 transition-all hover:border-slate-700"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-2 flex-1">
                              <span className="text-xs font-mono text-slate-500 font-bold shrink-0">
                                {modIdx + 1}.{lIdx + 1}
                              </span>
                              <input
                                type="text"
                                value={lesson.title}
                                onChange={(e) => {
                                  const updated = [...modules];
                                  updated[modIdx].lessons[lIdx].title = e.target.value;
                                  setModules(updated);
                                }}
                                className="flex-1 bg-slate-900 border border-slate-800 focus:border-brand-500 text-xs font-semibold text-white rounded-lg px-3 py-1.5"
                                placeholder="Lesson Title..."
                              />
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <select
                                value={lesson.type}
                                onChange={(e) => {
                                  const updated = [...modules];
                                  updated[modIdx].lessons[lIdx].type = e.target.value as any;
                                  setModules(updated);
                                }}
                                className="bg-slate-900 border border-slate-800 text-[11px] font-semibold text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none"
                              >
                                <option value="VIDEO">Video</option>
                                <option value="ARTICLE">Article</option>
                                <option value="QUIZ">Quiz</option>
                              </select>

                              {lesson.type === 'VIDEO' && (
                                <Badge
                                  variant={
                                    lesson.videoSource === 'YOUTUBE'
                                      ? 'rose'
                                      : lesson.videoSource === 'CLOUDINARY'
                                      ? 'cyan'
                                      : 'gray'
                                  }
                                  size="sm"
                                >
                                  {lesson.videoSource || 'NO SOURCE'}
                                </Badge>
                              )}

                              {lesson.type === 'VIDEO' && (
                                <Button
                                  type="button"
                                  variant="secondary"
                                  size="sm"
                                  onClick={() =>
                                    setEditingLessonKey(isEditingVideo ? null : lessonKey)
                                  }
                                  rightIcon={
                                    isEditingVideo ? (
                                      <ChevronUp className="w-3.5 h-3.5" />
                                    ) : (
                                      <ChevronDown className="w-3.5 h-3.5" />
                                    )
                                  }
                                >
                                  {isEditingVideo ? 'Close Media' : 'Configure Video'}
                                </Button>
                              )}

                              <button
                                type="button"
                                onClick={() => {
                                  const updated = [...modules];
                                  updated[modIdx].lessons.splice(lIdx, 1);
                                  setModules(updated);
                                }}
                                className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Expandable Lesson Video Manager */}
                          {isEditingVideo && lesson.type === 'VIDEO' && (
                            <div className="pt-3 border-t border-slate-800 animate-in fade-in slide-in-from-top-2">
                              <LessonVideoManager
                                initialSource={lesson.videoSource}
                                initialYoutubeId={lesson.youtubeVideoId}
                                initialCloudinaryUrl={lesson.cloudinaryUrl}
                                initialDuration={lesson.duration}
                                onVideoConfigured={(videoData) => {
                                  const updated = [...modules];
                                  updated[modIdx].lessons[lIdx] = {
                                    ...updated[modIdx].lessons[lIdx],
                                    ...videoData,
                                  };
                                  setModules(updated);
                                }}
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Outcomes */}
        {step === 4 && (
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <h2 className="text-lg font-bold text-white mb-4">Step 4: Learning Outcomes</h2>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. Master clean TypeScript architecture"
                value={newOutcome}
                onChange={(e) => setNewOutcome(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-800 text-slate-200 text-sm rounded-xl px-4 py-2.5"
              />
              <Button variant="secondary" onClick={handleAddOutcome}>
                Add
              </Button>
            </div>

            <div className="space-y-2 pt-2">
              {learningOutcomes.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs text-slate-200 p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 5: Review & Publish */}
        {step === 5 && (
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6">
            <h2 className="text-lg font-bold text-white">Step 5: Final Review</h2>
            <div className="space-y-2 text-sm text-slate-300">
              <p><strong>Title:</strong> {title || 'Untitled'}</p>
              <p><strong>Format:</strong> {type}</p>
              <p><strong>Price:</strong> ${price}</p>
              <p><strong>Modules:</strong> {modules.length} modules configured</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                variant="primary"
                size="lg"
                className="flex-1 shadow-glow-blue"
                isLoading={isSaving}
                onClick={() => handleSubmitCourse(true)}
                leftIcon={<CheckCircle2 className="w-5 h-5" />}
              >
                {isEditMode ? 'Update & Publish Live' : 'Publish Course Live'}
              </Button>
              <Button
                variant="secondary"
                size="lg"
                className="flex-1"
                isLoading={isSaving}
                onClick={() => handleSubmitCourse(false)}
              >
                {isEditMode ? 'Save Changes as Draft' : 'Save as Draft'}
              </Button>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-4">
          <Button
            variant="secondary"
            disabled={step <= 1}
            onClick={() => setStep((s) => s - 1)}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            Back
          </Button>

          {step < 5 && (
            <Button variant="primary" onClick={() => setStep((s) => s + 1)} rightIcon={<ArrowRight className="w-4 h-4" />}>
              Next Step
            </Button>
          )}
        </div>
      </main>
    </div>
  );
};
