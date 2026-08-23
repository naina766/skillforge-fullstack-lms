import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Github, Linkedin, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-dark-950 border-t border-slate-800/80 pt-16 pb-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand Column */}
          <div className="space-y-4 md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 via-cyan-500 to-purple-500 flex items-center justify-center shadow-glow-blue group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-white">
                Skill<span className="text-brand-500">Forge</span>
              </span>
            </Link>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Learn skills that actually move your career. Premium short courses, live workshops, and AI-assisted learning paths.
            </p>

            {/* Social Icons with personal profiles */}
            <div className="flex items-center gap-3 pt-1">
              <a
                href="https://github.com/naina766"
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub Profile"
                className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-400 hover:text-white hover:border-brand-500/50 hover:bg-slate-800 transition-all shadow-sm flex items-center gap-2 text-xs font-semibold"
              >
                <Github className="w-4 h-4 text-brand-400" />
                <span>GitHub</span>
              </a>
              <a
                href="https://www.linkedin.com/in/naina-varshney-0133bb2a2/"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn Profile"
                className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-400 hover:text-blue-400 hover:border-blue-500/50 hover:bg-slate-800 transition-all shadow-sm flex items-center gap-2 text-xs font-semibold"
              >
                <Linkedin className="w-4 h-4 text-blue-400" />
                <span>LinkedIn</span>
              </a>
            </div>
          </div>

          {/* Explore Platform Column */}
          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
              Explore Platform
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-400">
              <li>
                <Link to="/courses" className="hover:text-white transition-colors duration-200">
                  All Courses
                </Link>
              </li>
              <li>
                <Link to="/courses?type=WORKSHOP" className="hover:text-white transition-colors duration-200">
                  Live Workshops
                </Link>
              </li>
              <li>
                <Link to="/courses?type=BOOTCAMP" className="hover:text-white transition-colors duration-200">
                  Bootcamps
                </Link>
              </li>
              <li>
                <Link to="/ai-mentor" className="text-cyan-400 hover:text-cyan-300 transition-colors duration-200 font-medium inline-flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> AI Learning Mentor
                </Link>
              </li>
            </ul>
          </div>

          {/* For Learners Column */}
          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
              For Learners
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-400">
              <li>
                <Link to="/dashboard" className="hover:text-white transition-colors duration-200">
                  Student Dashboard
                </Link>
              </li>
              <li>
                <Link to="/dashboard/my-learning" className="hover:text-white transition-colors duration-200">
                  My Learning Progress
                </Link>
              </li>
              <li>
                <Link to="/dashboard/certificates" className="hover:text-white transition-colors duration-200">
                  Verified Certificates
                </Link>
              </li>
              <li>
                <Link to="/dashboard/wishlist" className="hover:text-white transition-colors duration-200">
                  Saved Wishlist
                </Link>
              </li>
            </ul>
          </div>

          {/* Instructor & Admin Column */}
          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
              Instructor & Admin
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-400">
              <li>
                <Link to="/instructor" className="hover:text-white transition-colors duration-200">
                  Instructor Studio
                </Link>
              </li>
              <li>
                <Link to="/instructor/courses/new" className="hover:text-white transition-colors duration-200">
                  Create New Course
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-white transition-colors duration-200">
                  Admin Control Center
                </Link>
              </li>
              <li>
                <a
                  href="/api/docs"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-brand-400 transition-colors duration-200 font-mono text-xs"
                >
                  Swagger API Docs →
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Sub-Navigation Bottom Bar */}
        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} SkillForge Inc. All rights reserved. Built with ❤️ for tech career growth.</p>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Verified Career Platform</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
