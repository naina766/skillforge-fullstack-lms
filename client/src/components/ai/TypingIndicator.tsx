import React from 'react';
import { Bot } from 'lucide-react';
import { motion } from 'framer-motion';

export const TypingIndicator: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      className="flex items-center gap-3"
    >
      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-cyan-500 text-white flex items-center justify-center shrink-0 shadow-glow-blue">
        <Bot className="w-4 h-4" />
      </div>

      <div className="p-3.5 rounded-2xl glass-card border border-slate-800 text-slate-400 flex items-center gap-2 text-xs">
        <span>SkillForge AI is analyzing course catalogs</span>
        <span className="flex gap-1 items-center ml-1">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: '300ms' }} />
        </span>
      </div>
    </motion.div>
  );
};
