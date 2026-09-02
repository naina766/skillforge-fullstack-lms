import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { certificateApi } from '../../api/certificateApi';
import { Sidebar } from '../../components/layout/Sidebar';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import {
  Award,
  ExternalLink,
  Calendar,
  Sparkles,
  BookOpen,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  QrCode,
} from 'lucide-react';

export const CertificatesPage: React.FC = () => {
  const { data: certsResponse, isLoading } = useQuery({
    queryKey: ['my-certificates'],
    queryFn: () => certificateApi.getUserCertificates(),
  });

  const certificates = certsResponse?.data || [];

  return (
    <div className="flex min-h-[calc(100vh-5rem)] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 gap-8 w-full">
      <Sidebar type="student" />

      <main className="flex-1 min-w-0 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <Award className="w-6 h-6 text-amber-400" />
              <h1 className="text-2xl font-bold text-white tracking-tight">Verified Certificates</h1>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Official accredited digital credentials earned upon 100% course curriculum completion.
            </p>
          </div>

          <Link to="/courses">
            <Button variant="secondary" size="sm" leftIcon={<BookOpen className="w-4 h-4 text-brand-400" />}>
              Explore More Programs
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-48 w-full rounded-2xl" />
            <Skeleton className="h-48 w-full rounded-2xl" />
          </div>
        ) : certificates.length === 0 ? (
          /* Elevated Empty State Card */
          <div className="glass-panel p-8 sm:p-14 text-center rounded-3xl border-2 border-dashed border-slate-700/80 hover:border-amber-500/40 bg-gradient-to-b from-slate-900/90 via-dark-900/70 to-amber-950/10 max-w-xl mx-auto my-8 shadow-2xl relative overflow-hidden transition-all">
            {/* Ambient Background Glow */}
            <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Concentric Icon Badge */}
            <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-500/20 via-orange-500/20 to-purple-500/20 border border-amber-500/30 flex items-center justify-center mx-auto mb-6 shadow-md">
              <Award className="w-10 h-10 text-amber-400" />
            </div>

            {/* Typography */}
            <div className="space-y-2 mb-6">
              <h3 className="text-xl font-extrabold text-white tracking-tight">
                No Certificates Earned Yet
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                Complete 100% of your enrolled lessons and project evaluations to automatically unlock and issue your verifiable credential.
              </p>
            </div>

            {/* Credential Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 max-w-md mx-auto mb-8 text-[11px] text-slate-300">
              <div className="flex items-center gap-1.5 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 justify-center">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Cryptographic Hash</span>
              </div>
              <div className="flex items-center gap-1.5 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 justify-center">
                <QrCode className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>Instant QR Verify</span>
              </div>
              <div className="flex items-center gap-1.5 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 justify-center">
                <ExternalLink className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>LinkedIn Ready</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to="/dashboard/my-learning">
                <Button variant="primary" size="md" className="w-full sm:w-auto shadow-glow-blue" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Continue Enrolled Courses
                </Button>
              </Link>
              <Link to="/courses">
                <Button variant="secondary" size="md" className="w-full sm:w-auto">
                  Browse Catalog
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {certificates.map((cert) => (
              <div key={cert._id} className="glass-panel p-6 rounded-2xl border border-slate-800 hover:border-amber-500/40 transition-all space-y-4 shadow-lg group">
                <div className="flex items-center justify-between">
                  <Badge variant="amber" size="md">
                    ID: {cert.certificateId}
                  </Badge>
                  <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    {new Date(cert.issueDate).toLocaleDateString()}
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors">
                    {cert.course?.title}
                  </h3>
                  <p className="text-xs text-slate-400">Professional Certificate of Mastery & Completion</p>
                </div>

                <div className="pt-2">
                  <Link to={`/verify-certificate/${cert.certificateId}`} target="_blank">
                    <Button variant="outline" size="sm" className="w-full hover:border-amber-500/50 hover:text-amber-300" rightIcon={<ExternalLink className="w-4 h-4" />}>
                      Verify & Share Credential
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
