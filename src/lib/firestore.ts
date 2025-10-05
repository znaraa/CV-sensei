import {
  collection,
  addDoc,
  query,
  where,
  serverTimestamp,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  orderBy,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Resume } from '@/types';

const resumesCollection = collection(db, 'resumes');

export const addResume = async (resumeData: Omit<Resume, 'id' | 'createdAt' | 'updatedAt'>) => {
  const docRef = await addDoc(resumesCollection, {
    ...resumeData,
    title: `CV for ${resumeData.personalInfo.name}`,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};

export const updateResume = async (id: string, resumeData: Partial<Resume>) => {
  const docRef = doc(db, 'resumes', id);
  await updateDoc(docRef, {
    ...resumeData,
    updatedAt: serverTimestamp(),
  });
};

export const deleteResume = async (id: string) => {
  const docRef = doc(db, 'resumes', id);
  await deleteDoc(docRef);
};

export const getResumes = (userId: string, onUpdate: (resumes: Resume[]) => void) => {
  const q = query(resumesCollection, where('userId', '==', userId), orderBy('updatedAt', 'desc'));
  
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const resumes = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Resume));
    onUpdate(resumes);
  });

  return unsubscribe;
};

export const getResume = async (id: string): Promise<Resume | null> => {
  const docRef = doc(db, 'resumes', id);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const data = docSnap.data();
    // For backwards compatibility with old data that might not have a title
    const title = data.title || `CV for ${data.personalInfo.name}`;
    return { id: docSnap.id, ...data, title } as Resume;
  } else {
    return null;
  }
};
