import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authApi } from '../../api/authApi';
import { useAuthStore } from '../../store/useAuthStore';
import { useUIStore } from '../../store/useUIStore';
import { Button } from '../../components/ui/Button';
import { Sparkles, Mail, Lock, LogIn, KeyRound } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const { addToast } = useUIStore();
  const [isLoading, setIsLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      const res = await authApi.login(data);
      setAuth(res.data.user as any, res.data.accessToken);
      addToast('success', `Welcome back, ${res.data.user.name}!`);
      navigate('/dashboard');
    } catch (err: any) {
      addToast('error', err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoAccount = (email: string) => {
    setValue('email', email);
    setValue('password', email.startsWith('admin') ? 'Admin@123456' : email.startsWith('instructor') ? 'Instructor@123456' : 'Student@123456');
  };

  return (
    <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8 glass-panel p-8 rounded-3xl border border-slate-800 shadow-2xl">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 via-cyan-500 to-purple-500 flex items-center justify-center shadow-glow-blue mx-auto mb-4">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
          <p className="text-xs text-slate-400">Log in to access your courses, progress, and certificates.</p>
        </div>

        {/* Demo Quick Fill Shortcuts */}
        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-400">
            <KeyRound className="w-3.5 h-3.5" />
            <span>Development Quick-Fill Demo Accounts:</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => fillDemoAccount('student@skillforge.dev')}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-slate-300 transition-colors"
            >
              Student
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount('instructor@skillforge.dev')}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-slate-300 transition-colors"
            >
              Instructor
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount('admin@skillforge.dev')}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-slate-300 transition-colors"
            >
              Admin
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                placeholder="name@example.com"
                {...register('email')}
                className="w-full bg-slate-900 border border-slate-800 focus:border-brand-500 text-slate-200 text-sm rounded-xl pl-10 pr-4 py-2.5"
              />
            </div>
            {errors.email && <p className="text-[11px] text-rose-400">{errors.email.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                placeholder="••••••••"
                {...register('password')}
                className="w-full bg-slate-900 border border-slate-800 focus:border-brand-500 text-slate-200 text-sm rounded-xl pl-10 pr-4 py-2.5"
              />
            </div>
            {errors.password && <p className="text-[11px] text-rose-400">{errors.password.message}</p>}
          </div>

          <Button type="submit" variant="primary" size="lg" className="w-full" isLoading={isLoading} leftIcon={<LogIn className="w-4 h-4" />}>
            Sign In
          </Button>
        </form>

        <div className="text-center text-xs text-slate-400 pt-4 border-t border-slate-800">
          Don't have an account?{' '}
          <Link to="/register" className="text-brand-400 font-bold hover:underline">
            Register now
          </Link>
        </div>
      </div>
    </div>
  );
};
