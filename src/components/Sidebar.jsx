import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Sliders, 
  Clock, 
  Printer, 
  ShieldCheck, 
  UserCheck, 
  Plus, 
  FileSpreadsheet, 
  LogOut, 
  ChevronLeft, 
  ChevronRight, 
  Menu,
  CheckCircle2,
  X
} from 'lucide-react';
import { logoutUser } from '../utils/firebase';

export default function Sidebar({
  activeTab,
  setActiveTab,
  user,
  onOpenAddModal,
  onOpenBulkModal,
  isCollapsed,
  setIsCollapsed
}) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const tabs = [
    { id: 'members', label: 'All Members', icon: Users },
    { id: 'template-studio', label: 'Card Design', icon: Sliders },
    { id: 'batches', label: 'Batch Edits', icon: Clock },
    { id: 'export', label: 'Print & Export', icon: Printer },
    { id: 'verify', label: 'Verify Portal', icon: ShieldCheck },
    { id: 'edit-portal', label: 'Self-Edit', icon: UserCheck }
  ];

  return (
    <>
      {/* Mobile Floating Menu Toggle Button (< 768px) */}
      <div className="mobile-menu-btn" style={{ position: 'fixed', top: 14, left: 14, zIndex: 60 }}>
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          style={{
            padding: '8px 12px',
            background: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: '10px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            fontWeight: 700,
            color: '#0f172a'
          }}
        >
          {isMobileOpen ? <X style={{ width: 18, height: 18 }} /> : <Menu style={{ width: 18, height: 18, color: '#1d4ed8' }} />}
          <span>{isMobileOpen ? 'Close' : 'Menu'}</span>
        </button>
      </div>

      {/* Mobile Drawer Overlay Backdrop */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.5)',
            backdropFilter: 'blur(4px)',
            zIndex: 49
          }}
        />
      )}

      {/* Sidebar Navigation Panel */}
      <aside
        className={`sidebar-aside ${isMobileOpen ? 'mobile-open' : ''}`}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          width: isCollapsed ? '72px' : '260px',
          background: '#ffffff',
          borderRight: '1px solid #e2e8f0',
          boxShadow: '4px 0 24px rgba(15,23,42,0.06)',
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          transition: 'width 0.3s cubic-bezier(0.16, 1, 0.3, 1), transform 0.3s ease',
          userSelect: 'none',
          boxSizing: 'border-box'
        }}
      >
        {/* TOP SECTION: LOGO, BRAND TITLE & COLLAPSE TOGGLE */}
        <div>
          <div
            style={{
              padding: isCollapsed ? '16px 10px' : '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: isCollapsed ? 'center' : 'space-between',
              borderBottom: '1px solid #f1f5f9',
              minHeight: '70px',
              boxSizing: 'border-box'
            }}
          >
            {/* Logo + Brand Name */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
              <img
                src="/ecell_logo.png"
                alt="E-CELL Logo"
                style={{
                  height: isCollapsed ? '36px' : '42px',
                  width: 'auto',
                  objectFit: 'contain',
                  flexShrink: 0
                }}
              />
              {!isCollapsed && (
                <div style={{ whiteSpace: 'nowrap', overflow: 'hidden' }}>
                  <div style={{ fontWeight: 800, fontSize: '13px', color: '#0f172a', letterSpacing: '-0.2px', lineHeight: 1.2 }}>
                    CARD GENERATION PANEL
                  </div>
                  <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 500 }}>
                    I.T.S Engineering College
                  </div>
                </div>
              )}
            </div>

            {/* Minimize / Open Desktop Toggle Button */}
            {!isCollapsed && (
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                title="Minimize Menu Bar"
                style={{
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '6px',
                  cursor: 'pointer',
                  color: '#475569',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <ChevronLeft style={{ width: 16, height: 16 }} />
              </button>
            )}
          </div>

          {/* Icon Expand Button when Minimized */}
          {isCollapsed && (
            <div style={{ padding: '8px', textAlign: 'center', borderBottom: '1px solid #f1f5f9' }}>
              <button
                onClick={() => setIsCollapsed(false)}
                title="Expand Menu Bar"
                style={{
                  width: '100%',
                  padding: '8px 0',
                  background: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  color: '#1d4ed8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <ChevronRight style={{ width: 18, height: 18 }} />
              </button>
            </div>
          )}

          {/* MENU SECTION HEADER */}
          <div style={{ padding: isCollapsed ? '12px 0 4px' : '16px 16px 6px' }}>
            <span
              style={{
                fontSize: '10px',
                fontWeight: 800,
                color: '#94a3b8',
                textTransform: 'uppercase',
                letterSpacing: '0.6px',
                display: isCollapsed ? 'none' : 'block'
              }}
            >
              Navigation Menu
            </span>
          </div>

          {/* NAVIGATION TAB BUTTONS */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: isCollapsed ? '0 8px' : '0 12px' }}>
            {tabs.map(({ id, label, icon: Icon }) => {
              const isActive = activeTab === id;
              return (
                <button
                  key={id}
                  onClick={() => {
                    setActiveTab(id);
                    setIsMobileOpen(false);
                  }}
                  title={isCollapsed ? label : undefined}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: isCollapsed ? 'center' : 'flex-start',
                    gap: '10px',
                    padding: isCollapsed ? '10px 0' : '10px 12px',
                    borderRadius: '10px',
                    fontSize: '13px',
                    fontWeight: isActive ? 700 : 600,
                    cursor: 'pointer',
                    border: isActive ? '1px solid #bfdbfe' : '1px solid transparent',
                    background: isActive ? '#eff6ff' : 'transparent',
                    color: isActive ? '#1d4ed8' : '#475569',
                    position: 'relative',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {/* Left Active Accent Indicator */}
                  {isActive && (
                    <div
                      style={{
                        position: 'absolute',
                        left: 0,
                        top: '20%',
                        bottom: '20%',
                        width: '3px',
                        background: '#1d4ed8',
                        borderRadius: '0 4px 4px 0'
                      }}
                    />
                  )}
                  <Icon
                    style={{
                      width: 18,
                      height: 18,
                      color: isActive ? '#1d4ed8' : '#64748b',
                      flexShrink: 0
                    }}
                  />
                  {!isCollapsed && <span style={{ whiteSpace: 'nowrap' }}>{label}</span>}
                </button>
              );
            })}
          </nav>

          {/* ACTION BUTTONS (ADD MEMBER & BULK CSV) */}
          <div style={{ marginTop: '16px', padding: isCollapsed ? '0 8px' : '0 12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {!isCollapsed && (
              <span style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                Quick Actions
              </span>
            )}
            <button
              onClick={() => {
                onOpenAddModal();
                setIsMobileOpen(false);
              }}
              title={isCollapsed ? 'Add Member' : undefined}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: isCollapsed ? 'center' : 'flex-start',
                gap: '8px',
                padding: isCollapsed ? '10px 0' : '9px 12px',
                background: '#1d4ed8',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 10px rgba(29,78,216,0.25)',
                whiteSpace: 'nowrap'
              }}
            >
              <Plus style={{ width: 16, height: 16, flexShrink: 0 }} />
              {!isCollapsed && <span>Add Member</span>}
            </button>

            <button
              onClick={() => {
                onOpenBulkModal();
                setIsMobileOpen(false);
              }}
              title={isCollapsed ? 'Bulk CSV Entry' : undefined}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: isCollapsed ? 'center' : 'flex-start',
                gap: '8px',
                padding: isCollapsed ? '10px 0' : '9px 12px',
                background: '#f8fafc',
                color: '#334155',
                border: '1px solid #cbd5e1',
                borderRadius: '10px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              <FileSpreadsheet style={{ width: 16, height: 16, color: '#16a34a', flexShrink: 0 }} />
              {!isCollapsed && <span>Bulk CSV Entry</span>}
            </button>
          </div>
        </div>

        {/* BOTTOM ADMIN PROFILE & LOGOUT SECTION */}
        <div style={{ borderTop: '1px solid #f1f5f9', padding: isCollapsed ? '12px 6px' : '14px' }}>
          {user && !user.isAnonymous ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: isCollapsed ? 'center' : 'space-between',
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '10px',
                padding: isCollapsed ? '8px 4px' : '8px 10px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                <CheckCircle2 style={{ width: 16, height: 16, color: '#16a34a', flexShrink: 0 }} />
                {!isCollapsed && (
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#15803d', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {user.email}
                  </span>
                )}
              </div>
              <button
                onClick={logoutUser}
                title="Sign Out Admin"
                style={{
                  background: '#ffffff',
                  border: '1px solid #fecaca',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  padding: isCollapsed ? '6px' : '4px 8px',
                  color: '#dc2626',
                  fontSize: '11px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  flexShrink: 0
                }}
              >
                <LogOut style={{ width: 14, height: 14 }} />
                {!isCollapsed && <span>Logout</span>}
              </button>
            </div>
          ) : (
            <div style={{ fontSize: '11px', color: '#94a3b8', textAlign: 'center' }}>
              {!isCollapsed ? 'Guest Mode' : '🔒'}
            </div>
          )}
        </div>
      </aside>

      {/* Global CSS for Responsive Mobile Behavior & Smooth Transitions */}
      <style>{`
        @media (max-width: 768px) {
          .sidebar-aside {
            transform: translateX(-100%);
            width: 260px !important;
          }
          .sidebar-aside.mobile-open {
            transform: translateX(0);
          }
          .mobile-menu-btn {
            display: block !important;
          }
        }
        @media (min-width: 769px) {
          .mobile-menu-btn {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}
