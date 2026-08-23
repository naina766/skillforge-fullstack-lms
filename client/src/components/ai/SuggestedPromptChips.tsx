import React from 'react';
import { Lightbulb } from 'lucide-react';

interface SuggestedPromptChipsProps {
  onSelectPrompt: (promptText: string) => void;
}

export const SuggestedPromptChips: React.FC<SuggestedPromptChipsProps> = ({ onSelectPrompt }) => {
  const chips = [
    'MERN Stack Roadmap',
    'AI Engineer Career Path',
    'Senior Backend Engineer',
    'System Design Preparation',
    'DevOps Container Plan',
    'Software Interview Prep',
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
        <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
        <span>Suggested Starters</span>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar scroll-smooth">
        {chips.map((chip, idx) => (
          <button
            key={idx}
            onClick={() => onSelectPrompt(chip)}
            className="shrink-0 text-xs px-3.5 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-brand-500/50 text-slate-300 hover:text-white transition-all hover:bg-slate-800 shadow-sm"
          >
            {chip}
          </button>
        ))}
      </div>
    </div>
  );
};
