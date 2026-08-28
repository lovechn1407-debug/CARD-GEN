import React, { useState, useEffect } from 'react';
import Sidebar, { SIDEBAR_W } from './components/Sidebar';
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
  subscribeMembers, subscribeBatches, subscribeTemplateConfig,
  subscribeCardTemplates, saveMembers, saveBatches,
  updateMember, deleteMember, getTemplateConfig
} from './utils/storage';
import { subscribeToAuth } from './utils/firebase';

export default function App() {
  const [currentRoute, setCurrentRoute] = useState(window.location.hash || '#/');
  const [activeTab, setActiveTab] = useState('members');

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
    const u1 = subscribeMembers((l)       => setMembers(l));
    const u2 = subscribeBatches((l)       => setBatches(l));
    const u3 = subscribeTemplateConfig((c) => setTemplateConfig(c));
    const u4 = subscribeCardTemplates((t)  => setCardTemplates(t));
    return () => { u1?.(); u2?.(); u3?.(); u4?.(); };
  }, [user]);

  const handleAddMember    = async (m)      => { await updateMember(m); };
  const handleImportBatch  = async (nm, nb) => { await saveMembers([...members, ...nm]); await saveBatches([nb, ...batches]); };
  const handleUpdateMember = async (m)      => { await updateMember(m); };
  const handleDeleteMember = async (id)     => { await deleteMember(id); };

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
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>

      {/* Fixed top header */}
      <TopHeader user={isAdminAuthenticated ? user : null} />

      {/* Fixed sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddModal={() => setShowAddModal(true)}
        onOpenBulkModal={() => setShowBulkModal(true)}
      />

      {/* Content area — permanent left margin matching sidebar width */}
      <div style={{
        marginLeft: `${SIDEBAR_W}px`,
        marginTop: '56px',
        minHeight: 'calc(100vh - 56px)',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <main style={{ flex: 1, padding: '28px 24px', boxSizing: 'border-box' }}>
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

        <footer style={{ background: '#ffffff', borderTop: '1px solid #e2e8f0', padding: '14px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: '#64748b', flexWrap: 'wrap', gap: '6px' }}>
            <span><strong style={{ color: '#334155' }}>CARD GENERATION PANEL</strong> · I.T.S Engineering College</span>
            <span>
              Status:{' '}
              <strong style={{ color: isAdminAuthenticated ? '#16a34a' : '#dc2626' }}>
                {isAdminAuthenticated ? `Admin: ${user.email}` : 'Login Required'}
              </strong>
            </span>
          </div>
        </footer>
      </div>

      {showAddModal  && <AddMemberModal onClose={() => setShowAddModal(false)}  onAddMember={handleAddMember} />}
      {showBulkModal && <BulkCsvModal  onClose={() => setShowBulkModal(false)} onImportSuccess={handleImportBatch} />}
    </div>
  );
}
