import React from 'react';
import { Code2, Layers } from 'lucide-react';
import { AIProjectItem } from '../../types';

interface ProjectBlueprintGridProps {
  projects: AIProjectItem[];
}

export const ProjectBlueprintGrid: React.FC<ProjectBlueprintGridProps> = ({ projects }) => {
  if (!projects || projects.length === 0) return null;

  return (
    <div className="space-y-3 pt-2 border-t border-slate-800/80">
      <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
        <Code2 className="w-4 h-4" />
        <span>Portfolio Project Blueprints</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {projects.map((proj, idx) => (
          <div
            key={idx}
            className="p-4 rounded-2xl glass-card border border-slate-800 space-y-2 hover:border-amber-500/30 transition-all"
          >
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400 shrink-0" />
              <h5 className="text-xs font-bold text-slate-100">{proj.title}</h5>
            </div>

            <div className="flex flex-wrap gap-1 pt-1">
              {proj.skills.map((s, sIdx) => (
                <span key={sIdx} className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 font-mono">
                  {s}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
