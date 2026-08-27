import React, { useState } from 'react';
import IDCardCanvas from './IDCardCanvas';
import { exportMembersToPdf, exportMembersToZip } from '../utils/cardExporter';
import { Printer, Download, FileText, Archive, CheckSquare, Square, Filter, Sparkles, CheckCircle2 } from 'lucide-react';

export default function AdminExport({ members, batches }) {
  const [selectedBatchFilter, setSelectedBatchFilter] = useState('ALL');
  const [selectedIds, setSelectedIds] = useState(members.map((m) => m.id));

  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState({ current: 0, total: 0, name: '' });
  const [exportType, setExportType] = useState(null); // 'pdf' | 'zip'

  // Filter members list by batch
  const displayMembers = members.filter(
    (m) => selectedBatchFilter === 'ALL' || m.batchId === selectedBatchFilter
  );

  const isAllSelected =
    displayMembers.length > 0 && displayMembers.every((m) => selectedIds.includes(m.id));

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(displayMembers.map((m) => m.id));
    }
  };

  const toggleSelectMember = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const selectedMemberList = members.filter((m) => selectedIds.includes(m.id));

  // Trigger PDF Export
  const handleExportPdf = async () => {
    if (!selectedMemberList.length) return;
    setIsExporting(true);
    setExportType('PDF');
    try {
      await exportMembersToPdf(selectedMemberList, (current, total, name) => {
        setExportProgress({ current, total, name });
      });
    } catch (e) {
      alert('Failed to generate PDF export.');
    } finally {
      setIsExporting(false);
    }
  };

  // Trigger ZIP Export
  const handleExportZip = async () => {
    if (!selectedMemberList.length) return;
    setIsExporting(true);
    setExportType('ZIP');
    try {
      await exportMembersToZip(selectedMemberList, (current, total, name) => {
        setExportProgress({ current, total, name });
      });
    } catch (e) {
      alert('Failed to generate ZIP export.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Export Toolbar */}
      <div className="hero-card p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Printer className="w-5 h-5 text-blue-600" /> Print & High-Res Card Export Studio
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Select cards by batch or individual selection. Export as standard 3.375" × 2.125" ID Card PDF or ZIP package.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportPdf}
              disabled={!selectedMemberList.length || isExporting}
              className="hero-btn hero-btn-primary text-xs"
            >
              <FileText className="w-4 h-4" /> Export PDF (3.375″ × 2.125″)
            </button>
            <button
              onClick={handleExportZip}
              disabled={!selectedMemberList.length || isExporting}
              className="hero-btn hero-btn-secondary text-xs"
            >
              <Archive className="w-4 h-4 text-purple-600" /> Export PNG Images ZIP
            </button>
          </div>
        </div>

        {/* Filter & Selection Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-1">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedBatchFilter}
              onChange={(e) => {
                setSelectedBatchFilter(e.target.value);
                const batchMembers = members.filter(
                  (m) => e.target.value === 'ALL' || m.batchId === e.target.value
                );
                setSelectedIds(batchMembers.map((m) => m.id));
              }}
              className="hero-input text-xs py-1.5"
            >
              <option value="ALL">All Batches ({members.length} Cards)</option>
              {batches.map((b) => (
                <option key={b.batchId} value={b.batchId}>
                  {b.name} ({members.filter((m) => m.batchId === b.batchId).length})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
            <button
              onClick={toggleSelectAll}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1.5"
            >
              {isAllSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
              {isAllSelected ? 'Deselect All' : 'Select All Filtered'}
            </button>
            <span className="hero-badge hero-badge-blue text-xs">
              {selectedMemberList.length} of {displayMembers.length} Selected
            </span>
          </div>
        </div>

        {/* Progress Bar when Exporting */}
        {isExporting && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-blue-800">
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600 animate-pulse" /> Generating High-Res {exportType} for {exportProgress.name}...
              </span>
              <span>
                {exportProgress.current} / {exportProgress.total}
              </span>
            </div>
            <div className="w-full h-2 bg-blue-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all duration-300"
                style={{
                  width: `${(exportProgress.current / (exportProgress.total || 1)) * 100}%`
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Selectable Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {displayMembers.map((member) => {
          const isSelected = selectedIds.includes(member.id);

          return (
            <div
              key={member.id}
              onClick={() => toggleSelectMember(member.id)}
              className={`hero-card p-4 cursor-pointer transition-all ${
                isSelected ? 'ring-2 ring-blue-600 border-blue-600 bg-blue-50/20' : 'opacity-70 hover:opacity-100'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {isSelected ? (
                    <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
                  ) : (
                    <Square className="w-5 h-5 text-slate-300 shrink-0" />
                  )}
                  <span className="font-bebas text-base text-slate-900 tracking-wide">{member.name}</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">{member.collegeRollNo}</span>
              </div>

              {/* Card Canvas */}
              <div className="bg-slate-900 rounded-lg p-2 flex items-center justify-center">
                <div className="w-full max-w-[220px]">
                  <IDCardCanvas member={member} interactive={false} overlayOpacity={1.0} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
