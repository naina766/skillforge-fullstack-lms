import React from 'react';
import { Category } from '../../types';
import { Filter, RotateCcw, Sparkles, Layers, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { Button } from '../ui/Button';

interface CourseFilterProps {
  categories: Category[];
  selectedCategory: string;
  selectedLevel: string;
  selectedType: string;
  selectedSort: string;
  onCategoryChange: (category: string) => void;
  onLevelChange: (level: string) => void;
  onTypeChange: (type: string) => void;
  onSortChange: (sort: string) => void;
  onReset: () => void;
}

export const CourseFilter: React.FC<CourseFilterProps> = ({
  categories,
  selectedCategory,
  selectedLevel,
  selectedType,
  selectedSort,
  onCategoryChange,
  onLevelChange,
  onTypeChange,
  onSortChange,
  onReset,
}) => {
  const hasActiveFilters = Boolean(selectedCategory || selectedLevel || selectedType || (selectedSort && selectedSort !== 'popular'));

  return (
    <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-slate-800/90 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-2 font-bold text-white text-base">
          <SlidersHorizontal className="w-4 h-4 text-brand-400" />
          <span>Faceted Filters</span>
        </div>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onReset} leftIcon={<RotateCcw className="w-3.5 h-3.5" />}>
            Reset
          </Button>
        )}
      </div>

      {/* Sort By Dropdown */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
            <span>Sort Catalog</span>
          </label>
        </div>
        <div className="relative">
          <select
            value={selectedSort}
            onChange={(e) => onSortChange(e.target.value)}
            className="w-full bg-slate-900/90 border border-slate-800 hover:border-brand-500/50 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-slate-100 text-sm font-medium rounded-xl px-3.5 py-2.5 transition-all cursor-pointer shadow-inner appearance-none pr-8"
          >
            <option value="popular">🔥 Most Popular</option>
            <option value="rating">⭐ Highest Rated</option>
            <option value="newest">✨ Newest Additions</option>
            <option value="price_asc">💵 Price: Low → High</option>
            <option value="price_desc">💎 Price: High → Low</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
            ▼
          </div>
        </div>
      </div>

      {/* Learning Format Buttons */}
      <div className="space-y-2.5 pt-1">
        <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-slate-500" />
          <span>Learning Format</span>
        </label>
        <div className="grid grid-cols-2 gap-2 pt-1">
          {['ALL', 'COURSE', 'WORKSHOP', 'BOOTCAMP', 'WEBINAR'].map((t) => {
            const isSelected = (t === 'ALL' && !selectedType) || selectedType === t;
            return (
              <button
                key={t}
                onClick={() => onTypeChange(t === 'ALL' ? '' : t)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold text-center transition-all ${
                  isSelected
                    ? 'bg-brand-600 text-white shadow-glow-blue font-bold border border-brand-400/40'
                    : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800/80 border border-slate-800'
                }`}
              >
                {t}
              </button>
            );
          })}
        </div>
      </div>

      {/* Difficulty Level */}
      <div className="space-y-2.5">
        <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Skill Level</label>
        <div className="relative">
          <select
            value={selectedLevel}
            onChange={(e) => onLevelChange(e.target.value)}
            className="w-full bg-slate-900/90 border border-slate-800 hover:border-brand-500/50 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-slate-100 text-sm font-medium rounded-xl px-3.5 py-2.5 transition-all cursor-pointer shadow-inner appearance-none pr-8"
          >
            <option value="">All Skill Levels</option>
            <option value="BEGINNER">Beginner (Foundations)</option>
            <option value="INTERMEDIATE">Intermediate (Core Concepts)</option>
            <option value="ADVANCED">Advanced (Production Mastery)</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
            ▼
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-2.5">
        <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Subject Category</label>
        <div className="space-y-1 max-h-52 overflow-y-auto pr-1">
          <button
            onClick={() => onCategoryChange('')}
            className={`w-full text-left px-3.5 py-2 rounded-xl text-xs font-medium transition-colors ${
              !selectedCategory
                ? 'bg-brand-500/15 text-brand-300 font-bold border border-brand-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => onCategoryChange(cat.slug)}
              className={`w-full text-left px-3.5 py-2 rounded-xl text-xs font-medium transition-colors ${
                selectedCategory === cat.slug
                  ? 'bg-brand-500/15 text-brand-300 font-bold border border-brand-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
