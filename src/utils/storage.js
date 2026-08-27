// Firebase Firestore & Realtime Database Sync Manager for CARD-GEN
import { db, rtdb, ensureAnonymousAuth } from './firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot 
} from "firebase/firestore";
import { ref as rtdbRef, set as rtdbSet, onValue as rtdbOnValue, remove as rtdbRemove } from "firebase/database";

const MEMBERS_KEY = 'ecell_id_members_v1';
const BATCHES_KEY = 'ecell_id_batches_v1';
const BATCH_EDITS_KEY = 'ecell_id_batch_edits_v1';
const TEMPLATE_CONFIG_KEY = 'ecell_id_template_config_v1';

export const DEFAULT_TEMPLATE_CONFIG = {
  nameY: 0.74,               // Name vertical position
  nameFontSize: 72,          // Name font size in px
  nameLetterSpacing: 1,      // Name letter spacing in px
  nameColor: '#FFFFFF',      // Name text color
  desigY: 0.83,              // Designation vertical position
  desigFontSize: 32,         // Designation font size in px
  desigLetterSpacing: 0,     // Designation letter spacing in px
  desigColor: '#FFFFFF',     // Designation text color
  desigQuotes: true,         // Include " " quotes around designation
  fadeStartY: 0.46,          // Black overlay starting height
  fadeOpacity: 1.0,          // Overlay opacity
  glowEnabled: true,         // Member photo aura glow enabled
  glowBlur: 55,              // Glow blur amount in px
  glowIntensity: 0.95,       // Glow opacity / intensity (0.0 - 1.0)
  glowColor: '#FFFFFF',      // Glow color hex
  showRefGuide: false,       // Reference ID card overlay guide toggle
  refGuideOpacity: 0.4,      // Reference guide opacity
  directorSignUrl: '',       // Custom Director PNG Signature URL
  allowedAdminEmail: 'lovechn1407@gmail.com', // Authorized Admin Gmail Address
  backQrX: 42,               // Back QR Code X Position
  backQrY: 140,              // Back QR Code Y Position
  backQrSize: 195,           // Back QR Code Box Size in px
  backTextX: 315,            // Back Details Text X Position
  backTextY: 194,            // Back Details Text Start Y Position
  backTextFontSize: 23,      // Back Details Text Font Size in px
  backSignX: 568,            // Director Signature X Position (Right aligned)
  backSignY: 875,            // Director Signature Y Position
  backSignWidth: 120         // Director Signature Width/Size in px
};

// Initial default member records
const DEFAULT_MEMBERS = [
  {
    id: 'ECELL2026-001',
    collegeRollNo: '2100290130085',
    name: 'LOVE CHAUHAN',
    designation: 'Creative Designing',
    validTill: '2026-08-31',
    phone: '+91 9876543210',
    bloodGroup: 'O+',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
    batchId: 'BATCH-DEFAULT-2026',
    photoTransform: { x: 0, y: -20, scale: 1.05, rotation: 0 },
    createdAt: new Date().toISOString()
  },
  {
    id: 'ECELL2026-002',
    collegeRollNo: '2100290130086',
    name: 'ANANYA SHARMA',
    designation: 'Technical Head',
    validTill: '2026-08-31',
    phone: '+91 9123456789',
    bloodGroup: 'B+',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    batchId: 'BATCH-DEFAULT-2026',
    photoTransform: { x: 0, y: -20, scale: 1, rotation: 0 },
    createdAt: new Date().toISOString()
  }
];

const DEFAULT_BATCHES = [
  {
    batchId: 'BATCH-DEFAULT-2026',
    name: 'Initial Team Batch 2026',
    createdAt: new Date().toISOString(),
    memberCount: 2,
    isPublic: true,
    publicToken: 'ecell-batch-2026-token'
  }
];

// In-Memory Cache
let cachedMembers = [...DEFAULT_MEMBERS];
let cachedBatches = [...DEFAULT_BATCHES];
let cachedEdits = [];
let cachedConfig = { ...DEFAULT_TEMPLATE_CONFIG };

// -------------------------------------------------------------
// REAL-TIME SUBSCRIPTIONS (Firestore & Realtime DB Sync)
// -------------------------------------------------------------

export function subscribeMembers(callback) {
  ensureAnonymousAuth();
  // Subscribe to Realtime Database
  const rtdbMembersRef = rtdbRef(rtdb, 'members');
  rtdbOnValue(rtdbMembersRef, (snapshot) => {
    const val = snapshot.val();
    if (val) {
      const list = Array.isArray(val) ? val : Object.values(val);
      cachedMembers = list;
      localStorage.setItem(MEMBERS_KEY, JSON.stringify(list));
      callback(list);
      return;
    }
  }, () => {});

  // Subscribe to Firestore
  const membersRef = collection(db, "members");
  return onSnapshot(membersRef, (snapshot) => {
    if (snapshot.empty) {
      seedFirestoreData();
      return;
    }
    const list = [];
    snapshot.forEach((docSnap) => {
      list.push({ id: docSnap.id, ...docSnap.data() });
    });
    cachedMembers = list;
    localStorage.setItem(MEMBERS_KEY, JSON.stringify(list));
    callback(list);
  }, (err) => {
    callback(getMembersLocal());
  });
}

