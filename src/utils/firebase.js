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
  if (customAllowedEmail && lower === customAllowedEmail.toLowerCase().trim()) return true;
  return AUTHORIZED_ADMIN_EMAILS.some((e) => lower === e.toLowerCase().trim());
}

// Sign in with popup — works reliably across all hosting environments
export async function loginWithGoogle(customAllowedEmail) {
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;

  if (!user || !user.email) {
    await signOut(auth);
    throw new Error("No email address returned from Google.");
  }

  const authorized = isEmailAuthorized(user.email, customAllowedEmail);
  if (!authorized) {
    await signOut(auth);
    throw new Error(`Access Denied: "${user.email}" is NOT authorized. Only the registered Admin Gmail (${customAllowedEmail || AUTHORIZED_ADMIN_EMAILS[0]}) can access this site.`);
  }

  return user;
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

// Fires immediately with null or restored user on page load
export function subscribeToAuth(callback) {
  return onAuthStateChanged(auth, (user) => {
    callback(user);
  });
}
