import React, { useState } from 'react';
import IDCardCanvas from './IDCardCanvas';
import { uploadToImgBB } from '../utils/imgbb';
import { X, ZoomIn, ZoomOut, Move, RotateCw, Eye, EyeOff, Upload, Check, RefreshCw, User, Type } from 'lucide-react';

const sliderStyle = { width: '100%', height: '5px', accentColor: '#1d4ed8', cursor: 'pointer' };
const sectionCard = { background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '8px' };
const rowBetween = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600, color: '#334155' };
const inpStyle = { width: '100%', padding: '6px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px', color: '#0f172a', background: '#fff', outline: 'none', boxSizing: 'border-box' };
const lblStyle = { display: 'block', fontSize: '10px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '3px' };

export default function CardEditorModal({ member, onClose, onSave }) {
  const [photoTransform, setPhotoTransform] = useState(member?.photoTransform || { x: 0, y: -20, scale: 1, rotation: 0 });
  const [photoUrl, setPhotoUrl] = useState(member?.photoUrl || '');
  const [overlayOpacity, setOverlayOpacity] = useState(1.0);
  const [seeThrough, setSeeThrough] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [memberData, setMemberData] = useState({
    name: member?.name || '',
    designation: member?.designation || '',
    year: member?.year || '3rd Year',
    branch: member?.branch || 'CSE',
    section: member?.section || 'A',
    email: member?.email || '',
    phone: member?.phone || '',
    bloodGroup: member?.bloodGroup || 'O+',
    nameMode: member?.nameMode || 'AUTO',
    nameFontSizeScale: member?.nameFontSizeScale || 1.0
  });

  const handleToggleSeeThrough = () => {
    if (seeThrough) { setSeeThrough(false); setOverlayOpacity(1.0); }
    else { setSeeThrough(true); setOverlayOpacity(0.3); }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try { const url = await uploadToImgBB(file); setPhotoUrl(url); }
    catch (err) { alert('Failed to upload image to ImgBB.'); }
    finally { setIsUploading(false); }
  };

  const handleSave = () => {
    onSave({ ...member, ...memberData, photoUrl, photoTransform });
    onClose();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', background: 'rgba(15,23,42,0.65)', overflowY: 'auto' }}>
      <div style={{ background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '880px', maxHeight: '92vh', boxShadow: '0 25px 50px rgba(0,0,0,0.25)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', flexShrink: 0 }}>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', margin: 0 }}>Modify Member ID Card & Details</h3>
            <p style={{ fontSize: '11px', color: '#64748b', margin: '2px 0 0' }}>Reposition photo, adjust long name display (auto-fit or 2 lines), or update info.</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#94a3b8' }}>
            <X style={{ width: 18, height: 18 }} />
          </button>
        </div>

        {/* Body — Left canvas, Right controls */}
        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '20px', padding: '20px', overflowY: 'auto', flex: 1 }}>

          {/* LEFT: Card Preview */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', background: '#f1f5f9', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0', width: '280px' }}>
            <div style={{ width: '250px', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
              <IDCardCanvas
                member={{ ...member, ...memberData, photoUrl, photoTransform }}
                interactive={true}
                overlayOpacity={overlayOpacity}
                onTransformChange={setPhotoTransform}
              />
            </div>
            <p style={{ fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', margin: 0 }}>
              <Move style={{ width: 12, height: 12, color: '#1d4ed8' }} /> Drag photo on card to move
            </p>
          </div>

          {/* RIGHT: Controls */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

              {/* Editable Member Metadata */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#1d4ed8', textTransform: 'uppercase', letterSpacing: '0.4px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <User style={{ width: 13, height: 13 }} /> Member Details (ID: {member?.collegeRollNo || member?.id})
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div>
                    <label style={lblStyle}>Full Name</label>
                    <input type="text" value={memberData.name} onChange={(e) => setMemberData({ ...memberData, name: e.target.value })} style={inpStyle} />
                  </div>
                  <div>
                    <label style={lblStyle}>Designation</label>
                    <input type="text" value={memberData.designation} onChange={(e) => setMemberData({ ...memberData, designation: e.target.value })} style={inpStyle} />
                  </div>
                  <div>
                    <label style={lblStyle}>Year</label>
                    <select value={memberData.year} onChange={(e) => setMemberData({ ...memberData, year: e.target.value })} style={inpStyle}>
                      {['1st Year', '2nd Year', '3rd Year', '4th Year'].map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={lblStyle}>Branch</label>
                    <input type="text" placeholder="e.g. CSE, ECE" value={memberData.branch} onChange={(e) => setMemberData({ ...memberData, branch: e.target.value })} style={inpStyle} />
                  </div>
                  <div>
                    <label style={lblStyle}>Section</label>
                    <input type="text" placeholder="e.g. A, B" value={memberData.section} onChange={(e) => setMemberData({ ...memberData, section: e.target.value })} style={inpStyle} />
                  </div>
                  <div>
                    <label style={lblStyle}>Email ID</label>
                    <input type="email" placeholder="student@gmail.com" value={memberData.email} onChange={(e) => setMemberData({ ...memberData, email: e.target.value })} style={inpStyle} />
                  </div>
                </div>
              </div>

              {/* Long Name Handling & Formatting */}
              <div style={sectionCard}>
                <div style={rowBetween}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#1d4ed8', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Type style={{ width: 13, height: 13 }} /> Name Layout & Long Name Options
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div>
                    <label style={lblStyle}>Display Mode</label>
                    <select
                      value={memberData.nameMode || 'AUTO'}
                      onChange={(e) => setMemberData({ ...memberData, nameMode: e.target.value })}
                      style={inpStyle}
                    >
                      <option value="AUTO">⚡ Auto-Fit (Shrink if Long)</option>
                      <option value="TWO_LINES">🥞 Wrap into 2 Lines</option>
                      <option value="CUSTOM">🎚️ Custom Font Scale</option>
                    </select>
                  </div>
                  <div>
                    <label style={lblStyle}>Font Size Scale ({((memberData.nameFontSizeScale || 1.0) * 100).toFixed(0)}%)</label>
                    <input
                      type="range"
                      min="0.5"
                      max="1.5"
                      step="0.05"
                      value={memberData.nameFontSizeScale || 1.0}
                      onChange={(e) => setMemberData({ ...memberData, nameFontSizeScale: parseFloat(e.target.value) })}
                      style={sliderStyle}
                    />
                  </div>
                </div>
              </div>

              {/* See Through Overlay */}
              <div style={sectionCard}>
                <div style={rowBetween}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {seeThrough ? <EyeOff style={{ width: 14, height: 14, color: '#d97706' }} /> : <Eye style={{ width: 14, height: 14, color: '#1d4ed8' }} />}
                    See-Through Overlay
                  </span>
                  <button onClick={handleToggleSeeThrough}
                    style={{ padding: '5px 10px', background: seeThrough ? '#d97706' : '#fff', color: seeThrough ? '#fff' : '#334155', border: seeThrough ? 'none' : '1px solid #cbd5e1', borderRadius: '6px', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}>
                    {seeThrough ? 'Overlay On' : 'Show Overlay'}
                  </button>
                </div>
                <div style={rowBetween}>
                  <span>Transparency</span><span>{Math.round(overlayOpacity * 100)}%</span>
                </div>
                <input type="range" min="0.1" max="1.0" step="0.05" value={overlayOpacity}
                  onChange={(e) => setOverlayOpacity(parseFloat(e.target.value))} style={sliderStyle} />
              </div>

              {/* Zoom & Rotation */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div style={sectionCard}>
                  <div style={rowBetween}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><ZoomIn style={{ width: 13, height: 13, color: '#1d4ed8' }} /> Zoom</span>
                    <span>{photoTransform.scale.toFixed(2)}x</span>
                  </div>
                  <input type="range" min="0.4" max="2.5" step="0.02" value={photoTransform.scale}
                    onChange={(e) => setPhotoTransform((p) => ({ ...p, scale: parseFloat(e.target.value) }))} style={sliderStyle} />
                </div>

                <div style={sectionCard}>
                  <div style={rowBetween}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><RotateCw style={{ width: 13, height: 13, color: '#1d4ed8' }} /> Rotate</span>
                    <span>{photoTransform.rotation || 0}°</span>
                  </div>
                  <input type="range" min="-45" max="45" step="1" value={photoTransform.rotation || 0}
                    onChange={(e) => setPhotoTransform((p) => ({ ...p, rotation: parseInt(e.target.value) }))} style={sliderStyle} />
                </div>
              </div>

              {/* Upload Photo */}
              <div>
                <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#334155', marginBottom: '4px', textTransform: 'uppercase' }}>
                  Replace Photo (Auto ImgBB Host)
                </label>
                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '9px', border: '2px dashed #cbd5e1', borderRadius: '8px', cursor: 'pointer', background: '#f8fafc' }}>
                  <Upload style={{ width: 14, height: 14, color: '#64748b' }} />
                  <span style={{ fontSize: '12px', color: '#475569' }}>{isUploading ? 'Uploading...' : 'Choose image'}</span>
                  <input type="file" accept="image/*" onChange={handleFileChange} disabled={isUploading} style={{ display: 'none' }} />
                </label>
              </div>
            </div>

            {/* Footer Actions */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid #f1f5f9', gap: '8px' }}>
              <button onClick={() => setPhotoTransform({ x: 0, y: -20, scale: 1, rotation: 0 })}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '8px 14px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '12px', fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
                <RefreshCw style={{ width: 13, height: 13 }} /> Reset
              </button>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={onClose}
                  style={{ padding: '8px 14px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '12px', fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button onClick={handleSave}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '8px 18px', background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
                  <Check style={{ width: 14, height: 14 }} /> Save Card Edits
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
