import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: 'REPLACE_WITH_YOUR_FIREBASE_API_KEY',
  authDomain: 'REPLACE_WITH_YOUR_FIREBASE_AUTH_DOMAIN',
  projectId: 'REPLACE_WITH_YOUR_FIREBASE_PROJECT_ID',
  storageBucket: 'REPLACE_WITH_YOUR_FIREBASE_STORAGE_BUCKET',
  messagingSenderId: 'REPLACE_WITH_YOUR_FIREBASE_MESSAGING_SENDER_ID',
  appId: 'REPLACE_WITH_YOUR_FIREBASE_APP_ID'
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
