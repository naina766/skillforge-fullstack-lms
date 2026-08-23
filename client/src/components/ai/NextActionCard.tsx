import React from 'react';
import { ArrowRight, Zap } from 'lucide-react';

interface NextActionCardProps {
  actionText: string;
}

export const NextActionCard: React.FC<NextActionCardProps> = ({ actionText }) => {
  if (!actionText) return null;

  return (
    <div className="p-4 rounded-2xl bg-gradient-to-r from-brand-950/60 via-dark-900 to-indigo-950/40 border border-brand-500/30 flex items-center justify-between gap-4 text-xs shadow-lg">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-brand-500/20 border border-brand-400/30 text-brand-300 flex items-center justify-center shrink-0">
          <Zap className="w-4 h-4" />
        </div>
        <div className="space-y-0.5">
          <span className="text-[10px] text-brand-400 font-bold uppercase tracking-wider block">Immediate Next Best Action</span>
          <p className="text-slate-200 font-bold leading-snug">{actionText}</p>
        </div>
      </div>

      <ArrowRight className="w-4 h-4 text-brand-400 shrink-0" />
    </div>
  );
};
