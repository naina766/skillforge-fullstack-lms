import React from 'react';
import { MapPin, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { LearningPathPhase } from '../../types';

interface LearningPathTimelineProps {
  phases: LearningPathPhase[];
}

export const LearningPathTimeline: React.FC<LearningPathTimelineProps> = ({ phases }) => {
  if (!phases || phases.length === 0) return null;

  return (
    <div className="space-y-3 pt-2">
      <div className="flex items-center gap-2 text-xs font-bold text-brand-400 uppercase tracking-wider">
        <MapPin className="w-4 h-4 text-brand-400" />
        <span>Visual Learning Path Roadmap</span>
      </div>

      <div className="relative pl-6 border-l-2 border-brand-500/30 space-y-4">
        {phases.map((phase, idx) => (
          <motion.div
            key={phase.phase}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25, delay: idx * 0.08 }}
            className="relative p-4 rounded-2xl glass-card border border-slate-800 space-y-2 group hover:border-brand-500/40 transition-all"
          >
            {/* Timeline Circle Bullet */}
            <div className="absolute -left-[31px] top-4 w-4 h-4 rounded-full bg-slate-900 border-2 border-brand-500 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-400" />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-brand-400 font-mono tracking-widest uppercase">
                PHASE 0{phase.phase}
              </span>
            </div>

            <h4 className="text-sm font-bold text-white group-hover:text-brand-300 transition-colors">
              {phase.title}
            </h4>

            {phase.skills && phase.skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {phase.skills.map((skill, sIdx) => (
                  <span
                    key={sIdx}
                    className="text-[11px] px-2 py-0.5 rounded-lg bg-slate-800/80 border border-slate-700/50 text-slate-300 font-mono"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};
