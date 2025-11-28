// Firebase Configuration & Initialization (v9+ Compat)
// Get these from: https://console.firebase.google.com/project/studio-4627045237-a2fe9/settings/general

const firebaseConfig = {
    apiKey: "AIzaSyDh7to-ioQOrlwIuvrmmNV1O9sY-eSD5LM",
    authDomain: "studio-4627045237-a2fe9.firebaseapp.com",
    projectId: "studio-4627045237-a2fe9",
    storageBucket: "studio-4627045237-a2fe9.firebasestorage.app",
    messagingSenderId: "612847421952",
    appId: "1:612847421952:web:d66d4ba0666e7f5116e6e5"
};

// Initialize Firebase (compat mode for namespaced API)
firebase.initializeApp(firebaseConfig);

// Get Firebase services
const auth = firebase.auth();
const db = firebase.firestore();

// Enable persistence
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch(err => {
    console.log('Persistence set');
});

// Export for use in other scripts
window.firebaseAuth = auth;
window.firebaseDb = db;
window.firebase = firebase;

console.log('✅ Firebase initialized!');

