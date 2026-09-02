import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../api/adminApi';
import { Sidebar } from '../../components/layout/Sidebar';
import { Skeleton } from '../../components/ui/Skeleton';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { Users, BookOpen, DollarSign, Award, Shield, Code2, ExternalLink } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const AdminDashboard: React.FC = () => {
  const { data: analyticsResponse, isLoading } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: () => adminApi.getAnalytics(),
  });

  const analytics = analyticsResponse?.data;
  const metrics = analytics?.metrics;
  const charts = analytics?.charts;

  return (
    <div className="flex min-h-[calc(100vh-5rem)] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 gap-8 w-full">
      <Sidebar type="admin" />

      <main className="flex-1 min-w-0 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-rose-500" />
              <h1 className="text-2xl font-bold text-white">Platform Admin Control Center</h1>
            </div>
            <p className="text-xs text-slate-400">Monitor total revenue, active enrollments, user accounts, and security logs.</p>
          </div>

          <a href="http://localhost:5000/api/docs" target="_blank" rel="noreferrer">
            <Button variant="secondary" size="sm" leftIcon={<Code2 className="w-4 h-4 text-brand-400" />} rightIcon={<ExternalLink className="w-3.5 h-3.5 text-slate-400" />}>
              Swagger API Docs
            </Button>
          </a>
        </div>

        {/* KPI Metrics Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Skeleton className="h-24 w-full rounded-2xl" />
            <Skeleton className="h-24 w-full rounded-2xl" />
            <Skeleton className="h-24 w-full rounded-2xl" />
            <Skeleton className="h-24 w-full rounded-2xl" />
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400 font-medium">Platform Students</span>
              <div className="text-2xl font-extrabold text-white">{metrics?.totalStudents || 0}</div>
            </div>
            <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400 font-medium">Instructors</span>
              <div className="text-2xl font-extrabold text-white">{metrics?.totalInstructors || 0}</div>
            </div>
            <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400 font-medium">Active Enrollments</span>
              <div className="text-2xl font-extrabold text-white">{metrics?.totalEnrollments || 0}</div>
            </div>
            <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400 font-medium">Total Platform Revenue</span>
              <div className="text-2xl font-extrabold text-emerald-400">${metrics?.totalRevenue || 0}</div>
            </div>
          </div>
        )}

        {/* Recharts Analytics Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Student Growth Chart */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-slate-200">Student Signups Growth</h3>
            <div className="h-64 w-full">
              {charts?.studentGrowth && charts.studentGrowth.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={charts.studentGrowth}>
                    <defs>
                      <linearGradient id="studentColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                    <XAxis dataKey="month" stroke="#9ca3af" fontSize={11} />
                    <YAxis stroke="#9ca3af" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', fontSize: '12px' }} />
                    <Area type="monotone" dataKey="count" stroke="#3b82f6" fillOpacity={1} fill="url(#studentColor)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-500">
                  Data points compiling...
                </div>
              )}
            </div>
          </div>

          {/* Category Distribution Chart */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-slate-200">Category Program Distribution</h3>
            <div className="h-64 w-full">
              {charts?.categoryDistribution && charts.categoryDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={charts.categoryDistribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                    <XAxis dataKey="name" stroke="#9ca3af" fontSize={10} />
                    <YAxis stroke="#9ca3af" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', fontSize: '12px' }} />
                    <Bar dataKey="value" fill="#06b6d4" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-500">
                  Data points compiling...
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
