import React, { useState, useEffect } from 'react';
import IDCardCanvas from './IDCardCanvas';
import { getMembers, saveBatchEdit } from '../utils/storage';
import { uploadToImgBB } from '../utils/imgbb';
import { ShieldCheck, Search, Eye, EyeOff, ZoomIn, ZoomOut, Move, RotateCw, Upload, CheckCircle2, Lock, ArrowRight, RefreshCw } from 'lucide-react';

const sliderStyle = { width: '100%', height: '5px', accentColor: '#1d4ed8', cursor: 'pointer' };
const sectionBox = { background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '8px' };

export default function PublicEditPortal() {
  const [batchId, setBatchId] = useState('');
  const [collegeRollNo, setCollegeRollNo] = useState('');
  const [authenticatedMember, setAuthenticatedMember] = useState(null);
  const [authError, setAuthError] = useState('');
  const [photoTransform, setPhotoTransform] = useState({ x: 0, y: -20, scale: 1, rotation: 0 });
  const [photoUrl, setPhotoUrl] = useState('');
  const [overlayOpacity, setOverlayOpacity] = useState(1.0);
  const [seeThrough, setSeeThrough] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    const hash = window.location.hash;
    const match = hash.match(/batch=([^&]+)/) || window.location.search.match(/batch=([^&]+)/);
    if (match?.[1]) setBatchId(decodeURIComponent(match[1]));
  }, []);

  const handleAuthSubmit = (e) => {
    e.preventDefault();
    setAuthError('');
    const members = getMembers();
    const found = members.find((m) => {
      const matchRoll = m.collegeRollNo?.toLowerCase() === collegeRollNo.trim().toLowerCase();
      const matchBatch = !batchId || m.batchId === batchId;
      return matchRoll && matchBatch;
    });
    if (found) {
      setAuthenticatedMember(found);
      setPhotoUrl(found.photoUrl || '');
      setPhotoTransform(found.photoTransform || { x: 0, y: -20, scale: 1, rotation: 0 });
    } else {
      setAuthError(`No member found for Roll No "${collegeRollNo}" in this batch.`);
    }
  };

  const handleToggleSeeThrough = () => {
    if (seeThrough) { setSeeThrough(false); setOverlayOpacity(1.0); }
    else { setSeeThrough(true); setOverlayOpacity(0.3); }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try { const url = await uploadToImgBB(file); setPhotoUrl(url); }
    catch (err) { alert('Failed to upload image. Please try again.'); }
    finally { setIsUploading(false); }
  };

  const handleSubmitEdits = () => {
    if (!authenticatedMember) return;
    saveBatchEdit({ batchId: authenticatedMember.batchId || batchId || 'DEFAULT', collegeRollNo: authenticatedMember.collegeRollNo, memberId: authenticatedMember.id, photoUrl, photoTransform });
    setIsSubmitted(true);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '0 20px' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '60px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: 38, height: 38, background: '#1d4ed8', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Bebas Neue', sans-serif", color: '#fff', fontSize: '18px' }}>EC</div>
            <div>
              <h1 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', margin: 0 }}>E-CELL Member Portal</h1>
              <p style={{ fontSize: '11px', color: '#64748b', fontStyle: 'italic', margin: 0 }}>Self-Service Card Photo Editor</p>
            </div>
          </div>
          <a href="#/" style={{ padding: '7px 14px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '12px', fontWeight: 600, color: '#334155', textDecoration: 'none' }}>
            Admin Portal
          </a>
        </div>
      </header>

      {/* Main */}
      <main style={{ flex: 1, maxWidth: '960px', margin: '0 auto', width: '100%', padding: '40px 20px', display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>

        {!authenticatedMember ? (
          /* Auth Form */
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '40px', maxWidth: '420px', width: '100%', boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ width: 52, height: 52, background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                <Lock style={{ width: 22, height: 22, color: '#1d4ed8' }} />
              </div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', margin: '0 0 4px' }}>Member Verification</h2>
              <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>Enter your College Roll No to access your ID card editor.</p>
            </div>

            <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#334155', marginBottom: '5px', textTransform: 'uppercase' }}>
                  College Roll No / Student ID
                </label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#94a3b8' }}>
                    <Search style={{ width: 15, height: 15 }} />
                  </div>
                  <input type="text" required placeholder="e.g. 2100290130085" value={collegeRollNo}
                    onChange={(e) => setCollegeRollNo(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px 10px 32px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
                </div>
              </div>
              {authError && (
                <div style={{ padding: '10px 12px', background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: '12px', borderRadius: '8px', fontWeight: 500 }}>
                  {authError}
                </div>
              )}
              <button type="submit" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '11px', background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
                Verify ID & Load Card <ArrowRight style={{ width: 15, height: 15 }} />
              </button>
            </form>
          </div>

        ) : isSubmitted ? (
          /* Success */
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '48px', maxWidth: '400px', width: '100%', textAlign: 'center', boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}>
            <CheckCircle2 style={{ width: 60, height: 60, color: '#16a34a', margin: '0 auto 16px' }} />
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', margin: '0 0 8px' }}>Edits Submitted!</h2>
            <p style={{ fontSize: '12px', color: '#475569', lineHeight: 1.6 }}>
              Thank you, <strong style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '14px', color: '#0f172a' }}>{authenticatedMember.name}</strong>! Your updated photo positioning has been submitted for admin review.
            </p>
            <button onClick={() => { setIsSubmitted(false); setAuthenticatedMember(null); setCollegeRollNo(''); }}
              style={{ marginTop: '20px', padding: '9px 18px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '12px', fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
              Edit Another Card
            </button>
          </div>

        ) : (
          /* Editor */
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', width: '100%', boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}>
            {/* Editor Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <span style={{ display: 'inline-block', background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', borderRadius: '20px', fontSize: '10px', fontWeight: 700, padding: '2px 8px', marginBottom: '4px' }}>
                  Verified: {authenticatedMember.collegeRollNo}
                </span>
                <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '28px', fontWeight: 700, color: '#0f172a', margin: '0 0 2px', letterSpacing: '1px' }}>{authenticatedMember.name}</h2>
                <p style={{ fontSize: '12px', color: '#64748b', fontStyle: 'italic', margin: 0 }}>{authenticatedMember.designation}</p>
              </div>
              <button onClick={handleToggleSeeThrough}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: seeThrough ? '#d97706' : '#fff', color: seeThrough ? '#fff' : '#334155', border: seeThrough ? 'none' : '1px solid #cbd5e1', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                {seeThrough ? <EyeOff style={{ width: 14, height: 14 }} /> : <Eye style={{ width: 14, height: 14 }} />}
                {seeThrough ? 'Overlay Transparent' : 'See Through Overlay'}
              </button>
            </div>

            {/* 2-col layout */}
            <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '24px' }}>
              {/* Card Canvas */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', background: '#f1f5f9', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0', width: '300px' }}>
                <div style={{ width: '270px', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 12px 30px rgba(0,0,0,0.2)' }}>
                  <IDCardCanvas
                    member={{ ...authenticatedMember, photoUrl, photoTransform }}
                    interactive={true}
                    overlayOpacity={overlayOpacity}
                    onTransformChange={setPhotoTransform}
                  />
                </div>
                <p style={{ fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', margin: 0 }}>
                  <Move style={{ width: 12, height: 12, color: '#1d4ed8' }} /> Touch or drag photo to reposition
                </p>
              </div>

              {/* Controls */}
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

                  {/* Opacity */}
                  <div style={sectionBox}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600, color: '#334155' }}>
                      <span>See-Through Opacity</span><span>{Math.round(overlayOpacity * 100)}%</span>
                    </div>
                    <input type="range" min="0.1" max="1.0" step="0.05" value={overlayOpacity}
                      onChange={(e) => setOverlayOpacity(parseFloat(e.target.value))} style={sliderStyle} />
                  </div>

                  {/* Zoom */}
                  <div style={sectionBox}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600, color: '#334155' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><ZoomIn style={{ width: 14, height: 14, color: '#1d4ed8' }} /> Zoom & Scale</span>
                      <span>{photoTransform.scale.toFixed(2)}x</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button onClick={() => setPhotoTransform((p) => ({ ...p, scale: Math.max(0.4, p.scale - 0.05) }))}
                        style={{ padding: '5px 8px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer' }}>
                        <ZoomOut style={{ width: 13, height: 13 }} />
                      </button>
                      <input type="range" min="0.4" max="2.5" step="0.02" value={photoTransform.scale}
                        onChange={(e) => setPhotoTransform((p) => ({ ...p, scale: parseFloat(e.target.value) }))} style={sliderStyle} />
                      <button onClick={() => setPhotoTransform((p) => ({ ...p, scale: Math.min(2.5, p.scale + 0.05) }))}
                        style={{ padding: '5px 8px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer' }}>
                        <ZoomIn style={{ width: 13, height: 13 }} />
                      </button>
                    </div>
                  </div>

                  {/* Rotation */}
                  <div style={sectionBox}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600, color: '#334155' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><RotateCw style={{ width: 14, height: 14, color: '#1d4ed8' }} /> Rotation</span>
                      <span>{photoTransform.rotation || 0}°</span>
                    </div>
                    <input type="range" min="-45" max="45" step="1" value={photoTransform.rotation || 0}
                      onChange={(e) => setPhotoTransform((p) => ({ ...p, rotation: parseInt(e.target.value) }))} style={sliderStyle} />
                  </div>

                  {/* Upload Photo */}
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#334155', marginBottom: '5px', textTransform: 'uppercase' }}>
                      Upload New Photo (Auto ImgBB Host)
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', border: '2px dashed #cbd5e1', borderRadius: '10px', cursor: 'pointer', background: '#f8fafc' }}>
                      <Upload style={{ width: 15, height: 15, color: '#64748b' }} />
                      <span style={{ fontSize: '12px', color: '#475569' }}>{isUploading ? 'Uploading Image...' : 'Select File'}</span>
                      <input type="file" accept="image/*" onChange={handleImageUpload} disabled={isUploading} style={{ display: 'none' }} />
                    </label>
                  </div>
                </div>

                {/* Footer */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '14px', borderTop: '1px solid #f1f5f9', gap: '8px' }}>
                  <button onClick={() => setPhotoTransform({ x: 0, y: -20, scale: 1, rotation: 0 })}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '9px 14px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '12px', fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
                    <RefreshCw style={{ width: 13, height: 13 }} /> Reset
                  </button>
                  <button onClick={handleSubmitEdits}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '9px 20px', background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
                    <ShieldCheck style={{ width: 15, height: 15 }} /> Confirm & Submit Photo
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer style={{ textAlign: 'center', padding: '16px', fontSize: '11px', color: '#94a3b8', borderTop: '1px solid #e2e8f0', background: '#fff' }}>
        © 2026 E-CELL I.T.S Engineering College • All Rights Reserved
      </footer>
    </div>
  );
}