export function subscribeBatches(callback) {
  ensureAnonymousAuth();
  const batchesRef = collection(db, "batches");
  return onSnapshot(batchesRef, (snapshot) => {
    if (snapshot.empty) {
      callback(cachedBatches);
      return;
    }
    const list = [];
    snapshot.forEach((docSnap) => {
      list.push({ batchId: docSnap.id, ...docSnap.data() });
    });
    cachedBatches = list;
    localStorage.setItem(BATCHES_KEY, JSON.stringify(list));
    callback(list);
  }, () => {
    callback(getBatchesLocal());
  });
}

export function subscribeBatchEdits(callback) {
  ensureAnonymousAuth();
  const editsRef = collection(db, "batch_edits");
  return onSnapshot(editsRef, (snapshot) => {
    const list = [];
    snapshot.forEach((docSnap) => {
      list.push({ id: docSnap.id, ...docSnap.data() });
    });
    cachedEdits = list;
    localStorage.setItem(BATCH_EDITS_KEY, JSON.stringify(list));
    callback(list);
  }, () => {
    callback(getBatchEditsLocal());
  });
}

export function subscribeTemplateConfig(callback) {
  ensureAnonymousAuth();
  const configDocRef = doc(db, "config", "template_studio");
  return onSnapshot(configDocRef, (docSnap) => {
    if (docSnap.exists()) {
      const data = { ...DEFAULT_TEMPLATE_CONFIG, ...docSnap.data() };
      cachedConfig = data;
      localStorage.setItem(TEMPLATE_CONFIG_KEY, JSON.stringify(data));
      callback(data);
    } else {
      setDoc(configDocRef, DEFAULT_TEMPLATE_CONFIG).catch(() => {});
      callback(cachedConfig);
    }
  }, () => {
    callback(getTemplateConfigLocal());
  });
}

// -------------------------------------------------------------
// READ & WRITE OPERATIONS (Sync to BOTH Firestore & Realtime DB)
// -------------------------------------------------------------

export function getTemplateConfig() {
  return cachedConfig;
}

export async function saveTemplateConfig(config) {
  cachedConfig = config;
  localStorage.setItem(TEMPLATE_CONFIG_KEY, JSON.stringify(config));
  try {
    await ensureAnonymousAuth();
    await setDoc(doc(db, "config", "template_studio"), config);
    await rtdbSet(rtdbRef(rtdb, 'config/template_studio'), config);
  } catch (err) {
    console.error("Error saving template config to Firebase:", err);
  }
}

export function getMembers() {
  return cachedMembers;
}

export function getMemberById(id) {
  return cachedMembers.find((m) => m.id === id || m.collegeRollNo === id);
}

export async function updateMember(updatedMember) {
  const index = cachedMembers.findIndex((m) => m.id === updatedMember.id);
  if (index !== -1) {
    cachedMembers[index] = { ...cachedMembers[index], ...updatedMember };
  } else {
    cachedMembers.push(updatedMember);
  }
  localStorage.setItem(MEMBERS_KEY, JSON.stringify(cachedMembers));
  try {
    await ensureAnonymousAuth();
    await setDoc(doc(db, "members", updatedMember.id), updatedMember);
    await rtdbSet(rtdbRef(rtdb, `members/${updatedMember.id}`), updatedMember);
  } catch (err) {
    console.error("Error updating member in Firebase:", err);
  }
  return cachedMembers;
}

export async function saveMembers(membersList) {
  cachedMembers = membersList;
  localStorage.setItem(MEMBERS_KEY, JSON.stringify(membersList));
  try {
    await ensureAnonymousAuth();
    for (const m of membersList) {
      await setDoc(doc(db, "members", m.id), m);
      await rtdbSet(rtdbRef(rtdb, `members/${m.id}`), m);
    }
  } catch (err) {
    console.error("Error saving members to Firebase:", err);
  }
}

export async function deleteMember(id) {
  cachedMembers = cachedMembers.filter((m) => m.id !== id);
  localStorage.setItem(MEMBERS_KEY, JSON.stringify(cachedMembers));
  try {
    await ensureAnonymousAuth();
    await deleteDoc(doc(db, "members", id));
    await rtdbRemove(rtdbRef(rtdb, `members/${id}`));
  } catch (err) {
    console.error("Error deleting member in Firebase:", err);
  }
  return cachedMembers;
}

export function getBatches() {
  return cachedBatches;
}

