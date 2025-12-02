// lib/firebase.ts
"use client";

import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "REDACTED_Google_API_Key_PrefixDh7to-ioQOrlwIuvrmmNV1O9sY-eSD5LM",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "studio-4627045237-a2fe9.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "studio-4627045237-a2fe9",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "studio-4627045237-a2fe9.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "612847421952",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:612847421952:web:d66d4ba0666e7f5116e6e5",
};

let app: any = null;
let authInstance: any = null;
let dbInstance: any = null;

// Initialize Firebase synchronously if in browser
if (typeof window !== "undefined") {
  try {
    const apps = getApps();
    app = apps.length > 0 ? apps[0] : initializeApp(firebaseConfig);
    authInstance = getAuth(app);
    dbInstance = getFirestore(app);
    
    // Initialize App Check with debug token for development
    // This prevents "firebase-app-check-token-is-invalid" errors
    if (process.env.NODE_ENV === 'development') {
      (window as any).FIREBASE_APPCHECK_DEBUG_TOKEN = true;
    }
    
    try {
      initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider(
          process.env.NEXT_PUBLIC_RECAPTCHA_KEY || '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'
        ),
        isTokenAutoRefreshEnabled: true,
      });
    } catch (err) {
      console.warn("App Check initialization failed (this is okay for development):", err);
    }
  } catch (e) {
    console.error("Firebase initialization error:", e);
  }
}

// Export instances (will be ready immediately on client)
export const auth = authInstance;
export const db = dbInstance;
export { app };

