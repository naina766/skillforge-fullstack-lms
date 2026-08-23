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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, idx) => (
          <div key={idx} className="h-80 rounded-2xl glass-panel flex flex-col p-4 space-y-4">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <div className="flex justify-between pt-4">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-4 w-1/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="glass-panel rounded-2xl p-12 text-center max-w-md mx-auto my-8 space-y-4 border border-slate-800">
        <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 flex items-center justify-center mx-auto">
          <SearchX className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-200">No Courses Found</h3>
        <p className="text-sm text-slate-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {courses.map((course) => (
        <CourseCard key={course._id} course={course} />
      ))}
    </div>
  );
};
