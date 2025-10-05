import type { Timestamp } from 'firebase/firestore';

export type PersonalInfo = {
  name: string;
  email: string;
  phone: string;
  address: string;
  dob: string;
  gender: 'male' | 'female' | 'other';
};

export type Education = {
  id: string;
  institution: string;
  degree: string;
  major: string;
  graduationDate: string;
};

export type Experience = {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  responsibilities: string;
};

export type Skills = {
  selected: string[];
  other: string;
};

export type Certification = {
  id: string;
  name: string;
  date: string;
};

export type Resume = {
  id?: string;
  userId: string;
  personalInfo: PersonalInfo;
  jobTitle: string;
  education: Omit<Education, 'id'>[];
  experience: Omit<Experience, 'id'>[];
  skills: Skills;
  certifications?: Omit<Certification, 'id'>[];
  goals: string;
  personalInterests?: string;
  rirekisho?: string;
  shokumuKeirekisho?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};
