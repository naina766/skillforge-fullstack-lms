import React from 'react';
import { Category } from '../../types';
import { Filter, RotateCcw } from 'lucide-react';
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
  return (
    <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2 font-bold text-slate-200 text-base">
          <Filter className="w-4 h-4 text-brand-400" />
          <span>Faceted Filters</span>
        </div>
        <Button variant="ghost" size="sm" onClick={onReset} leftIcon={<RotateCcw className="w-3.5 h-3.5" />}>
          Reset
        </Button>
      </div>

      {/* Sort By */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sort By</label>
        <select
          value={selectedSort}
          onChange={(e) => onSortChange(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-sm rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-brand-500"
        >
          <option value="popular">Most Popular</option>
          <option value="rating">Highest Rated</option>
          <option value="newest">Newest Additions</option>
          <option value="price_asc">Price: Low → High</option>
          <option value="price_desc">Price: High → Low</option>
        </select>
      </div>

      {/* Course Format Type */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Learning Format</label>
        <div className="grid grid-cols-2 gap-1.5">
          {['ALL', 'COURSE', 'WORKSHOP', 'BOOTCAMP', 'WEBINAR'].map((t) => (
            <button
              key={t}
              onClick={() => onTypeChange(t === 'ALL' ? '' : t)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold text-center transition-all ${
                (t === 'ALL' && !selectedType) || selectedType === t
                  ? 'bg-brand-600 text-white shadow-glow-blue'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Difficulty Level */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Level</label>
        <select
          value={selectedLevel}
          onChange={(e) => onLevelChange(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-sm rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-brand-500"
        >
          <option value="">All Levels</option>
          <option value="BEGINNER">Beginner</option>
          <option value="INTERMEDIATE">Intermediate</option>
          <option value="ADVANCED">Advanced</option>
        </select>
      </div>

      {/* Categories */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Category</label>
        <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
          <button
            onClick={() => onCategoryChange('')}
            className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              !selectedCategory ? 'bg-brand-500/10 text-brand-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => onCategoryChange(cat.slug)}
              className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                selectedCategory === cat.slug ? 'bg-brand-500/10 text-brand-400 font-bold' : 'text-slate-400 hover:text-slate-200'
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
