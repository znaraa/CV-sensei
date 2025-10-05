# **App Name**: CV Sensei

## Core Features:

- User Authentication: Allow users to register and log in using email and password via Firebase Authentication.
- Dashboard: Display a list of user's existing CVs and provide a button to create a new CV.
- CV Form: A form to collect personal information, education, work experience, skills, and goals. Skills should be multi-select with an option for 'other' manual input.
- Firestore Integration: Store user data and AI-generated CVs in Firestore under the `resumes` collection.
- AI CV Generation: Generate 履歴書 (Rirekisho) and 職務経歴書 (Shokumu Keirekisho) based on the user's input data, by acting as a tool that takes the user data as its input. Use placeholders for the AI-generated code in the MVP.
- PDF Export via Firebase Storage: Enable users to export their CVs as PDF files, storing them temporarily in Firebase Storage.

## Style Guidelines:

- Primary color: Royal blue (#4169E1), reflecting competence and calm.
- Background color: Light grey (#F5F7FA) to provide a clean, neutral backdrop.
- Accent color: Teal (#008080) for highlighting key actions and elements.
- Headline font: 'Belleza' (sans-serif) for titles and important text to communicate artistry; body text: 'Alegreya' (serif) for readability.
- Use simple, professional icons for navigation and to represent different sections of the CV.
- Design a clean, form-based layout using Tailwind CSS for a consistent and user-friendly experience.
- Incorporate subtle transitions and animations for user interactions, like form submissions or data loading.