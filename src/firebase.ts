import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const firebaseEnabled = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

const app = firebaseEnabled ? initializeApp(firebaseConfig) : null;

export const auth = app ? getAuth(app) : null;
// Firestore (not Cloud Storage): as of Feb 2026 Cloud Storage requires the paid
// Blaze plan, while Firestore stays free on the Spark plan with no card on file.
export const firestore = app ? getFirestore(app) : null;
export const googleProvider = new GoogleAuthProvider();
