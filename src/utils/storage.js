// 100% Firebase Realtime Database Data Manager for CARD-GEN
import { rtdb, ensureAnonymousAuth } from './firebase';
import { ref as rtdbRef, set as rtdbSet, onValue as rtdbOnValue, get as rtdbGet, remove as rtdbRemove } from "firebase/database";

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

// Initial default member records to seed Realtime Database if empty
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

// In-Memory Live State
let cachedMembers = [...DEFAULT_MEMBERS];
let cachedBatches = [...DEFAULT_BATCHES];
let cachedEdits = [];
let cachedConfig = { ...DEFAULT_TEMPLATE_CONFIG };

// -------------------------------------------------------------
// REAL-TIME FIREBASE REALTIME DATABASE SUBSCRIPTIONS (rtdb)
// -------------------------------------------------------------

export function subscribeMembers(callback) {
  ensureAnonymousAuth();
  const membersRef = rtdbRef(rtdb, 'members');
  return rtdbOnValue(membersRef, (snapshot) => {
    const val = snapshot.val();
    if (!val) {
      seedRealtimeDatabase();
      callback(DEFAULT_MEMBERS);
      return;
    }
    const list = Array.isArray(val) ? val.filter(Boolean) : Object.values(val);
    cachedMembers = list;
    callback(list);
  }, (err) => {
    console.warn("Realtime DB members subscription warning:", err);
    callback(cachedMembers);
  });
}

export function subscribeBatches(callback) {
  ensureAnonymousAuth();
  const batchesRef = rtdbRef(rtdb, 'batches');
  return rtdbOnValue(batchesRef, (snapshot) => {
    const val = snapshot.val();
    if (!val) {
      callback(DEFAULT_BATCHES);
      return;
    }
    const list = Array.isArray(val) ? val.filter(Boolean) : Object.values(val);
    cachedBatches = list;
    callback(list);
  }, () => {
    callback(cachedBatches);
  });
}

export function subscribeBatchEdits(callback) {
  ensureAnonymousAuth();
  const editsRef = rtdbRef(rtdb, 'batch_edits');
  return rtdbOnValue(editsRef, (snapshot) => {
    const val = snapshot.val();
    if (!val) {
      callback([]);
      return;
    }
    const list = Array.isArray(val) ? val.filter(Boolean) : Object.values(val);
    cachedEdits = list;
    callback(list);
  }, () => {
    callback(cachedEdits);
  });
}

export function subscribeTemplateConfig(callback) {
  ensureAnonymousAuth();
  const configRef = rtdbRef(rtdb, 'config/template_studio');
  return rtdbOnValue(configRef, (snapshot) => {
    const val = snapshot.val();
    if (!val) {
      rtdbSet(configRef, DEFAULT_TEMPLATE_CONFIG).catch(() => {});
      callback(DEFAULT_TEMPLATE_CONFIG);
      return;
    }
    const data = { ...DEFAULT_TEMPLATE_CONFIG, ...val };
    cachedConfig = data;
    callback(data);
  }, () => {
    callback(cachedConfig);
  });
}

// -------------------------------------------------------------
// READ & WRITE OPERATIONS (100% REALTIME DATABASE ONLY)
// -------------------------------------------------------------

export function getTemplateConfig() {
  return cachedConfig;
}

export async function saveTemplateConfig(config) {
  cachedConfig = config;
  try {
    await ensureAnonymousAuth();
    await rtdbSet(rtdbRef(rtdb, 'config/template_studio'), config);
  } catch (err) {
    console.error("Error saving template config to Realtime Database:", err);
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
  try {
    await ensureAnonymousAuth();
    await rtdbSet(rtdbRef(rtdb, `members/${updatedMember.id}`), updatedMember);
  } catch (err) {
    console.error("Error updating member in Realtime Database:", err);
  }
  return cachedMembers;
}

export async function saveMembers(membersList) {
  cachedMembers = membersList;
  try {
    await ensureAnonymousAuth();
    for (const m of membersList) {
      await rtdbSet(rtdbRef(rtdb, `members/${m.id}`), m);
    }
  } catch (err) {
    console.error("Error saving members to Realtime Database:", err);
  }
}

export async function deleteMember(id) {
  cachedMembers = cachedMembers.filter((m) => m.id !== id);
  try {
    await ensureAnonymousAuth();
    await rtdbRemove(rtdbRef(rtdb, `members/${id}`));
  } catch (err) {
    console.error("Error deleting member in Realtime Database:", err);
  }
  return cachedMembers;
}

export function getBatches() {
  return cachedBatches;
}

export async function saveBatches(batchesList) {
  cachedBatches = batchesList;
  try {
    await ensureAnonymousAuth();
    for (const b of batchesList) {
      await rtdbSet(rtdbRef(rtdb, `batches/${b.batchId}`), b);
    }
  } catch (err) {
    console.error("Error saving batches to Realtime Database:", err);
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

  try {
    await ensureAnonymousAuth();
    await rtdbSet(rtdbRef(rtdb, `batch_edits/${editId}`), record);
  } catch (err) {
    console.error("Error saving batch edit to Realtime Database:", err);
  }
  return cachedEdits;
}

export async function approveBatchEdit(batchId, collegeRollNo) {
  const editId = `${batchId}_${collegeRollNo}`.replace(/[^a-zA-Z0-9_]/g, '_');
  const editItem = cachedEdits.find((e) => e.batchId === batchId && e.collegeRollNo === collegeRollNo);
  
  if (editItem) {
    editItem.status = 'CONFIRMED';
    
    const memberIndex = cachedMembers.findIndex((m) => m.collegeRollNo === collegeRollNo || m.id === editItem.memberId);
    if (memberIndex !== -1) {
      if (editItem.photoUrl) cachedMembers[memberIndex].photoUrl = editItem.photoUrl;
      if (editItem.photoTransform) cachedMembers[memberIndex].photoTransform = editItem.photoTransform;
      await saveMembers(cachedMembers);
    }

    try {
      await ensureAnonymousAuth();
      await rtdbSet(rtdbRef(rtdb, `batch_edits/${editId}/status`), 'CONFIRMED');
    } catch (err) {}
  }
  return cachedEdits;
}

// Auto seed ONLY if data doesn't already exist (never overwrites user data)
async function seedRealtimeDatabase() {
  try {
    await ensureAnonymousAuth();
    for (const m of DEFAULT_MEMBERS) {
      await rtdbSet(rtdbRef(rtdb, `members/${m.id}`), m);
    }
    for (const b of DEFAULT_BATCHES) {
      await rtdbSet(rtdbRef(rtdb, `batches/${b.batchId}`), b);
    }
    // ONLY write default config if NO config exists yet — never overwrite existing user config
    const configSnap = await rtdbGet(rtdbRef(rtdb, 'config/template_studio'));
    if (!configSnap.exists()) {
      await rtdbSet(rtdbRef(rtdb, 'config/template_studio'), DEFAULT_TEMPLATE_CONFIG);
    }
  } catch (e) {
    console.warn("Realtime DB Auto-seed error:", e);
  }
}
