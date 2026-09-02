import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { wishlistApi } from '../../api/wishlistApi';
import { Sidebar } from '../../components/layout/Sidebar';
import { CourseGrid } from '../../components/course/CourseGrid';

export const WishlistPage: React.FC = () => {
  const { data: wishlistData, isLoading } = useQuery({
    queryKey: ['wishlist'],
    queryFn: () => wishlistApi.getWishlist(),
  });

  const courses = wishlistData?.data || [];

  return (
    <div className="flex min-h-[calc(100vh-5rem)] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 gap-8 w-full">
      <Sidebar type="student" />

      <main className="flex-1 min-w-0 space-y-6">
        <div className="border-b border-slate-800 pb-4">
          <h1 className="text-2xl font-bold text-white">Wishlist</h1>
          <p className="text-xs text-slate-400">Courses and workshops you have saved for later.</p>
        </div>

        <CourseGrid courses={courses} isLoading={isLoading} emptyMessage="Your wishlist is empty." />
      </main>
    </div>
  );
};
