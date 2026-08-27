import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import AdminMembers from './components/AdminMembers';
import AdminBatchEdits from './components/AdminBatchEdits';
import AdminExport from './components/AdminExport';
import PublicVerifyPortal from './components/PublicVerifyPortal';
import PublicEditPortal from './components/PublicEditPortal';
import AddMemberModal from './components/AddMemberModal';
import BulkCsvModal from './components/BulkCsvModal';
import { getMembers, saveMembers, getBatches, saveBatches, updateMember, deleteMember, createBatch } from './utils/storage';

export default function App() {
  const [currentRoute, setCurrentRoute] = useState(window.location.hash || '#/');
  const [activeTab, setActiveTab] = useState('members');

  const [members, setMembersState] = useState([]);
  const [batches, setBatchesState] = useState([]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);

  // Load initial data
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

  // Handlers
  const handleAddMember = (newMember) => {
    const updated = updateMember(newMember);
    setMembersState(updated);
  };

  const handleImportBatch = (newMembers, newBatch) => {
    // Add all new members
    const currentM = getMembers();
    const merged = [...currentM, ...newMembers];
    saveMembers(merged);

    // Save new batch
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

  // Route 1: Public Verification Portal (#/verify)
  if (currentRoute.startsWith('#/verify')) {
    return <PublicVerifyPortal />;
  }

  // Route 2: Public Member Self-Edit Portal (#/public-edit)
  if (currentRoute.startsWith('#/public-edit')) {
    return <PublicEditPortal />;
  }

  // Route 3: Main Admin Application
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

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            <span className="font-bold text-slate-700">E-CELL CARD-GEN</span> • Entrepreneurship Cell, I.T.S Engineering College
          </div>
          <div>
            Design Fonts: <span className="font-bebas text-slate-700 text-sm">BEBAS NEUE</span> & <span className="font-poppins italic text-slate-700">Poppins</span>
          </div>
        </div>
      </footer>

      {/* Global Modals */}
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
