// Safe seed: ONLY sets allowedAdminEmail, never overwrites other studio settings
import { initializeApp } from "firebase/app";
import { getDatabase, ref, update } from "firebase/database";

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
const db = getDatabase(app);

async function main() {
  // update() MERGES — only sets allowedAdminEmail, all other user studio settings are preserved
  await update(ref(db, 'config/template_studio'), {
    allowedAdminEmail: 'lovechn1407@gmail.com'
  });
  console.log("✅ allowedAdminEmail safely set to: lovechn1407@gmail.com");
  console.log("ℹ️  All other studio config fields preserved.");
  process.exit(0);
}
main().catch((e) => { console.error(e); process.exit(1); });
