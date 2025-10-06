"use server";

import { revalidatePath } from 'next/cache';
import { generateInitialCvDraft } from "@/ai/flows/generate-initial-cv-draft";
import { addResume, updateResume, getResume, deleteResume, updateResumeDocuments } from "@/lib/firestore";
import { cvSchema, CvFormValues } from "@/schemas/cv";
import { SKILL_OPTIONS } from '@/schemas/cv';
import { suggestSkillsFromJobTitle } from '@/ai/flows/suggest-skills-from-job-title';

type ActionResult = {
  success: boolean;
  message: string;
  id?: string;
};

const processCvData = (data: CvFormValues, userId: string) => {
  const allSkills = [...data.skills.selected];
  if (data.skills.other) {
    allSkills.push(...data.skills.other.split(',').map(s => s.trim()).filter(Boolean));
  }

  const aiInput = {
    personalInfo: data.personalInfo,
    jobTitle: data.jobTitle,
    education: data.education,
    experience: data.experience,
    skills: allSkills,
    certifications: data.certifications,
    goals: data.goals,
    personalInterests: data.personalInterests,
  };

  const firestoreData = {
    userId,
    ...data,
  };
  
  return { aiInput, firestoreData };
};


export async function saveCvAction(
  userId: string,
  data: CvFormValues,
  cvId?: string,
): Promise<ActionResult> {
  try {
    const validatedData = cvSchema.safeParse(data);
    if (!validatedData.success) {
      return { success: false, message: "Invalid form data." };
    }
    
    const { firestoreData } = processCvData(validatedData.data, userId);

    if (cvId) {
      await updateResume(cvId, firestoreData);
      revalidatePath('/dashboard');
      revalidatePath(`/dashboard/cv/${cvId}`);
      return { success: true, message: "CV data saved successfully!", id: cvId };
    } else {
      // @ts-ignore
      const newId = await addResume(firestoreData);
      revalidatePath('/dashboard');
      return { success: true, message: "CV created successfully!", id: newId };
    }
  } catch (error: any) {
    console.error("Error saving CV:", error);
    return { success: false, message: error.message || "Failed to save CV data." };
  }
}

export async function generateDocumentAction(
  cvId: string,
  userId: string,
  docType: 'rirekisho' | 'shokumuKeirekisho'
): Promise<ActionResult> {
   try {
    const resume = await getResume(cvId);
    if (!resume || resume.userId !== userId) {
      return { success: false, message: "CV not found or permission denied." };
    }

    const { aiInput } = processCvData(resume as CvFormValues, userId);
    
    const aiResult = await generateInitialCvDraft({ ...aiInput, docType });

    const updateData = docType === 'rirekisho' 
      ? { rirekisho: aiResult.document } 
      : { shokumuKeirekisho: aiResult.document };

    await updateResumeDocuments(cvId, updateData);

    revalidatePath(`/dashboard/cv/${cvId}`);
    return { success: true, message: `${docType === 'rirekisho' ? 'Rirekisho' : 'Shokumu Keirekisho'} generated successfully!`, id: cvId };
  } catch (error: any) {
    console.error(`Error generating ${docType}:`, error);
    return { success: false, message: error.message || `Failed to generate ${docType}.` };
  }
}


export async function deleteCvAction(
  cvId: string,
  userId: string
): Promise<ActionResult> {
  try {
    const resume = await getResume(cvId);
    if (!resume) {
      return { success: false, message: "CV not found." };
    }
    if (resume.userId !== userId) {
      return { success: false, message: "You don't have permission to delete this CV." };
    }

    await deleteResume(cvId);

    revalidatePath('/dashboard');
    return { success: true, message: "CV deleted successfully." };
  } catch (error: any) {
    console.error("Error deleting CV:", error);
    return { success: false, message: error.message || "Failed to delete CV." };
  }
}


export async function suggestSkillsAction(jobTitle: string): Promise<{ success: boolean; skills?: string[]; message: string; }> {
  if (!jobTitle) {
    return { success: false, message: 'Job title is required.' };
  }

  try {
    const result = await suggestSkillsFromJobTitle({ jobTitle });
    return { success: true, skills: result.skills, message: 'Skills suggested successfully.' };
  } catch (error: any) {
    console.error('Error suggesting skills:', error);
    return { success: false, message: error.message || 'Failed to suggest skills.' };
  }
}
