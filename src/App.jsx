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
  const [user, setUser] = useState(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);

  useEffect(() => {
    // 1. Subscribe to Firebase Auth
    const unsubAuth = subscribeToAuth((u) => setUser(u));

    // 2. Real-time Firestore Subscriptions
    const unsubMembers = subscribeMembers((list) => setMembers(list));
    const unsubBatches = subscribeBatches((list) => setBatches(list));

    const handleHashChange = () => setCurrentRoute(window.location.hash || '#/');
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      unsubAuth();
      unsubMembers();
      unsubBatches();
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const handleAddMember = async (newMember) => {
    await updateMember(newMember);
  };

  const handleImportBatch = async (newMembers, newBatch) => {
    await saveMembers([...members, ...newMembers]);
    await saveBatches([newBatch, ...batches]);
  };

  const handleUpdateMember = async (updatedMember) => {
    await updateMember(updatedMember);
  };

  const handleDeleteMember = async (id) => {
    await deleteMember(id);
  };

  // Public hash routes (no admin auth required)
  if (currentRoute.startsWith('#/verify')) return <PublicVerifyPortal />;
  if (currentRoute.startsWith('#/public-edit')) return <PublicEditPortal />;

  // Check if Admin user is signed in AND authorized
  const cfg = getTemplateConfig();
  const isAdminAuthenticated = user && !user.isAnonymous && isEmailAuthorized(user.email, cfg.allowedAdminEmail);

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
        {/* Public Portals inside Tab bar */}
        {activeTab === 'verify' && <PublicVerifyPortal />}
        {activeTab === 'edit-portal' && <PublicEditPortal />}

        {/* Admin Features (Strictly Gated behind Single Authorized Gmail Authentication) */}
        {!isAdminAuthenticated && activeTab !== 'verify' && activeTab !== 'edit-portal' ? (
          <AdminLoginGate user={user} onAuthenticated={(u) => setUser(u)} />
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
            {activeTab === 'template-studio' && (
              <AdminTemplateStudio members={members} />
            )}
            {activeTab === 'batches' && (
              <AdminBatchEdits batches={batches} members={members} />
            )}
            {activeTab === 'export' && (
              <AdminExport members={members} batches={batches} />
            )}
          </>
        )}
      </main>

      <footer style={{ background: '#ffffff', borderTop: '1px solid #e2e8f0', padding: '20px', marginTop: 'auto' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', fontSize: '12px', color: '#64748b' }}>
          <div>
            <span style={{ fontWeight: 700, color: '#334155' }}>E-CELL CARD-GEN</span> • Firebase Realtime DB & Firestore Dual Synced
          </div>
          <div>
            Status:{' '}
            <span style={{ fontWeight: 700, color: isAdminAuthenticated ? '#16a34a' : '#dc2626' }}>
              {isAdminAuthenticated ? `Authorized Admin (${user.email})` : 'Authorized Gmail Access Required'}
            </span>
          </div>
        </div>
      </footer>

      {showAddModal && (
        <AddMemberModal onClose={() => setShowAddModal(false)} onAddMember={handleAddMember} />
      )}
      {showBulkModal && (
        <BulkCsvModal onClose={() => setShowBulkModal(false)} onImportSuccess={handleImportBatch} />
      )}
    </div>
  );
}
