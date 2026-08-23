import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { certificateApi } from '../../api/certificateApi';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { Award, CheckCircle2, ShieldCheck, Calendar, ArrowLeft } from 'lucide-react';

export const CertificateVerifyPage: React.FC = () => {
  const { certId } = useParams<{ certId: string }>();

  const { data: certResponse, isLoading, isError } = useQuery({
    queryKey: ['verify-certificate', certId],
    queryFn: () => certificateApi.verifyCertificate(certId!),
    enabled: !!certId,
  });

  const cert = certResponse?.data?.certificate;

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <Skeleton className="h-96 w-full rounded-3xl" />
      </div>
    );
  }

  if (isError || !cert) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
          <Award className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white">Certificate Not Found</h2>
        <p className="text-sm text-slate-400">
          The requested certificate ID <strong className="text-rose-400 font-mono">{certId}</strong> could not be verified in the SkillForge ledger.
        </p>
        <Link to="/courses">
          <Button variant="secondary" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back to Courses
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
      {/* Verification Status Badge */}
      <div className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-bold shadow-glow-cyan max-w-sm mx-auto">
        <ShieldCheck className="w-5 h-5" />
        <span>Official Verified SkillForge Credential</span>
      </div>

      {/* Certificate Graphic Card */}
      <div className="glass-panel p-8 sm:p-12 rounded-3xl border-2 border-brand-500/30 shadow-2xl relative space-y-8 text-center bg-gradient-to-b from-dark-900 via-dark-950 to-dark-950">
        <div className="flex items-center justify-between border-b border-slate-800 pb-6">
          <div className="text-left">
            <span className="text-2xl font-black tracking-tight text-white">SKILLFORGE</span>
            <span className="block text-[10px] text-brand-400 font-bold uppercase tracking-widest">Credential Ledger</span>
          </div>
          <Badge variant="amber" size="md">
            ID: {cert.certificateId}
          </Badge>
        </div>

        <div className="space-y-4 py-4">
          <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold">Certificate of Completion</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-300">
            {cert.student?.name}
          </h2>
          <p className="text-xs text-slate-400">has successfully completed all requirements for the professional program:</p>
          <h3 className="text-xl sm:text-2xl font-bold text-brand-400">{cert.course?.title}</h3>
        </div>

        {/* Audit Details Footer */}
        <div className="pt-6 border-t border-slate-800 grid grid-cols-2 gap-4 text-xs text-slate-400 text-left">
          <div>
            <span className="block text-[10px] text-slate-500 uppercase">Issue Date</span>
            <div className="flex items-center gap-1.5 font-semibold text-slate-200 mt-1">
              <Calendar className="w-3.5 h-3.5 text-brand-400" />
              <span>{new Date(cert.issueDate).toLocaleDateString()}</span>
            </div>
          </div>
          <div>
            <span className="block text-[10px] text-slate-500 uppercase">Verification Hash</span>
            <span className="font-mono text-[10px] text-slate-400 truncate block mt-1">{cert.verificationHash}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
