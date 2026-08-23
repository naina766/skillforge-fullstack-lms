import React, { useState } from 'react';
import { AIMentorStructuredResponse } from '../../types';
import { CareerAssessmentPanel } from './CareerAssessmentPanel';
import { SkillGapBadges } from './SkillGapBadges';
import { LearningPathTimeline } from './LearningPathTimeline';
import { ProjectBlueprintGrid } from './ProjectBlueprintGrid';
import { NextActionCard } from './NextActionCard';
import { CourseCard } from '../course/CourseCard';
import { Badge } from '../ui/Badge';
import { aiApi } from '../../api/aiApi';
import { Copy, Check, Sparkles, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface AIMessageRendererProps {
  response: AIMentorStructuredResponse;
}

const MarkdownParagraph: React.FC<{ text: string }> = ({ text }) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const lines = text.split('\n');

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="space-y-2">
      {lines.map((line, idx) => {
        const trimmed = line.trim();

        if (trimmed.startsWith('### ')) {
          return (
            <h3 key={idx} className="text-sm font-extrabold text-brand-400 mt-4 mb-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              {trimmed.replace('### ', '')}
            </h3>
          );
        }

        if (trimmed.startsWith('```')) {
          const codeSnippet = trimmed.replace(/```[a-z]*/, '').replace(/```/, '');
          if (!codeSnippet) return null;
          return (
            <div key={idx} className="relative rounded-xl bg-slate-950 border border-slate-800 p-3 font-mono text-xs text-cyan-300 my-2 overflow-x-auto">
              <button
                onClick={() => copyToClipboard(codeSnippet)}
                className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors text-[10px] flex items-center gap-1"
              >
                {copiedCode === codeSnippet ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400 font-bold">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
              <pre>{codeSnippet}</pre>
            </div>
          );
        }

        if (trimmed.startsWith('- ')) {
          const parts = trimmed.replace('- ', '').split('**');
          return (
            <li key={idx} className="text-xs text-slate-300 ml-4 list-disc space-x-1">
              {parts.map((p, i) =>
                i % 2 === 1 ? (
                  <strong key={i} className="font-bold text-white">
                    {p}
                  </strong>
                ) : (
                  <span key={i}>{p}</span>
                )
              )}
            </li>
          );
        }

        if (trimmed === '') return null;

        const boldParts = trimmed.split('**');
        return (
          <p key={idx} className="text-xs sm:text-sm text-slate-200 leading-relaxed">
            {boldParts.map((p, i) =>
              i % 2 === 1 ? (
                <strong key={i} className="font-bold text-white">
                  {p}
                </strong>
              ) : (
                <span key={i}>{p}</span>
              )
            )}
          </p>
        );
      })}
    </div>
  );
};

export const AIMessageRenderer: React.FC<AIMessageRendererProps> = ({ response }) => {
  const handleCourseClick = (courseId: string) => {
    aiApi.trackRecommendationClick(courseId);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25 }}
      className="p-6 rounded-3xl glass-panel border border-slate-800 space-y-6 rounded-tl-none text-slate-200 shadow-xl max-w-3xl"
    >
      {/* 1. Main Text Guidance */}
      <MarkdownParagraph text={response.message} />

      {/* 2. Bento Career Assessment */}
      {response.careerAssessment && (
        <CareerAssessmentPanel assessment={response.careerAssessment} />
      )}

      {/* 3. Identified Skill Gaps */}
      {response.skillGaps && response.skillGaps.length > 0 && (
        <SkillGapBadges gaps={response.skillGaps} />
      )}

      {/* 4. Visual Learning Path Roadmap Timeline */}
      {response.learningPath && response.learningPath.length > 0 && (
        <LearningPathTimeline phases={response.learningPath} />
      )}

      {/* 5. Verified Catalog Recommendation Cards (Hydrated from MongoDB) */}
      {response.recommendations && response.recommendations.length > 0 && (
        <div className="space-y-3 pt-2 border-t border-slate-800/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              Verified SkillForge Catalog Recommendations
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Canonical MongoDB Data</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {response.recommendations.map((item, idx) => (
              <div key={idx} className="space-y-2" onClick={() => handleCourseClick(item.course._id)}>
                {/* Explainable Recommendation Callout */}
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-emerald-500/20 text-[11px] space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>Why SkillForge Recommends This</span>
                    </div>
                    <Badge variant={item.priority === 'HIGH' ? 'emerald' : 'cyan'} size="sm">
                      {item.priority} MATCH
                    </Badge>
                  </div>
                  <p className="text-slate-300 leading-snug">{item.matchReason}</p>
                </div>

                <CourseCard course={item.course} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. Portfolio Projects */}
      {response.projects && response.projects.length > 0 && (
        <ProjectBlueprintGrid projects={response.projects} />
      )}

      {/* 7. Immediate Next Best Action */}
      {response.nextAction && (
        <NextActionCard actionText={response.nextAction} />
      )}
    </motion.div>
  );
};
