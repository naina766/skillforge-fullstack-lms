import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { courseApi } from '../../api/courseApi';
import { CourseGrid } from '../../components/course/CourseGrid';
import { CourseFilter } from '../../components/course/CourseFilter';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const CourseCatalogPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const level = searchParams.get('level') || '';
  const type = searchParams.get('type') || '';
  const sort = searchParams.get('sort') || 'popular';
  const page = parseInt(searchParams.get('page') || '1', 10);

  const [searchInput, setSearchInput] = useState(search);

  // Queries
  const { data: courseData, isLoading } = useQuery({
    queryKey: ['courses', { search, category, level, type, sort, page }],
    queryFn: () =>
      courseApi.getCourses({
        search,
        category,
        level,
        type,
        sort,
        page,
        limit: 12,
      }),
  });

  const { data: categoryData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => courseApi.getCategories(),
  });

  const courses = courseData?.data?.items || [];
  const pagination = courseData?.data?.pagination;
  const categories = categoryData?.data || [];

  const updateFilters = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.set('page', '1'); // Reset to page 1 on filter change
    setSearchParams(newParams);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters('search', searchInput);
  };

  const handleReset = () => {
    setSearchInput('');
    setSearchParams(new URLSearchParams());
  };

  const handlePageChange = (newPage: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', newPage.toString());
    setSearchParams(newParams);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-800 pb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Course & Workshop Catalog</h1>
          <p className="text-slate-400 text-sm mt-1">
            Discover practical software development programs designed for high-impact careers.
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative max-w-md w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search titles, skills, or topics..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 focus:border-brand-500 text-slate-200 text-sm rounded-xl pl-10 pr-4 py-2.5"
          />
        </form>
      </div>

      {/* Main Catalog Section */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <div className="lg:col-span-1">
          <CourseFilter
            categories={categories}
            selectedCategory={category}
            selectedLevel={level}
            selectedType={type}
            selectedSort={sort}
            onCategoryChange={(val) => updateFilters('category', val)}
            onLevelChange={(val) => updateFilters('level', val)}
            onTypeChange={(val) => updateFilters('type', val)}
            onSortChange={(val) => updateFilters('sort', val)}
            onReset={handleReset}
          />
        </div>

        {/* Grid & Pagination */}
        <div className="lg:col-span-3 space-y-8">
          <CourseGrid courses={courses} isLoading={isLoading} />

          {/* Pagination Controls */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between pt-6 border-t border-slate-800">
              <span className="text-xs text-slate-400">
                Showing page <strong className="text-white">{pagination.page}</strong> of{' '}
                <strong className="text-white">{pagination.totalPages}</strong> ({pagination.total} items)
              </span>

              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={!pagination.hasPreviousPage}
                  onClick={() => handlePageChange(pagination.page - 1)}
                  leftIcon={<ChevronLeft className="w-4 h-4" />}
                >
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={!pagination.hasNextPage}
                  onClick={() => handlePageChange(pagination.page + 1)}
                  rightIcon={<ChevronRight className="w-4 h-4" />}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
