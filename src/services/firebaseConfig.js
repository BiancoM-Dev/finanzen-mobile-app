import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore, initializeFirestore, persistentLocalCache } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const firebaseConfig = {
  projectId: "finanzen-app-bm",
  appId: "1:888613225131:web:4b517e70b3f07d84ec6dee",
  storageBucket: "finanzen-app-bm.firebasestorage.app",
  apiKey: "AIzaSyAx3lJo9mkMpZ3vakmKCV07nMTCtfFSGz8",
  authDomain: "finanzen-app-bm.firebaseapp.com",
  messagingSenderId: "888613225131"
};

// Inicializar Firebase App (singleton)
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Inicializar Auth con persistencia en AsyncStorage para React Native
let authInstance;
try {
  authInstance = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (e) {
  // Si ya estaba inicializado, obtener instancia existente
  const { getAuth } = require('firebase/auth');
  authInstance = getAuth(app);
}
export const auth = authInstance;

// Inicializar Cloud Firestore con soporte offline local
let firestoreInstance;
try {
  firestoreInstance = initializeFirestore(app, {
    localCache: persistentLocalCache(),
  });
} catch (e) {
  firestoreInstance = getFirestore(app);
}
export const db = firestoreInstance;

// Inicializar Cloud Storage
export const storage = getStorage(app);

export const FIREBASE_READY = true;
