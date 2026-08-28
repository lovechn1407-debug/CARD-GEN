import React from 'react';
import { CheckCircle2, LogOut } from 'lucide-react';
import { logoutUser } from '../utils/firebase';

export default function TopHeader({ user }) {
  return (
    <header style={{
      position: 'fixed',
      top: 0, left: 0, right: 0,
      height: '56px',
      background: '#ffffff',
      borderBottom: '1px solid #e2e8f0',
      display: 'flex',
      alignItems: 'center',
      padding: '0 20px',
      gap: '14px',
      zIndex: 40,
      boxShadow: '0 1px 4px rgba(15,23,42,0.06)',
    }}>
      {/* Logo + Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
        <img src="/ecell_logo.png" alt="E-CELL Logo" style={{ height: '36px', width: 'auto', objectFit: 'contain' }} />
        <div>
          <div style={{ fontWeight: 800, fontSize: '14px', color: '#0f172a', letterSpacing: '-0.2px', lineHeight: 1.2 }}>
            CARD GENERATION PANEL
          </div>
          <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 500 }}>
            I.T.S Engineering College
          </div>
        </div>
      </div>

      <div style={{ flex: 1 }} />

      {/* Admin auth info */}
      {user && !user.isAnonymous && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '5px 10px',
          background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px',
        }}>
          <CheckCircle2 style={{ width: 14, height: 14, color: '#16a34a', flexShrink: 0 }} />
          <span style={{
            fontSize: '12px', fontWeight: 700, color: '#15803d',
            maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {user.email}
          </span>
          <button
            onClick={logoutUser}
            style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              padding: '3px 8px', background: '#fff',
              border: '1px solid #fecaca', borderRadius: '6px',
              cursor: 'pointer', color: '#dc2626', fontSize: '11px', fontWeight: 700,
            }}
          >
            <LogOut style={{ width: 12, height: 12 }} /> Logout
          </button>
        </div>
      )}
    </header>
  );
}
