import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { certificateApi } from '../../api/certificateApi';
import { Sidebar } from '../../components/layout/Sidebar';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { Award, ExternalLink, Calendar } from 'lucide-react';

export const CertificatesPage: React.FC = () => {
  const { data: certsResponse, isLoading } = useQuery({
    queryKey: ['my-certificates'],
    queryFn: () => certificateApi.getUserCertificates(),
  });

  const certificates = certsResponse?.data || [];

  return (
    <div className="flex min-h-[calc(100vh-5rem)] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 gap-8">
      <Sidebar type="student" />

      <main className="flex-1 space-y-6">
        <div className="border-b border-slate-800 pb-4">
          <h1 className="text-2xl font-bold text-white">My Certificates</h1>
          <p className="text-xs text-slate-400">Verifiable credentials earned upon completing programs.</p>
        </div>

        {isLoading ? (
          <Skeleton className="h-40 w-full rounded-2xl" />
        ) : certificates.length === 0 ? (
          <div className="glass-panel p-12 text-center rounded-2xl max-w-md mx-auto space-y-4">
            <Award className="w-12 h-12 text-slate-500 mx-auto" />
            <h3 className="text-base font-bold text-white">No Certificates Earned Yet</h3>
            <p className="text-xs text-slate-400">Complete 100% of your enrolled course lessons to issue a certificate.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {certificates.map((cert) => (
              <div key={cert._id} className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <Badge variant="amber" size="md">
                    ID: {cert.certificateId}
                  </Badge>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(cert.issueDate).toLocaleDateString()}
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white">{cert.course?.title}</h3>
                  <p className="text-xs text-slate-400">Professional Certificate of Completion</p>
                </div>

                <div className="pt-2">
                  <Link to={`/verify-certificate/${cert.certificateId}`} target="_blank">
                    <Button variant="outline" size="sm" className="w-full" rightIcon={<ExternalLink className="w-4 h-4" />}>
                      Verify Credential
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
