import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCSO1glwpfcl6zMsDsxalO1_zTW89qiTqI",
  authDomain: "floors-55.firebaseapp.com",
  projectId: "floors-55",
  storageBucket: "floors-55.firebasestorage.app",
  messagingSenderId: "390652727558",
  appId: "1:390652727558:web:c5c030bb5f75a66c428e87"
};

// Initialize Firebase only once to prevent memory leaks
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const appId = 'floors55-admin';

export { app, auth, db, appId };