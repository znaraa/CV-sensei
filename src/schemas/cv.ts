import { z } from 'zod';

export const SKILL_OPTIONS = [
  "Japanese (JLPT N1)",
  "Japanese (JLPT N2)",
  "English (Business Level)",
  "React",
  "Next.js",
  "TypeScript",
  "Node.js",
  "Python",
  "AWS",
  "Google Cloud Platform",
];

const educationSchema = z.object({
  id: z.string().optional(),
  institution: z.string().min(1, 'Institution is required'),
  degree: z.string().min(1, 'Degree is required'),
  major: z.string().min(1, 'Major is required'),
  graduationDate: z.string().min(1, 'Graduation date is required'),
});

const experienceSchema = z.object({
  id: z.string().optional(),
  company: z.string().min(1, 'Company is required'),
  position: z.string().min(1, 'Position is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  responsibilities: z.string().min(1, 'Responsibilities are required'),
});

export const cvSchema = z.object({
  title: z.string().min(1, 'CV title is required'),
  personalInfo: z.object({
    name: z.string().min(1, 'Full name is required'),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(1, 'Phone number is required'),
    address: z.string().min(1, 'Address is required'),
  }),
  education: z.array(educationSchema).min(1, 'At least one education entry is required'),
  experience: z.array(experienceSchema),
  skills: z.object({
    selected: z.array(z.string()),
    other: z.string().optional(),
  }),
  goals: z.string().min(1, 'Career goals are required'),
});

export type CvFormValues = z.infer<typeof cvSchema>;
