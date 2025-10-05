"use client";

import { useFieldArray, useForm, useWatch } from 'react-hook-form';
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
import { PlusCircle, Trash2, Loader2, Briefcase, User, GraduationCap, Building2, Lightbulb, Target, Wand2, Smile, Award } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createCvAction, updateCvAction, suggestSkillsAction } from '@/actions/cv';
import { useAuth } from '@/hooks/use-auth';
import type { Resume } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface CvFormProps {
  resumeId?: string;
  defaultValues?: Partial<CvFormValues>;
}

export default function CvForm({ resumeId, defaultValues }: CvFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isSuggestingSkills, setIsSuggestingSkills] = useState(false);
  const [suggestedSkills, setSuggestedSkills] = useState<string[]>([]);
  const isEditing = !!resumeId;

  const form = useForm<CvFormValues>({
    resolver: zodResolver(cvSchema),
    defaultValues: defaultValues || {
      personalInfo: { name: '', email: '', phone: '', address: '', dob: '', gender: 'male' },
      jobTitle: '',
      education: [{ institution: '', degree: '', major: '', graduationDate: '' }],
      experience: [],
      skills: { selected: [], other: '' },
      certifications: [],
      goals: '',
      personalInterests: '',
    },
  });

  const jobTitle = useWatch({ control: form.control, name: 'jobTitle' });

  const { fields: educationFields, append: appendEducation, remove: removeEducation } = useFieldArray({
    control: form.control,
    name: 'education',
  });

  const { fields: experienceFields, append: appendExperience, remove: removeExperience } = useFieldArray({
    control: form.control,
    name: 'experience',
  });
  
  const { fields: certificationFields, append: appendCertification, remove: removeCertification } = useFieldArray({
    control: form.control,
    name: 'certifications',
  });
  
  const handleSuggestSkills = async () => {
    if (!jobTitle) {
      toast({
        variant: "destructive",
        title: "Job Title Required",
        description: "Please enter a job title to get skill suggestions.",
      });
      return;
    }
    setIsSuggestingSkills(true);
    setSuggestedSkills([]);
    try {
      const result = await suggestSkillsAction(jobTitle);
      if (result.success && result.skills) {
        setSuggestedSkills(result.skills);
        toast({
          title: "Skills Suggested",
          description: "Click on a skill to add it to your list.",
        });
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
       toast({
        variant: "destructive",
        title: "Failed to Suggest Skills",
        description: error.message || "An unexpected error occurred.",
      });
    } finally {
      setIsSuggestingSkills(false);
    }
  };

  const addSuggestedSkill = (skill: string) => {
    const currentOtherSkills = form.getValues('skills.other') || '';
    const otherSkillsArray = currentOtherSkills.split(',').map(s => s.trim()).filter(Boolean);
    
    if (!otherSkillsArray.includes(skill) && !SKILL_OPTIONS.includes(skill)) {
      const newOtherSkills = [...otherSkillsArray, skill].join(', ');
      form.setValue('skills.other', newOtherSkills, { shouldValidate: true });
    }
    setSuggestedSkills(prev => prev.filter(s => s !== skill));
  };


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
        <Accordion type="multiple" defaultValue={['personal-info', 'job-title', 'education', 'skills', 'goals']} className="w-full space-y-4">
          
          {/* Personal Information */}
          <AccordionItem value="personal-info">
             <Card>
              <AccordionTrigger className="p-6 font-headline text-lg">
                <div className="flex items-center">
                  <User className="mr-2 h-5 w-5" />
                  <span>Personal Information</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-6 pt-0">
                <div className="space-y-4">
                  <FormField control={form.control} name="personalInfo.name" render={({ field }) => (<FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="Taro Yamada" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="personalInfo.email" render={({ field }) => (<FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" placeholder="taro.yamada@example.com" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="personalInfo.phone" render={({ field }) => (<FormItem><FormLabel>Phone</FormLabel><FormControl><Input placeholder="080-1234-5678" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="personalInfo.address" render={({ field }) => (<FormItem><FormLabel>Address</FormLabel><FormControl><Input placeholder="Tokyo, Japan" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="personalInfo.dob" render={({ field }) => (<FormItem><FormLabel>Date of Birth</FormLabel><FormControl><Input placeholder="YYYY-MM-DD" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField
                    control={form.control}
                    name="personalInfo.gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a gender" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </AccordionContent>
            </Card>
          </AccordionItem>

          {/* Job Title */}
          <AccordionItem value="job-title">
            <Card>
              <AccordionTrigger className="p-6 font-headline text-lg">
                <div className="flex items-center">
                  <Briefcase className="mr-2 h-5 w-5" />
                  <span>Job Application</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-6 pt-0">
                <FormField
                  control={form.control}
                  name="jobTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Title You're Applying For</FormLabel>
                      <div className="flex items-center gap-2">
                        <FormControl>
                          <Input placeholder="e.g., Software Engineer, Project Manager" {...field} />
                        </FormControl>
                         <Button type="button" onClick={handleSuggestSkills} disabled={isSuggestingSkills}>
                           {isSuggestingSkills ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                          <span className="ml-2 hidden sm:inline">Suggest Skills</span>
                        </Button>
                      </div>
                      <FormDescription>
                        Specify the role you are interested in. This helps the AI tailor your CV and suggest skills.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </AccordionContent>
            </Card>
          </AccordionItem>

          {/* Education */}
          <AccordionItem value="education">
            <Card>
              <AccordionTrigger className="p-6 font-headline text-lg">
                <div className="flex items-center">
                  <GraduationCap className="mr-2 h-5 w-5" />
                  <span>Education</span>
                </div>
              </AccordionTrigger>
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
              <AccordionTrigger className="p-6 font-headline text-lg">
                <div className="flex items-center">
                  <Building2 className="mr-2 h-5 w-5" />
                  <span>Work Experience (Optional)</span>
                </div>
              </AccordionTrigger>
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
               <AccordionTrigger className="p-6 font-headline text-lg">
                <div className="flex items-center">
                  <Lightbulb className="mr-2 h-5 w-5" />
                  <span>Skills</span>
                </div>
              </AccordionTrigger>
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
                      <FormDescription>Add any other relevant skills not listed above, or use the suggestion feature.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {suggestedSkills.length > 0 && (
                   <div className="mt-4">
                      <p className="text-sm font-medium mb-2">Suggested Skills (click to add):</p>
                      <div className="flex flex-wrap gap-2">
                        {suggestedSkills.map((skill) => (
                          <Badge 
                            key={skill}
                            variant="secondary" 
                            className="cursor-pointer hover:bg-primary/20"
                            onClick={() => addSuggestedSkill(skill)}
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                   </div>
                )}
              </AccordionContent>
            </Card>
          </AccordionItem>
          
          {/* Certifications */}
          <AccordionItem value="certifications">
            <Card>
              <AccordionTrigger className="p-6 font-headline text-lg">
                <div className="flex items-center">
                  <Award className="mr-2 h-5 w-5" />
                  <span>Certifications (Optional)</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-6 pt-0">
                {certificationFields.map((field, index) => (
                  <div key={field.id} className="p-4 border rounded-lg mb-4 space-y-4 relative">
                     <h4 className="font-semibold">Certification #{index + 1}</h4>
                     <FormField control={form.control} name={`certifications.${index}.name`} render={({ field }) => (<FormItem><FormLabel>Certification Name</FormLabel><FormControl><Input placeholder="e.g., Driver's License" {...field} /></FormControl><FormMessage /></FormItem>)} />
                     <FormField control={form.control} name={`certifications.${index}.date`} render={({ field }) => (<FormItem><FormLabel>Date Obtained</FormLabel><FormControl><Input placeholder="e.g., June 2021" {...field} /></FormControl><FormMessage /></FormItem>)} />
                     <Button type="button" variant="destructive" size="sm" onClick={() => removeCertification(index)} className="absolute top-4 right-4"><Trash2 className="w-4 h-4 mr-1" /> Remove</Button>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={() => appendCertification({ name: '', date: '' })}><PlusCircle className="w-4 h-4 mr-1"/> Add Certification</Button>
              </AccordionContent>
            </Card>
          </AccordionItem>

          {/* Career Goals */}
          <AccordionItem value="goals">
            <Card>
              <AccordionTrigger className="p-6 font-headline text-lg">
                <div className="flex items-center">
                  <Target className="mr-2 h-5 w-5" />
                  <span>Career Goals</span>
                </div>
              </AccordionTrigger>
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
          
          {/* Personal Interests */}
          <AccordionItem value="personal-interests">
            <Card>
              <AccordionTrigger className="p-6 font-headline text-lg">
                <div className="flex items-center">
                  <Smile className="mr-2 h-5 w-5" />
                  <span>Personal Interests (Optional)</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-6 pt-0">
                <FormField
                  control={form.control}
                  name="personalInterests"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Personality, Hobbies, etc.</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Describe your personality, hobbies, or things you are passionate about." {...field} rows={5} />
                      </FormControl>
                      <FormDescription>This can help recruiters understand you better as a person.</FormDescription>
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
