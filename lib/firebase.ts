// lib/firebase.ts
"use client";

import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDvP7dG8L0wTp4H9K8xJ2pQ5mN3aB6cD7e",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "studio-4627045237-a2fe9.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "studio-4627045237-a2fe9",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "studio-4627045237-a2fe9.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:123456789:web:abc",
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
