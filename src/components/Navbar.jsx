import React from 'react';
import { Users, Clock, Printer, ShieldCheck, UserCheck, Plus, FileSpreadsheet, Sliders, LogIn, LogOut, CheckCircle2 } from 'lucide-react';
import { loginWithGoogle, logoutUser } from '../utils/firebase';

const styles = {
  header: {
    background: '#ffffff',
    borderBottom: '1px solid #e2e8f0',
    position: 'sticky',
    top: 0,
    zIndex: 40,
    boxShadow: '0 1px 3px rgba(0,0,0,0.07)'
  },
  inner: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '0 20px',
    display: 'flex',
    alignItems: 'center',
    height: '60px',
    gap: '12px'
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexShrink: 0
  },
  logoBox: {
    width: '38px',
    height: '38px',
    background: '#1d4ed8',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: '20px',
    letterSpacing: '1px',
    boxShadow: '0 2px 6px rgba(29,78,216,0.35)',
    flexShrink: 0
  },
  brandName: {
    fontWeight: 800,
    fontSize: '16px',
    color: '#0f172a',
    letterSpacing: '-0.3px',
    lineHeight: 1.2
  },
  brandSub: {
    fontSize: '10px',
    color: '#64748b',
    fontWeight: 500,
    lineHeight: 1.2
  },
  badge: {
    background: '#eff6ff',
    color: '#1d4ed8',
    border: '1px solid #bfdbfe',
    borderRadius: '4px',
    fontSize: '10px',
    fontWeight: 700,
    padding: '1px 6px',
    marginLeft: '6px',
    verticalAlign: 'middle'
  },
  nav: {
    display: 'flex',
    alignItems: 'center',
    gap: '2px',
    flex: 1,
    overflowX: 'auto',
    scrollbarWidth: 'none',
    msOverflowStyle: 'none'
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexShrink: 0
  }
};

export default function Navbar({ activeTab, setActiveTab, user, onOpenAddModal, onOpenBulkModal }) {
  const tabs = [
    { id: 'members', label: 'All Members', icon: Users },
    { id: 'template-studio', label: 'Card Design', icon: Sliders },
    { id: 'batches', label: 'Batch Edits', icon: Clock },
    { id: 'export', label: 'Print & Export', icon: Printer },
    { id: 'verify', label: 'Verify Portal', icon: ShieldCheck },
    { id: 'edit-portal', label: 'Self-Edit', icon: UserCheck }
  ];

  const handleGoogleAuth = async () => {
    try {
      await loginWithGoogle();
    } catch (e) {
      alert("Google Sign-In failed or was cancelled.");
    }
  };

  return (
    <header style={styles.header}>
      <div style={styles.inner}>

        {/* Brand */}
        <div style={styles.brand}>
          <div style={styles.logoBox}>EC</div>
          <div>
            <div>
              <span style={styles.brandName}>CARD-GEN</span>
              <span style={styles.badge}>FIREBASE</span>
            </div>
            <div style={styles.brandSub}>I.T.S Engineering College</div>
          </div>
        </div>

        {/* Nav Tabs */}
        <nav style={styles.nav}>
          {tabs.map(({ id, label, icon: Icon }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '6px 10px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  border: isActive ? '1px solid #bfdbfe' : '1px solid transparent',
                  background: isActive ? '#eff6ff' : 'transparent',
                  color: isActive ? '#1d4ed8' : '#475569',
                  transition: 'all 0.15s'
                }}
              >
                <Icon style={{ width: 14, height: 14, color: isActive ? '#1d4ed8' : '#94a3b8', flexShrink: 0 }} />
                {label}
              </button>
            );
          })}
        </nav>

        {/* Action Buttons & Firebase Google Auth */}
        <div style={styles.actions}>

          {/* Google Auth Status */}
          {user && !user.isAnonymous ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 8px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px' }}>
              {user.photoURL ? (
                <img src={user.photoURL} alt="Avatar" style={{ width: 22, height: 22, borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                <CheckCircle2 style={{ width: 16, height: 16, color: '#16a34a' }} />
              )}
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#15803d', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.displayName || user.email}
              </span>
              <button
                onClick={logoutUser}
                title="Sign Out"
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: '#94a3b8' }}
              >
                <LogOut style={{ width: 13, height: 13 }} />
              </button>
            </div>
          ) : (
            <button
              onClick={handleGoogleAuth}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 12px',
                background: '#fff',
                color: '#334155',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              <LogIn style={{ width: 13, height: 13, color: '#1d4ed8' }} /> Admin Google Login
            </button>
          )}

          <button
            onClick={onOpenAddModal}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '7px 14px',
              background: '#1d4ed8',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              boxShadow: '0 2px 6px rgba(29,78,216,0.3)'
            }}
          >
            <Plus style={{ width: 14, height: 14 }} /> Add Member
          </button>
          <button
            onClick={onOpenBulkModal}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '7px 14px',
              background: '#f8fafc',
              color: '#374151',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            <FileSpreadsheet style={{ width: 14, height: 14, color: '#16a34a' }} /> Bulk CSV
          </button>
        </div>

      </div>
    </header>
  );
}
