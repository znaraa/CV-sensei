import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Bot, FileText, DownloadCloud } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function Home() {
  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-background');

  const features = [
    {
      icon: <FileText className="h-10 w-10 text-primary" />,
      title: 'Structured CV Builder',
      description: 'Easily input your personal details, education, and work history through our intuitive forms.',
    },
    {
      icon: <Bot className="h-10 w-10 text-primary" />,
      title: 'AI-Powered Generation',
      description: 'Let our AI, "CV Sensei," generate professional 履歴書 (Rirekisho) and 職務経歴書 (Shokumu Keirekisho) for you.',
    },
    {
      icon: <DownloadCloud className="h-10 w-10 text-primary" />,
      title: 'Export to PDF',
      description: 'Download your generated CVs as clean, professionally formatted PDF files, ready for job applications.',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative w-full py-20 md:py-32 lg:py-40 flex items-center justify-center text-center bg-card">
          {heroImage && (
            <Image
              src={heroImage.imageUrl}
              alt={heroImage.description}
              fill
              className="object-cover opacity-10"
              data-ai-hint={heroImage.imageHint}
              priority
            />
          )}
          <div className="container px-4 md:px-6 z-10">
            <div className="max-w-3xl mx-auto">
              <h1 className="font-headline text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
                Craft Your Perfect Japanese CV with <span className="text-primary">CV Sensei</span>
              </h1>
              <p className="mt-6 text-lg leading-8 text-muted-foreground md:text-xl">
                Your personal AI assistant for creating professional 履歴書 (Rirekisho) and 職務経歴書 (Shokumu Keirekisho). Land your dream job in Japan with a flawless first impression.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Button asChild size="lg">
                  <Link href="/register">Get Started for Free</Link>
                </Button>
                <Button asChild variant="ghost" size="lg">
                  <Link href="/login">Log In &rarr;</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 sm:py-32">
          <div className="container mx-auto px-6 lg:px-8">
            <div className="mx-auto max-w-2xl lg:text-center">
              <h2 className="font-headline text-base font-semibold leading-7 text-primary">Your Path to Success</h2>
              <p className="mt-2 font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Everything you need to create a winning CV
              </p>
              <p className="mt-6 text-lg leading-8 text-muted-foreground">
                CV Sensei streamlines the complex process of creating Japanese resumes, combining your information with AI precision.
              </p>
            </div>
            <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
              <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
                {features.map((feature) => (
                  <div key={feature.title} className="flex flex-col items-center text-center p-6 rounded-lg transition-all duration-300 hover:bg-card hover:shadow-xl">
                    <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-foreground">
                      {feature.icon}
                      <span className="font-headline text-xl">{feature.title}</span>
                    </dt>
                    <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-muted-foreground">
                      <p className="flex-auto">{feature.description}</p>
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>

        {/* How it works Section */}
        <section className="py-20 sm:py-32 bg-card">
          <div className="container mx-auto px-6 lg:px-8">
            <div className="text-center">
               <h2 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Simple Steps to Your Professional CV</h2>
               <p className="mt-4 text-lg text-muted-foreground">From data entry to a polished document in minutes.</p>
            </div>
            <div className="relative mt-16">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 h-full w-px bg-border" aria-hidden="true"></div>
              <ul className="space-y-12">
                <li className="relative flex items-center justify-start md:justify-center">
                  <div className="md:w-1/2 md:pr-8 md:text-right">
                    <Card className="p-6 max-w-md ml-auto">
                      <h3 className="font-headline text-xl font-semibold text-primary">1. Provide Your Information</h3>
                      <p className="mt-2 text-muted-foreground">Fill out our comprehensive forms with your career details. We guide you through every step.</p>
                    </Card>
                  </div>
                  <div className="absolute left-1/2 -translate-x-1/2 bg-background p-2 rounded-full border-2 border-primary">
                    <CheckCircle className="w-5 h-5 text-primary"/>
                  </div>
                </li>
                 <li className="relative flex items-center justify-end md:justify-center">
                  <div className="md:w-1/2 md:pl-8 md:text-left">
                     <Card className="p-6 max-w-md mr-auto">
                      <h3 className="font-headline text-xl font-semibold text-primary">2. AI Works Its Magic</h3>
                      <p className="mt-2 text-muted-foreground">Our Sensei analyzes your data and generates drafts of your Rirekisho and Shokumu Keirekisho.</p>
                    </Card>
                  </div>
                  <div className="absolute left-1/2 -translate-x-1/2 bg-background p-2 rounded-full border-2 border-primary">
                    <CheckCircle className="w-5 h-5 text-primary"/>
                  </div>
                </li>
                 <li className="relative flex items-center justify-start md:justify-center">
                   <div className="md:w-1/2 md:pr-8 md:text-right">
                     <Card className="p-6 max-w-md ml-auto">
                      <h3 className="font-headline text-xl font-semibold text-primary">3. Review and Export</h3>
                      <p className="mt-2 text-muted-foreground">Fine-tune the generated documents and export them as print-ready PDFs for your applications.</p>
                     </Card>
                  </div>
                   <div className="absolute left-1/2 -translate-x-1/2 bg-background p-2 rounded-full border-2 border-primary">
                    <CheckCircle className="w-5 h-5 text-primary"/>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-6 bg-background border-t">
        <div className="container mx-auto px-6 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} CV Sensei. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
