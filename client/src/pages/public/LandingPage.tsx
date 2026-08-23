import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { courseApi } from '../../api/courseApi';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { motion } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  Code2,
  Terminal,
  Cpu,
  ShieldCheck,
  Zap,
  Users,
  Award,
  BookOpen,
  Star,
  CheckCircle2,
  Cloud,
  Database,
  BrainCircuit,
  Smartphone,
  Layers,
} from 'lucide-react';

import { FeaturedProgramsSection } from '../../components/home/FeaturedProgramsSection';

export const LandingPage: React.FC = () => {
  const { data: categoryData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => courseApi.getCategories(),
  });

  const categories = categoryData?.data || [];

  const getCategoryTheme = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('cloud') || n.includes('devops')) {
      return { icon: Cloud, bg: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400 group-hover:bg-cyan-500/20' };
    }
    if (n.includes('ai') || n.includes('machine learning')) {
      return { icon: BrainCircuit, bg: 'bg-purple-500/10 border-purple-500/20 text-purple-400 group-hover:bg-purple-500/20' };
    }
    if (n.includes('data')) {
      return { icon: Database, bg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 group-hover:bg-emerald-500/20' };
    }
    if (n.includes('security') || n.includes('cyber')) {
      return { icon: ShieldCheck, bg: 'bg-rose-500/10 border-rose-500/20 text-rose-400 group-hover:bg-rose-500/20' };
    }
    if (n.includes('mobile') || n.includes('ios') || n.includes('android')) {
      return { icon: Smartphone, bg: 'bg-blue-500/10 border-blue-500/20 text-blue-400 group-hover:bg-blue-500/20' };
    }
    if (n.includes('system') || n.includes('architecture') || n.includes('design')) {
      return { icon: Layers, bg: 'bg-amber-500/10 border-amber-500/20 text-amber-400 group-hover:bg-amber-500/20' };
    }
    if (n.includes('blockchain') || n.includes('crypto')) {
      return { icon: Cpu, bg: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400 group-hover:bg-indigo-500/20' };
    }
    return { icon: Code2, bg: 'bg-brand-500/10 border-brand-500/20 text-brand-400 group-hover:bg-brand-500/20' };
  };

  return (
    <div className="space-y-24 pb-20">
      {/* 1. Hero Section */}
      <section className="relative pt-12 lg:pt-20 overflow-hidden">
        {/* Aceternity ambient glow & dot matrix overlay */}
        <div className="absolute inset-0 bg-dot-pattern opacity-40 pointer-events-none" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[450px] bg-gradient-to-tr from-brand-600/25 via-cyan-500/20 to-purple-600/25 blur-[130px] pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel border border-brand-500/30 text-brand-300 text-xs font-semibold shadow-glow-blue animate-in fade-in slide-in-from-top-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400" />
            </span>
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Introducing SkillForge 2026 AI-Powered Bootcamps</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-3xl lg:max-w-4xl mx-auto leading-[1.15] text-balance">
            Learn Skills That&nbsp;Actually{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-cyan-400 to-purple-400 block sm:inline">
              Move Your Career.
            </span>
          </h1>

          <p className="text-slate-400 text-base sm:text-lg lg:text-xl max-w-2xl mx-auto leading-relaxed">
            Master practical full-stack tech, cloud architecture, and business engineering through expert-led short courses, live workshops, and AI mentor guidance.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link to="/courses">
              <Button size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
                Explore All Courses
              </Button>
            </Link>
            <Link to="/courses?type=WORKSHOP">
              <Button variant="outline" size="lg" leftIcon={<Zap className="w-5 h-5 text-cyan-400" />}>
                Join Free Live Workshop
              </Button>
            </Link>
          </div>

          {/* Above-the-fold Trust & Social Proof Strip */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-6 max-w-2xl mx-auto">
            {/* Student Avatar Stack */}
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2.5 overflow-hidden">
                {['https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&fit=crop&crop=faces',
                  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=faces',
                  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&h=64&fit=crop&crop=faces',
                  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=64&h=64&fit=crop&crop=faces'
                ].map((src, idx) => (
                  <img
                    key={idx}
                    src={src}
                    alt="Learner"
                    className="inline-block h-8 w-8 rounded-full ring-2 ring-dark-950 object-cover"
                  />
                ))}
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1 text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                  <span className="text-xs font-bold text-slate-200 ml-1">4.9 / 5.0</span>
                </div>
                <p className="text-[11px] text-slate-400">Trusted by 10,000+ developers</p>
              </div>
            </div>

            <div className="hidden sm:block h-6 w-px bg-slate-800" />

            <div className="flex items-center gap-2 text-xs text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Engineers from Google, Amazon & top scale-ups</span>
            </div>
          </div>

          {/* Modern Tech Stack Badges */}
          <div className="pt-6">
            <p className="text-[11px] uppercase tracking-widest text-slate-400 font-bold mb-3">
              Master Enterprise Technologies
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2.5 max-w-3xl mx-auto">
              {['TypeScript', 'React', 'Node.js', 'Next.js', 'Docker', 'Kubernetes', 'AWS', 'MongoDB', 'PostgreSQL', 'GraphQL', 'System Design'].map((tech) => (
                <span
                  key={tech}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900/80 border border-slate-800 text-slate-300 hover:border-brand-500/40 hover:text-white hover:bg-slate-800 transition-all shadow-sm hover:scale-105"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Social Proof Stats Bar */}
          <div className="pt-10 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto text-center border-t border-slate-800/80">
            <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60">
              <div className="text-2xl sm:text-3xl font-extrabold text-white">20+</div>
              <div className="text-xs text-slate-400 font-medium mt-0.5">Production Courses</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60">
              <div className="text-2xl sm:text-3xl font-extrabold text-cyan-400">10,000+</div>
              <div className="text-xs text-slate-400 font-medium mt-0.5">Enrolled Engineers</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60">
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">98.4%</div>
              <div className="text-xs text-slate-400 font-medium mt-0.5">Completion Rating</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60">
              <div className="text-2xl sm:text-3xl font-extrabold text-purple-400">100%</div>
              <div className="text-xs text-slate-400 font-medium mt-0.5">Verifiable Certificates</div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Premium Featured Programs Discovery */}
      <FeaturedProgramsSection />

      {/* 3. Learning Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto">
          {/* <Badge variant="purple" className="mb-2">Faceted Discovery</Badge> */}
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Explore By Career Track</h2>
          <p className="text-slate-400 text-sm mt-1">Structured modules tailored for modern engineering disciplines.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.slice(0, 10).map((cat) => {
            const theme = getCategoryTheme(cat.name);
            const IconComponent = theme.icon;

            return (
              <Link
                key={cat._id}
                to={`/courses?category=${cat.slug}`}
                className="p-5 rounded-2xl glass-card border border-slate-800/80 hover:border-brand-500/40 text-center space-y-3 transition-all hover:-translate-y-1 group"
              >
                <div className={`w-12 h-12 rounded-xl border flex items-center justify-center mx-auto group-hover:scale-110 transition-transform ${theme.bg}`}>
                  <IconComponent className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-200 group-hover:text-brand-400 transition-colors">{cat.name}</h3>
                  <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{cat.description}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 4. Why SkillForge Feature Highlights */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-slate-800/80 space-y-12">
          {/* Eyebrow & High-Contrast Heading */}
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-brand-400">WHY SKILLFORGE</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Learn.{' '}
              <span className="bg-clip-text bg-gradient-to-r from-brand-300 via-cyan-300 to-white font-black drop-shadow-sm">
                Build.
              </span>{' '}
              Prove.
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              SkillForge is designed around one goal: turning learning into demonstrable engineering ability.
            </p>
          </div>

          {/* Cards Grid with High-Contrast Micro-Copy */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1 - Production-Grade Projects */}
            <motion.div
              whileHover={{ y: -3, scale: 1.01 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="bg-[#0D1117]/90 border border-white/[0.08] hover:border-brand-500/40 rounded-2xl p-6 space-y-4 transition-colors group flex flex-col justify-between"
              aria-label="Production-Grade Projects card"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black tracking-widest text-brand-300 uppercase">BUILD</span>
                  <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center group-hover:scale-110 group-hover:bg-brand-500/20 transition-all">
                    <Code2 className="w-5 h-5" />
                  </div>
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-brand-300 transition-colors">
                  Production-Grade Projects
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Go beyond basic CRUD apps. Build full-stack systems with authentication, RBAC, APIs, databases, testing, Docker, CI/CD, and deployment.
                </p>
              </div>
            </motion.div>

            {/* Card 2 - Hands-On Workshops */}
            <motion.div
              whileHover={{ y: -3, scale: 1.01 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="bg-[#0D1117]/90 border border-white/[0.08] hover:border-cyan-500/40 rounded-2xl p-6 space-y-4 transition-colors group flex flex-col justify-between"
              aria-label="Hands-On Workshops card"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black tracking-widest text-cyan-300 uppercase">PRACTICE</span>
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center group-hover:scale-110 group-hover:bg-cyan-500/20 transition-all">
                    <Zap className="w-5 h-5" />
                  </div>
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                  Hands-On Workshops
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Learn by building through guided workshops, practical exercises, and real-world engineering scenarios.
                </p>
              </div>
            </motion.div>

            {/* Card 3 - AI Career Mentor */}
            <motion.div
              whileHover={{ y: -3, scale: 1.01 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="bg-[#0D1117]/90 border border-white/[0.08] hover:border-purple-500/40 rounded-2xl p-6 space-y-4 transition-colors group flex flex-col justify-between"
              aria-label="AI Career Mentor card"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black tracking-widest text-purple-300 uppercase">GUIDANCE</span>
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center group-hover:scale-110 group-hover:bg-purple-500/20 transition-all">
                    <Sparkles className="w-5 h-5" />
                  </div>
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors">
                  AI Career Mentor
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Get personalized skill-gap analysis, learning paths, project ideas, and course recommendations aligned with your target role.
                </p>
              </div>
            </motion.div>

            {/* Card 4 - Verifiable Credentials */}
            <motion.div
              whileHover={{ y: -3, scale: 1.01 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="bg-[#0D1117]/90 border border-white/[0.08] hover:border-amber-500/40 rounded-2xl p-6 space-y-4 transition-colors group flex flex-col justify-between"
              aria-label="Verifiable Credentials card"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black tracking-widest text-amber-300 uppercase">PROOF</span>
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center group-hover:scale-110 group-hover:bg-amber-500/20 transition-all">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors">
                  Verifiable Credentials
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Earn certificates that document your completed learning and projects.
                </p>
              </div>
            </motion.div>
          </div>

          {/* High-Contrast Bottom Statement */}
          <div className="pt-2 text-center border-t border-slate-800/60">
            <p className="text-slate-300 text-xs sm:text-sm font-medium">
              Don't just complete courses. <span className="text-white font-bold">Build evidence of what you can do.</span>
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/courses">
              <Button size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
                Explore Learning Paths
              </Button>
            </Link>
            <Link to="/mentor">
              <Button variant="outline" size="lg" leftIcon={<Sparkles className="w-5 h-5 text-cyan-400" />}>
                Meet Your AI Mentor
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 5. CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="p-12 rounded-3xl bg-gradient-to-r from-brand-900/60 via-dark-900 to-purple-950/60 border border-brand-500/30 space-y-6 shadow-glow-blue">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Ready To Upgrade Your Full-Stack Engineering Stack?
          </h2>
          <p className="text-slate-300 text-sm max-w-xl mx-auto">
            Join thousands of developers leveling up their technical resume with SkillForge.
          </p>
          <div className="pt-2">
            <Link to="/register">
              <Button size="lg" className="px-8">
                Create Free Account
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
