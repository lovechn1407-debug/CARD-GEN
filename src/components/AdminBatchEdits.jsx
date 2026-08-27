import React, { useState } from 'react';
import { getBatchEdits, approveBatchEdit } from '../utils/storage';
import IDCardCanvas from './IDCardCanvas';
import { Link2, Copy, Check, Eye, Users, RefreshCw, Sparkles, Clock, ShieldCheck, ArrowRight } from 'lucide-react';

export default function AdminBatchEdits({ batches, members, onBatchUpdated }) {
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [copiedToken, setCopiedToken] = useState(null);

  const batchEdits = getBatchEdits();

  // Generate public self-edit link for a batch
  const getPublicLink = (batchId) => {
    return `${window.location.origin}${window.location.pathname}#/public-edit?batch=${encodeURIComponent(batchId)}`;
  };

  const handleCopyLink = (batchId) => {
    const url = getPublicLink(batchId);
    navigator.clipboard.writeText(url);
    setCopiedToken(batchId);
    setTimeout(() => setCopiedToken(null), 2500);
  };

  // Handle Admin Approval for a member's edit
  const handleApprove = (batchId, collegeRollNo) => {
    approveBatchEdit(batchId, collegeRollNo);
    if (onBatchUpdated) onBatchUpdated();
  };

  return (
    <div className="space-y-6">
      {/* Intro Banner */}
      <div className="hero-card p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" /> Public Batch Self-Edit System
          </h3>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl">
            Generate public self-service links for member batches. Members enter their College Roll No to adjust their own photos, zoom, and crop with live overlay previews. You review and approve their edits here!
          </p>
        </div>
      </div>

      {/* Batches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {batches.map((batch) => {
          const batchMembers = members.filter((m) => m.batchId === batch.batchId);
          const editsForBatch = batchEdits.filter((e) => e.batchId === batch.batchId);
          const submittedEdits = editsForBatch.filter((e) => e.status === 'PENDING');
          const approvedEdits = editsForBatch.filter((e) => e.status === 'CONFIRMED');

          const publicUrl = getPublicLink(batch.batchId);

          return (
            <div key={batch.batchId} className="hero-card hero-card-hover p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="hero-badge hero-badge-blue text-[11px] font-mono">{batch.batchId}</span>
                  <span className="text-xs text-slate-400">
                    {new Date(batch.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h4 className="text-base font-bold text-slate-900">{batch.name}</h4>
                <div className="flex items-center gap-3 text-xs text-slate-500 pt-1">
                  <span className="flex items-center gap-1 font-medium">
                    <Users className="w-3.5 h-3.5 text-blue-600" /> {batchMembers.length} Members
                  </span>
                  <span className="flex items-center gap-1 text-amber-600 font-medium">
                    <Clock className="w-3.5 h-3.5" /> {submittedEdits.length} Pending Approval
                  </span>
                </div>
              </div>

              {/* Public Link Box */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Public Member Self-Edit Link
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={publicUrl}
                    className="hero-input py-1 px-2 text-xs bg-white font-mono truncate"
                  />
                  <button
                    onClick={() => handleCopyLink(batch.batchId)}
                    className="hero-btn hero-btn-secondary py-1 px-2.5 text-xs shrink-0"
                    title="Copy Public Link"
                  >
                    {copiedToken === batch.batchId ? (
                      <Check className="w-3.5 h-3.5 text-green-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                <button
                  onClick={() => setSelectedBatch(batch)}
                  className="hero-btn hero-btn-primary text-xs w-full justify-center"
                >
                  <Eye className="w-4 h-4" /> See Batch Edits ({editsForBatch.length})
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Batch Details Modal */}
      {selectedBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="hero-card w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col my-auto">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Batch Edit Status: {selectedBatch.name}
                </h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  Public Link: {getPublicLink(selectedBatch.batchId)}
                </p>
              </div>
              <button
                onClick={() => setSelectedBatch(null)}
                className="hero-btn hero-btn-secondary text-xs"
              >
                Close
              </button>
            </div>

            {/* Content Table */}
            <div className="p-6 overflow-y-auto space-y-4">
              {members.filter((m) => m.batchId === selectedBatch.batchId).length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-6">No members assigned to this batch.</p>
              ) : (
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase">
                        <th className="py-3 px-4">Member Info</th>
                        <th className="py-3 px-4">Edit Attempts</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Card Preview</th>
                        <th className="py-3 px-4 text-right">Admin Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-xs text-slate-800">
                      {members
                        .filter((m) => m.batchId === selectedBatch.batchId)
                        .map((member) => {
                          const editItem = batchEdits.find(
                            (e) => e.batchId === selectedBatch.batchId && e.collegeRollNo === member.collegeRollNo
                          );
                          const editCount = editItem?.editCount || 0;
                          const isPending = editItem?.status === 'PENDING';
                          const isConfirmed = editItem?.status === 'CONFIRMED';

                          return (
                            <tr key={member.id} className="hover:bg-slate-50/80 transition">
                              <td className="py-3 px-4">
                                <div className="font-bold text-slate-900 font-bebas text-base">
                                  {member.name}
                                </div>
                                <div className="text-[11px] text-slate-500 font-poppins italic">
                                  {member.designation}
                                </div>
                                <div className="text-[10px] text-blue-600 font-mono">
                                  ID: {member.collegeRollNo}
                                </div>
                              </td>

                              <td className="py-3 px-4 font-semibold">
                                {editCount > 0 ? (
                                  <span className="hero-badge hero-badge-blue">{editCount} times edited</span>
                                ) : (
                                  <span className="text-slate-400">Not edited yet</span>
                                )}
                              </td>

                              <td className="py-3 px-4">
                                {isPending && (
                                  <span className="hero-badge hero-badge-amber">Submitted (Pending Approval)</span>
                                )}
                                {isConfirmed && (
                                  <span className="hero-badge hero-badge-green">Confirmed & Saved</span>
                                )}
                                {!editItem && <span className="hero-badge bg-slate-100 text-slate-600">Initial State</span>}
                              </td>

                              <td className="py-3 px-4">
                                <div className="w-20 rounded-md overflow-hidden border border-slate-200 shadow-xs">
                                  <IDCardCanvas
                                    member={{
                                      ...member,
                                      photoUrl: editItem?.photoUrl || member.photoUrl,
                                      photoTransform: editItem?.photoTransform || member.photoTransform
                                    }}
                                    interactive={false}
                                    overlayOpacity={1.0}
                                  />
                                </div>
                              </td>

                              <td className="py-3 px-4 text-right">
                                {isPending ? (
                                  <button
                                    onClick={() => handleApprove(selectedBatch.batchId, member.collegeRollNo)}
                                    className="hero-btn hero-btn-primary py-1 px-3 text-xs"
                                  >
                                    <Check className="w-3.5 h-3.5" /> Approve Edits
                                  </button>
                                ) : isConfirmed ? (
                                  <span className="text-xs font-semibold text-green-600 flex items-center justify-end gap-1">
                                    <ShieldCheck className="w-4 h-4" /> Approved
                                  </span>
                                ) : (
                                  <span className="text-xs text-slate-400">Awaiting Member</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
