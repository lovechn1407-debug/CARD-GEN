import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
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

// Custom Google Provider configuration to prevent COOP issues
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

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

// Sign in with Google (Handles Popup & Redirect to bypass COOP warnings)
export async function loginWithGoogle(customAllowedEmail) {
  try {
    let user = null;
    try {
      const result = await signInWithPopup(auth, googleProvider);
      user = result?.user;
    } catch (popupErr) {
      console.warn("Popup blocked or COOP warning, switching to Redirect mode:", popupErr);
      await signInWithRedirect(auth, googleProvider);
      return null;
    }

    if (!user || !user.email) {
      await signOut(auth);
      throw new Error("No email address returned from Google.");
    }
    
    // Validate email authorization
    const authorized = isEmailAuthorized(user.email, customAllowedEmail);
    if (!authorized) {
      await signOut(auth);
      throw new Error(`Access Denied: "${user.email}" is NOT authorized. Only the registered Admin Gmail (${customAllowedEmail || AUTHORIZED_ADMIN_EMAILS[0]}) can access this site.`);
    }
    return user;
  } catch (error) {
    console.error("Google Sign-In Error:", error);
    throw error;
  }
}

// Handle Redirect Login Result on App Launch
export async function checkRedirectAuth(customAllowedEmail) {
  try {
    const result = await getRedirectResult(auth);
    if (result && result.user) {
      const user = result.user;
      const authorized = isEmailAuthorized(user.email, customAllowedEmail);
      if (!authorized) {
        await signOut(auth);
        throw new Error(`Access Denied: "${user.email}" is NOT authorized.`);
      }
      return user;
    }
  } catch (e) {
    console.warn("Redirect Auth Check Warning:", e);
  }
  return null;
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
