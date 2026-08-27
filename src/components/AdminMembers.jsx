import React, { useState } from 'react';
import IDCardCanvas from './IDCardCanvas';
import FlippableIDCard from './FlippableIDCard';
import AddMemberModal from './AddMemberModal';
import BulkCsvModal from './BulkCsvModal';
import CardEditorModal from './CardEditorModal';
import { UserPlus, FileSpreadsheet, Search, SlidersHorizontal, Edit3, Trash2, CreditCard } from 'lucide-react';

export default function AdminMembers({ members, batches, onAddMember, onImportBatch, onUpdateMember, onDeleteMember }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBatchFilter, setSelectedBatchFilter] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);

  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      m.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.collegeRollNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.designation?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBatch = selectedBatchFilter === 'ALL' || m.batchId === selectedBatchFilter;
    return matchesSearch && matchesBatch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Top Filter & Action Bar */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        
        {/* Search + Batch Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Search box */}
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#94a3b8' }}>
              <Search style={{ width: 15, height: 15 }} />
            </div>
            <input
              type="text"
              placeholder="Search name, roll no, role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '32px', paddingRight: '12px', paddingTop: '8px', paddingBottom: '8px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', outline: 'none', width: '240px', background: '#fff', color: '#0f172a' }}
            />
          </div>

          {/* Batch Filter Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <SlidersHorizontal style={{ width: 15, height: 15, color: '#64748b', flexShrink: 0 }} />
            <select
              value={selectedBatchFilter}
              onChange={(e) => setSelectedBatchFilter(e.target.value)}
              style={{ padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', background: '#fff', color: '#0f172a', outline: 'none' }}
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

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setShowAddModal(true)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
          >
            <UserPlus style={{ width: 15, height: 15 }} /> Add New Member
          </button>
          <button
            onClick={() => setShowBulkModal(true)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: '#fff', color: '#374151', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
          >
            <FileSpreadsheet style={{ width: 15, height: 15, color: '#16a34a' }} /> Bulk CSV Entry
          </button>
        </div>
      </div>

      {/* Member Cards Grid */}
      {filteredMembers.length === 0 ? (
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '60px 20px', textAlign: 'center' }}>
          <CreditCard style={{ width: 48, height: 48, color: '#cbd5e1', margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>No Member Cards Found</h3>
          <p style={{ fontSize: '12px', color: '#64748b' }}>Click "Add New Member" or "Bulk CSV Entry" to start generating E-Cell ID cards.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '24px' }}>
          {filteredMembers.map((member) => (
            <div
              key={member.id}
              style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', transition: 'box-shadow 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.1)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)'}
            >
              {/* 3D Flippable Card Canvas */}
              <div style={{ position: 'relative' }}>
                <FlippableIDCard member={member} interactive={false} overlayOpacity={1.0} showFlipButton={true} />
              </div>

              {/* Member Info */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', borderRadius: '20px', fontSize: '10px', fontWeight: 700, padding: '2px 8px', fontFamily: 'monospace' }}>
                    ID: {member.collegeRollNo || member.id}
                  </span>
                  <span style={{ background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', borderRadius: '20px', fontSize: '10px', fontWeight: 700, padding: '2px 8px' }}>
                    Verified
                  </span>
                </div>
                <h4 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '20px', fontWeight: 700, color: '#0f172a', margin: '4px 0 2px', lineHeight: 1.2 }}>
                  {member.name}
                </h4>
                <p style={{ fontFamily: "'Poppins', sans-serif", fontStyle: 'italic', fontSize: '12px', color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {member.designation}
                </p>
              </div>

              {/* Quick Actions */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
                <button
                  onClick={() => setEditingMember(member)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: '#1d4ed8', color: '#ffffff', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                >
                  <Edit3 style={{ width: 13, height: 13 }} /> Modify Card
                </button>
                <button
                  onClick={() => { if (confirm(`Delete card for ${member.name}?`)) onDeleteMember(member.id); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#94a3b8' }}
                  title="Delete Member"
                  onMouseEnter={e => e.currentTarget.style.color = '#dc2626'}
                  onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
                >
                  <Trash2 style={{ width: 15, height: 15 }} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {showAddModal && <AddMemberModal onClose={() => setShowAddModal(false)} onAddMember={onAddMember} />}
      {showBulkModal && <BulkCsvModal onClose={() => setShowBulkModal(false)} onImportSuccess={onImportBatch} />}
      {editingMember && (
        <CardEditorModal member={editingMember} onClose={() => setEditingMember(null)} onSave={onUpdateMember} />
      )}
    </div>
  );
}
