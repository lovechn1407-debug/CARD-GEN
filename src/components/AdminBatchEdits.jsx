import React, { useState, useEffect } from 'react';
import { subscribeBatchEdits, approveBatchEdit } from '../utils/storage';
import IDCardCanvas from './IDCardCanvas';
import { Link2, Copy, Check, Eye, Users, Clock, ShieldCheck, Sparkles } from 'lucide-react';

export default function AdminBatchEdits({ batches, members, onBatchUpdated }) {
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [copiedToken, setCopiedToken] = useState(null);

  const [batchEdits, setBatchEdits] = useState([]);

  useEffect(() => {
    const unsub = subscribeBatchEdits((list) => setBatchEdits(list));
    return () => unsub && unsub();
  }, []);

  const getPublicLink = (batchId) =>
    `${window.location.origin}${window.location.pathname}#/public-edit?batch=${encodeURIComponent(batchId)}`;

  const handleCopyLink = (batchId) => {
    navigator.clipboard.writeText(getPublicLink(batchId));
    setCopiedToken(batchId);
    setTimeout(() => setCopiedToken(null), 2500);
  };

  const handleApprove = (batchId, collegeRollNo) => {
    approveBatchEdit(batchId, collegeRollNo);
    if (onBatchUpdated) onBatchUpdated();
  };

  // Card style
  const card = {
    background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px',
    padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '14px'
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Intro Banner */}
      <div style={{ background: 'linear-gradient(to right, #eff6ff, #eef2ff)', border: '1px solid #dbeafe', borderRadius: '12px', padding: '20px 24px' }}>
        <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
          <Sparkles style={{ width: 18, height: 18, color: '#1d4ed8' }} /> Public Batch Self-Edit System
        </h3>
        <p style={{ fontSize: '13px', color: '#475569', marginTop: '6px' }}>
          Generate public self-service links for member batches. Members enter their College Roll No to adjust their own photos. You review and approve edits here.
        </p>
      </div>

      {/* Batches Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {batches.map((batch) => {
          const batchMembers = members.filter((m) => m.batchId === batch.batchId);
          const editsForBatch = batchEdits.filter((e) => e.batchId === batch.batchId);
          const submittedEdits = editsForBatch.filter((e) => e.status === 'PENDING');
          const publicUrl = getPublicLink(batch.batchId);

          return (
            <div key={batch.batchId} style={card}>
              {/* Batch Header */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', borderRadius: '20px', fontSize: '10px', fontWeight: 700, padding: '2px 8px', fontFamily: 'monospace' }}>
                    {batch.batchId}
                  </span>
                  <span style={{ fontSize: '11px', color: '#94a3b8' }}>{new Date(batch.createdAt).toLocaleDateString()}</span>
                </div>
                <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', margin: '0 0 6px' }}>{batch.name}</h4>
                <div style={{ display: 'flex', gap: '14px', fontSize: '12px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#475569', fontWeight: 600 }}>
                    <Users style={{ width: 13, height: 13, color: '#1d4ed8' }} /> {batchMembers.length} Members
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#b45309', fontWeight: 600 }}>
                    <Clock style={{ width: 13, height: 13 }} /> {submittedEdits.length} Pending
                  </span>
                </div>
              </div>

              {/* Public Link */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 12px' }}>
                <div style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                  Public Self-Edit Link
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <input
                    type="text"
                    readOnly
                    value={publicUrl}
                    style={{ flex: 1, padding: '6px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '11px', fontFamily: 'monospace', background: '#fff', color: '#334155', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                  />
                  <button
                    onClick={() => handleCopyLink(batch.batchId)}
                    style={{ padding: '6px 10px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                    title="Copy Public Link"
                  >
                    {copiedToken === batch.batchId
                      ? <Check style={{ width: 14, height: 14, color: '#16a34a' }} />
                      : <Copy style={{ width: 14, height: 14, color: '#475569' }} />
                    }
                  </button>
                </div>
              </div>

              {/* See Edits Button */}
              <button
                onClick={() => setSelectedBatch(batch)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '9px', background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
              >
                <Eye style={{ width: 15, height: 15 }} /> See Batch Edits ({editsForBatch.length})
              </button>
            </div>
          );
        })}
      </div>

      {/* Batch Detail Modal */}
      {selectedBatch && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', background: 'rgba(15,23,42,0.6)', overflowY: 'auto' }}>
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '14px', width: '100%', maxWidth: '900px', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px rgba(0,0,0,0.25)' }}>
            
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  Batch Edit Status: {selectedBatch.name}
                </h3>
                <p style={{ fontSize: '11px', fontFamily: 'monospace', color: '#64748b', marginTop: '2px' }}>
                  {getPublicLink(selectedBatch.batchId)}
                </p>
              </div>
              <button
                onClick={() => setSelectedBatch(null)}
                style={{ padding: '7px 14px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', color: '#334155' }}
              >
                Close
              </button>
            </div>

            {/* Modal Content - Table */}
            <div style={{ overflowY: 'auto', padding: '16px' }}>
              {members.filter((m) => m.batchId === selectedBatch.batchId).length === 0 ? (
                <p style={{ textAlign: 'center', fontSize: '13px', color: '#64748b', padding: '32px' }}>No members in this batch.</p>
              ) : (
                <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                        {['Member Info', 'Edit Attempts', 'Status', 'Card Preview', 'Admin Action'].map(h => (
                          <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {members.filter((m) => m.batchId === selectedBatch.batchId).map((member) => {
                        const editItem = batchEdits.find(
                          (e) => e.batchId === selectedBatch.batchId && e.collegeRollNo === member.collegeRollNo
                        );
                        const editCount = editItem?.editCount || 0;
                        const isPending = editItem?.status === 'PENDING';
                        const isConfirmed = editItem?.status === 'CONFIRMED';

                        return (
                          <tr key={member.id} style={{ borderBottom: '1px solid #f1f5f9' }}
                            onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                          >
                            <td style={{ padding: '10px 14px' }}>
                              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>{member.name}</div>
                              <div style={{ fontFamily: "'Poppins', sans-serif", fontStyle: 'italic', fontSize: '11px', color: '#64748b' }}>{member.designation}</div>
                              <div style={{ fontSize: '10px', color: '#1d4ed8', fontFamily: 'monospace' }}>ID: {member.collegeRollNo}</div>
                            </td>
                            <td style={{ padding: '10px 14px' }}>
                              {editCount > 0
                                ? <span style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', borderRadius: '20px', fontSize: '11px', fontWeight: 700, padding: '2px 8px' }}>{editCount}× edited</span>
                                : <span style={{ color: '#94a3b8', fontSize: '12px' }}>Not edited yet</span>
                              }
                            </td>
                            <td style={{ padding: '10px 14px' }}>
                              {isPending && <span style={{ background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a', borderRadius: '20px', fontSize: '11px', fontWeight: 700, padding: '2px 8px' }}>Pending Approval</span>}
                              {isConfirmed && <span style={{ background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', borderRadius: '20px', fontSize: '11px', fontWeight: 700, padding: '2px 8px' }}>Confirmed ✓</span>}
                              {!editItem && <span style={{ background: '#f1f5f9', color: '#475569', borderRadius: '20px', fontSize: '11px', fontWeight: 600, padding: '2px 8px' }}>Initial State</span>}
                            </td>
                            <td style={{ padding: '10px 14px' }}>
                              <div style={{ width: '60px', borderRadius: '6px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                                <IDCardCanvas
                                  member={{ ...member, photoUrl: editItem?.photoUrl || member.photoUrl, photoTransform: editItem?.photoTransform || member.photoTransform }}
                                  interactive={false} overlayOpacity={1.0}
                                />
                              </div>
                            </td>
                            <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                              {isPending ? (
                                <button
                                  onClick={() => handleApprove(selectedBatch.batchId, member.collegeRollNo)}
                                  style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '6px 12px', background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: '7px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                                >
                                  <Check style={{ width: 13, height: 13 }} /> Approve
                                </button>
                              ) : isConfirmed ? (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600, color: '#15803d' }}>
                                  <ShieldCheck style={{ width: 14, height: 14 }} /> Approved
                                </span>
                              ) : (
                                <span style={{ fontSize: '12px', color: '#94a3b8' }}>Awaiting Member</span>
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
