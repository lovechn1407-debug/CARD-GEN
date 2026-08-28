import React from 'react';
import {
  Users, Sliders, Clock, Printer,
  ShieldCheck, UserCheck, Plus, FileSpreadsheet,
  ChevronLeft, ChevronRight
} from 'lucide-react';

export const SIDEBAR_OPEN  = 240;
export const SIDEBAR_MINI  = 64;

const tabs = [
  { id: 'members',         label: 'All Members',    icon: Users       },
  { id: 'template-studio', label: 'Card Design',    icon: Sliders     },
  { id: 'batches',         label: 'Batch Edits',    icon: Clock       },
  { id: 'export',         label: 'Print & Export', icon: Printer     },
  { id: 'verify',         label: 'Verify Portal',  icon: ShieldCheck },
  { id: 'edit-portal',    label: 'Self-Edit',      icon: UserCheck   },
];

export default function Sidebar({
  activeTab, setActiveTab,
  isCollapsed, setIsCollapsed,
  onOpenAddModal, onOpenBulkModal
}) {
  const W = isCollapsed ? SIDEBAR_MINI : SIDEBAR_OPEN;

  return (
    <aside style={{
      position: 'fixed',
      top: '56px',
      left: 0,
      bottom: 0,
      /* Animate WIDTH so content actually shifts — no translateX overlap */
      width: `${W}px`,
      transition: 'width 0.2s ease',
      overflowX: 'hidden',
      overflowY: 'auto',
      background: '#ffffff',
      borderRight: '1px solid #e2e8f0',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 30,
      boxShadow: '2px 0 12px rgba(15,23,42,0.05)',
    }}>

      {/* ── Collapse / Expand toggle ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: isCollapsed ? 'center' : 'flex-end',
        padding: isCollapsed ? '12px 0' : '12px 10px',
        borderBottom: '1px solid #f1f5f9',
        flexShrink: 0,
      }}>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? 'Expand' : 'Collapse'}
          style={{
            width: 32, height: 32,
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            background: '#f8fafc',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#64748b',
            flexShrink: 0,
          }}
        >
          {isCollapsed
            ? <ChevronRight style={{ width: 15, height: 15 }} />
            : <ChevronLeft  style={{ width: 15, height: 15 }} />}
        </button>
      </div>

      {/* ── Nav items ── */}
      <nav style={{ flex: 1, padding: '8px 8px 0', display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {!isCollapsed && (
          <span style={{
            fontSize: '9px', fontWeight: 700, color: '#94a3b8',
            textTransform: 'uppercase', letterSpacing: '0.8px',
            padding: '8px 8px 4px',
            whiteSpace: 'nowrap',
          }}>Navigation</span>
        )}

        {tabs.map(({ id, label, icon: Icon }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              title={isCollapsed ? label : undefined}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: isCollapsed ? 'center' : 'flex-start',
                gap: '10px',
                width: '100%',
                /* Fixed padding so icons are always centered at SIDEBAR_MINI */
                padding: isCollapsed ? '10px 0' : '10px 12px',
                borderRadius: '10px',
                border: 'none',
                cursor: 'pointer',
                background: active ? '#eff6ff' : 'transparent',
                color: active ? '#1d4ed8' : '#475569',
                fontSize: '13px',
                fontWeight: active ? 700 : 500,
                position: 'relative',
                whiteSpace: 'nowrap',
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
              <Icon style={{
                width: 18, height: 18,
                color: active ? '#1d4ed8' : '#64748b',
                flexShrink: 0,
              }} />
              {!isCollapsed && <span>{label}</span>}
            </button>
          );
        })}
      </nav>

      {/* ── Quick actions ── */}
      <div style={{
        padding: '8px',
        borderTop: '1px solid #f1f5f9',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        flexShrink: 0,
      }}>
        {!isCollapsed && (
          <span style={{
            fontSize: '9px', fontWeight: 700, color: '#94a3b8',
            textTransform: 'uppercase', letterSpacing: '0.8px',
            padding: '4px 4px 2px', whiteSpace: 'nowrap',
          }}>Quick Actions</span>
        )}

        <button
          onClick={onOpenAddModal}
          title={isCollapsed ? 'Add Member' : undefined}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: isCollapsed ? 'center' : 'flex-start',
            gap: '8px',
            width: '100%',
            padding: isCollapsed ? '9px 0' : '9px 12px',
            borderRadius: '10px',
            border: 'none',
            cursor: 'pointer',
            background: '#1d4ed8',
            color: '#fff',
            fontSize: '12px',
            fontWeight: 700,
            whiteSpace: 'nowrap',
            boxSizing: 'border-box',
          }}
        >
          <Plus style={{ width: 15, height: 15, flexShrink: 0 }} />
          {!isCollapsed && <span>Add Member</span>}
        </button>

        <button
          onClick={onOpenBulkModal}
          title={isCollapsed ? 'Bulk CSV' : undefined}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: isCollapsed ? 'center' : 'flex-start',
            gap: '8px',
            width: '100%',
            padding: isCollapsed ? '9px 0' : '9px 12px',
            borderRadius: '10px',
            border: '1px solid #e2e8f0',
            cursor: 'pointer',
            background: '#f8fafc',
            color: '#374151',
            fontSize: '12px',
            fontWeight: 600,
            whiteSpace: 'nowrap',
            boxSizing: 'border-box',
          }}
        >
          <FileSpreadsheet style={{ width: 15, height: 15, color: '#16a34a', flexShrink: 0 }} />
          {!isCollapsed && <span>Bulk CSV</span>}
        </button>
      </div>
    </aside>
  );
}
