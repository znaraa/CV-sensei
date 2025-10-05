'use server';
/**
 * @fileOverview Summarizes work experience using Genkit.
 *
 * - summarizeWorkExperience - A function that summarizes work experience.
 * - SummarizeWorkExperienceInput - The input type for the summarizeWorkExperience function.
 * - SummarizeWorkExperienceOutput - The return type for the summarizeWorkExperience function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeWorkExperienceInputSchema = z.object({
  workExperience: z
    .string()
    .describe('The work experience to be summarized.'),
});
export type SummarizeWorkExperienceInput = z.infer<
  typeof SummarizeWorkExperienceInputSchema
>;

const SummarizeWorkExperienceOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the work experience.'),
});
export type SummarizeWorkExperienceOutput = z.infer<
  typeof SummarizeWorkExperienceOutputSchema
>;

export async function summarizeWorkExperience(
  input: SummarizeWorkExperienceInput
): Promise<SummarizeWorkExperienceOutput> {
  return summarizeWorkExperienceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeWorkExperiencePrompt',
  input: {schema: SummarizeWorkExperienceInputSchema},
  output: {schema: SummarizeWorkExperienceOutputSchema},
  prompt: `Summarize the following work experience in a concise manner:\n\nWork Experience: {{{workExperience}}}`,
});

const summarizeWorkExperienceFlow = ai.defineFlow(
  {
    name: 'summarizeWorkExperienceFlow',
    inputSchema: SummarizeWorkExperienceInputSchema,
    outputSchema: SummarizeWorkExperienceOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
