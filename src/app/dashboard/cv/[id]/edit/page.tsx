"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { getResume } from '@/lib/firestore';
import type { Resume } from '@/types';
import CvForm from '@/components/cv/CvForm';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { FileWarning } from 'lucide-react';
import { CvFormValues } from '@/schemas/cv';

function EditCvPageSkeleton() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-5 w-96" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  );
}

export default function EditCvPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [resume, setResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cvId = Array.isArray(params.id) ? params.id[0] : params.id;

  useEffect(() => {
    if (user && cvId) {
      getResume(cvId)
        .then((data) => {
          if (data && data.userId === user.uid) {
            setResume(data);
          } else if (data) {
            setError("You do not have permission to edit this CV.");
          } else {
            setError("CV not found.");
          }
        })
        .catch(() => setError("Failed to load CV data."))
        .finally(() => setLoading(false));
    }
  }, [user, cvId]);

  if (loading) {
    return <div className="container mx-auto max-w-4xl p-4 sm:p-6 lg:p-8"><EditCvPageSkeleton /></div>;
  }
  
  if (error) {
    return (
       <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <Alert variant="destructive">
          <FileWarning className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
         <Button onClick={() => router.push('/dashboard')} className="mt-4">Back to Dashboard</Button>
      </div>
    );
  }

  if (resume) {
    const defaultValues: CvFormValues = {
        personalInfo: resume.personalInfo,
        education: resume.education,
        experience: resume.experience,
        skills: resume.skills,
        goals: resume.goals
    };

    return (
      <div className="container mx-auto max-w-4xl p-4 sm:p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="font-headline text-3xl font-bold text-foreground">Edit CV</h1>
          <p className="text-muted-foreground mt-1">Make changes to your CV and regenerate the documents.</p>
        </div>
        <CvForm resumeId={cvId} defaultValues={defaultValues} />
      </div>
    );
  }
  
  return null;
}
