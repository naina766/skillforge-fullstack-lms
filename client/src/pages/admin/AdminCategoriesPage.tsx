import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryApi } from '../../api/categoryApi';
import { Sidebar } from '../../components/layout/Sidebar';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { useUIStore } from '../../store/useUIStore';
import { Category } from '../../types';
import {
  ListOrdered,
  Plus,
  FolderPlus,
  Tag,
  AlignLeft,
  Sparkles,
} from 'lucide-react';

export const AdminCategoriesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { addToast } = useUIStore();
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('Code');

  const { data: categoriesResponse, isLoading } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: () => categoryApi.getCategories(),
  });

  const categories: Category[] = categoriesResponse?.data || [];

  const createCategoryMutation = useMutation({
    mutationFn: (payload: { name: string; description?: string; icon?: string }) =>
      categoryApi.createCategory(payload),
    onSuccess: () => {
      addToast('success', 'Category created successfully.');
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setName('');
      setDescription('');
      setIcon('Code');
      setIsCreating(false);
    },
    onError: (err: any) => {
      addToast('error', err.response?.data?.message || 'Failed to create category.');
    },
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      addToast('error', 'Category name is required.');
      return;
    }
    createCategoryMutation.mutate({ name: name.trim(), description: description.trim(), icon });
  };

  return (
    <div className="flex min-h-[calc(100vh-5rem)] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 gap-8 w-full">
      <Sidebar type="admin" />

      <main className="flex-1 min-w-0 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <ListOrdered className="w-5 h-5 text-brand-400" />
              <h1 className="text-2xl font-bold text-white">Course Categories</h1>
            </div>
            <p className="text-xs text-slate-400">Manage curriculum domains, taxonomy classifications, and icons.</p>
          </div>

          <Button
            variant={isCreating ? 'secondary' : 'primary'}
            onClick={() => setIsCreating(!isCreating)}
            leftIcon={isCreating ? undefined : <Plus className="w-4 h-4" />}
          >
            {isCreating ? 'Cancel' : 'Add Category'}
          </Button>
        </div>

        {/* Create Category Panel */}
        {isCreating && (
          <form onSubmit={handleCreateSubmit} className="glass-panel p-6 rounded-2xl border border-brand-500/30 space-y-4 animate-in fade-in">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <FolderPlus className="w-4 h-4 text-brand-400" />
              <span>Create New Taxonomy Category</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Category Name *</label>
                <div className="relative">
                  <Tag className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="e.g. Data Engineering & Analytics"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-sm rounded-xl pl-9 pr-3 py-2.5 focus:border-brand-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Icon / Identifier</label>
                <select
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-sm rounded-xl px-3 py-2.5 focus:border-brand-500 focus:outline-none"
                >
                  <option value="Code">Code (Web & Software)</option>
                  <option value="Cloud">Cloud (Cloud & DevOps)</option>
                  <option value="Cpu">Cpu (AI & Data Science)</option>
                  <option value="Smartphone">Smartphone (Mobile)</option>
                  <option value="Shield">Shield (Cybersecurity)</option>
                  <option value="Server">Server (System Design)</option>
                  <option value="Database">Database (Data Engineering)</option>
                  <option value="Palette">Palette (UI/UX Design)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Description</label>
              <div className="relative">
                <AlignLeft className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <textarea
                  placeholder="Describe topics covered in this track..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-sm rounded-xl pl-9 pr-3 py-2 focus:border-brand-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="secondary" size="sm" onClick={() => setIsCreating(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" isLoading={createCategoryMutation.isPending}>
                Save Category
              </Button>
            </div>
          </form>
        )}

        {/* Categories Table */}
        {isLoading ? (
          <Skeleton className="h-64 w-full rounded-2xl" />
        ) : (
          <div className="glass-panel rounded-2xl border border-slate-800 overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                <tr>
                  <th className="p-4">Icon</th>
                  <th className="p-4">Category Name</th>
                  <th className="p-4">Slug Identifier</th>
                  <th className="p-4">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {categories.map((cat) => (
                  <tr key={cat._id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="p-4">
                      <div className="w-8 h-8 rounded-lg bg-brand-500/10 border border-brand-500/20 text-brand-400 flex items-center justify-center font-bold text-xs">
                        {cat.icon?.charAt(0) || '📁'}
                      </div>
                    </td>
                    <td className="p-4 font-bold text-white">{cat.name}</td>
                    <td className="p-4 font-mono text-slate-400 text-[11px]">{cat.slug}</td>
                    <td className="p-4 text-slate-400 max-w-md truncate">
                      {cat.description || 'No description provided.'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
};
