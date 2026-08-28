import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithEmailAndPassword,
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
  databaseURL: "https://id-gen-89427-default-rtdb.asia-southeast1.firebasedatabase.app"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const rtdb = getDatabase(app);

// Approved Admin check: Any email added/authenticated in Firebase Auth console is authorized
export function isEmailAuthorized(email) {
  return !!email;
}

// Sign in with Email & Password (added in Firebase Auth console)
export async function loginWithEmailPassword(email, password) {
  if (!email || !password) {
    throw new Error("Please enter both Admin Email and Password.");
  }

  try {
    const result = await signInWithEmailAndPassword(auth, email.trim(), password);
    const user = result.user;

    if (!user || !user.email) {
      await signOut(auth);
      throw new Error("Invalid user authentication record.");
    }

    return user;
  } catch (err) {
    if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-email') {
      throw new Error("Invalid Email or Password. Please ensure this user is created in Firebase Auth Users console.");
    }
    if (err.code === 'auth/too-many-requests') {
      throw new Error("Too many failed login attempts. Please try again later.");
    }
    throw err;
  }
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

// Fires immediately with null or restored user on page load (Firebase Auth remembers user session)
export function subscribeToAuth(callback) {
  return onAuthStateChanged(auth, (user) => {
    callback(user);
  });
}
