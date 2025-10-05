"use client";

import Link from "next/link";
import { useEffect, useState } from 'react';
import { Button, buttonVariants } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { getResumes } from "@/lib/firestore";
import { Resume } from "@/types";
import { PlusCircle, FileText, Inbox, Trash2, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { deleteCvAction } from "@/actions/cv";

function CvCardSkeleton() {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
      <div className="flex-grow" />
      <CardFooter>
        <Skeleton className="h-4 w-1/3" />
      </CardFooter>
    </Card>
  );
}


function CvCard({ resume, userId }: { resume: Resume; userId: string }) {
  const updatedAt = resume.updatedAt?.toDate();
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleConfirmDelete = async () => {
    if (!resume.id) return;
    setIsDeleting(true);
    try {
      const result = await deleteCvAction(resume.id, userId);
      if (result.success) {
        toast({
          title: "CV Deleted",
          description: "The CV has been successfully removed.",
        });
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Deletion Failed",
        description: error.message || "An unexpected error occurred.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card className="h-full flex flex-col hover:shadow-lg hover:border-primary transition-all duration-200">
      <Link href={`/dashboard/cv/${resume.id}`} className="flex-grow">
        <CardHeader>
          <CardTitle className="font-headline text-xl flex items-center gap-2">
            <FileText className="w-5 h-5 text-accent" />
            CV for {resume.personalInfo.name}
          </CardTitle>
          <CardDescription>Created for {resume.personalInfo.name}</CardDescription>
        </CardHeader>
      </Link>
      <CardFooter className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Last updated {updatedAt ? formatDistanceToNow(updatedAt, { addSuffix: true }) : 'recently'}
        </p>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
              <span className="sr-only">Delete CV</span>
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your CV.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className={buttonVariants({ variant: "destructive" })}
              >
                {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
}


function CvList({ resumes, userId }: { resumes: Resume[], userId: string }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {resumes.map((resume) => (
        <CvCard key={resume.id} resume={resume} userId={userId} />
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-20 px-6 border-2 border-dashed rounded-lg">
      <Inbox className="mx-auto h-12 w-12 text-muted-foreground" />
      <h3 className="mt-4 font-headline text-lg font-medium text-foreground">No CVs Created Yet</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Get started by creating your first CV.
      </p>
      <div className="mt-6">
        <Button asChild>
          <Link href="/dashboard/cv/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create New CV
          </Link>
        </Button>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const unsubscribe = getResumes(user.uid, (resumes) => {
        setResumes(resumes);
        setLoading(false);
      });
      return () => unsubscribe();
    }
  }, [user]);

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-headline text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage your CVs here.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/cv/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create New CV
          </Link>
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <CvCardSkeleton />
          <CvCardSkeleton />
          <CvCardSkeleton />
        </div>
      ) : resumes.length > 0 ? (
        <CvList resumes={resumes} userId={user!.uid}/>
      ) : (
        <EmptyState />
      )}
    </div>
  );
}
