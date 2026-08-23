import React from 'react';
import { AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface SkillGapBadgesProps {
  gaps: string[];
}

export const SkillGapBadges: React.FC<SkillGapBadgesProps> = ({ gaps }) => {
  if (!gaps || gaps.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
        <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
        <span>Identified Skill Gaps</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {gaps.map((gap, idx) => (
          <motion.span
            key={idx}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2, delay: idx * 0.04 }}
            className="text-xs px-2.5 py-1 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 font-semibold flex items-center gap-1.5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            {gap}
          </motion.span>
        ))}
      </div>
    </div>
  );
};
