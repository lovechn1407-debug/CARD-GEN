import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
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
import { subscribeToAuth, isEmailAuthorized } from './utils/firebase';

export default function App() {
  const [currentRoute, setCurrentRoute] = useState(window.location.hash || '#/');
  const [activeTab, setActiveTab] = useState('members');
  const [isCollapsed, setIsCollapsed] = useState(false);

  const [members, setMembers] = useState([]);
  const [batches, setBatches] = useState([]);
  const [cardTemplates, setCardTemplates] = useState({});
  const [templateConfig, setTemplateConfig] = useState(getTemplateConfig());
  const [user, setUser] = useState(null);
  // authLoading = true while Firebase resolves auth state (handles redirect login restore)
  const [authLoading, setAuthLoading] = useState(true);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);

  useEffect(() => {
    // Listen for Firebase Auth state changes (remembers logged-in admin user across page reloads)
    const unsubAuth = subscribeToAuth((u) => {
      setUser(u);
      setAuthLoading(false);
    });

    const handleHashChange = () => setCurrentRoute(window.location.hash || '#/');
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      unsubAuth();
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  // DO NOT load Realtime Database until user logs in as Authorized Admin!
  useEffect(() => {
    const isAdmin = user && !user.isAnonymous && user.email;
    
    if (!isAdmin) {
      setMembers([]);
      setBatches([]);
      return;
    }

    // Subscribe to database listeners ONLY when admin is logged in
    const unsubMembers = subscribeMembers((list) => setMembers(list));
    const unsubBatches = subscribeBatches((list) => setBatches(list));
    const unsubConfig = subscribeTemplateConfig((cfg) => setTemplateConfig(cfg));
    const unsubCardTemplates = subscribeCardTemplates((templates) => setCardTemplates(templates));

    return () => {
      unsubMembers && unsubMembers();
      unsubBatches && unsubBatches();
      unsubConfig && unsubConfig();
      unsubCardTemplates && unsubCardTemplates();
    };
  }, [user]);

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

  const isAdminAuthenticated = user && !user.isAnonymous && user.email;

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
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={isAdminAuthenticated ? user : null}
        onOpenAddModal={() => setShowAddModal(true)}
        onOpenBulkModal={() => setShowBulkModal(true)}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />

      <main 
        style={{ 
          flex: 1, 
          maxWidth: '1280px', 
          margin: '0 auto', 
          width: '100%', 
          padding: '32px 20px', 
          paddingLeft: isCollapsed ? '92px' : '280px',
          transition: 'padding-left 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          boxSizing: 'border-box' 
        }}
      >
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

      <footer 
        style={{ 
          background: '#ffffff', 
          borderTop: '1px solid #e2e8f0', 
          padding: '20px', 
          paddingLeft: isCollapsed ? '92px' : '280px',
          transition: 'padding-left 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          marginTop: 'auto' 
        }}
      >
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
