import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  "projectId": "studio-4680325009-17497",
  "appId": "1:437282757897:web:905a66cb0bc5e362d107d8",
  "storageBucket": "studio-4680325009-17497.appspot.com",
  "apiKey": "AIzaSyDpuUtoaT4D11klFqLNA3WS8Eq3zQPh2fM",
  "authDomain": "studio-4680325009-17497.firebaseapp.com",
  "messagingSenderId": "437282757897"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
