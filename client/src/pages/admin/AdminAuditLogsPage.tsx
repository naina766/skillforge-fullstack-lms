import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../api/adminApi';
import { Sidebar } from '../../components/layout/Sidebar';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { FileText, Shield, Clock } from 'lucide-react';

export const AdminAuditLogsPage: React.FC = () => {
  const { data: logsResponse, isLoading } = useQuery({
    queryKey: ['admin-audit-logs'],
    queryFn: () => adminApi.getAuditLogs(),
  });

  const logs = logsResponse?.data?.items || [];

  return (
    <div className="flex min-h-[calc(100vh-5rem)] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 gap-8">
      <Sidebar type="admin" />

      <main className="flex-1 space-y-6">
        <div className="border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-400" />
            <h1 className="text-2xl font-bold text-white">Security Audit Trail</h1>
          </div>
          <p className="text-xs text-slate-400">Trace administrative actions, status publishing, and role changes.</p>
        </div>

        {isLoading ? (
          <Skeleton className="h-64 w-full rounded-2xl" />
        ) : (
          <div className="glass-panel rounded-2xl border border-slate-800 overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                <tr>
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">User</th>
                  <th className="p-4">Action</th>
                  <th className="p-4">Resource Target</th>
                  <th className="p-4">Metadata</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-900/40">
                    <td className="p-4 text-slate-400 text-[11px]">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="p-4 font-sans font-bold text-white">
                      {log.user?.name || 'System'}
                    </td>
                    <td className="p-4 font-sans">
                      <Badge variant="purple">{log.action}</Badge>
                    </td>
                    <td className="p-4 text-slate-300">
                      {log.resource} ({log.resourceId || 'N/A'})
                    </td>
                    <td className="p-4 text-[10px] text-slate-400 max-w-xs truncate">
                      {log.metadata ? JSON.stringify(log.metadata) : '-'}
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
