import React, { useState } from 'react';
import { uploadToImgBB } from '../utils/imgbb';
import { X, Upload, Check, UserPlus, Image as ImageIcon } from 'lucide-react';

const inp = { width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', color: '#0f172a', background: '#fff', outline: 'none', boxSizing: 'border-box' };
const lbl = { display: 'block', fontSize: '11px', fontWeight: 700, color: '#334155', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.4px' };

export default function AddMemberModal({ onClose, onAddMember }) {
  const [formData, setFormData] = useState({
    collegeRollNo: '', name: '', designation: '',
    validTill: '2026-08-31', phone: '', bloodGroup: 'O+',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80'
  });
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const hostedUrl = await uploadToImgBB(file);
      setFormData((prev) => ({ ...prev, photoUrl: hostedUrl }));
    } catch (err) {
      alert('Failed to upload image to ImgBB. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.collegeRollNo) {
      alert('Please enter Name and College Roll No / ID');
      return;
    }
    onAddMember({
      id: `ECELL-${Date.now().toString().slice(-6)}`,
      ...formData,
      batchId: 'BATCH-MANUAL',
      photoTransform: { x: 0, y: -20, scale: 1, rotation: 0 },
      createdAt: new Date().toISOString()
    });
    onClose();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', background: 'rgba(15,23,42,0.65)', overflowY: 'auto' }}>
      <div style={{ background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '560px', boxShadow: '0 25px 50px rgba(0,0,0,0.25)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UserPlus style={{ width: 18, height: 18, color: '#1d4ed8' }} />
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', margin: 0 }}>Add New Member (Manual)</h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#94a3b8', borderRadius: '6px' }}>
            <X style={{ width: 18, height: 18 }} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={lbl}>College Roll No / ID *</label>
              <input type="text" required placeholder="e.g. 2100290130085" value={formData.collegeRollNo}
                onChange={(e) => setFormData({ ...formData, collegeRollNo: e.target.value })} style={inp} />
            </div>
            <div>
              <label style={lbl}>Member Full Name *</label>
              <input type="text" required placeholder="e.g. LOVE CHAUHAN" value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                style={{ ...inp, fontFamily: "'Bebas Neue', sans-serif", textTransform: 'uppercase', fontSize: '15px' }} />
            </div>
            <div>
              <label style={lbl}>Designation *</label>
              <input type="text" required placeholder="e.g. Creative Designing" value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                style={{ ...inp, fontStyle: 'italic' }} />
            </div>
            <div>
              <label style={lbl}>Valid Till Date</label>
              <input type="date" value={formData.validTill}
                onChange={(e) => setFormData({ ...formData, validTill: e.target.value })} style={inp} />
            </div>
            <div>
              <label style={lbl}>Phone Number</label>
              <input type="text" placeholder="+91 9876543210" value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })} style={inp} />
            </div>
            <div>
              <label style={lbl}>Blood Group</label>
              <select value={formData.bloodGroup} onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })} style={inp}>
                {['A+','A-','B+','B-','O+','O-','AB+','AB-'].map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
          </div>

          {/* Photo Upload */}
          <div>
            <label style={lbl}>Member Photo (Uploaded to ImgBB)</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '10px', border: '1px solid #e2e8f0', overflow: 'hidden', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {formData.photoUrl
                  ? <img src={formData.photoUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <ImageIcon style={{ width: 20, height: 20, color: '#94a3b8' }} />
                }
              </div>
              <label style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', border: '2px dashed #cbd5e1', borderRadius: '10px', cursor: 'pointer', background: '#f8fafc' }}>
                <Upload style={{ width: 15, height: 15, color: '#64748b' }} />
                <span style={{ fontSize: '12px', color: '#475569', fontWeight: 500 }}>
                  {isUploading ? 'Uploading to ImgBB...' : 'Choose Profile Image'}
                </span>
                <input type="file" accept="image/*" onChange={handleImageUpload} disabled={isUploading} style={{ display: 'none' }} />
              </label>
            </div>
          </div>

          {/* Footer Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
            <button type="button" onClick={onClose}
              style={{ padding: '9px 18px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
              Cancel
            </button>
            <button type="submit" disabled={isUploading}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '9px 18px', background: isUploading ? '#cbd5e1' : '#1d4ed8', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: isUploading ? 'not-allowed' : 'pointer' }}>
              <Check style={{ width: 15, height: 15 }} /> Confirm & Add Member
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
