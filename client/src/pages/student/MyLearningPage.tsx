import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { enrollmentApi } from '../../api/enrollmentApi';
import { Sidebar } from '../../components/layout/Sidebar';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { PlayCircle, Award, CheckCircle, BookOpen } from 'lucide-react';

export const MyLearningPage: React.FC = () => {
  const [filterTab, setFilterTab] = useState<'all' | 'active' | 'completed'>('all');

  const { data: enrollmentsData, isLoading } = useQuery({
    queryKey: ['my-enrollments'],
    queryFn: () => enrollmentApi.getUserEnrollments(),
  });

  const enrollments = enrollmentsData?.data || [];

  const filteredEnrollments = enrollments.filter((e) => {
    if (filterTab === 'active') return e.status === 'ACTIVE';
    if (filterTab === 'completed') return e.status === 'COMPLETED';
    return true;
  });

  return (
    <div className="flex min-h-[calc(100vh-5rem)] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 gap-8">
      <Sidebar type="student" />

      <main className="flex-1 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-2xl font-bold text-white">My Learning</h1>
            <p className="text-xs text-slate-400">All your enrolled courses, workshops, and program completions.</p>
          </div>

          <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs">
            <button
              onClick={() => setFilterTab('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                filterTab === 'all' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({enrollments.length})
            </button>
            <button
              onClick={() => setFilterTab('active')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                filterTab === 'active' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              In Progress ({enrollments.filter((e) => e.status === 'ACTIVE').length})
            </button>
            <button
              onClick={() => setFilterTab('completed')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                filterTab === 'completed' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Completed ({enrollments.filter((e) => e.status === 'COMPLETED').length})
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full rounded-2xl" />
            <Skeleton className="h-32 w-full rounded-2xl" />
          </div>
        ) : filteredEnrollments.length === 0 ? (
          <div className="glass-panel p-12 text-center rounded-2xl space-y-4 max-w-md mx-auto my-12">
            <BookOpen className="w-10 h-10 text-slate-500 mx-auto" />
            <h3 className="text-base font-bold text-white">No Enrolled Courses Found</h3>
            <p className="text-xs text-slate-400">Browse our catalog and enroll in practical programs.</p>
            <Link to="/courses">
              <Button size="sm">Explore Courses</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredEnrollments.map((item) => (
              <div
                key={item._id}
                className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-xl bg-slate-900 overflow-hidden shrink-0">
                    <img src={item.course.thumbnail} alt={item.course.title} className="w-full h-full object-cover" />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Badge variant={item.course.type === 'WORKSHOP' ? 'cyan' : 'blue'}>{item.course.type}</Badge>
                      <span className="text-xs text-slate-400 font-medium">{item.course.category?.name}</span>
                    </div>
                    <h3 className="text-base font-bold text-white">{item.course.title}</h3>
                    <p className="text-xs text-slate-400">Instructor: {item.course.instructor?.name}</p>
                  </div>
                </div>

                {/* Progress Bar & Actions */}
                <div className="w-full md:w-64 space-y-3 shrink-0">
                  <ProgressBar progress={item.completionPercentage} />

                  {item.status === 'COMPLETED' ? (
                    <Link to="/dashboard/certificates" className="block">
                      <Button variant="outline" size="sm" className="w-full" leftIcon={<Award className="w-4 h-4 text-amber-400" />}>
                        View Certificate
                      </Button>
                    </Link>
                  ) : (
                    <Link to={`/learn/${item.course._id}`} className="block">
                      <Button variant="primary" size="sm" className="w-full" leftIcon={<PlayCircle className="w-4 h-4" />}>
                        Continue Learning
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
