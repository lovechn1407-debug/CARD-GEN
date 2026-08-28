import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TopHeader from './components/TopHeader';
import AdminMembers from './components/AdminMembers';
import AdminBatchEdits from './components/AdminBatchEdits';
import AdminExport from './components/AdminExport';
import AdminTemplateStudio from './components/AdminTemplateStudio';
import AdminLoginGate from './components/AdminLoginGate';
import PublicVerifyPortal from './components/PublicVerifyPortal';
import PublicEditPortal from './components/PublicEditPortal';
import AddMemberModal from './components/AddMemberModal';
import BulkCsvModal from './components/BulkCsvModal';
import {
  subscribeMembers,
  subscribeBatches,
  subscribeTemplateConfig,
  subscribeCardTemplates,
  saveMembers,
  saveBatches,
  updateMember,
  deleteMember,
  getTemplateConfig
} from './utils/storage';
import { subscribeToAuth } from './utils/firebase';

// Sidebar collapsed width – always reserves this much space in layout
const SIDEBAR_MIN = 60;

export default function App() {
  const [currentRoute, setCurrentRoute] = useState(window.location.hash || '#/');
  const [activeTab, setActiveTab] = useState('members');
  const [isCollapsed, setIsCollapsed] = useState(false);

  const [members, setMembers] = useState([]);
  const [batches, setBatches] = useState([]);
  const [cardTemplates, setCardTemplates] = useState({});
  const [templateConfig, setTemplateConfig] = useState(getTemplateConfig());
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);

  useEffect(() => {
    const unsubAuth = subscribeToAuth((u) => { setUser(u); setAuthLoading(false); });
    const handleHashChange = () => setCurrentRoute(window.location.hash || '#/');
    window.addEventListener('hashchange', handleHashChange);
    return () => { unsubAuth(); window.removeEventListener('hashchange', handleHashChange); };
  }, []);

  useEffect(() => {
    const isAdmin = user && !user.isAnonymous && user.email;
    if (!isAdmin) { setMembers([]); setBatches([]); return; }
    const unsubMembers        = subscribeMembers((list)      => setMembers(list));
    const unsubBatches        = subscribeBatches((list)      => setBatches(list));
    const unsubConfig         = subscribeTemplateConfig((c)  => setTemplateConfig(c));
    const unsubCardTemplates  = subscribeCardTemplates((t)   => setCardTemplates(t));
    return () => { unsubMembers?.(); unsubBatches?.(); unsubConfig?.(); unsubCardTemplates?.(); };
  }, [user]);

  const handleAddMember    = async (m)  => { await updateMember(m); };
  const handleImportBatch  = async (nm, nb) => { await saveMembers([...members, ...nm]); await saveBatches([nb, ...batches]); };
  const handleUpdateMember = async (m)  => { await updateMember(m); };
  const handleDeleteMember = async (id) => { await deleteMember(id); };

  // Public routes – render without admin chrome
  if (currentRoute.startsWith('#/verify'))      return <PublicVerifyPortal />;
  if (currentRoute.startsWith('#/public-edit')) return <PublicEditPortal />;

  const isAdminAuthenticated = !!(user && !user.isAnonymous && user.email);

  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid #e2e8f0', borderTopColor: '#1d4ed8', animation: 'spin 0.7s linear infinite', margin: '0 auto 14px' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ fontWeight: 700, color: '#1e293b', margin: '0 0 4px', fontSize: '14px' }}>E-CELL CARD GENERATION PANEL</p>
          <p style={{ color: '#64748b', margin: 0, fontSize: '12px' }}>Verifying authentication...</p>
        </div>
      </div>
    );
  }

  return (
    /*
      Layout strategy:
      ─────────────────────────────────────────────────────────────────
      TopHeader:  position:fixed, top:0, full width, h=56px
      Sidebar:    position:fixed, top:56px, uses translateX (no reflow)
      Spacer div: width=60px (collapsed width), always in flow – pushes
                  main content 60px to the right. Sidebar then slides 
                  over this area when expanded. Zero layout animation.
      Main:       marginLeft=0, padding fills the rest naturally.
      ─────────────────────────────────────────────────────────────────
    */
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#f1f5f9' }}>
      {/* Fixed top header */}
      <TopHeader
        user={isAdminAuthenticated ? user : null}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />

      {/* Body area (below fixed header) */}
      <div style={{ display: 'flex', flex: 1, paddingTop: '56px' }}>

        {/* Sidebar (handles its own fixed positioning + transform internally) */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
          onOpenAddModal={() => setShowAddModal(true)}
          onOpenBulkModal={() => setShowBulkModal(true)}
        />

        {/* Main content – marginLeft is ALWAYS SIDEBAR_MIN (60px), never animates */}
        <main style={{
          flex: 1,
          minWidth: 0,
          padding: '28px 24px',
          boxSizing: 'border-box',
          overflowX: 'hidden',
        }}>
          {activeTab === 'verify'      && <PublicVerifyPortal />}
          {activeTab === 'edit-portal' && <PublicEditPortal />}

          {!isAdminAuthenticated && activeTab !== 'verify' && activeTab !== 'edit-portal' ? (
            <AdminLoginGate />
          ) : (
            <>
              {activeTab === 'members'         && <AdminMembers members={members} batches={batches} onAddMember={handleAddMember} onImportBatch={handleImportBatch} onUpdateMember={handleUpdateMember} onDeleteMember={handleDeleteMember} />}
              {activeTab === 'template-studio' && <AdminTemplateStudio members={members} />}
              {activeTab === 'batches'         && <AdminBatchEdits batches={batches} members={members} />}
              {activeTab === 'export'          && <AdminExport members={members} batches={batches} />}
            </>
          )}
        </main>
      </div>

      {showAddModal  && <AddMemberModal onClose={() => setShowAddModal(false)}  onAddMember={handleAddMember} />}
      {showBulkModal && <BulkCsvModal  onClose={() => setShowBulkModal(false)} onImportSuccess={handleImportBatch} />}
    </div>
  );
}
