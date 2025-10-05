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
import { Printer, Edit, FileWarning, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { generateDocumentAction } from '@/actions/cv';
import { useToast } from '@/hooks/use-toast';

function GeneratedCvView({ resume, cvId }: { resume: Resume, cvId: string }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isGeneratingRirekisho, setIsGeneratingRirekisho] = useState(false);
  const [isGeneratingShokumu, setIsGeneratingShokumu] = useState(false);

  const handlePrint = () => {
    window.print();
  };
  
  const handleGenerate = async (docType: 'rirekisho' | 'shokumuKeirekisho') => {
    if (!user) return;
    
    if (docType === 'rirekisho') {
      setIsGeneratingRirekisho(true);
    } else {
      setIsGeneratingShokumu(true);
    }
    
    const result = await generateDocumentAction(cvId, user.uid, docType);
    
    if (result.success) {
      toast({
        title: "Document Generated",
        description: result.message,
      });
    } else {
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: result.message,
      });
    }
    
    if (docType === 'rirekisho') {
      setIsGeneratingRirekisho(false);
    } else {
      setIsGeneratingShokumu(false);
    }
  };


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline text-3xl font-bold text-foreground">CV for {resume.personalInfo.name}</h1>
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
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="font-headline">履歴書 (Rirekisho)</CardTitle>
                <Button size="sm" onClick={() => handleGenerate('rirekisho')} disabled={isGeneratingRirekisho} className="no-print">
                  {isGeneratingRirekisho && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Generate Rirekisho
                </Button>
              </CardHeader>
              <CardContent>
                {resume.rirekisho ? (
                   <pre className="whitespace-pre-wrap font-body text-sm leading-relaxed">{resume.rirekisho}</pre>
                ) : (
                  <div className="text-center py-10 text-muted-foreground">
                    <p>Rirekisho has not been generated yet.</p>
                    <p>Click the button above to generate it.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="shokumuKeirekisho">
            <Card>
               <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="font-headline">職務経歴書 (Shokumu Keirekisho)</CardTitle>
                 <Button size="sm" onClick={() => handleGenerate('shokumuKeirekisho')} disabled={isGeneratingShokumu} className="no-print">
                  {isGeneratingShokumu && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Generate Shokumu Keirekisho
                </Button>
              </CardHeader>
              <CardContent>
                 {resume.shokumuKeirekisho ? (
                  <pre className="whitespace-pre-wrap font-body text-sm leading-relaxed">{resume.shokumuKeirekisho}</pre>
                ) : (
                  <div className="text-center py-10 text-muted-foreground">
                    <p>Shokumu Keirekisho has not been generated yet.</p>
                    <p>Click the button above to generate it.</p>
                  </div>
                )}
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
      const unsubscribe = getResume(cvId, (data) => {
        if (data && data.userId === user.uid) {
          setResume(data);
        } else if (data) {
          setError("You do not have permission to view this CV.");
        } else {
          setError("CV not found.");
        }
        setLoading(false);
      });
      return () => unsubscribe();
    } else if (!user && !loading) {
      router.push('/login');
    }
  }, [user, cvId, loading, router]);


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
        <GeneratedCvView resume={resume} cvId={cvId} />
      </div>
    );
  }

  return null;
}