"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { getResume } from '@/lib/firestore';
import type { Resume } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Printer, Edit, FileWarning } from 'lucide-react';
import Link from 'next/link';

function GeneratedCvView({ resume }: { resume: Resume }) {

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline text-3xl font-bold text-foreground">{resume.title}</h1>
          <p className="text-muted-foreground mt-1">Generated documents for {resume.personalInfo.name}</p>
        </div>
        <div className="flex gap-2 no-print">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/cv/${resume.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" /> Edit
            </Link>
          </Button>
          <Button onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" /> Export to PDF
          </Button>
        </div>
      </div>

      <div className="printable-content">
        <Tabs defaultValue="rirekisho">
          <TabsList className="grid w-full grid-cols-2 no-print">
            <TabsTrigger value="rirekisho">履歴書 (Rirekisho)</TabsTrigger>
            <TabsTrigger value="shokumuKeirekisho">職務経歴書 (Shokumu Keirekisho)</TabsTrigger>
          </TabsList>
          <TabsContent value="rirekisho">
            <Card>
              <CardHeader>
                <CardTitle className="font-headline">履歴書 (Rirekisho)</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="whitespace-pre-wrap font-body text-sm leading-relaxed">{resume.rirekisho}</pre>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="shokumuKeirekisho">
            <Card>
              <CardHeader>
                <CardTitle className="font-headline">職務経歴書 (Shokumu Keirekisho)</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="whitespace-pre-wrap font-body text-sm leading-relaxed">{resume.shokumuKeirekisho}</pre>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function CvViewSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-9 w-72" />
          <Skeleton className="h-5 w-48" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-[600px] w-full" />
    </div>
  );
}


export default function CvPage() {
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
            setError("You do not have permission to view this CV.");
          } else {
            setError("CV not found.");
          }
        })
        .catch(() => setError("Failed to load CV."))
        .finally(() => setLoading(false));
    }
  }, [user, cvId]);

  if (loading) {
    return <div className="container mx-auto p-4 sm:p-6 lg:p-8"><CvViewSkeleton /></div>;
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
    return (
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <GeneratedCvView resume={resume} />
      </div>
    );
  }

  return null;
}
