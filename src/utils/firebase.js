import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInAnonymously, 
  signOut, 
  onAuthStateChanged 
} from "firebase/auth";
import { getDatabase } from "firebase/database";

// User's Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyBRtac6GfcqrRpSxmBo8QlQ3hETQkP_9K4",
  authDomain: "id-gen-89427.firebaseapp.com",
  projectId: "id-gen-89427",
  storageBucket: "id-gen-89427.firebasestorage.app",
  messagingSenderId: "903943050417",
  appId: "1:903943050417:web:bc252d1eb935e95003be90",
  measurementId: "G-MG7CP5B03P",
  databaseURL: "https://id-gen-89427-default-rtdb.firebaseio.com"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const rtdb = getDatabase(app);
export const googleProvider = new GoogleAuthProvider();

// Hardcoded Allowed Admin Gmail Emails
export const AUTHORIZED_ADMIN_EMAILS = [
  "lovechn1407@gmail.com",
  "lovechauhan1407@gmail.com",
  "love.chauhan@ecell.in"
];

export function isEmailAuthorized(email, customAllowedEmail) {
  if (!email) return false;
  const lower = email.toLowerCase().trim();
  if (customAllowedEmail && lower === customAllowedEmail.toLowerCase().trim()) return true;
  return AUTHORIZED_ADMIN_EMAILS.some((e) => lower === e.toLowerCase().trim());
}

// Sign in with Google Popup (Strict Authorization Check)
export async function loginWithGoogle(customAllowedEmail) {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    if (!user || !user.email) {
      await signOut(auth);
      throw new Error("No email address returned from Google.");
    }
    
    // Validate email
    const authorized = isEmailAuthorized(user.email, customAllowedEmail);
    if (!authorized && customAllowedEmail) {
      await signOut(auth);
      throw new Error(`Access Denied: "${user.email}" is NOT authorized. Only the registered Admin Gmail (${customAllowedEmail}) can access this site.`);
    }
    return user;
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
    callback(user);
  });
}
