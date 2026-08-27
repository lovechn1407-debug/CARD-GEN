import React from 'react';
import { Users, Clock, Printer, ShieldCheck, UserCheck, Plus, FileSpreadsheet, Sliders } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, onOpenAddModal, onOpenBulkModal }) {
  const tabs = [
    { id: 'members', label: 'All Members', icon: Users },
    { id: 'template-studio', label: 'Card Design Layout', icon: Sliders },
    { id: 'batches', label: 'Batch Edits & Links', icon: Clock },
    { id: 'export', label: 'Print & Export', icon: Printer },
    { id: 'verify', label: 'Public Verify Portal', icon: ShieldCheck },
    { id: 'edit-portal', label: 'Public Self-Edit', icon: UserCheck }
  ];

  return (
    <header style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 40, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px', gap: '16px' }}>
          {/* Brand Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', shrink: 0 }}>
            <div style={{ width: '40px', height: '40px', background: '#0072ce', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Bebas Neue, sans-serif', color: '#ffffff', fontSize: '22px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
              EC
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontWeight: '800', color: '#0f172a', fontSize: '18px', letterSpacing: '-0.5px' }}>CARD-GEN</span>
                <span className="hero-badge hero-badge-blue" style={{ fontSize: '10px' }}>E-CELL V3</span>
              </div>
              <p style={{ fontSize: '11px', color: '#64748b', margin: 0, fontWeight: '500' }}>I.T.S Engineering College</p>
            </div>
          </div>

          {/* Nav Tabs */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '4px', overflowX: 'auto' }}>
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: '600',
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    backgroundColor: isActive ? '#eff6ff' : 'transparent',
                    color: isActive ? '#1d4ed8' : '#475569',
                    border: isActive ? '1px solid #bfdbfe' : '1px solid transparent'
                  }}
                >
                  <Icon style={{ width: '16px', height: '16px', color: isActive ? '#0072ce' : '#94a3b8' }} />
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {/* Right Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', shrink: 0 }}>
            <button onClick={onOpenAddModal} className="hero-btn hero-btn-primary" style={{ fontSize: '12px', padding: '6px 12px' }}>
              <Plus style={{ width: '16px', height: '16px' }} /> Add Member
            </button>
            <button onClick={onOpenBulkModal} className="hero-btn hero-btn-secondary" style={{ fontSize: '12px', padding: '6px 12px' }}>
              <FileSpreadsheet style={{ width: '16px', height: '16px', color: '#16a34a' }} /> Bulk CSV
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
