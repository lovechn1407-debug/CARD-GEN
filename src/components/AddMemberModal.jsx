import React, { useState } from 'react';
import { uploadToImgBB } from '../utils/imgbb';
import { getCardTemplates } from '../utils/storage';
import { X, Upload, Check, UserPlus, Image as ImageIcon, CreditCard } from 'lucide-react';

const inp = { width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', color: '#0f172a', background: '#fff', outline: 'none', boxSizing: 'border-box' };
const lbl = { display: 'block', fontSize: '11px', fontWeight: 700, color: '#334155', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.4px' };

export default function AddMemberModal({ onClose, onAddMember }) {
  const cardTemplates = getCardTemplates();
  const [formData, setFormData] = useState({
    collegeRollNo: '',
    name: '',
    designation: '',
    cardId: 'default',
    year: '3rd Year',
    branch: 'CSE',
    section: 'A',
    email: '',
    validTill: '2026-08-31',
    phone: '',
    bloodGroup: 'O+',
    photoUrl: ''
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
      <div style={{ background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '640px', boxShadow: '0 25px 50px rgba(0,0,0,0.25)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        
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
        <form onSubmit={handleSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto', maxHeight: '80vh' }}>
          
          {/* Card Template Selector Radio Options */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 14px' }}>
            <label style={{ ...lbl, color: '#1d4ed8', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CreditCard style={{ width: 14, height: 14 }} /> Select Card Design / Template *
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '10px' }}>
              {Object.values(cardTemplates).map((template) => {
                const isSelected = formData.cardId === template.id;
                return (
                  <label
                    key={template.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: isSelected ? '2px solid #1d4ed8' : '1px solid #cbd5e1',
                      background: isSelected ? '#eff6ff' : '#ffffff',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <input
                      type="radio"
                      name="cardId"
                      value={template.id}
                      checked={isSelected}
                      onChange={() => setFormData({ ...formData, cardId: template.id })}
                      style={{ accentColor: '#1d4ed8', cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: '13px', fontWeight: isSelected ? 700 : 500, color: isSelected ? '#1e40af' : '#334155' }}>
                      {template.name}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
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
              <label style={lbl}>Academic Year</label>
              <select value={formData.year} onChange={(e) => setFormData({ ...formData, year: e.target.value })} style={inp}>
                {['1st Year', '2nd Year', '3rd Year', '4th Year'].map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={lbl}>Branch / Department</label>
              <input type="text" placeholder="e.g. CSE, ECE, ME, IT" value={formData.branch}
                onChange={(e) => setFormData({ ...formData, branch: e.target.value })} style={inp} />
            </div>

            <div>
              <label style={lbl}>Section</label>
              <input type="text" placeholder="e.g. A, B, C, 1, 2" value={formData.section}
                onChange={(e) => setFormData({ ...formData, section: e.target.value })} style={inp} />
            </div>

            <div>
              <label style={lbl}>Student Email ID</label>
              <input type="email" placeholder="e.g. student@gmail.com" value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })} style={inp} />
            </div>

            <div>
              <label style={lbl}>Phone Number</label>
              <input type="text" placeholder="+91 9876543210" value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })} style={inp} />
            </div>

            <div>
              <label style={lbl}>Valid Till Date</label>
              <input type="date" value={formData.validTill}
                onChange={(e) => setFormData({ ...formData, validTill: e.target.value })} style={inp} />
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
