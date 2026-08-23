import React from 'react';
import { Target, Compass } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { CareerAssessment } from '../../types';

interface CareerAssessmentPanelProps {
  assessment: CareerAssessment;
}

export const CareerAssessmentPanel: React.FC<CareerAssessmentPanelProps> = ({ assessment }) => {
  return (
    <div className="p-4 rounded-2xl glass-card border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-brand-950/20">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
          <Target className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Assessed Career Target</span>
          <h4 className="text-sm font-bold text-white leading-snug">{assessment.targetRole}</h4>
        </div>
      </div>

      <div className="flex items-center gap-2 self-start sm:self-center">
        <span className="text-[10px] text-slate-400 font-medium">Assessed Level:</span>
        <Badge variant={assessment.level === 'ADVANCED' ? 'purple' : assessment.level === 'INTERMEDIATE' ? 'blue' : 'emerald'}>
          {assessment.level}
        </Badge>
      </div>
    </div>
  );
};
