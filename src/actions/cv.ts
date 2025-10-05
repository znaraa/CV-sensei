"use server";

import { revalidatePath } from 'next/cache';
import { generateInitialCvDraft } from "@/ai/flows/generate-initial-cv-draft";
import { addResume, updateResume, getResume, deleteResume } from "@/lib/firestore";
import { cvSchema, CvFormValues } from "@/schemas/cv";
import { SKILL_OPTIONS } from '@/schemas/cv';

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
    education: data.education,
    experience: data.experience,
    skills: allSkills,
    goals: data.goals,
  };

  const firestoreData = {
    userId,
    title: data.title,
    ...data,
  };
  
  return { aiInput, firestoreData };
};


export async function createCvAction(
  userId: string,
  data: CvFormValues
): Promise<ActionResult> {
  try {
    const validatedData = cvSchema.safeParse(data);
    if (!validatedData.success) {
      return { success: false, message: "Invalid form data." };
    }

    const { aiInput, firestoreData } = processCvData(validatedData.data, userId);
    
    const aiResult = await generateInitialCvDraft(aiInput);

    const fullResumeData = {
      ...firestoreData,
      ...aiResult,
    };
    
    // @ts-ignore
    const newId = await addResume(fullResumeData);

    revalidatePath('/dashboard');
    return { success: true, message: "CV created successfully!", id: newId };
  } catch (error: any) {
    console.error("Error creating CV:", error);
    return { success: false, message: error.message || "Failed to create CV." };
  }
}

export async function updateCvAction(
  cvId: string,
  userId: string,
  data: CvFormValues
): Promise<ActionResult> {
  try {
    const validatedData = cvSchema.safeParse(data);
    if (!validatedData.success) {
      return { success: false, message: "Invalid form data." };
    }

    const { aiInput, firestoreData } = processCvData(validatedData.data, userId);

    const aiResult = await generateInitialCvDraft(aiInput);

    const fullResumeData = {
      ...firestoreData,
      ...aiResult,
    };
    
    // @ts-ignore
    await updateResume(cvId, fullResumeData);

    revalidatePath('/dashboard');
    revalidatePath(`/dashboard/cv/${cvId}`);
    return { success: true, message: "CV updated successfully!", id: cvId };
  } catch (error: any) {
    console.error("Error updating CV:", error);
    return { success: false, message: error.message || "Failed to update CV." };
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
