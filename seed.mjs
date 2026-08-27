// One-time seed: run with node seed.mjs
// Usage: node seed.mjs

import { initializeApp } from "firebase/app";
import { getDatabase, ref, set } from "firebase/database";

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

const config = {
  nameY: 0.74,
  nameFontSize: 72,
  nameLetterSpacing: 1,
  nameColor: '#FFFFFF',
  desigY: 0.83,
  desigFontSize: 32,
  desigLetterSpacing: 0,
  desigColor: '#FFFFFF',
  desigQuotes: true,
  fadeStartY: 0.46,
  fadeOpacity: 1.0,
  glowEnabled: true,
  glowBlur: 55,
  glowIntensity: 0.95,
  glowColor: '#FFFFFF',
  showRefGuide: false,
  refGuideOpacity: 0.4,
  directorSignUrl: '',
  allowedAdminEmail: 'lovechn1407@gmail.com',
  backQrX: 42,
  backQrY: 140,
  backQrSize: 195,
  backTextX: 315,
  backTextY: 194,
  backTextFontSize: 23,
  backSignX: 568,
  backSignY: 875,
  backSignWidth: 120
};

async function main() {
  await set(ref(db, 'config/template_studio'), config);
  console.log("✅ Config seeded with allowedAdminEmail: lovechn1407@gmail.com");
  process.exit(0);
}
main().catch((e) => { console.error(e); process.exit(1); });
