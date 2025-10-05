'use server';
/**
 * @fileOverview Suggests relevant skills based on the provided job title.
 *
 * - suggestSkillsFromJobTitle - A function that suggests skills for a given job title.
 * - SuggestSkillsFromJobTitleInput - The input type for the suggestSkillsFromJobTitle function.
 * - SuggestSkillsFromJobTitleOutput - The return type for the suggestSkillsFromJobTitle function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestSkillsFromJobTitleInputSchema = z.object({
  jobTitle: z
    .string()
    .describe('The job title for which skills are to be suggested.'),
});
export type SuggestSkillsFromJobTitleInput = z.infer<
  typeof SuggestSkillsFromJobTitleInputSchema
>;

const SuggestSkillsFromJobTitleOutputSchema = z.object({
  skills: z.array(z.string()).describe('A list of suggested skills for the job title.'),
});
export type SuggestSkillsFromJobTitleOutput = z.infer<
  typeof SuggestSkillsFromJobTitleOutputSchema
>;

export async function suggestSkillsFromJobTitle(
  input: SuggestSkillsFromJobTitleInput
): Promise<SuggestSkillsFromJobTitleOutput> {
  return suggestSkillsFromJobTitleFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestSkillsFromJobTitlePrompt',
  input: {schema: SuggestSkillsFromJobTitleInputSchema},
  output: {schema: SuggestSkillsFromJobTitleOutputSchema},
  prompt: `Suggest a list of 5 to 10 relevant skills for the following job title. Return only skills, no additional text or formatting:\n\nJob Title: {{{jobTitle}}}`,
});

const suggestSkillsFromJobTitleFlow = ai.defineFlow(
  {
    name: 'suggestSkillsFromJobTitleFlow',
    inputSchema: SuggestSkillsFromJobTitleInputSchema,
    outputSchema: SuggestSkillsFromJobTitleOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
