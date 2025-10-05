"use client";

import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { cvSchema, CvFormValues, SKILL_OPTIONS } from '@/schemas/cv';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { PlusCircle, Trash2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createCvAction, updateCvAction } from '@/actions/cv';
import { useAuth } from '@/hooks/use-auth';
import type { Resume } from '@/types';

interface CvFormProps {
  resumeId?: string;
  defaultValues?: Partial<CvFormValues>;
}

export default function CvForm({ resumeId, defaultValues }: CvFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const isEditing = !!resumeId;

  const form = useForm<CvFormValues>({
    resolver: zodResolver(cvSchema),
    defaultValues: defaultValues || {
      personalInfo: { name: '', email: '', phone: '', address: '' },
      education: [{ institution: '', degree: '', major: '', graduationDate: '' }],
      experience: [],
      skills: { selected: [], other: '' },
      goals: '',
    },
  });

  const { fields: educationFields, append: appendEducation, remove: removeEducation } = useFieldArray({
    control: form.control,
    name: 'education',
  });

  const { fields: experienceFields, append: appendExperience, remove: removeExperience } = useFieldArray({
    control: form.control,
    name: 'experience',
  });

  const onSubmit = async (data: CvFormValues) => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Authentication Error', description: 'You must be logged in.' });
      return;
    }
    setLoading(true);

    const action = isEditing
      ? updateCvAction(resumeId, user.uid, data)
      // @ts-ignore
      : createCvAction(user.uid, data);

    try {
      const result = await action;
      if (result.success && result.id) {
        toast({
          title: `CV ${isEditing ? 'Updated' : 'Created'}!`,
          description: `Your CV has been successfully ${isEditing ? 'updated' : 'created'}.`,
        });
        router.push(`/dashboard/cv/${result.id}`);
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: `Error ${isEditing ? 'Updating' : 'Creating'} CV`,
        description: error.message || 'An unexpected error occurred.',
      });
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Accordion type="multiple" defaultValue={['personal-info', 'education', 'skills', 'goals']} className="w-full space-y-4">
          
          {/* Personal Information */}
          <AccordionItem value="personal-info">
             <Card>
              <AccordionTrigger className="p-6 font-headline text-lg">Personal Information</AccordionTrigger>
              <AccordionContent className="p-6 pt-0">
                <div className="space-y-4">
                  <FormField control={form.control} name="personalInfo.name" render={({ field }) => (<FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="Taro Yamada" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="personalInfo.email" render={({ field }) => (<FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" placeholder="taro.yamada@example.com" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="personalInfo.phone" render={({ field }) => (<FormItem><FormLabel>Phone</FormLabel><FormControl><Input placeholder="080-1234-5678" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="personalInfo.address" render={({ field }) => (<FormItem><FormLabel>Address</FormLabel><FormControl><Input placeholder="Tokyo, Japan" {...field} /></FormControl><FormMessage /></FormItem>)} />
                </div>
              </AccordionContent>
            </Card>
          </AccordionItem>

          {/* Education */}
          <AccordionItem value="education">
            <Card>
              <AccordionTrigger className="p-6 font-headline text-lg">Education</AccordionTrigger>
              <AccordionContent className="p-6 pt-0">
                {educationFields.map((field, index) => (
                  <div key={field.id} className="p-4 border rounded-lg mb-4 space-y-4 relative">
                     <h4 className="font-semibold">Education #{index + 1}</h4>
                     <FormField control={form.control} name={`education.${index}.institution`} render={({ field }) => (<FormItem><FormLabel>Institution</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                     <FormField control={form.control} name={`education.${index}.degree`} render={({ field }) => (<FormItem><FormLabel>Degree</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                     <FormField control={form.control} name={`education.${index}.major`} render={({ field }) => (<FormItem><FormLabel>Major</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                     <FormField control={form.control} name={`education.${index}.graduationDate`} render={({ field }) => (<FormItem><FormLabel>Graduation Date</FormLabel><FormControl><Input placeholder="e.g., March 2020" {...field} /></FormControl><FormMessage /></FormItem>)} />
                     <Button type="button" variant="destructive" size="sm" onClick={() => removeEducation(index)} className="absolute top-4 right-4"><Trash2 className="w-4 h-4 mr-1" /> Remove</Button>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={() => appendEducation({ institution: '', degree: '', major: '', graduationDate: '' })}><PlusCircle className="w-4 h-4 mr-1"/> Add Education</Button>
              </AccordionContent>
            </Card>
          </AccordionItem>
          
          {/* Work Experience */}
          <AccordionItem value="experience">
            <Card>
              <AccordionTrigger className="p-6 font-headline text-lg">Work Experience (Optional)</AccordionTrigger>
              <AccordionContent className="p-6 pt-0">
                {experienceFields.map((field, index) => (
                  <div key={field.id} className="p-4 border rounded-lg mb-4 space-y-4 relative">
                     <h4 className="font-semibold">Experience #{index + 1}</h4>
                     <FormField control={form.control} name={`experience.${index}.company`} render={({ field }) => (<FormItem><FormLabel>Company</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                     <FormField control={form.control} name={`experience.${index}.position`} render={({ field }) => (<FormItem><FormLabel>Position</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                     <div className="grid grid-cols-2 gap-4">
                       <FormField control={form.control} name={`experience.${index}.startDate`} render={({ field }) => (<FormItem><FormLabel>Start Date</FormLabel><FormControl><Input placeholder="e.g., April 2020" {...field} /></FormControl><FormMessage /></FormItem>)} />
                       <FormField control={form.control} name={`experience.${index}.endDate`} render={({ field }) => (<FormItem><FormLabel>End Date</FormLabel><FormControl><Input placeholder="e.g., Present" {...field} /></FormControl><FormMessage /></FormItem>)} />
                     </div>
                     <FormField control={form.control} name={`experience.${index}.responsibilities`} render={({ field }) => (<FormItem><FormLabel>Responsibilities</FormLabel><FormControl><Textarea placeholder="Describe your key responsibilities and achievements..." {...field} /></FormControl><FormMessage /></FormItem>)} />
                     <Button type="button" variant="destructive" size="sm" onClick={() => removeExperience(index)} className="absolute top-4 right-4"><Trash2 className="w-4 h-4 mr-1" /> Remove</Button>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={() => appendExperience({ company: '', position: '', startDate: '', endDate: '', responsibilities: '' })}><PlusCircle className="w-4 h-4 mr-1"/> Add Experience</Button>
              </AccordionContent>
            </Card>
          </AccordionItem>

          {/* Skills */}
          <AccordionItem value="skills">
            <Card>
              <AccordionTrigger className="p-6 font-headline text-lg">Skills</AccordionTrigger>
              <AccordionContent className="p-6 pt-0">
                <FormField
                  control={form.control}
                  name="skills.selected"
                  render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel className="text-base">Select your skills</FormLabel>
                        <FormDescription>Choose from the list of common skills.</FormDescription>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {SKILL_OPTIONS.map((item) => (
                          <FormField
                            key={item}
                            control={form.control}
                            name="skills.selected"
                            render={({ field }) => (
                              <FormItem key={item} className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl><Checkbox checked={field.value?.includes(item)} onCheckedChange={(checked) => {
                                    return checked ? field.onChange([...(field.value || []), item]) : field.onChange(field.value?.filter((value) => value !== item));
                                  }} /></FormControl>
                                <FormLabel className="font-normal">{item}</FormLabel>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Separator className="my-6" />
                <FormField
                  control={form.control}
                  name="skills.other"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Other Skills</FormLabel>
                      <FormControl><Input placeholder="Comma-separated skills, e.g., Figma, SQL" {...field} /></FormControl>
                      <FormDescription>Add any other relevant skills not listed above.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </AccordionContent>
            </Card>
          </AccordionItem>

          {/* Career Goals */}
          <AccordionItem value="goals">
            <Card>
              <AccordionTrigger className="p-6 font-headline text-lg">Career Goals</AccordionTrigger>
              <AccordionContent className="p-6 pt-0">
                <FormField
                  control={form.control}
                  name="goals"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>自己PR (Self-promotion)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Describe your career aspirations, strengths, and what you want to achieve." {...field} rows={5} />
                      </FormControl>
                      <FormDescription>This will be used for the self-promotion section of your CV.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </AccordionContent>
            </Card>
          </AccordionItem>
        </Accordion>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEditing ? 'Updating...' : 'Generating...'}
              </>
            ) : (
              isEditing ? 'Update & Regenerate CV' : 'Generate CV'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
