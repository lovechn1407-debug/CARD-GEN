import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithRedirect,
  getRedirectResult,
  signInAnonymously, 
  signOut, 
  onAuthStateChanged 
} from "firebase/auth";
import { getDatabase } from "firebase/database";

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

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const rtdb = getDatabase(app);

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Hardcoded Allowed Admin Emails
export const AUTHORIZED_ADMIN_EMAILS = [
  "lovechn1407@gmail.com",
  "lovechauhan1407@gmail.com",
  "love.chauhan@ecell.in"
];

export function isEmailAuthorized(email, customAllowedEmail) {
  if (!email) return false;
  const lower = email.toLowerCase().trim();
  // Check custom email from DB config first
  if (customAllowedEmail && lower === customAllowedEmail.toLowerCase().trim()) return true;
  // Fallback to hardcoded list
  return AUTHORIZED_ADMIN_EMAILS.some((e) => lower === e.toLowerCase().trim());
}

// Trigger Google Redirect sign-in (no popup = no COOP warnings)
export async function loginWithGoogle() {
  await signInWithRedirect(auth, googleProvider);
  // Page navigates away — Firebase restores session via onAuthStateChanged on return
}

// Check if redirect result has an unauthorized user and sign them out
export async function validateRedirectAuth(customAllowedEmail) {
  try {
    const result = await getRedirectResult(auth);
    if (result && result.user) {
      const authorized = isEmailAuthorized(result.user.email, customAllowedEmail);
      if (!authorized) {
        await signOut(auth);
        return { denied: true, email: result.user.email };
      }
    }
  } catch (e) {
    // Not a redirect result or already consumed — ignore
  }
  return null;
}

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

export async function logoutUser() {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Sign-Out Error:", error);
  }
}

// onAuthStateChanged fires immediately with null (no session) or the restored user
// This is the ONLY reliable way to know auth state after a redirect
export function subscribeToAuth(callback) {
  return onAuthStateChanged(auth, (user) => {
    callback(user);
  });
}
