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

    const handleHashChange = () => {
      setCurrentRoute(window.location.hash || '#/');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleAddMember = (newMember) => {
    const updated = updateMember(newMember);
    setMembersState(updated);
  };

  const handleImportBatch = (newMembers, newBatch) => {
    const currentM = getMembers();
    const merged = [...currentM, ...newMembers];
    saveMembers(merged);

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

  if (currentRoute.startsWith('#/verify')) {
    return <PublicVerifyPortal />;
  }

  if (currentRoute.startsWith('#/public-edit')) {
    return <PublicEditPortal />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <div>
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenAddModal={() => setShowAddModal(true)}
          onOpenBulkModal={() => setShowBulkModal(true)}
        />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
            <AdminTemplateStudio
              members={members}
              onConfigSaved={() => refreshData()}
            />
          )}

          {activeTab === 'batches' && (
            <AdminBatchEdits
              batches={batches}
              members={members}
              onBatchUpdated={refreshData}
            />
          )}

          {activeTab === 'export' && (
            <AdminExport members={members} batches={batches} />
          )}

          {activeTab === 'verify' && <PublicVerifyPortal />}

          {activeTab === 'edit-portal' && <PublicEditPortal />}
        </main>
      </div>

      <footer className="bg-white border-t border-slate-200 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            <span className="font-bold text-slate-700">E-CELL CARD-GEN</span> • Entrepreneurship Cell, I.T.S Engineering College
          </div>
          <div>
            Design Layout: <span className="font-bebas text-slate-700 text-sm">BEBAS NEUE</span> & <span className="font-poppins italic text-slate-700">Poppins</span>
          </div>
        </div>
      </footer>

      {showAddModal && (
        <AddMemberModal
          onClose={() => setShowAddModal(false)}
          onAddMember={handleAddMember}
        />
      )}

      {showBulkModal && (
        <BulkCsvModal
          onClose={() => setShowBulkModal(false)}
          onImportSuccess={handleImportBatch}
        />
      )}
    </div>
  );
}
