import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { courseApi } from '../../api/courseApi';
import { Sidebar } from '../../components/layout/Sidebar';
import { Button } from '../../components/ui/Button';
import { useUIStore } from '../../store/useUIStore';
import { Plus, Trash2, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';

export const CourseEditorPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { addToast } = useUIStore();
  const [step, setStep] = useState(1);

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
  const [modules, setModules] = useState([
    {
      title: 'Module 1: Introduction & Environment Setup',
      order: 1,
      lessons: [
        { title: '1. Orientation & Project Overview', duration: 600, order: 1, isPreview: true, type: 'VIDEO' as const },
        { title: '2. Workspace & Environment Configuration', duration: 1200, order: 2, isPreview: false, type: 'VIDEO' as const },
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

  React.useEffect(() => {
    if (categories.length > 0 && !category) {
      setCategory(categories[0]._id);
    }
  }, [categories, category]);

  const createMutation = useMutation({
    mutationFn: (data: any) => courseApi.createCourse(data),
    onSuccess: () => {
      addToast('success', 'Course draft created successfully!');
      queryClient.invalidateQueries({ queryKey: ['instructor-analytics'] });
      navigate('/instructor');
    },
    onError: (err: any) => {
      addToast('error', err.response?.data?.message || 'Failed to create course.');
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

  const handleSubmitCourse = () => {
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
      price: parseFloat(price) || 0,
      thumbnail,
      curriculum: modules,
      learningOutcomes,
      skills: ['TypeScript', 'Full-Stack', 'Node.js'],
      ...(type === 'WORKSHOP' ? { startDate, meetingUrl, capacity: parseInt(capacity, 10) } : {}),
    };

    createMutation.mutate(payload);
  };

  return (
    <div className="flex min-h-[calc(100vh-5rem)] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 gap-8">
      <Sidebar type="instructor" />

      <main className="flex-1 space-y-8 max-w-4xl">
        <div className="border-b border-slate-800 pb-4">
          <h1 className="text-2xl font-bold text-white">Multi-Step Course Creation Wizard</h1>
          <p className="text-xs text-slate-400">Step {step} of 5 — Author course specifications, pricing, and curriculum modules.</p>
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
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <h2 className="text-lg font-bold text-white mb-4">Step 1: Course Basic Information</h2>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Course Title *</label>
              <input
                type="text"
                placeholder="e.g. Master Production Node.js & Microservices"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-sm rounded-xl px-4 py-2.5"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Short Description *</label>
              <input
                type="text"
                placeholder="Brief 1-2 sentence tagline..."
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-sm rounded-xl px-4 py-2.5"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Full Description *</label>
              <textarea
                rows={4}
                placeholder="Detailed curriculum overview and prerequisites..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-sm rounded-xl p-4"
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
              <h2 className="text-lg font-bold text-white">Step 3: Curriculum & Lesson Modules</h2>
              <Button variant="outline" size="sm" onClick={handleAddModule} leftIcon={<Plus className="w-4 h-4" />}>
                Add Module
              </Button>
            </div>

            <div className="space-y-4">
              {modules.map((mod, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                  <h3 className="text-sm font-bold text-brand-400">{mod.title}</h3>
                  <div className="space-y-2 pl-4 border-l-2 border-slate-800">
                    {mod.lessons.map((lesson, lIdx) => (
                      <div key={lIdx} className="text-xs text-slate-300 font-medium">
                        • {lesson.title} ({Math.round(lesson.duration / 60)} mins)
                      </div>
                    ))}
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

            <Button
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={createMutation.isPending}
              onClick={handleSubmitCourse}
            >
              Create Course Draft
            </Button>
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
