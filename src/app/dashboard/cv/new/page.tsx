import CvForm from '@/components/cv/CvForm';

export default function NewCvPage() {
  return (
    <div className="container mx-auto max-w-4xl p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="font-headline text-3xl font-bold text-foreground">Create a New CV</h1>
        <p className="text-muted-foreground mt-1">Fill in your details and let our AI do the rest.</p>
      </div>
      <CvForm />
    </div>
  );
}
