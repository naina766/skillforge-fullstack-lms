import React from 'react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Sparkles, Trash2, Bot } from 'lucide-react';
import { motion } from 'framer-motion';

interface AIMentorHeaderProps {
  onClearChat: () => void;
  isGenerating?: boolean;
}

export const AIMentorHeader: React.FC<AIMentorHeaderProps> = ({ onClearChat, isGenerating = false }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-4 sm:p-6 rounded-3xl border border-slate-800/80 shadow-xl">
      <div className="flex items-center gap-3.5">
        {/* Animated AI Avatar */}
        <div className="relative">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-600 via-cyan-500 to-purple-500 text-white flex items-center justify-center shadow-glow-blue shrink-0">
            <Bot className="w-6 h-6" />
          </div>
          {/* Status Dot */}
          <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isGenerating ? 'bg-amber-400' : 'bg-emerald-400'}`} />
            <span className={`relative inline-flex rounded-full h-3.5 w-3.5 ${isGenerating ? 'bg-amber-500' : 'bg-emerald-500'} border-2 border-dark-950`} />
          </span>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black tracking-tight text-white">SkillForge AI Career Mentor</h1>
            <Badge variant="cyan" size="sm">
              <Sparkles className="w-3 h-3" /> Catalog Grounded
            </Badge>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Your senior engineering advisor — career blueprints, skill gaps, & verified program roadmaps.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearChat}
          leftIcon={<Trash2 className="w-4 h-4 text-slate-400" />}
          className="text-slate-400 hover:text-rose-400"
        >
          Clear Chat
        </Button>
      </div>
    </div>
  );
};
