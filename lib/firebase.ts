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
  REDACTED_SECRET_Possible_password_env ?? "",
  authDomain: process.env.REDACTED_SECRET_Generic_long_secret ?? "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
  storageBucket: process.env.REDACTED_SECRET_Generic_long_secret ?? "",
  messagingSenderId: process.env.REDACTED_SECRET_Generic_long_secret ?? "",
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
    // Set `REDACTED_SECRET_Generic_long_secret=true` in dev env to enable.
    const allowDebug =
      process.env.REDACTED_SECRET_Generic_long_secret === "true" &&
      process.env.NODE_ENV !== "production";

    if (allowDebug) {
      window.FIREBASE_APPCHECK_DEBUG_REDACTED_SECRET_Possible_password_env
    }
  } catch (e) {
    console.error("Firebase initialization error:", e);
  }
}

// Export instances (will be ready immediately on client)
export const auth = authInstance as Auth | null;
export const db = dbInstance as Firestore | null;
export { app };

