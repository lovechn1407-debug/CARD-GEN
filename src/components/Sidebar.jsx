import React from 'react';
import {
  Users,
  Sliders,
  Clock,
  Printer,
  ShieldCheck,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  Plus,
  FileSpreadsheet
} from 'lucide-react';

const SIDEBAR_OPEN_W = 224;
const SIDEBAR_COLLAPSED_W = 60;

const tabs = [
  { id: 'members',          label: 'All Members',    icon: Users       },
  { id: 'template-studio',  label: 'Card Design',    icon: Sliders     },
  { id: 'batches',          label: 'Batch Edits',    icon: Clock       },
  { id: 'export',           label: 'Print & Export', icon: Printer     },
  { id: 'verify',           label: 'Verify Portal',  icon: ShieldCheck },
  { id: 'edit-portal',      label: 'Self-Edit',      icon: UserCheck   },
];

export { SIDEBAR_OPEN_W, SIDEBAR_COLLAPSED_W };

export default function Sidebar({ activeTab, setActiveTab, isCollapsed, setIsCollapsed, onOpenAddModal, onOpenBulkModal }) {
  return (
    <>
      {/* ── SIDEBAR PANEL ── fixed, GPU-animated via transform only ── */}
      <aside
        style={{
          position: 'fixed',
          top: '56px',              /* below the top header */
          left: 0,
          bottom: 0,
          width: `${SIDEBAR_OPEN_W}px`,
          background: '#0f172a',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 30,
          overflowX: 'hidden',
          overflowY: 'auto',
          /* GPU-accelerated – does NOT trigger layout reflow */
          transform: isCollapsed
            ? `translateX(-${SIDEBAR_OPEN_W - SIDEBAR_COLLAPSED_W}px)`
            : 'translateX(0)',
          transition: 'transform 0.22s ease',
          willChange: 'transform',
        }}
      >
        {/* ── Toggle button pinned to right edge ── */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? 'Expand menu' : 'Collapse menu'}
          style={{
            position: 'absolute',
            top: '12px',
            right: '8px',
            width: 28,
            height: 28,
            borderRadius: '8px',
            border: 'none',
            background: 'rgba(255,255,255,0.08)',
            color: '#94a3b8',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            zIndex: 2,
          }}
        >
          {isCollapsed
            ? <ChevronRight style={{ width: 15, height: 15 }} />
            : <ChevronLeft  style={{ width: 15, height: 15 }} />}
        </button>

        {/* ── NAVIGATION ── */}
        <nav style={{ flex: 1, padding: '52px 8px 8px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {/* Section label */}
          {!isCollapsed && (
            <span style={{
              fontSize: '9px',
              fontWeight: 700,
              color: '#475569',
              textTransform: 'uppercase',
              letterSpacing: '0.8px',
              padding: '0 8px 8px',
            }}>
              Menu
            </span>
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
                  gap: '10px',
                  width: '100%',
                  padding: '9px 10px',
                  borderRadius: '10px',
                  border: 'none',
                  cursor: 'pointer',
                  background: active ? 'rgba(59,130,246,0.18)' : 'transparent',
                  color: active ? '#60a5fa' : '#94a3b8',
                  fontSize: '13px',
                  fontWeight: active ? 700 : 500,
                  textAlign: 'left',
                  whiteSpace: 'nowrap',
                  position: 'relative',
                  transition: 'background 0.12s, color 0.12s',
                }}
                onMouseEnter={e => {
                  if (!active) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                    e.currentTarget.style.color = '#cbd5e1';
                  }
                }}
                onMouseLeave={e => {
                  if (!active) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#94a3b8';
                  }
                }}
              >
                {/* Active left accent */}
                {active && (
                  <span style={{
                    position: 'absolute',
                    left: 0,
                    top: '18%',
                    bottom: '18%',
                    width: 3,
                    borderRadius: '0 3px 3px 0',
                    background: '#3b82f6',
                  }} />
                )}
                <Icon style={{ width: 17, height: 17, flexShrink: 0 }} />
                <span style={{ overflow: 'hidden', opacity: isCollapsed ? 0 : 1, transition: 'opacity 0.15s' }}>
                  {label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* ── QUICK ACTIONS ── */}
        <div style={{ padding: '8px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          {!isCollapsed && (
            <span style={{
              display: 'block',
              fontSize: '9px',
              fontWeight: 700,
              color: '#475569',
              textTransform: 'uppercase',
              letterSpacing: '0.8px',
              padding: '0 4px 8px',
            }}>
              Quick Actions
            </span>
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
              padding: '8px 10px',
              marginBottom: '6px',
              borderRadius: '10px',
              border: 'none',
              cursor: 'pointer',
              background: '#1d4ed8',
              color: '#fff',
              fontSize: '12px',
              fontWeight: 700,
              whiteSpace: 'nowrap',
            }}
          >
            <Plus style={{ width: 15, height: 15, flexShrink: 0 }} />
            <span style={{ opacity: isCollapsed ? 0 : 1, transition: 'opacity 0.15s' }}>Add Member</span>
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
              padding: '8px 10px',
              borderRadius: '10px',
              border: '1px solid rgba(255,255,255,0.08)',
              cursor: 'pointer',
              background: 'rgba(255,255,255,0.04)',
              color: '#94a3b8',
              fontSize: '12px',
              fontWeight: 600,
              whiteSpace: 'nowrap',
            }}
          >
            <FileSpreadsheet style={{ width: 15, height: 15, color: '#22c55e', flexShrink: 0 }} />
            <span style={{ opacity: isCollapsed ? 0 : 1, transition: 'opacity 0.15s' }}>Bulk CSV</span>
          </button>
        </div>
      </aside>

      {/* ── INVISIBLE SPACER – reserves layout space, never animates ── */}
      <div style={{ width: `${SIDEBAR_COLLAPSED_W}px`, flexShrink: 0 }} />
    </>
  );
}
