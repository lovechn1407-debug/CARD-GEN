import React, { useState } from 'react';
import IDCardCanvas from './IDCardCanvas';
import FlippableIDCard from './FlippableIDCard';
import AddMemberModal from './AddMemberModal';
import BulkCsvModal from './BulkCsvModal';
import CardEditorModal from './CardEditorModal';
import { getCardTemplates } from '../utils/storage';
import { UserPlus, FileSpreadsheet, Search, SlidersHorizontal, Edit3, Trash2, CreditCard, AlertTriangle, Filter } from 'lucide-react';

export default function AdminMembers({ members, batches, onAddMember, onImportBatch, onUpdateMember, onDeleteMember }) {
  const cardTemplates = getCardTemplates();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCardFilter, setSelectedCardFilter] = useState('ALL');
  const [selectedBatchFilter, setSelectedBatchFilter] = useState('ALL');
  const [selectedBranchFilter, setSelectedBranchFilter] = useState('ALL');
  const [selectedYearFilter, setSelectedYearFilter] = useState('ALL');

  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);

  // Extract unique branches from existing members list
  const uniqueBranches = Array.from(
    new Set(members.map((m) => m.branch).filter(Boolean))
  );

  const filteredMembers = members.filter((m) => {
    const searchLower = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !searchLower ||
      m.name?.toLowerCase().includes(searchLower) ||
      m.collegeRollNo?.toLowerCase().includes(searchLower) ||
      m.designation?.toLowerCase().includes(searchLower) ||
      m.branch?.toLowerCase().includes(searchLower) ||
      m.year?.toLowerCase().includes(searchLower) ||
      m.section?.toLowerCase().includes(searchLower) ||
      m.email?.toLowerCase().includes(searchLower);

    const matchesCard = selectedCardFilter === 'ALL' || (m.cardId || 'default') === selectedCardFilter;
    const matchesBatch = selectedBatchFilter === 'ALL' || m.batchId === selectedBatchFilter;
    const matchesBranch = selectedBranchFilter === 'ALL' || m.branch === selectedBranchFilter;
    const matchesYear = selectedYearFilter === 'ALL' || m.year === selectedYearFilter;

    return matchesSearch && matchesCard && matchesBatch && matchesBranch && matchesYear;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Top Filter & Action Bar */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        
        {/* Search + Multi-Filter Row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Search box */}
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#94a3b8' }}>
              <Search style={{ width: 15, height: 15 }} />
            </div>
            <input
              type="text"
              placeholder="Search name, roll, branch, year, mail..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '32px', paddingRight: '12px', paddingTop: '8px', paddingBottom: '8px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', outline: 'none', width: '230px', background: '#fff', color: '#0f172a' }}
            />
          </div>

          {/* Card Template Filter Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CreditCard style={{ width: 15, height: 15, color: '#1d4ed8', flexShrink: 0 }} />
            <select
              value={selectedCardFilter}
              onChange={(e) => setSelectedCardFilter(e.target.value)}
              style={{ padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '12px', fontWeight: 600, background: '#eff6ff', color: '#1e40af', outline: 'none', cursor: 'pointer' }}
            >
              <option value="ALL">All Card Templates ({members.length})</option>
              {Object.values(cardTemplates).map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({members.filter((m) => (m.cardId || 'default') === t.id).length})
                </option>
              ))}
            </select>
          </div>

          {/* Batch Filter Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <SlidersHorizontal style={{ width: 15, height: 15, color: '#64748b', flexShrink: 0 }} />
            <select
              value={selectedBatchFilter}
              onChange={(e) => setSelectedBatchFilter(e.target.value)}
              style={{ padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '12px', background: '#fff', color: '#0f172a', outline: 'none' }}
            >
              <option value="ALL">All Batches</option>
              {batches.map((b) => (
                <option key={b.batchId} value={b.batchId}>
                  {b.name} ({members.filter((m) => m.batchId === b.batchId).length})
                </option>
              ))}
            </select>
          </div>

          {/* Branch Filter Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <select
              value={selectedBranchFilter}
              onChange={(e) => setSelectedBranchFilter(e.target.value)}
              style={{ padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '12px', background: '#fff', color: '#0f172a', outline: 'none' }}
            >
              <option value="ALL">All Branches</option>
              {uniqueBranches.map((br) => (
                <option key={br} value={br}>{br}</option>
              ))}
            </select>
          </div>

          {/* Year Filter Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <select
              value={selectedYearFilter}
              onChange={(e) => setSelectedYearFilter(e.target.value)}
              style={{ padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '12px', background: '#fff', color: '#0f172a', outline: 'none' }}
            >
              <option value="ALL">All Academic Years</option>
              {['1st Year', '2nd Year', '3rd Year', '4th Year'].map((yr) => (
                <option key={yr} value={yr}>{yr}</option>
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
          <p style={{ fontSize: '12px', color: '#64748b' }}>Try clearing your branch, year or batch search filters.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '24px' }}>
          {filteredMembers.map((member) => {
            const rawUrl = (member.photoUrl || '').trim();
            const isMissingPhoto = !rawUrl || rawUrl.includes('unsplash');

            return (
              <div
                key={member.id}
                style={{
                  background: isMissingPhoto ? '#fef2f2' : '#ffffff',
                  border: isMissingPhoto ? '2px solid #ef4444' : '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  boxShadow: isMissingPhoto ? '0 0 16px rgba(239, 68, 68, 0.25)' : '0 1px 3px rgba(0,0,0,0.05)',
                  transition: 'all 0.2s ease',
                  position: 'relative'
                }}
              >
                {/* 3D Flippable Card Canvas with Hover Overlay */}
                <div style={{ position: 'relative' }}>
                  <FlippableIDCard
                    member={member}
                    interactive={false}
                    overlayOpacity={1.0}
                    showFlipButton={false}
                    onModifyClick={() => setEditingMember(member)}
                  />
                </div>

                {/* Member Info */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', borderRadius: '20px', fontSize: '10px', fontWeight: 700, padding: '2px 8px', fontFamily: 'monospace' }}>
                      ID: {member.collegeRollNo || member.id}
                    </span>
                    
                    {isMissingPhoto ? (
                      <span style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '20px', fontSize: '10px', fontWeight: 800, padding: '2px 8px', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                        <AlertTriangle style={{ width: 11, height: 11 }} /> MISSING PHOTO
                      </span>
                    ) : (
                      <span style={{ background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', borderRadius: '20px', fontSize: '10px', fontWeight: 700, padding: '2px 8px' }}>
                        Verified
                      </span>
                    )}
                  </div>

                  <h4 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '20px', fontWeight: 700, color: '#0f172a', margin: 0, lineHeight: 1.2 }}>
                    {member.name}
                  </h4>

                  <p style={{ fontFamily: "'Poppins', sans-serif", fontStyle: 'italic', fontSize: '12px', color: '#475569', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {member.designation}
                  </p>

                  {/* Year, Branch, Section, Card Template & Email Badges */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', paddingTop: '4px' }}>
                    <span style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', borderRadius: '4px', fontSize: '10px', fontWeight: 700, padding: '1px 6px', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                      <CreditCard style={{ width: 10, height: 10 }} />
                      {cardTemplates[member.cardId || 'default']?.name || 'Default Card'}
                    </span>
                    {member.branch && (
                      <span style={{ background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '10px', fontWeight: 700, padding: '1px 5px' }}>
                        {member.branch}
                      </span>
                    )}
                    {member.year && (
                      <span style={{ background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '10px', fontWeight: 600, padding: '1px 5px' }}>
                        {member.year}
                      </span>
                    )}
                    {member.section && (
                      <span style={{ background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '10px', fontWeight: 600, padding: '1px 5px' }}>
                        Sec: {member.section}
                      </span>
                    )}
                  </div>

                  {member.email && (
                    <div style={{ fontSize: '10px', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'monospace' }}>
                      ✉ {member.email}
                    </div>
                  )}
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
            );
          })}
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
