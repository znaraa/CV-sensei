'use server';

/**
 * @fileOverview Generates initial drafts of 履歴書 (Rirekisho) and 職務経歴書 (Shokumu Keirekisho) based on user-provided data.
 *
 * - generateInitialCvDraft - A function to generate the initial CV drafts.
 * - GenerateInitialCvDraftInput - The input type for the generateInitialCvDraft function.
 * - GenerateInitialCvDraftOutput - The return type for the generateInitialCvDraft function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateInitialCvDraftInputSchema = z.object({
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

export type GenerateInitialCvDraftInput = z.infer<typeof GenerateInitialCvDraftInputSchema>;

const GenerateInitialCvDraftOutputSchema = z.object({
  rirekisho: z.string().describe('The generated 履歴書 (Rirekisho) draft.'),
  shokumuKeirekisho: z.string().describe('The generated 職務経歴書 (Shokumu Keirekisho) draft.'),
});

export type GenerateInitialCvDraftOutput = z.infer<typeof GenerateInitialCvDraftOutputSchema>;

export async function generateInitialCvDraft(input: GenerateInitialCvDraftInput): Promise<GenerateInitialCvDraftOutput> {
  return generateInitialCvDraftFlow(input);
}

const generateCvDraftPrompt = ai.definePrompt({
  name: 'generateCvDraftPrompt',
  input: {schema: GenerateInitialCvDraftInputSchema},
  output: {schema: GenerateInitialCvDraftOutputSchema},
  prompt: `You are an expert in creating 履歴書 (Rirekisho) and 職務経歴書 (Shokumu Keirekisho) in the Japanese format.

  Based on the following information, generate a draft of both documents for a person applying for the position of {{{jobTitle}}}.

  Personal Information:
  Name: {{{personalInfo.name}}}
  Email: {{{personalInfo.email}}}
  Phone: {{{personalInfo.phone}}}
  Address: {{{personalInfo.address}}}
  Date of Birth: {{{personalInfo.dob}}}
  Gender: {{{personalInfo.gender}}}

  Education:
  {{#each education}}
  Institution: {{{institution}}}
  Degree: {{{degree}}}
  Major: {{{major}}}
  Graduation Date: {{{graduationDate}}}
  {{/each}}

  Work Experience:
  {{#each experience}}
  Company: {{{company}}}
  Position: {{{position}}}
  Start Date: {{{startDate}}}
  End Date: {{{endDate}}}
  Responsibilities: {{{responsibilities}}}
  {{/each}}

  Skills: {{skills}}

  Career Goals: {{{goals}}}

  Please provide the 履歴書 (Rirekisho) and 職務経歴書 (Shokumu Keirekisho) drafts in a well-formatted, professional manner.

  Make sure to use bullet points for skills and responsibilities.

  The output must be returned as a JSON object with the fields:
  - rirekisho: The generated 履歴書 (Rirekisho) draft.
  - shokumuKeirekisho: The generated 職務経歴書 (Shokumu Keirekisho) draft.
  `,
});

const generateInitialCvDraftFlow = ai.defineFlow(
  {
    name: 'generateInitialCvDraftFlow',
    inputSchema: GenerateInitialCvDraftInputSchema,
    outputSchema: GenerateInitialCvDraftOutputSchema,
  },
  async input => {
    const {output} = await generateCvDraftPrompt(input);
    return output!;
  }
);
