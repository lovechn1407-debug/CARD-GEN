import React, { useState, useEffect } from 'react';
import IDCardCanvas from './IDCardCanvas';
import FlippableIDCard from './FlippableIDCard';
import { subscribeMembers, getMemberById } from '../utils/storage';
import { ensureAnonymousAuth } from '../utils/firebase';
import { ShieldCheck, ShieldAlert, CheckCircle, Search, Calendar, Phone, Award, User, Loader } from 'lucide-react';

export default function PublicVerifyPortal() {
  const [memberId, setMemberId] = useState('');
  const [member, setMember] = useState(null);
  const [searched, setSearched] = useState(false);
  const [dbLoaded, setDbLoaded] = useState(false); // Wait for Firebase to load before lookup

  // On mount: get anonymous auth, subscribe to Realtime DB, THEN do the QR lookup
  useEffect(() => {
    ensureAnonymousAuth();

    // Subscribe to members from Firebase Realtime Database
    const unsub = subscribeMembers((list) => {
      setDbLoaded(true);

      // After DB loads, re-check if we have a pending QR lookup
      const hash = window.location.hash;
      const match = hash.match(/id=([^&]+)/) || window.location.search.match(/id=([^&]+)/);
      if (match?.[1]) {
        const queryId = decodeURIComponent(match[1]);
        setMemberId(queryId);
        // getMemberById now reads the LIVE data from Firebase
        setMember(getMemberById(queryId));
        setSearched(true);
      }
    });

    return () => unsub && unsub();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!memberId.trim()) return;
    setMember(getMemberById(memberId.trim()));
    setSearched(true);
  };

  // Loading state while Firebase is fetching member data
  if (!dbLoaded) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid #e2e8f0', borderTopColor: '#1d4ed8', animation: 'spin 0.8s linear infinite' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>Loading verification database...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
      {/* Mobile-Responsive Header */}
      <header style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '12px 16px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: 36, height: 36, background: '#1d4ed8', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Bebas Neue', sans-serif", color: '#fff', fontSize: '18px' }}>EC</div>
            <div>
              <h1 style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', margin: 0, lineHeight: 1.2 }}>E-CELL Official Verification</h1>
              <p style={{ fontSize: '10px', color: '#64748b', fontStyle: 'italic', margin: 0 }}>I.T.S Engineering College</p>
            </div>
          </div>
          <a href="#/" style={{ padding: '6px 12px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '12px', fontWeight: 600, color: '#334155', textDecoration: 'none' }}>
            Admin Portal
          </a>
        </div>
      </header>

      {/* Main Body */}
      <main style={{ flex: 1, maxWidth: '900px', margin: '0 auto', width: '100%', padding: '24px 16px', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', boxSizing: 'border-box' }}>
        {!searched || !member ? (
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '32px 20px', maxWidth: '420px', width: '100%', boxShadow: '0 8px 30px rgba(0,0,0,0.08)', textAlign: 'center', boxSizing: 'border-box' }}>
            <div style={{ width: 52, height: 52, background: searched && !member ? '#fef2f2' : '#eff6ff', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', border: `1px solid ${searched && !member ? '#fecaca' : '#bfdbfe'}` }}>
              {searched && !member
                ? <ShieldAlert style={{ width: 26, height: 26, color: '#dc2626' }} />
                : <ShieldCheck style={{ width: 26, height: 26, color: '#1d4ed8' }} />
              }
            </div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', margin: '0 0 6px' }}>
              {searched && !member ? 'Unverified / Invalid Card' : 'Verify E-Cell ID Card'}
            </h2>
            <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 20px', lineHeight: 1.5 }}>
              {searched && !member
                ? `No member record found for ID "${memberId}". Please verify the Roll No.`
                : 'Scan QR code or enter Member Roll No to check official active status.'
              }
            </p>
            <form onSubmit={handleSearchSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#94a3b8' }}>
                  <Search style={{ width: 15, height: 15 }} />
                </div>
                <input type="text" placeholder="Enter College Roll No / ID..." value={memberId}
                  onChange={(e) => setMemberId(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px 10px 32px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <button type="submit" style={{ padding: '10px', background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
                Verify Member Authenticity
              </button>
            </form>
          </div>
        ) : (
          <div style={{ background: '#fff', border: '1px solid #bbf7d0', borderRadius: '16px', padding: '20px', width: '100%', boxShadow: '0 8px 30px rgba(0,0,0,0.08)', boxSizing: 'border-box' }}>
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CheckCircle style={{ width: 24, height: 24, color: '#16a34a', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: '#166534', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Official E-Cell Status</div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#14532d' }}>VERIFIED ACTIVE MEMBER</div>
                </div>
              </div>
              <span style={{ background: '#fff', color: '#15803d', border: '1px solid #bbf7d0', borderRadius: '20px', fontSize: '10px', fontWeight: 700, padding: '2px 8px', fontFamily: 'monospace' }}>
                ID: {member.collegeRollNo || member.id}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px', alignItems: 'start' }}>
              <div style={{ width: '100%', maxWidth: '270px', margin: '0 auto' }}>
                <FlippableIDCard member={member} interactive={false} overlayOpacity={1.0} showFlipButton={true} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <span style={{ fontSize: '10px', fontWeight: 700, color: '#1d4ed8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Member Name</span>
                  <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '32px', fontWeight: 700, color: '#0f172a', margin: '2px 0 0', letterSpacing: '1px', lineHeight: 1.1 }}>
                    {member.name}
                  </h2>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
                  {[
                    { icon: Award, label: 'Designation', value: member.designation, italic: true },
                    { icon: User, label: 'Roll No / ID', value: member.collegeRollNo || member.id, mono: true },
                    { icon: Calendar, label: 'Valid Till', value: member.validTill || '2026-08-31' },
                    { icon: Phone, label: 'Contact', value: member.phone || 'N/A' },
                  ].map(({ icon: Icon, label, value, italic, mono }) => (
                    <div key={label}>
                      <span style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                        <Icon style={{ width: 12, height: 12, color: '#1d4ed8' }} /> {label}
                      </span>
                      <p style={{ fontSize: '12px', fontWeight: 600, color: '#0f172a', margin: 0, fontStyle: italic ? 'italic' : 'normal', fontFamily: mono ? 'monospace' : 'inherit', wordBreak: 'break-word' }}>{value}</p>
                    </div>
                  ))}
                </div>

                <button onClick={() => { setSearched(false); setMember(null); setMemberId(''); }}
                  style={{ alignSelf: 'flex-start', padding: '8px 14px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '12px', fontWeight: 600, color: '#334155', cursor: 'pointer', marginTop: '4px' }}>
                  Verify Another Card
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer style={{ textAlign: 'center', padding: '12px 16px', fontSize: '11px', color: '#94a3b8', borderTop: '1px solid #e2e8f0', background: '#fff' }}>
        © 2026 E-CELL I.T.S Engineering College • Official Verification Portal
      </footer>
    </div>
  );
}
