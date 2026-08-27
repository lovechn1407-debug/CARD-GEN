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

// Firebase Configuration
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

// Trigger Google Redirect (NO POPUP = NO COOP WARNINGS)
export async function loginWithGoogle() {
  await signInWithRedirect(auth, googleProvider);
  // Page will reload automatically; result is handled in checkRedirectAuth()
}

// Called on App mount to finalize redirect auth result
export async function checkRedirectAuth(customAllowedEmail) {
  try {
    const result = await getRedirectResult(auth);
    if (!result || !result.user) return null;

    const user = result.user;
    const authorized = isEmailAuthorized(user.email, customAllowedEmail);
    if (!authorized) {
      await signOut(auth);
      return { error: `Access Denied: "${user.email}" is NOT authorized. Only the registered Admin Gmail (${customAllowedEmail || AUTHORIZED_ADMIN_EMAILS[0]}) can access this site.` };
    }
    return user;
  } catch (e) {
    console.warn("Redirect Auth Result Error:", e);
    return null;
  }
}

// Anonymous Auth (for verifiers & public)
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

export function subscribeToAuth(callback) {
  return onAuthStateChanged(auth, (user) => {
    callback(user);
  });
}