export async function saveBatches(batchesList) {
  cachedBatches = batchesList;
  localStorage.setItem(BATCHES_KEY, JSON.stringify(batchesList));
  try {
    await ensureAnonymousAuth();
    for (const b of batchesList) {
      await setDoc(doc(db, "batches", b.batchId), b);
      await rtdbSet(rtdbRef(rtdb, `batches/${b.batchId}`), b);
    }
  } catch (err) {
    console.error("Error saving batches to Firebase:", err);
  }
}

export function getBatchEdits() {
  return cachedEdits;
}

export async function saveBatchEdit(editPayload) {
  const editId = `${editPayload.batchId}_${editPayload.collegeRollNo}`.replace(/[^a-zA-Z0-9_]/g, '_');
  const existingIndex = cachedEdits.findIndex((e) => e.collegeRollNo === editPayload.collegeRollNo && e.batchId === editPayload.batchId);
  
  let record;
  if (existingIndex !== -1) {
    record = {
      ...cachedEdits[existingIndex],
      ...editPayload,
      editCount: (cachedEdits[existingIndex].editCount || 0) + 1,
      updatedAt: new Date().toISOString()
    };
    cachedEdits[existingIndex] = record;
  } else {
    record = {
      ...editPayload,
      id: editId,
      editCount: 1,
      status: 'PENDING',
      updatedAt: new Date().toISOString()
    };
    cachedEdits.push(record);
  }
  localStorage.setItem(BATCH_EDITS_KEY, JSON.stringify(cachedEdits));

  try {
    await ensureAnonymousAuth();
    await setDoc(doc(db, "batch_edits", editId), record);
    await rtdbSet(rtdbRef(rtdb, `batch_edits/${editId}`), record);
  } catch (err) {
    console.error("Error saving batch edit to Firebase:", err);
  }
  return cachedEdits;
}

export async function approveBatchEdit(batchId, collegeRollNo) {
  const editId = `${batchId}_${collegeRollNo}`.replace(/[^a-zA-Z0-9_]/g, '_');
  const editItem = cachedEdits.find((e) => e.batchId === batchId && e.collegeRollNo === collegeRollNo);
  
  if (editItem) {
    editItem.status = 'CONFIRMED';
    localStorage.setItem(BATCH_EDITS_KEY, JSON.stringify(cachedEdits));
    
    const memberIndex = cachedMembers.findIndex((m) => m.collegeRollNo === collegeRollNo || m.id === editItem.memberId);
    if (memberIndex !== -1) {
      if (editItem.photoUrl) cachedMembers[memberIndex].photoUrl = editItem.photoUrl;
      if (editItem.photoTransform) cachedMembers[memberIndex].photoTransform = editItem.photoTransform;
      await saveMembers(cachedMembers);
    }

    try {
      await ensureAnonymousAuth();
      await updateDoc(doc(db, "batch_edits", editId), { status: 'CONFIRMED' });
      await rtdbSet(rtdbRef(rtdb, `batch_edits/${editId}/status`), 'CONFIRMED');
    } catch (err) {}
  }
  return cachedEdits;
}

// Auto seed default data to both Firestore and Realtime Database
async function seedFirestoreData() {
  try {
    await ensureAnonymousAuth();
    for (const m of DEFAULT_MEMBERS) {
      await setDoc(doc(db, "members", m.id), m);
      await rtdbSet(rtdbRef(rtdb, `members/${m.id}`), m);
    }
    for (const b of DEFAULT_BATCHES) {
      await setDoc(doc(db, "batches", b.batchId), b);
      await rtdbSet(rtdbRef(rtdb, `batches/${b.batchId}`), b);
    }
    await setDoc(doc(db, "config", "template_studio"), DEFAULT_TEMPLATE_CONFIG);
    await rtdbSet(rtdbRef(rtdb, 'config/template_studio'), DEFAULT_TEMPLATE_CONFIG);
  } catch (e) {
    console.warn("Auto-seed error:", e);
  }
}

// Fallbacks for local storage
function getMembersLocal() {
  const data = localStorage.getItem(MEMBERS_KEY);
  if (!data) return DEFAULT_MEMBERS;
  try { return JSON.parse(data); } catch (e) { return DEFAULT_MEMBERS; }
}

function getBatchesLocal() {
  const data = localStorage.getItem(BATCHES_KEY);
  if (!data) return DEFAULT_BATCHES;
  try { return JSON.parse(data); } catch (e) { return DEFAULT_BATCHES; }
}

function getBatchEditsLocal() {
  const data = localStorage.getItem(BATCH_EDITS_KEY);
  if (!data) return [];
  try { return JSON.parse(data); } catch (e) { return []; }
}

function getTemplateConfigLocal() {
  const data = localStorage.getItem(TEMPLATE_CONFIG_KEY);
  if (!data) return DEFAULT_TEMPLATE_CONFIG;
  try { return { ...DEFAULT_TEMPLATE_CONFIG, ...JSON.parse(data) }; } catch (e) { return DEFAULT_TEMPLATE_CONFIG; }
}
