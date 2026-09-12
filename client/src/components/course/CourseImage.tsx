import React, { useState } from 'react';
import { Course } from '../../types';
import {
  Sparkles,
  Code,
  Cloud,
  Cpu,
  Database,
  Shield,
  Figma,
  Smartphone,
  Layers,
  Globe,
  Briefcase,
  BookOpen,
} from 'lucide-react';

interface CourseImageProps {
  course: Partial<Course> & { title: string };
  className?: string;
  imgClassName?: string;
  alt?: string;
  aspectRatio?: string;
}

export const CourseImage: React.FC<CourseImageProps> = ({
  course,
  className = '',
  imgClassName = '',
  alt,
  aspectRatio = 'aspect-video',
}) => {
  const [hasError, setHasError] = useState(false);

  // Category Icon Resolver for Stylized Fallback
  const getCategoryIcon = (categoryName?: string) => {
    const cat = (categoryName || '').toLowerCase();
    if (cat.includes('web') || cat.includes('frontend') || cat.includes('backend')) return <Code className="w-8 h-8 text-cyan-400" />;
    if (cat.includes('cloud') || cat.includes('devops')) return <Cloud className="w-8 h-8 text-blue-400" />;
    if (cat.includes('ai') || cat.includes('machine learning') || cat.includes('generative')) return <Cpu className="w-8 h-8 text-purple-400" />;
    if (cat.includes('data')) return <Database className="w-8 h-8 text-emerald-400" />;
    if (cat.includes('security') || cat.includes('cyber')) return <Shield className="w-8 h-8 text-rose-400" />;
    if (cat.includes('design') || cat.includes('ui') || cat.includes('ux') || cat.includes('figma')) return <Figma className="w-8 h-8 text-pink-400" />;
    if (cat.includes('mobile') || cat.includes('react native') || cat.includes('flutter')) return <Smartphone className="w-8 h-8 text-amber-400" />;
    if (cat.includes('blockchain') || cat.includes('web3') || cat.includes('solidity')) return <Globe className="w-8 h-8 text-indigo-400" />;
    if (cat.includes('bootcamp') || cat.includes('career')) return <Briefcase className="w-8 h-8 text-yellow-400" />;
    return <Sparkles className="w-8 h-8 text-brand-400" />;
  };

  const getDomainGradient = (title: string, categoryName?: string) => {
    const text = `${title} ${categoryName || ''}`.toLowerCase();
    if (text.includes('ai') || text.includes('llm') || text.includes('gemini')) {
      return 'from-purple-950 via-slate-900 to-brand-950 border-purple-500/30';
    }
    if (text.includes('node') || text.includes('backend') || text.includes('microservices')) {
      return 'from-emerald-950 via-slate-900 to-slate-950 border-emerald-500/30';
    }
    if (text.includes('react') || text.includes('frontend') || text.includes('tanstack')) {
      return 'from-cyan-950 via-slate-900 to-blue-950 border-cyan-500/30';
    }
    if (text.includes('docker') || text.includes('kubernetes') || text.includes('cloud') || text.includes('devops')) {
      return 'from-blue-950 via-slate-900 to-indigo-950 border-blue-500/30';
    }
    if (text.includes('cyber') || text.includes('security')) {
      return 'from-rose-950 via-slate-900 to-slate-950 border-rose-500/30';
    }
    return 'from-brand-950 via-slate-900 to-dark-950 border-brand-500/30';
  };

  // Image Source Resolution
  let rawSrc = course.thumbnail || '';

  // Cloudinary Cloud Name Resolution if stored as public ID
  if (rawSrc && !rawSrc.startsWith('http') && !rawSrc.startsWith('/')) {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dkta4gfdh';
    rawSrc = `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_auto,w_800/${rawSrc}`;
  }

  const categoryName = typeof course.category === 'object' ? course.category?.name : course.category;

  if (hasError || !rawSrc) {
    return (
      <div
        className={`relative ${aspectRatio} w-full rounded-2xl bg-gradient-to-br ${getDomainGradient(
          course.title,
          categoryName
        )} border p-6 flex flex-col justify-between overflow-hidden shadow-inner select-none ${className}`}
      >
        {/* Glow ambient background lights */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between z-10">
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 shadow-md">
            {getCategoryIcon(categoryName)}
          </div>
          {categoryName && (
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider bg-slate-900/70 border border-slate-800 px-2.5 py-1 rounded-lg">
              {categoryName}
            </span>
          )}
        </div>

        <div className="z-10 space-y-1">
          <div className="text-xs font-mono text-brand-400 font-semibold tracking-wider uppercase">
            SkillForge Masterclass
          </div>
          <h4 className="text-sm sm:text-base font-extrabold text-white line-clamp-2 leading-snug">
            {course.title}
          </h4>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${aspectRatio} w-full rounded-2xl bg-slate-900 overflow-hidden border border-slate-800 ${className}`}>
      <img
        src={rawSrc}
        alt={alt || course.title}
        loading="lazy"
        onError={() => setHasError(true)}
        className={`w-full h-full object-cover transition-transform duration-500 ease-out ${imgClassName}`}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-dark-950/60 via-transparent to-transparent pointer-events-none" />
    </div>
  );
};
