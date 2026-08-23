import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authApi } from '../../api/authApi';
import { useUIStore } from '../../store/useUIStore';
import { Button } from '../../components/ui/Button';
import { Sparkles, Mail, Lock, User, UserPlus } from 'lucide-react';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['STUDENT', 'INSTRUCTOR']).default('STUDENT'),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useUIStore();
  const [isLoading, setIsLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'STUDENT' },
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsLoading(true);
      await authApi.register(data);
      addToast('success', 'Account created successfully! Please log in.');
      navigate('/login');
    } catch (err: any) {
      addToast('error', err.response?.data?.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8 glass-panel p-8 rounded-3xl border border-slate-800 shadow-2xl">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 via-cyan-500 to-purple-500 flex items-center justify-center shadow-glow-blue mx-auto mb-4">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">Create SkillForge Account</h2>
          <p className="text-xs text-slate-400">Join thousands of developers building real portfolio skills.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Jane Doe"
                {...register('name')}
                className="w-full bg-slate-900 border border-slate-800 focus:border-brand-500 text-slate-200 text-sm rounded-xl pl-10 pr-4 py-2.5"
              />
            </div>
            {errors.name && <p className="text-[11px] text-rose-400">{errors.name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                placeholder="jane@example.com"
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

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Account Type</label>
            <select
              {...register('role')}
              className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-sm rounded-xl px-3 py-2.5"
            >
              <option value="STUDENT">Student Learner</option>
              <option value="INSTRUCTOR">Course Instructor</option>
            </select>
          </div>

          <Button type="submit" variant="primary" size="lg" className="w-full" isLoading={isLoading} leftIcon={<UserPlus className="w-4 h-4" />}>
            Create Account
          </Button>
        </form>

        <div className="text-center text-xs text-slate-400 pt-4 border-t border-slate-800">
          Already registered?{' '}
          <Link to="/login" className="text-brand-400 font-bold hover:underline">
            Log in here
          </Link>
        </div>
      </div>
    </div>
  );
};
