import React, { useState } from 'react';
import IDCardCanvas from './IDCardCanvas';
import AddMemberModal from './AddMemberModal';
import BulkCsvModal from './BulkCsvModal';
import CardEditorModal from './CardEditorModal';
import { UserPlus, FileSpreadsheet, Search, SlidersHorizontal, Edit3, Trash2, ShieldCheck, CreditCard } from 'lucide-react';

export default function AdminMembers({
  members,
  batches,
  onAddMember,
  onImportBatch,
  onUpdateMember,
  onDeleteMember
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBatchFilter, setSelectedBatchFilter] = useState('ALL');

  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);

  // Filtered members list
  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      m.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.collegeRollNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.designation?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesBatch = selectedBatchFilter === 'ALL' || m.batchId === selectedBatchFilter;

    return matchesSearch && matchesBatch;
  });

  return (
    <div className="space-y-6">
      {/* Top Action & Filter Toolbar */}
      <div className="hero-card p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search & Batch Select */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search name, roll no, role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="hero-input pl-9"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <SlidersHorizontal className="w-4 h-4 text-slate-500 shrink-0" />
            <select
              value={selectedBatchFilter}
              onChange={(e) => setSelectedBatchFilter(e.target.value)}
              className="hero-input py-2 text-xs"
            >
              <option value="ALL">All Upload Batches ({members.length})</option>
              {batches.map((b) => (
                <option key={b.batchId} value={b.batchId}>
                  {b.name} ({members.filter((m) => m.batchId === b.batchId).length})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Create / Import Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button onClick={() => setShowAddModal(true)} className="hero-btn hero-btn-primary text-xs">
            <UserPlus className="w-4 h-4" /> Add New Member
          </button>
          <button onClick={() => setShowBulkModal(true)} className="hero-btn hero-btn-secondary text-xs">
            <FileSpreadsheet className="w-4 h-4 text-green-600" /> Bulk CSV Entry
          </button>
        </div>
      </div>

      {/* Members Cards Grid */}
      {filteredMembers.length === 0 ? (
        <div className="hero-card p-12 text-center space-y-3">
          <CreditCard className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-700">No Member Cards Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Click "Add New Member" or "Bulk CSV Entry" to start generating custom E-Cell ID cards.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMembers.map((member) => (
            <div key={member.id} className="hero-card hero-card-hover p-4 flex flex-col justify-between space-y-4">
              {/* Card Canvas Thumbnail */}
              <div className="relative group bg-slate-900 rounded-xl overflow-hidden shadow-inner flex items-center justify-center p-2">
                <div className="w-full max-w-[240px]">
                  <IDCardCanvas member={member} interactive={false} overlayOpacity={1.0} />
                </div>

                {/* Quick Edit Hover Overlay */}
                <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-2xs">
                  <button
                    onClick={() => setEditingMember(member)}
                    className="hero-btn hero-btn-primary text-xs py-1.5 px-3"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Modify Card
                  </button>
                </div>
              </div>

              {/* Member Meta Info */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="hero-badge hero-badge-blue text-[10px]">
                    ID: {member.collegeRollNo || member.id}
                  </span>
                  <span className="hero-badge hero-badge-green text-[10px]">Verified</span>
                </div>
                <h4 className="font-bebas text-lg tracking-wide text-slate-900 leading-tight pt-1">
                  {member.name}
                </h4>
                <p className="font-poppins italic text-xs text-slate-600 truncate">{member.designation}</p>
              </div>

              {/* Bottom Quick Actions */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => setEditingMember(member)}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Edit Photo/Card
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Delete card for ${member.name}?`)) {
                      onDeleteMember(member.id);
                    }
                  }}
                  className="text-slate-400 hover:text-red-600 p-1 transition"
                  title="Delete Member"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {showAddModal && (
        <AddMemberModal
          onClose={() => setShowAddModal(false)}
          onAddMember={(newM) => {
            onAddMember(newM);
          }}
        />
      )}

      {showBulkModal && (
        <BulkCsvModal
          onClose={() => setShowBulkModal(false)}
          onImportSuccess={(newMembers, newBatch) => {
            onImportBatch(newMembers, newBatch);
          }}
        />
      )}

      {editingMember && (
        <CardEditorModal
          member={editingMember}
          onClose={() => setEditingMember(null)}
          onSave={(updatedM) => {
            onUpdateMember(updatedM);
          }}
        />
      )}
    </div>
  );
}
