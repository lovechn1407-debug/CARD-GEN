// Local Storage Manager for CARD-GEN

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
  showRefGuide: false,       // Reference ID card overlay guide toggle
  refGuideOpacity: 0.4       // Reference guide opacity
};

export function getTemplateConfig() {
  const data = localStorage.getItem(TEMPLATE_CONFIG_KEY);
  if (!data) return DEFAULT_TEMPLATE_CONFIG;
  try {
    return { ...DEFAULT_TEMPLATE_CONFIG, ...JSON.parse(data) };
  } catch (e) {
    return DEFAULT_TEMPLATE_CONFIG;
  }
}

export function saveTemplateConfig(config) {
  localStorage.setItem(TEMPLATE_CONFIG_KEY, JSON.stringify(config));
}

// Sample initial member data with reliable working portrait photos
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

export function getMembers() {
  const data = localStorage.getItem(MEMBERS_KEY);
  if (!data) {
    localStorage.setItem(MEMBERS_KEY, JSON.stringify(DEFAULT_MEMBERS));
    return DEFAULT_MEMBERS;
  }
  try {
    const parsed = JSON.parse(data);
    // Auto-fix broken imgur URLs in stored local data if present
    const fixed = parsed.map(m => {
      if (m.photoUrl && m.photoUrl.includes('imgur')) {
        return { ...m, photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80' };
      }
      return m;
    });
    return fixed;
  } catch (e) {
    return DEFAULT_MEMBERS;
  }
}

export function saveMembers(members) {
  localStorage.setItem(MEMBERS_KEY, JSON.stringify(members));
}

export function getMemberById(id) {
  const members = getMembers();
  return members.find(m => m.id === id || m.collegeRollNo === id);
}

export function updateMember(updatedMember) {
  const members = getMembers();
  const index = members.findIndex(m => m.id === updatedMember.id);
  if (index !== -1) {
    members[index] = { ...members[index], ...updatedMember };
  } else {
    members.push(updatedMember);
  }
  saveMembers(members);
  return members;
}

export function deleteMember(id) {
  const members = getMembers().filter(m => m.id !== id);
  saveMembers(members);
  return members;
}

export function getBatches() {
  const data = localStorage.getItem(BATCHES_KEY);
  if (!data) {
    const defaultBatch = [
      {
        batchId: 'BATCH-DEFAULT-2026',
        name: 'Initial Team Batch 2026',
        createdAt: new Date().toISOString(),
        memberCount: 2,
        isPublic: true,
        publicToken: 'ecell-batch-2026-token'
      }
    ];
    localStorage.setItem(BATCHES_KEY, JSON.stringify(defaultBatch));
    return defaultBatch;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
}

export function saveBatches(batches) {
  localStorage.setItem(BATCHES_KEY, JSON.stringify(batches));
}

export function getBatchEdits() {
  const data = localStorage.getItem(BATCH_EDITS_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
}

export function saveBatchEdit(editPayload) {
  const edits = getBatchEdits();
  const existingIndex = edits.findIndex(e => e.collegeRollNo === editPayload.collegeRollNo && e.batchId === editPayload.batchId);
  
  if (existingIndex !== -1) {
    const prev = edits[existingIndex];
    edits[existingIndex] = {
      ...prev,
      ...editPayload,
      editCount: (prev.editCount || 0) + 1,
      updatedAt: new Date().toISOString()
    };
  } else {
    edits.push({
      ...editPayload,
      editCount: 1,
      status: 'PENDING',
      updatedAt: new Date().toISOString()
    });
  }
  localStorage.setItem(BATCH_EDITS_KEY, JSON.stringify(edits));
  return edits;
}

export function approveBatchEdit(batchId, collegeRollNo) {
  const edits = getBatchEdits();
  const editItem = edits.find(e => e.batchId === batchId && e.collegeRollNo === collegeRollNo);
  if (editItem) {
    editItem.status = 'CONFIRMED';
    localStorage.setItem(BATCH_EDITS_KEY, JSON.stringify(edits));
    
    const members = getMembers();
    const memberIndex = members.findIndex(m => m.collegeRollNo === collegeRollNo || m.id === editItem.memberId);
    if (memberIndex !== -1) {
      if (editItem.photoUrl) members[memberIndex].photoUrl = editItem.photoUrl;
      if (editItem.photoTransform) members[memberIndex].photoTransform = editItem.photoTransform;
      saveMembers(members);
    }
  }
  return getBatchEdits();
}
