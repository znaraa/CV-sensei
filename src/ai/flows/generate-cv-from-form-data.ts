'use server';

/**
 * @fileOverview Generates 履歴書 (Rirekisho) and 職務経歴書 (Shokumu Keirekisho) based on form data provided by the user.
 *
 * - generateCvFromFormData - A function to generate the CV documents.
 * - GenerateCvFromFormDataInput - The input type for the generateCvFromFormData function.
 * - GenerateCvFromFormDataOutput - The return type for the generateCvFromFormData function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateCvFromFormDataInputSchema = z.object({
  personalInfo: z.object({
    name: z.string().describe('The full name of the user.'),
    email: z.string().email().describe('The email address of the user.'),
    phone: z.string().describe('The phone number of the user.'),
    address: z.string().describe('The address of the user.'),
    dob: z.string().describe('The date of birth of the user.'),
    gender: z.string().describe('The gender of the user.'),
  }).describe('Personal information of the user'),
  jobTitle: z.string().describe("The job title the user is applying for."),
  education: z.array(z.object({
    institution: z.string().describe('The name of the educational institution.'),
    degree: z.string().describe('The degree obtained.'),
    major: z.string().describe('The major field of study.'),
    graduationDate: z.string().describe('The graduation date.'),
  })).describe('Education history of the user.'),
  experience: z.array(z.object({
    company: z.string().describe('The name of the company.'),
    position: z.string().describe('The job position held.'),
    startDate: z.string().describe('The start date of the employment.'),
    endDate: z.string().describe('The end date of the employment.'),
    responsibilities: z.string().describe('The responsibilities held at the job.'),
  })).describe('Work experience of the user.'),
  skills: z.array(z.string()).describe('Skills of the user.'),
  goals: z.string().describe('Career goals of the user.'),
});

export type GenerateCvFromFormDataInput = z.infer<typeof GenerateCvFromFormDataInputSchema>;

const GenerateCvFromFormDataOutputSchema = z.object({
  rirekisho: z.string().describe('The generated 履歴書 (Rirekisho) draft.'),
  shokumuKeirekisho: z.string().describe('The generated 職務経歴書 (Shokumu Keirekisho) draft.'),
});

export type GenerateCvFromFormDataOutput = z.infer<typeof GenerateCvFromFormDataOutputSchema>;

export async function generateCvFromFormData(input: GenerateCvFromFormDataInput): Promise<GenerateCvFromFormDataOutput> {
  return generateCvFromFormDataFlow(input);
}

const generateCvPrompt = ai.definePrompt({
  name: 'generateCvPrompt',
  input: {schema: GenerateCvFromFormDataInputSchema},
  output: {schema: GenerateCvFromFormDataOutputSchema},
  prompt: `You are an expert in creating 履歴書 (Rirekisho) and 職務経歴書 (Shokumu Keirekisho) in the Japanese format.\n
  Based on the following information, generate a draft of both documents for a person applying for the position of {{{jobTitle}}}.\n
  Personal Information:\n  Name: {{{personalInfo.name}}}\n  Email: {{{personalInfo.email}}}\n  Phone: {{{personalInfo.phone}}}\n  Address: {{{personalInfo.address}}}\n  Date of Birth: {{{personalInfo.dob}}}\n  Gender: {{{personalInfo.gender}}}\n
  Education:\n  {{#each education}}\n  Institution: {{{institution}}}\n  Degree: {{{degree}}}\n  Major: {{{major}}}\n  Graduation Date: {{{graduationDate}}}\n  {{/each}}\n
  Work Experience:\n  {{#each experience}}\n  Company: {{{company}}}\n  Position: {{{position}}}\n  Start Date: {{{startDate}}}\n  End Date: {{{endDate}}}\n  Responsibilities: {{{responsibilities}}}\n  {{/each}}\n
  Skills: {{skills}}\n
  Career Goals: {{{goals}}}\n
  Please provide the 履歴書 (Rirekisho) and 職務経歴書 (Shokumu Keirekisho) drafts in a well-formatted, professional manner.\n
  Make sure to use bullet points for skills and responsibilities.\n
  The output must be returned as a JSON object with the fields:\n  - rirekisho: The generated 履歴書 (Rirekisho) draft.\n  - shokumuKeirekisho: The generated 職務経歴書 (Shokumu Keirekisho) draft.\n  `,
});

const generateCvFromFormDataFlow = ai.defineFlow(
  {
    name: 'generateCvFromFormDataFlow',
    inputSchema: GenerateCvFromFormDataInputSchema,
    outputSchema: GenerateCvFromFormDataOutputSchema,
  },
  async input => {
    const {output} = await generateCvPrompt(input);
    return output!;
  }
);
