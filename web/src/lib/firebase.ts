import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

function getFirebaseAdmin() {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error("Missing Firebase environment variables");
  }

  return initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  });
}

export function getDb() {
  getFirebaseAdmin();
  return getFirestore();
}
