import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../api/adminApi';
import { Sidebar } from '../../components/layout/Sidebar';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useUIStore } from '../../store/useUIStore';
import { Search, ShieldAlert, CheckCircle, Ban } from 'lucide-react';

export const AdminUsersPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { addToast } = useUIStore();
  const [roleFilter, setRoleFilter] = useState('');
  const [search, setSearch] = useState('');

  const { data: usersResponse, isLoading } = useQuery({
    queryKey: ['admin-users', { roleFilter, search }],
    queryFn: () => adminApi.getUsers({ role: roleFilter, search }),
  });

  const users = usersResponse?.data?.items || [];

  const updateRoleMutation = useMutation({
    mutationFn: ({ id, role, isActive }: { id: string; role?: string; isActive?: boolean }) =>
      adminApi.updateUserRoleOrStatus(id, { role, isActive }),
    onSuccess: () => {
      addToast('success', 'User profile updated.');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });

  return (
    <div className="flex min-h-[calc(100vh-5rem)] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 gap-8 w-full">
      <Sidebar type="admin" />

      <main className="flex-1 min-w-0 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-2xl font-bold text-white">User Management</h1>
            <p className="text-xs text-slate-400">Search users, update role privileges, or toggle active account status.</p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2"
            >
              <option value="">All Roles</option>
              <option value="STUDENT">Students</option>
              <option value="INSTRUCTOR">Instructors</option>
              <option value="ADMIN">Admins</option>
            </select>
          </div>
        </div>

        {/* User Table */}
        <div className="glass-panel rounded-2xl border border-slate-800 overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Email</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
                <th className="p-4">Joined Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-900/40">
                  <td className="p-4 font-bold text-white">{u.name}</td>
                  <td className="p-4 font-mono text-slate-400">{u.email}</td>
                  <td className="p-4">
                    <Badge variant={u.role === 'ADMIN' ? 'rose' : u.role === 'INSTRUCTOR' ? 'cyan' : 'blue'}>
                      {u.role}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1 font-semibold ${u.isActive !== false ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {u.isActive !== false ? 'Active' : 'Deactivated'}
                    </span>
                  </td>
                  <td className="p-4 text-slate-500">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}</td>
                  <td className="p-4 text-right space-x-2">
                    {u.role === 'STUDENT' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => updateRoleMutation.mutate({ id: u.id, role: 'INSTRUCTOR' })}
                      >
                        Promote Instructor
                      </Button>
                    )}
                    <Button
                      variant={u.isActive !== false ? 'danger' : 'outline'}
                      size="sm"
                      onClick={() => updateRoleMutation.mutate({ id: u.id, isActive: !u.isActive })}
                    >
                      {u.isActive !== false ? 'Deactivate' : 'Reactivate'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};
