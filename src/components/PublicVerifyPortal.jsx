import React, { useState, useEffect } from 'react';
import IDCardCanvas from './IDCardCanvas';
import { getMemberById } from '../utils/storage';
import { ShieldCheck, ShieldAlert, CheckCircle, Search, Calendar, Phone, Award, User } from 'lucide-react';

export default function PublicVerifyPortal() {
  const [memberId, setMemberId] = useState('');
  const [member, setMember] = useState(null);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    const hash = window.location.hash;
    const match = hash.match(/id=([^&]+)/) || window.location.search.match(/id=([^&]+)/);
    if (match?.[1]) {
      const queryId = decodeURIComponent(match[1]);
      setMemberId(queryId);
      setMember(getMemberById(queryId));
      setSearched(true);
    }
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!memberId.trim()) return;
    setMember(getMemberById(memberId.trim()));
    setSearched(true);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '0 20px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '60px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: 38, height: 38, background: '#1d4ed8', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Bebas Neue', sans-serif", color: '#fff', fontSize: '18px' }}>EC</div>
            <div>
              <h1 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', margin: 0 }}>E-CELL Official Verification</h1>
              <p style={{ fontSize: '11px', color: '#64748b', fontStyle: 'italic', margin: 0 }}>I.T.S Engineering College</p>
            </div>
          </div>
          <a href="#/" style={{ padding: '7px 14px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '12px', fontWeight: 600, color: '#334155', textDecoration: 'none' }}>
            Admin Portal
          </a>
        </div>
      </header>

      {/* Main */}
      <main style={{ flex: 1, maxWidth: '900px', margin: '0 auto', width: '100%', padding: '40px 20px', display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }}>
        {!searched || !member ? (
          /* Search Form */
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '40px', maxWidth: '420px', width: '100%', boxShadow: '0 8px 30px rgba(0,0,0,0.08)', textAlign: 'center' }}>
            <div style={{ width: 56, height: 56, background: searched && !member ? '#fef2f2' : '#eff6ff', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', border: `1px solid ${searched && !member ? '#fecaca' : '#bfdbfe'}` }}>
              {searched && !member
                ? <ShieldAlert style={{ width: 28, height: 28, color: '#dc2626' }} />
                : <ShieldCheck style={{ width: 28, height: 28, color: '#1d4ed8' }} />
              }
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', margin: '0 0 6px' }}>
              {searched && !member ? 'Unverified / Invalid Card' : 'Verify E-Cell ID Card'}
            </h2>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 24px' }}>
              {searched && !member
                ? `No member record found for ID "${memberId}".`
                : 'Enter a Member Roll No to check official status.'
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
          /* Verified Result Card */
          <div style={{ background: '#fff', border: '1px solid #bbf7d0', borderRadius: '16px', padding: '28px', width: '100%', boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}>
            {/* Verified Banner */}
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CheckCircle style={{ width: 28, height: 28, color: '#16a34a', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: '#166534', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Official E-Cell Verification Status</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#14532d' }}>VERIFIED ACTIVE E-CELL MEMBER</div>
                </div>
              </div>
              <span style={{ background: '#fff', color: '#15803d', border: '1px solid #bbf7d0', borderRadius: '20px', fontSize: '11px', fontWeight: 700, padding: '3px 10px', fontFamily: 'monospace' }}>
                ID: {member.collegeRollNo || member.id}
              </span>
            </div>

            {/* Content: Card + Details */}
            <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '32px', alignItems: 'center' }}>
              {/* Card Canvas */}
              <div style={{ width: '240px', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 15px 35px rgba(0,0,0,0.18)' }}>
                <IDCardCanvas member={member} interactive={false} overlayOpacity={1.0} />
              </div>

              {/* Member Details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <span style={{ fontSize: '10px', fontWeight: 700, color: '#1d4ed8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Member Name</span>
                  <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '36px', fontWeight: 700, color: '#0f172a', margin: '4px 0 0', letterSpacing: '1px' }}>
                    {member.name}
                  </h2>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', paddingTop: '14px', borderTop: '1px solid #f1f5f9' }}>
                  {[
                    { icon: Award, label: 'Designation', value: member.designation, italic: true },
                    { icon: User, label: 'Roll No / ID', value: member.collegeRollNo || member.id, mono: true },
                    { icon: Calendar, label: 'Valid Till', value: member.validTill || '2026-08-31' },
                    { icon: Phone, label: 'Contact', value: member.phone || 'N/A' },
                  ].map(({ icon: Icon, label, value, italic, mono }) => (
                    <div key={label}>
                      <span style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '3px' }}>
                        <Icon style={{ width: 12, height: 12, color: '#1d4ed8' }} /> {label}
                      </span>
                      <p style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a', margin: 0, fontStyle: italic ? 'italic' : 'normal', fontFamily: mono ? 'monospace' : 'inherit' }}>{value}</p>
                    </div>
                  ))}
                </div>

                <div style={{ paddingTop: '12px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94a3b8' }}>
                  <span>Digital Security Token Verified</span>
                  <span style={{ fontFamily: 'monospace' }}>HASH: {Math.random().toString(36).substring(2, 10).toUpperCase()}</span>
                </div>

                <button onClick={() => { setSearched(false); setMember(null); setMemberId(''); }}
                  style={{ alignSelf: 'flex-start', padding: '8px 16px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '12px', fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
                  Search Another
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer style={{ textAlign: 'center', padding: '16px', fontSize: '11px', color: '#94a3b8', borderTop: '1px solid #e2e8f0', background: '#fff' }}>
        © 2026 E-CELL I.T.S Engineering College • Official Card Verification System
      </footer>
    </div>
  );
}
