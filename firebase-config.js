// Firebase Configuration & Initialization
// Get these from: https://console.firebase.google.com/project/studio-4627045237-a2fe9/settings/general

const firebaseConfig = {
    apiKey: "AIzaSyD-placeholder-get-from-firebase-console",
    authDomain: "studio-4627045237-a2fe9.firebaseapp.com",
    projectId: "studio-4627045237-a2fe9",
    storageBucket: "studio-4627045237-a2fe9.appspot.com",
    messagingSenderId: "612847421952",
    appId: "1:612847421952:web:your-app-id-here"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get Firebase services
const auth = firebase.auth();
const db = firebase.firestore();

// Enable Google Sign-In
auth.useDeviceLanguage();

// Export for use in other scripts
window.firebaseAuth = auth;
window.firebaseDb = db;

console.log('Firebase initialized successfully!');
