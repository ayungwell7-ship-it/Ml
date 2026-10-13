import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore, doc, getDocFromServer } from 'firebase/firestore';
import rawConfig from '../../firebase-applet-config.json';

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  firestoreDatabaseId?: string;
}

export const firebaseConfig: FirebaseConfig = rawConfig as FirebaseConfig;

// Initialize Primary Firebase App & Services
const primaryApp: FirebaseApp =
  getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

const primaryAuth: Auth = getAuth(primaryApp);
const firestoreDb: Firestore = firebaseConfig.firestoreDatabaseId
  ? getFirestore(primaryApp, firebaseConfig.firestoreDatabaseId)
  : getFirestore(primaryApp);

// Initialize Secondary Firebase App exclusively for admin user creation
// This allows Super Admin to create new admin accounts via Firebase Auth
// without replacing the Super Admin's active session.
const SECONDARY_APP_NAME = 'SecondaryAdminAuthApp';
const secondaryApp: FirebaseApp =
  getApps().find((a) => a.name === SECONDARY_APP_NAME) ||
  initializeApp(firebaseConfig, SECONDARY_APP_NAME);

const secondaryAuthInstance: Auth = getAuth(secondaryApp);

export const app = primaryApp;
export const auth = primaryAuth;
export const db = firestoreDb;
export const secondaryAuth = secondaryAuthInstance;
export const isFirebaseConfigured = true;

// Connection test helper per Firebase integration guidelines
export async function testFirestoreConnection(): Promise<{ success: boolean; message: string }> {
  if (!db) {
    return {
      success: false,
      message: 'Firebase belum terkonfigurasi.',
    };
  }

  try {
    await getDocFromServer(doc(db, 'system', 'connection_test'));
    return {
      success: true,
      message: 'Terhubung ke Cloud Firestore dengan sukses!',
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    if (msg.includes('offline') || msg.includes('unavailable')) {
      return {
        success: false,
        message: 'Koneksi gagal atau client offline. Periksa koneksi internet.',
      };
    }
    // Permission denied or not found still proves active cloud connection
    return {
      success: true,
      message: 'Terhubung ke Cloud Firestore.',
    };
  }
}
