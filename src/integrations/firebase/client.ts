import { getApp, getApps, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseEnv = {
  VITE_FIREBASE_API_KEY: import.meta.env["VITE_FIREBASE_API_KEY"] as
    | string
    | undefined,
  VITE_FIREBASE_AUTH_DOMAIN: import.meta.env["VITE_FIREBASE_AUTH_DOMAIN"] as
    | string
    | undefined,
  VITE_FIREBASE_PROJECT_ID: import.meta.env["VITE_FIREBASE_PROJECT_ID"] as
    | string
    | undefined,
  VITE_FIREBASE_STORAGE_BUCKET: import.meta.env["VITE_FIREBASE_STORAGE_BUCKET"] as
    | string
    | undefined,
  VITE_FIREBASE_MESSAGING_SENDER_ID: import.meta.env[
    "VITE_FIREBASE_MESSAGING_SENDER_ID"
  ] as string | undefined,
  VITE_FIREBASE_APP_ID: import.meta.env["VITE_FIREBASE_APP_ID"] as
    | string
    | undefined,
};

const missingFirebaseEnvVars = Object.entries(firebaseEnv)
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (missingFirebaseEnvVars.length > 0) {
  throw new Error(
    `Missing Firebase environment variable(s): ${missingFirebaseEnvVars.join(", ")}.`,
  );
}

export const firebaseApp = getApps().length
  ? getApp()
  : initializeApp({
      apiKey: firebaseEnv.VITE_FIREBASE_API_KEY!,
      authDomain: firebaseEnv.VITE_FIREBASE_AUTH_DOMAIN!,
      projectId: firebaseEnv.VITE_FIREBASE_PROJECT_ID!,
      storageBucket: firebaseEnv.VITE_FIREBASE_STORAGE_BUCKET!,
      messagingSenderId: firebaseEnv.VITE_FIREBASE_MESSAGING_SENDER_ID!,
      appId: firebaseEnv.VITE_FIREBASE_APP_ID!,
    });

export const firestore = getFirestore(firebaseApp);
