import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
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
  saveMembers, 
  saveBatches, 
  updateMember, 
  deleteMember,
  getTemplateConfig
} from './utils/storage';
import { subscribeToAuth, isEmailAuthorized } from './utils/firebase';

export default function App() {
  const [currentRoute, setCurrentRoute] = useState(window.location.hash || '#/');
  const [activeTab, setActiveTab] = useState('members');

  const [members, setMembers] = useState([]);
  const [batches, setBatches] = useState([]);
  const [templateConfig, setTemplateConfig] = useState(getTemplateConfig());
  const [user, setUser] = useState(null);
  // authLoading = true while Firebase resolves auth state (handles redirect login restore)
  const [authLoading, setAuthLoading] = useState(true);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);

  useEffect(() => {
    // onAuthStateChanged fires once immediately when Firebase resolves auth
    // (from either a fresh session, redirect result, or no session)
    const unsubAuth = subscribeToAuth((u) => {
      setUser(u);
      setAuthLoading(false); // Only show login gate AFTER Firebase tells us the auth state
    });

    const unsubMembers = subscribeMembers((list) => setMembers(list));
    const unsubBatches = subscribeBatches((list) => setBatches(list));
    const unsubConfig = subscribeTemplateConfig((cfg) => setTemplateConfig(cfg));

    const handleHashChange = () => setCurrentRoute(window.location.hash || '#/');
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      unsubAuth();
      unsubMembers();
      unsubBatches();
      unsubConfig();
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const handleAddMember = async (newMember) => { await updateMember(newMember); };
  const handleImportBatch = async (newMembers, newBatch) => {
    await saveMembers([...members, ...newMembers]);
    await saveBatches([newBatch, ...batches]);
  };
  const handleUpdateMember = async (updatedMember) => { await updateMember(updatedMember); };
  const handleDeleteMember = async (id) => { await deleteMember(id); };

  // Public hash routes (no admin auth required)
  if (currentRoute.startsWith('#/verify')) return <PublicVerifyPortal />;
  if (currentRoute.startsWith('#/public-edit')) return <PublicEditPortal />;

  const cfg = getTemplateConfig();
  const isAdminAuthenticated = user && !user.isAnonymous && isEmailAuthorized(user.email, cfg.allowedAdminEmail);

  // While Firebase is resolving auth state (especially after Google redirect),
  // show a spinner instead of the login gate to prevent the false login loop
  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: 40, height: 40, borderRadius: '50%',
            border: '3px solid #e2e8f0',
            borderTopColor: '#1d4ed8',
            animation: 'spin 0.7s linear infinite'
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <div>
            <p style={{ fontWeight: 700, color: '#1e293b', margin: '0 0 4px', fontSize: '14px' }}>E-CELL CARD-GEN</p>
            <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>Verifying authentication...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={isAdminAuthenticated ? user : null}
        onOpenAddModal={() => setShowAddModal(true)}
        onOpenBulkModal={() => setShowBulkModal(true)}
      />

      <main style={{ flex: 1, maxWidth: '1280px', margin: '0 auto', width: '100%', padding: '32px 20px', boxSizing: 'border-box' }}>
        {activeTab === 'verify' && <PublicVerifyPortal />}
        {activeTab === 'edit-portal' && <PublicEditPortal />}

        {!isAdminAuthenticated && activeTab !== 'verify' && activeTab !== 'edit-portal' ? (
          <AdminLoginGate />
        ) : (
          <>
            {activeTab === 'members' && (
              <AdminMembers
                members={members}
                batches={batches}
                onAddMember={handleAddMember}
                onImportBatch={handleImportBatch}
                onUpdateMember={handleUpdateMember}
                onDeleteMember={handleDeleteMember}
              />
            )}
            {activeTab === 'template-studio' && <AdminTemplateStudio members={members} />}
            {activeTab === 'batches' && <AdminBatchEdits batches={batches} members={members} />}
            {activeTab === 'export' && <AdminExport members={members} batches={batches} />}
          </>
        )}
      </main>

      <footer style={{ background: '#ffffff', borderTop: '1px solid #e2e8f0', padding: '20px', marginTop: 'auto' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', fontSize: '12px', color: '#64748b' }}>
          <div>
            <span style={{ fontWeight: 700, color: '#334155' }}>E-CELL CARD-GEN</span> • Firebase Realtime Database
          </div>
          <div>
            Status:{' '}
            <span style={{ fontWeight: 700, color: isAdminAuthenticated ? '#16a34a' : '#dc2626' }}>
              {isAdminAuthenticated ? `Admin: ${user.email}` : 'Login Required'}
            </span>
          </div>
        </div>
      </footer>

      {showAddModal && <AddMemberModal onClose={() => setShowAddModal(false)} onAddMember={handleAddMember} />}
      {showBulkModal && <BulkCsvModal onClose={() => setShowBulkModal(false)} onImportSuccess={handleImportBatch} />}
    </div>
  );
}
