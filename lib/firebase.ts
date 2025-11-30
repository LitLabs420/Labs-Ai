// lib/firebase.ts
"use client";

import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDh7to-ioQOrlwIuvrmmNV1O9sY-eSD5LM",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "studio-4627045237-a2fe9.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "studio-4627045237-a2fe9",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "studio-4627045237-a2fe9.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "612847421952",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:612847421952:web:d66d4ba0666e7f5116e6e5",
};

let app: any;
let authInstance: any;
let dbInstance: any;

if (typeof window !== "undefined") {
  try {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
    authInstance = getAuth(app);
    dbInstance = getFirestore(app);
  } catch (e) {
    console.warn("Firebase init error:", e);
  }
}

export const auth = authInstance || null;
export const db = dbInstance || null;
export { app };
