import { cert, getApp, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

function decodePrivateKey() {
  const fromRaw = process.env["FIREBASE_ADMIN_PRIVATE_KEY"];
  if (fromRaw) return fromRaw.replace(/\\n/g, "\n");

  const fromBase64 = process.env["FIREBASE_ADMIN_PRIVATE_KEY_BASE64"];
  if (!fromBase64) return null;

  return Buffer.from(fromBase64, "base64").toString("utf8");
}

function createFirebaseAdmin() {
  const projectId = process.env["FIREBASE_ADMIN_PROJECT_ID"];
  const clientEmail = process.env["FIREBASE_ADMIN_CLIENT_EMAIL"];
  const privateKey = decodePrivateKey();

  if (!projectId || !clientEmail || !privateKey) {
    const missing = [
      ...(!projectId ? ["FIREBASE_ADMIN_PROJECT_ID"] : []),
      ...(!clientEmail ? ["FIREBASE_ADMIN_CLIENT_EMAIL"] : []),
      ...(!privateKey ? ["FIREBASE_ADMIN_PRIVATE_KEY or FIREBASE_ADMIN_PRIVATE_KEY_BASE64"] : []),
    ];

    throw new Error(`Missing Firebase Admin environment variable(s): ${missing.join(", ")}.`);
  }

  const app = getApps().length
    ? getApp()
    : initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });

  return getFirestore(app);
}

let _firestoreAdmin: ReturnType<typeof createFirebaseAdmin> | undefined;

export const firestoreAdmin = new Proxy({} as ReturnType<typeof createFirebaseAdmin>, {
  get(_, prop, receiver) {
    if (!_firestoreAdmin) _firestoreAdmin = createFirebaseAdmin();
    return Reflect.get(_firestoreAdmin, prop, receiver);
  },
});
