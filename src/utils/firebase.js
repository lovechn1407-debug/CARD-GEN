import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInAnonymously, 
  signOut, 
  onAuthStateChanged 
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// User's Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyBRtac6GfcqrRpSxmBo8QlQ3hETQkP_9K4",
  authDomain: "id-gen-89427.firebaseapp.com",
  projectId: "id-gen-89427",
  storageBucket: "id-gen-89427.firebasestorage.app",
  messagingSenderId: "903943050417",
  appId: "1:903943050417:web:bc252d1eb935e95003be90",
  measurementId: "G-MG7CP5B03P"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Sign in with Google Popup (For Admin)
export async function loginWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Google Sign-In Error:", error);
    throw error;
  }
}

// Sign in Anonymously (For Verifiers & Public Users)
export async function ensureAnonymousAuth() {
  if (auth.currentUser) return auth.currentUser;
  try {
    const result = await signInAnonymously(auth);
    return result.user;
  } catch (error) {
    console.warn("Anonymous Sign-In Error:", error);
    return null;
  }
}

// Sign Out
export async function logoutUser() {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Sign-Out Error:", error);
  }
}

// Subscribe to Auth State Changes
export function subscribeToAuth(callback) {
  return onAuthStateChanged(auth, (user) => {
    if (!user) {
      // Auto sign-in anonymously if no user is active so Firestore rules pass seamlessly
      ensureAnonymousAuth().then((anonUser) => callback(anonUser));
    } else {
      callback(user);
    }
  });
}
