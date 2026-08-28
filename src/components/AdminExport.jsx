import React, { useState } from 'react';
import IDCardCanvas from './IDCardCanvas';
import FlippableIDCard from './FlippableIDCard';
import { exportMembersToPdf, exportMembersToZip } from '../utils/cardExporter';
import { getCardTemplates } from '../utils/storage';
import { Printer, FileText, Archive, CheckSquare, Square, Filter, Sparkles, CheckCircle2, RotateCw, CreditCard } from 'lucide-react';

export default function AdminExport({ members, batches }) {
  const cardTemplates = getCardTemplates();
  const [selectedCardFilter, setSelectedCardFilter] = useState('ALL');
  const [selectedBatchFilter, setSelectedBatchFilter] = useState('ALL');
  const [selectedIds, setSelectedIds] = useState(members.map((m) => m.id));
  const [includeBack, setIncludeBack] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState({ current: 0, total: 0, name: '' });
  const [exportType, setExportType] = useState(null);

  const displayMembers = members.filter((m) => {
    const matchesCard = selectedCardFilter === 'ALL' || (m.cardId || 'default') === selectedCardFilter;
    const matchesBatch = selectedBatchFilter === 'ALL' || m.batchId === selectedBatchFilter;
    return matchesCard && matchesBatch;
  });

  const isAllSelected = displayMembers.length > 0 && displayMembers.every((m) => selectedIds.includes(m.id));

  const toggleSelectAll = () => {
    setSelectedIds(isAllSelected ? [] : displayMembers.map((m) => m.id));
  };

  const toggleSelectMember = (id) => {
    setSelectedIds(selectedIds.includes(id) ? selectedIds.filter((i) => i !== id) : [...selectedIds, id]);
  };

  const selectedMemberList = members.filter((m) => selectedIds.includes(m.id));

  const handleExportPdf = async () => {
    if (!selectedMemberList.length) return;
    setIsExporting(true); setExportType('PDF');
    try { await exportMembersToPdf(selectedMemberList, (cur, tot, name) => setExportProgress({ current: cur, total: tot, name }), includeBack); }
    catch (e) { alert('Failed to generate PDF.'); }
    finally { setIsExporting(false); }
  };

  const handleExportZip = async () => {
    if (!selectedMemberList.length) return;
    setIsExporting(true); setExportType('ZIP');
    try { await exportMembersToZip(selectedMemberList, (cur, tot, name) => setExportProgress({ current: cur, total: tot, name }), includeBack); }
    catch (e) { alert('Failed to generate ZIP.'); }
    finally { setIsExporting(false); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Export Toolbar */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        
        {/* Title Row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
          <div>
            <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
              <Printer style={{ width: 18, height: 18, color: '#1d4ed8' }} /> Print & High-Res Card Export Studio
            </h3>
            <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
              Select cards by batch or individually. Export as 3.375″ × 2.125″ ID card PDF or ZIP image package.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={handleExportPdf}
              disabled={!selectedMemberList.length || isExporting}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: selectedMemberList.length && !isExporting ? '#1d4ed8' : '#cbd5e1', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: selectedMemberList.length && !isExporting ? 'pointer' : 'not-allowed' }}
            >
              <FileText style={{ width: 15, height: 15 }} /> Export PDF
            </button>
            <button
              onClick={handleExportZip}
              disabled={!selectedMemberList.length || isExporting}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: '#fff', color: '#374151', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: selectedMemberList.length && !isExporting ? 'pointer' : 'not-allowed' }}
            >
              <Archive style={{ width: 15, height: 15, color: '#7c3aed' }} /> Export ZIP
            </button>
          </div>
        </div>

        {/* Print Back Side Option Checkbox */}
        <div style={{ padding: '12px 14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', marginTop: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', fontWeight: 600, color: '#0f172a', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={includeBack}
              onChange={(e) => setIncludeBack(e.target.checked)}
              style={{ width: '16px', height: '16px', accentColor: '#1d4ed8', cursor: 'pointer' }}
            />
            <span>Include Card Back Side in Print / Export</span>
          </label>
          <span style={{ fontSize: '12px', color: '#64748b', fontStyle: 'italic' }}>
            {includeBack ? '✓ Front & Back printed side-by-side on same page with 1px gap' : 'Front side only'}
          </span>
        </div>

        {/* Filter & Selection Row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', paddingTop: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            
            {/* Card Template Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CreditCard style={{ width: 14, height: 14, color: '#1d4ed8' }} />
              <select
                value={selectedCardFilter}
                onChange={(e) => {
                  setSelectedCardFilter(e.target.value);
                  const filtered = members.filter((m) => {
                    const matchesCard = e.target.value === 'ALL' || (m.cardId || 'default') === e.target.value;
                    const matchesBatch = selectedBatchFilter === 'ALL' || m.batchId === selectedBatchFilter;
                    return matchesCard && matchesBatch;
                  });
                  setSelectedIds(filtered.map((m) => m.id));
                }}
                style={{ padding: '6px 10px', border: '1px solid #cbd5e1', borderRadius: '7px', fontSize: '12px', fontWeight: 600, background: '#eff6ff', color: '#1e40af', outline: 'none', cursor: 'pointer' }}
              >
                <option value="ALL">All Card Templates ({members.length})</option>
                {Object.values(cardTemplates).map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({members.filter((m) => (m.cardId || 'default') === t.id).length})
                  </option>
                ))}
              </select>
            </div>

            {/* Batch Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Filter style={{ width: 14, height: 14, color: '#94a3b8' }} />
              <select
                value={selectedBatchFilter}
                onChange={(e) => {
                  setSelectedBatchFilter(e.target.value);
                  const filtered = members.filter((m) => {
                    const matchesCard = selectedCardFilter === 'ALL' || (m.cardId || 'default') === selectedCardFilter;
                    const matchesBatch = e.target.value === 'ALL' || m.batchId === e.target.value;
                    return matchesCard && matchesBatch;
                  });
                  setSelectedIds(filtered.map((m) => m.id));
                }}
                style={{ padding: '6px 10px', border: '1px solid #cbd5e1', borderRadius: '7px', fontSize: '13px', background: '#fff', color: '#0f172a', outline: 'none' }}
              >
                <option value="ALL">All Batches</option>
                {batches.map((b) => (
                  <option key={b.batchId} value={b.batchId}>
                    {b.name} ({members.filter((m) => m.batchId === b.batchId).length})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={toggleSelectAll}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '13px', fontWeight: 600, color: '#1d4ed8', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              {isAllSelected ? <CheckSquare style={{ width: 15, height: 15 }} /> : <Square style={{ width: 15, height: 15 }} />}
              {isAllSelected ? 'Deselect All' : 'Select All'}
            </button>
            <span style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', borderRadius: '20px', fontSize: '12px', fontWeight: 700, padding: '2px 10px' }}>
              {selectedMemberList.length} / {displayMembers.length} Selected
            </span>
          </div>
        </div>

        {/* Export Progress */}
        {isExporting && (
          <div style={{ marginTop: '14px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '12px 14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600, color: '#1e40af', marginBottom: '6px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles style={{ width: 13, height: 13 }} /> Generating {exportType} for {exportProgress.name}...
              </span>
              <span>{exportProgress.current} / {exportProgress.total}</span>
            </div>
            <div style={{ width: '100%', height: '6px', background: '#bfdbfe', borderRadius: '99px', overflow: 'hidden' }}>
              <div style={{ height: '100%', background: '#1d4ed8', borderRadius: '99px', width: `${(exportProgress.current / (exportProgress.total || 1)) * 100}%`, transition: 'width 0.3s' }} />
            </div>
          </div>
        )}
      </div>

      {/* Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
        {displayMembers.map((member) => {
          const isSelected = selectedIds.includes(member.id);
          return (
            <div
              key={member.id}
              onClick={() => toggleSelectMember(member.id)}
              style={{
                background: '#ffffff',
                border: isSelected ? '2px solid #1d4ed8' : '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '12px',
                cursor: 'pointer',
                opacity: isSelected ? 1 : 0.72,
                boxShadow: isSelected ? '0 0 0 3px rgba(29,78,216,0.15)' : '0 1px 3px rgba(0,0,0,0.05)',
                transition: 'all 0.15s'
              }}
              onMouseEnter={e => { if (!isSelected) e.currentTarget.style.opacity = 1; }}
              onMouseLeave={e => { if (!isSelected) e.currentTarget.style.opacity = 0.72; }}
            >
              {/* Select row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {isSelected
                    ? <CheckCircle2 style={{ width: 16, height: 16, color: '#1d4ed8' }} />
                    : <Square style={{ width: 16, height: 16, color: '#cbd5e1' }} />
                  }
                  <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>{member.name}</span>
                </div>
                <span style={{ fontSize: '10px', fontFamily: 'monospace', color: '#94a3b8' }}>{member.collegeRollNo}</span>
              </div>
              {/* Card Canvas with 3D Flip */}
              <div>
                <FlippableIDCard member={member} interactive={false} overlayOpacity={1.0} showFlipButton={true} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
