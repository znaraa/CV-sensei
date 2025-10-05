import { config } from 'dotenv';
config();

import '@/ai/flows/generate-initial-cv-draft.ts';
import '@/ai/flows/summarize-work-experience.ts';
import '@/ai/flows/generate-cv-from-form-data.ts';
import '@/ai/flows/suggest-skills-from-job-title.ts';
