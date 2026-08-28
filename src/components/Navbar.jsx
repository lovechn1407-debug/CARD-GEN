import React from 'react';
import { Users, Clock, Printer, ShieldCheck, UserCheck, Plus, FileSpreadsheet, Sliders, LogIn, LogOut, CheckCircle2 } from 'lucide-react';
import { logoutUser } from '../utils/firebase';

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

  return (
    <header style={styles.header}>
      <div style={styles.inner}>

        {/* Brand */}
        <div style={styles.brand}>
          <img src="/ecell_logo.png" alt="E-CELL Logo" style={{ height: '36px', width: 'auto', objectFit: 'contain' }} />
          <div>
            <div>
              <span style={styles.brandName}>CARD GENERATION PANEL</span>
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

        {/* Action Buttons & Auth Status */}
        <div style={styles.actions}>

          {/* Admin Auth Status */}
          {user && !user.isAnonymous ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 10px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px' }}>
              <CheckCircle2 style={{ width: 15, height: 15, color: '#16a34a' }} />
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#15803d', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.email}
              </span>
              <button
                onClick={logoutUser}
                title="Sign Out Admin"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', background: '#fff', border: '1px solid #fecaca', borderRadius: '6px', cursor: 'pointer', padding: '2px 6px', color: '#dc2626', fontSize: '10px', fontWeight: 700 }}
              >
                <LogOut style={{ width: 12, height: 12 }} /> Logout
              </button>
            </div>
          ) : null}

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
