
// @ts-ignore
import { initializeApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

// הגדרות Firebase - נלקחות ממשתני סביבה באמצעות import.meta.env
// חשוב לגשת אליהם ישירות כדי ש-Vite יוכל להחליף אותם בזמן בנייה
const firebaseConfig = {
  // @ts-ignore
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  // @ts-ignore
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  // @ts-ignore
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  // @ts-ignore
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  // @ts-ignore
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  // @ts-ignore
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  // @ts-ignore
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

let auth: Auth = { currentUser: null } as unknown as Auth;
let db: Firestore = {} as Firestore;
let isFirebaseInitialized = false;

// בדיקה האם הקונפיגורציה תקינה
const isConfigValid = (config: typeof firebaseConfig) => {
    if (!config) return false;
    return !!config.apiKey && !!config.authDomain && !!config.projectId;
};

if (isConfigValid(firebaseConfig)) {
    try {
        const app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);
        isFirebaseInitialized = true;
        console.log("Firebase initialized securely via Environment Variables.");
    } catch (error) {
        console.error("Failed to initialize Firebase. Check Environment Variables.", error);
        isFirebaseInitialized = false;
    }
} else {
    console.warn("Firebase config missing. Please set VITE_FIREBASE_... environment variables in Netlify/Vercel.");
    isFirebaseInitialized = false;
}

export { auth, db, isFirebaseInitialized };
