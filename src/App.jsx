import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import AdminMembers from './components/AdminMembers';
import AdminBatchEdits from './components/AdminBatchEdits';
import AdminExport from './components/AdminExport';
import AdminTemplateStudio from './components/AdminTemplateStudio';
import PublicVerifyPortal from './components/PublicVerifyPortal';
import PublicEditPortal from './components/PublicEditPortal';
import AddMemberModal from './components/AddMemberModal';
import BulkCsvModal from './components/BulkCsvModal';
import { getMembers, saveMembers, getBatches, saveBatches, updateMember, deleteMember } from './utils/storage';

export default function App() {
  const [currentRoute, setCurrentRoute] = useState(window.location.hash || '#/');
  const [activeTab, setActiveTab] = useState('members');

  const [members, setMembersState] = useState([]);
  const [batches, setBatchesState] = useState([]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);

  const refreshData = () => {
    setMembersState(getMembers());
    setBatchesState(getBatches());
  };

  useEffect(() => {
    refreshData();
    const handleHashChange = () => setCurrentRoute(window.location.hash || '#/');
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleAddMember = (newMember) => {
    const updated = updateMember(newMember);
    setMembersState(updated);
  };

  const handleImportBatch = (newMembers, newBatch) => {
    const currentM = getMembers();
    saveMembers([...currentM, ...newMembers]);
    const currentB = getBatches();
    saveBatches([newBatch, ...currentB]);
    refreshData();
  };

  const handleUpdateMember = (updatedMember) => {
    const updated = updateMember(updatedMember);
    setMembersState(updated);
  };

  const handleDeleteMember = (id) => {
    const updated = deleteMember(id);
    setMembersState(updated);
  };

  if (currentRoute.startsWith('#/verify')) return <PublicVerifyPortal />;
  if (currentRoute.startsWith('#/public-edit')) return <PublicEditPortal />;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddModal={() => setShowAddModal(true)}
        onOpenBulkModal={() => setShowBulkModal(true)}
      />

      <main style={{ flex: 1, maxWidth: '1280px', margin: '0 auto', width: '100%', padding: '32px 20px' }}>
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
          <AdminTemplateStudio members={members} onConfigSaved={() => refreshData()} />
        )}
        {activeTab === 'batches' && (
          <AdminBatchEdits batches={batches} members={members} onBatchUpdated={refreshData} />
        )}
        {activeTab === 'export' && (
          <AdminExport members={members} batches={batches} />
        )}
        {activeTab === 'verify' && <PublicVerifyPortal />}
        {activeTab === 'edit-portal' && <PublicEditPortal />}
      </main>

      <footer style={{ background: '#ffffff', borderTop: '1px solid #e2e8f0', padding: '20px', marginTop: 'auto' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', fontSize: '12px', color: '#64748b' }}>
          <div>
            <span style={{ fontWeight: 700, color: '#334155' }}>E-CELL CARD-GEN</span> • Entrepreneurship Cell, I.T.S Engineering College
          </div>
          <div>
            Design Layout:{' '}
            <span style={{ fontFamily: "'Bebas Neue', sans-serif", color: '#334155', fontSize: '14px' }}>BEBAS NEUE</span>
            {' & '}
            <span style={{ fontFamily: "'Poppins', sans-serif", fontStyle: 'italic', color: '#334155' }}>Poppins</span>
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
