// lib/firebase.ts
"use client";

import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

declare global {
  interface Window {
    FIREBASE_APPCHECK_DEBUG_TOKEN?: boolean | string;
  }
}

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "",
};

let app: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;

// Initialize Firebase synchronously if in browser
if (typeof window !== "undefined") {
  try {
    const apps = getApps();
    app = apps.length > 0 ? (apps[0] as FirebaseApp) : initializeApp(firebaseConfig);
    authInstance = getAuth(app);
    dbInstance = getFirestore(app);
    
    // Only enable App Check debug token when explicitly allowed and not in production.
    // Set `NEXT_PUBLIC_FIREBASE_APPCHECK_DEBUG_TOKEN=true` in dev env to enable.
    const allowDebug =
      process.env.NEXT_PUBLIC_FIREBASE_APPCHECK_DEBUG_TOKEN === "true" &&
      process.env.NODE_ENV !== "production";

    if (allowDebug) {
      window.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
    }
  } catch (e) {
    console.error("Firebase initialization error:", e);
  }
}

// Export instances (will be ready immediately on client)
export const auth = authInstance as Auth | null;
export const db = dbInstance as Firestore | null;
export { app };

