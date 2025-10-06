import {
  collection,
  addDoc,
  query,
  where,
  serverTimestamp,
  doc,
  getDoc as getDocSdk,
  updateDoc,
  deleteDoc,
  onSnapshot,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Resume } from '@/types';

const resumesCollection = collection(db, 'resumes');

export const addResume = async (resumeData: Omit<Resume, 'id' | 'createdAt' | 'updatedAt'>) => {
  const docRef = await addDoc(resumesCollection, {
    ...resumeData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};

export const updateResume = async (id: string, resumeData: Partial<Omit<Resume, 'id' | 'createdAt' | 'updatedAt'>>) => {
  const docRef = doc(db, 'resumes', id);
  await updateDoc(docRef, {
    ...resumeData,
    updatedAt: serverTimestamp(),
  });
};

export const updateResumeDocuments = async (id: string, documents: { rirekisho?: string; shokumuKeirekisho?: string }) => {
  const docRef = doc(db, 'resumes', id);
  await updateDoc(docRef, {
    ...documents,
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

export const getResume = (id: string, onUpdate?: (resume: Resume | null) => void) => {
  const docRef = doc(db, 'resumes', id);

  if (onUpdate) {
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        onUpdate({ id: docSnap.id, ...docSnap.data() } as Resume);
      } else {
        onUpdate(null);
      }
    });
    return unsubscribe;
  }
  
  return getDocSdk(docRef).then(docSnap => {
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Resume;
    }
    return null;
  })
};
