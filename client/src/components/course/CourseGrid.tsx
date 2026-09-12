import React from 'react';
import { Course } from '../../types';
import { CourseCard } from './CourseCard';
import { Skeleton } from '../ui/Skeleton';
import { SearchX } from 'lucide-react';

interface CourseGridProps {
  courses: Course[];
  isLoading: boolean;
  emptyMessage?: string;
}

export const CourseGrid: React.FC<CourseGridProps> = ({
  courses,
  isLoading,
  emptyMessage = 'No courses match your filter criteria.',
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div key={idx} className="h-96 rounded-3xl glass-panel flex flex-col p-4 space-y-4 border border-slate-800">
            <Skeleton className="aspect-video w-full rounded-2xl" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <div className="flex justify-between pt-4 mt-auto">
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-8 w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="glass-panel rounded-3xl p-12 text-center max-w-md mx-auto my-8 space-y-4 border border-slate-800">
        <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 flex items-center justify-center mx-auto">
          <SearchX className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-200">No Programs Found</h3>
        <p className="text-sm text-slate-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 items-stretch">
      {courses.map((course) => (
        <CourseCard key={course._id} course={course} />
      ))}
    </div>
  );
};
