import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationApi } from '../../api/notificationApi';
import { Sidebar } from '../../components/layout/Sidebar';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Bell, CheckCheck, Award, BookOpen, Sparkles } from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: notifResponse, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationApi.getNotifications(),
  });

  const notifications = notifResponse?.data?.notifications || [];

  const markAllMutation = useMutation({
    mutationFn: () => notificationApi.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  return (
    <div className="flex min-h-[calc(100vh-5rem)] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 gap-8 w-full">
      <Sidebar type="student" />

      <main className="flex-1 min-w-0 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Notifications</h1>
            <p className="text-xs text-slate-400">Updates regarding your course activity, certificates, and recommendations.</p>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => markAllMutation.mutate()}
            isLoading={markAllMutation.isPending}
            leftIcon={<CheckCheck className="w-4 h-4 text-brand-400" />}
          >
            Mark All Read
          </Button>
        </div>

        {notifications.length === 0 ? (
          <div className="glass-panel p-12 text-center rounded-2xl max-w-md mx-auto space-y-4">
            <Bell className="w-12 h-12 text-slate-500 mx-auto" />
            <h3 className="text-base font-bold text-white">No Notifications</h3>
            <p className="text-xs text-slate-400">You are all caught up!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((item) => (
              <div
                key={item._id}
                className={`glass-panel p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                  !item.isRead ? 'border-brand-500/40 bg-brand-950/20' : 'border-slate-800 opacity-75'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 mt-0.5">
                    {item.type === 'CERTIFICATE' ? (
                      <Award className="w-4 h-4 text-amber-400" />
                    ) : item.type === 'ENROLLMENT' ? (
                      <BookOpen className="w-4 h-4 text-brand-400" />
                    ) : (
                      <Sparkles className="w-4 h-4 text-cyan-400" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white">{item.title}</h4>
                      <Badge variant={item.type === 'CERTIFICATE' ? 'amber' : 'blue'} size="sm">
                        {item.type}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-300">{item.message}</p>
                    <span className="text-[10px] text-slate-500 block">{new Date(item.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
