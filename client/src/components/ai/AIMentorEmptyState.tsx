import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Code2, Server, Cloud, Cpu, Target, ArrowRight } from 'lucide-react';

interface AIMentorEmptyStateProps {
  onSelectPrompt: (promptText: string) => void;
}

export const AIMentorEmptyState: React.FC<AIMentorEmptyStateProps> = ({ onSelectPrompt }) => {
  const promptCards = [
    {
      icon: Code2,
      title: 'Build my MERN roadmap',
      description: 'Step-by-step full-stack roadmap from React fundamentals to production Node.js APIs.',
      prompt: 'Create a comprehensive MERN stack career roadmap for me.',
      badge: 'Full Stack',
    },
    {
      icon: Server,
      title: 'Senior Backend Engineer',
      description: 'Analyze skill gaps in microservices, JWT session rotation, and database indexing.',
      prompt: 'Analyze my skills to become a Senior Backend Engineer.',
      badge: 'Backend Architecture',
    },
    {
      icon: Cloud,
      title: '30-Day DevOps & Cloud Plan',
      description: 'Containerization, Docker multi-stage builds, and GitHub Actions CI/CD pipelines.',
      prompt: 'Create a 30-day cloud & DevOps learning plan.',
      badge: 'DevOps',
    },
    {
      icon: Cpu,
      title: 'AI & Data Engineering',
      description: 'Integrate Gemini LLM APIs, prompt engineering, and Python analytics pipelines.',
      prompt: 'What should I learn to become an AI Engineer?',
      badge: 'AI / Data',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="py-8 px-4 space-y-8 max-w-4xl mx-auto text-center"
    >
      {/* Identity Banner */}
      <div className="space-y-3">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-brand-600 via-cyan-500 to-purple-500 text-white flex items-center justify-center shadow-glow-blue mx-auto mb-2">
          <Sparkles className="w-8 h-8" />
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Build the career you're aiming for.
        </h2>
        <p className="text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
          Tell me your target role, current skills, or what you're struggling with. I will analyze your skill gaps and generate a visual learning path grounded in SkillForge's catalog.
        </p>
      </div>

      {/* Bento Prompt Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left pt-2">
        {promptCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <motion.button
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.08 }}
              whileHover={{ y: -3, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelectPrompt(card.prompt)}
              className="p-5 rounded-2xl glass-card border border-slate-800/80 hover:border-brand-500/50 transition-all space-y-3 group text-left relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-brand-600/10 border border-brand-500/20 text-brand-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                  {card.badge}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-white group-hover:text-brand-400 transition-colors flex items-center gap-1.5">
                  {card.title}
                  <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-brand-400" />
                </h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {card.description}
                </p>
              </div>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
};
