import React from 'react';
import {
  Users, Sliders, Clock, Printer,
  ShieldCheck, UserCheck, Plus, FileSpreadsheet
} from 'lucide-react';

export const SIDEBAR_W = 220;

const tabs = [
  { id: 'members',         label: 'All Members',    icon: Users       },
  { id: 'template-studio', label: 'Card Design',    icon: Sliders     },
  { id: 'batches',         label: 'Batch Edits',    icon: Clock       },
  { id: 'export',          label: 'Print & Export', icon: Printer     },
  { id: 'verify',          label: 'Verify Portal',  icon: ShieldCheck },
  { id: 'edit-portal',     label: 'Self-Edit',      icon: UserCheck   },
];

export default function Sidebar({ activeTab, setActiveTab, onOpenAddModal, onOpenBulkModal }) {
  return (
    <aside style={{
      position: 'fixed',
      top: '56px',
      left: 0,
      bottom: 0,
      width: `${SIDEBAR_W}px`,
      background: '#ffffff',
      borderRight: '1px solid #e2e8f0',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 30,
      overflowY: 'auto',
    }}>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '12px 8px 0', display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <span style={{
          fontSize: '9px', fontWeight: 700, color: '#94a3b8',
          textTransform: 'uppercase', letterSpacing: '0.8px',
          padding: '0 8px 8px', display: 'block',
        }}>Navigation</span>

        {tabs.map(({ id, label, icon: Icon }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                width: '100%',
                padding: '10px 12px',
                borderRadius: '10px',
                border: 'none',
                cursor: 'pointer',
                background: active ? '#eff6ff' : 'transparent',
                color: active ? '#1d4ed8' : '#475569',
                fontSize: '13px',
                fontWeight: active ? 700 : 500,
                textAlign: 'left',
                position: 'relative',
                boxSizing: 'border-box',
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = '#f8fafc'; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
            >
              {active && (
                <span style={{
                  position: 'absolute', left: 0,
                  top: '20%', bottom: '20%',
                  width: 3, borderRadius: '0 3px 3px 0',
                  background: '#1d4ed8',
                }} />
              )}
              <Icon style={{ width: 17, height: 17, color: active ? '#1d4ed8' : '#64748b', flexShrink: 0 }} />
              <span>{label}</span>
            </button>
          );
        })}
      </nav>

      {/* Quick actions */}
      <div style={{ padding: '8px', borderTop: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <span style={{
          fontSize: '9px', fontWeight: 700, color: '#94a3b8',
          textTransform: 'uppercase', letterSpacing: '0.8px',
          padding: '4px 4px 2px', display: 'block',
        }}>Quick Actions</span>

        <button onClick={onOpenAddModal} style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          width: '100%', padding: '9px 12px', borderRadius: '10px',
          border: 'none', cursor: 'pointer', background: '#1d4ed8',
          color: '#fff', fontSize: '12px', fontWeight: 700, boxSizing: 'border-box',
        }}>
          <Plus style={{ width: 15, height: 15, flexShrink: 0 }} />
          Add Member
        </button>

        <button onClick={onOpenBulkModal} style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          width: '100%', padding: '9px 12px', borderRadius: '10px',
          border: '1px solid #e2e8f0', cursor: 'pointer', background: '#f8fafc',
          color: '#374151', fontSize: '12px', fontWeight: 600, boxSizing: 'border-box',
        }}>
          <FileSpreadsheet style={{ width: 15, height: 15, color: '#16a34a', flexShrink: 0 }} />
          Bulk CSV
        </button>
      </div>
    </aside>
  );
}
