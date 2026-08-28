import React, { useState } from 'react';
import Papa from 'papaparse';
import { uploadToImgBB } from '../utils/imgbb';
import { getCardTemplates } from '../utils/storage';
import { X, FileSpreadsheet, Upload, Check, Sparkles, Download, CreditCard } from 'lucide-react';

const inp = { width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', color: '#0f172a', background: '#fff', outline: 'none', boxSizing: 'border-box' };
const lbl = { display: 'block', fontSize: '11px', fontWeight: 700, color: '#334155', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.4px' };

export default function BulkCsvModal({ onClose, onImportSuccess }) {
  const cardTemplates = getCardTemplates();
  const [csvFile, setCsvFile] = useState(null);
  const [parsedRows, setParsedRows] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [batchName, setBatchName] = useState(`Batch ${new Date().toLocaleDateString('en-GB')}`);
  const [selectedCardId, setSelectedCardId] = useState('default');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');
  const [mappings, setMappings] = useState({
    collegeRollNo: '', name: '', designation: '',
    cardId: '', year: '', branch: '', section: '', email: '',
    validTill: '', phone: '', bloodGroup: '', photoUrl: ''
  });
  const [imageFiles, setImageFiles] = useState([]);

  const handleDownloadSampleCsv = () => {
    const csvContent = "CollegeRollNo,Name,Designation,CardType,Year,Branch,Section,Email,ValidTill,Phone,BloodGroup,PhotoUrl\n" +
      "2100290130085,LOVE CHAUHAN,Creative Designing,default,3rd Year,CSE,A,love.chauhan@ecell.in,2026-08-31,9876543210,O+,https://i.imgur.com/8Q9Z5b4.png\n" +
      "2100290130086,AARAV SHARMA,Technical Lead,volunteer,4th Year,ECE,B,aarav.sharma@ecell.in,2026-08-31,9876543211,A+,\n" +
      "2100290130087,ANANYA VERMA,Event Manager,event,2nd Year,IT,C,ananya.verma@ecell.in,2026-08-31,9876543212,B+,";

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'ecell_members_full_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCsvChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvFile(file);
    Papa.parse(file, {
      header: true, skipEmptyLines: true,
      complete: (results) => {
        if (results.data?.length > 0) {
          setParsedRows(results.data);
          const fields = results.meta.fields || [];
          setHeaders(fields);
          const autoMap = { ...mappings };
          fields.forEach((field) => {
            const lower = field.toLowerCase();
            if (lower.includes('roll') || lower.includes('id')) autoMap.collegeRollNo = field;
            else if (lower.includes('name')) autoMap.name = field;
            else if (lower.includes('designation') || lower.includes('role')) autoMap.designation = field;
            else if (lower.includes('card') || lower.includes('template') || lower.includes('type')) autoMap.cardId = field;
            else if (lower.includes('year')) autoMap.year = field;
            else if (lower.includes('branch') || lower.includes('dept')) autoMap.branch = field;
            else if (lower.includes('sec')) autoMap.section = field;
            else if (lower.includes('email') || lower.includes('mail')) autoMap.email = field;
            else if (lower.includes('valid') || lower.includes('date')) autoMap.validTill = field;
            else if (lower.includes('phone') || lower.includes('mobile')) autoMap.phone = field;
            else if (lower.includes('blood')) autoMap.bloodGroup = field;
            else if (lower.includes('photo') || lower.includes('image') || lower.includes('url')) autoMap.photoUrl = field;
          });
          setMappings(autoMap);
        }
      }
    });
  };

  const handleProcessImport = async () => {
    if (!parsedRows.length) return;
    setIsProcessing(true);
    const batchId = `BATCH-CSV-${Date.now()}`;
    const importedMembers = [];
    for (let i = 0; i < parsedRows.length; i++) {
      const row = parsedRows[i];
      const rollNo = (row[mappings.collegeRollNo] || `ROLL-${i + 1}`).toString().trim();
      const name = (row[mappings.name] || 'MEMBER').toString().trim();
      const desig = (row[mappings.designation] || 'E-Cell Team').toString().trim();
      const cardId = (row[mappings.cardId] || selectedCardId || 'default').toString().trim();
      const year = (row[mappings.year] || '3rd Year').toString().trim();
      const branch = (row[mappings.branch] || 'CSE').toString().trim();
      const section = (row[mappings.section] || 'A').toString().trim();
      const email = (row[mappings.email] || '').toString().trim();
      let photoUrl = row[mappings.photoUrl] || '';

      setProgressMsg(`Processing ${i + 1}/${parsedRows.length}: ${name}`);
      const matchedFile = imageFiles.find((f) => {
        const fname = f.name.toLowerCase();
        return fname.includes(rollNo.toLowerCase()) || fname.includes(name.toLowerCase());
      });
      if (matchedFile) {
        try { photoUrl = await uploadToImgBB(matchedFile); } catch (e) {}
      }
      if (!photoUrl) photoUrl = '';

      importedMembers.push({
        id: `ECELL-${Date.now()}-${i}`,
        collegeRollNo: rollNo,
        name,
        designation: desig,
        cardId: cardTemplates[cardId] ? cardId : (selectedCardId || 'default'),
        year,
        branch,
        section,
        email,
        validTill: row[mappings.validTill] || '2026-08-31',
        phone: row[mappings.phone] || '',
        bloodGroup: row[mappings.bloodGroup] || 'O+',
        photoUrl,
        batchId,
        photoTransform: { x: 0, y: -20, scale: 1, rotation: 0 },
        createdAt: new Date().toISOString()
      });
    }
    setIsProcessing(false);
    onImportSuccess(importedMembers, { batchId, name: batchName, createdAt: new Date().toISOString(), memberCount: importedMembers.length, isPublic: true, publicToken: `token-${Math.random().toString(36).substring(2, 9)}` });
    onClose();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', background: 'rgba(15,23,42,0.65)', overflowY: 'auto' }}>
      <div style={{ background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '680px', boxShadow: '0 25px 50px rgba(0,0,0,0.25)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileSpreadsheet style={{ width: 18, height: 18, color: '#16a34a' }} />
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', margin: 0 }}>Bulk CSV Member Entry</h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#94a3b8' }}>
            <X style={{ width: 18, height: 18 }} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto', maxHeight: '80vh' }}>
          
          {/* Template Download Banner */}
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#14532d', margin: 0 }}>Need a formatted CSV template?</h4>
              <p style={{ fontSize: '11px', color: '#15803d', margin: '2px 0 0' }}>Includes headers: Roll No, Name, Role, Year, Branch, Section, Email, etc.</p>
            </div>
            <button
              type="button"
              onClick={handleDownloadSampleCsv}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 6px rgba(22,163,74,0.25)', whiteSpace: 'nowrap' }}
            >
              <Download style={{ width: 14, height: 14 }} /> Download CSV Template
            </button>
          </div>

          {/* Step 1 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={lbl}>Batch Name</label>
              <input type="text" value={batchName} onChange={(e) => setBatchName(e.target.value)} style={inp} placeholder="e.g. Core Team Batch 2026" />
            </div>
            <div>
              <label style={lbl}>Upload CSV File</label>
              <input type="file" accept=".csv" onChange={handleCsvChange} style={inp} />
            </div>
          </div>

          {/* Select Card Template for CSV Import */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 14px' }}>
            <label style={{ ...lbl, color: '#1d4ed8', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CreditCard style={{ width: 14, height: 14 }} /> Target Card Design / Template for Bulk Import *
            </label>
            <select
              value={selectedCardId}
              onChange={(e) => setSelectedCardId(e.target.value)}
              style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', color: '#0f172a', background: '#fff', fontWeight: 600, outline: 'none' }}
            >
              {Object.values(cardTemplates).map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name} ({template.id})
                </option>
              ))}
            </select>
            <p style={{ fontSize: '11px', color: '#64748b', margin: '4px 0 0' }}>
              All imported members in this CSV batch will be assigned to this card template (or mapped individually from CSV if a CardType column is present).
            </p>
          </div>

          {/* Optional batch photos */}
          <div>
            <label style={lbl}>Batch Photos (Optional — name files with Roll No or Name)</label>
            <input type="file" multiple accept="image/*" onChange={(e) => setImageFiles(Array.from(e.target.files))} style={inp} />
            {imageFiles.length > 0 && (
              <p style={{ fontSize: '12px', color: '#16a34a', fontWeight: 500, marginTop: '4px' }}>
                ✓ {imageFiles.length} photo files selected for auto-mapping & ImgBB hosting
              </p>
            )}
          </div>

          {/* Column Mapper */}
          {headers.length > 0 && (
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h4 style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px', color: '#334155', margin: 0 }}>
                  <Sparkles style={{ width: 14, height: 14, color: '#1d4ed8' }} /> Map CSV Columns
                </h4>
                <span style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', borderRadius: '20px', fontSize: '11px', fontWeight: 700, padding: '2px 8px' }}>{parsedRows.length} Rows</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                {[
                  { key: 'collegeRollNo', label: 'ID / Roll No *' },
                  { key: 'name', label: 'Full Name *' },
                  { key: 'designation', label: 'Designation *' },
                  { key: 'cardId', label: 'Card Template / Type' },
                  { key: 'year', label: 'Year' },
                  { key: 'branch', label: 'Branch' },
                  { key: 'section', label: 'Section' },
                  { key: 'email', label: 'Email ID' },
                  { key: 'validTill', label: 'Valid Till' },
                  { key: 'phone', label: 'Phone' },
                  { key: 'bloodGroup', label: 'Blood Group' },
                  { key: 'photoUrl', label: 'Photo URL' }
                ].map((field) => (
                  <div key={field.key}>
                    <label style={{ ...lbl, fontSize: '10px' }}>{field.label}</label>
                    <select value={mappings[field.key]} onChange={(e) => setMappings({ ...mappings, [field.key]: e.target.value })}
                      style={{ ...inp, fontSize: '12px', padding: '6px 8px' }}>
                      <option value="">-- Ignore --</option>
                      {headers.map((h) => <option key={h} value={h}>{h}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Progress */}
          {isProcessing && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px' }}>
              <div style={{ width: 16, height: 16, border: '2px solid #1d4ed8', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', flexShrink: 0 }} />
              <p style={{ fontSize: '12px', color: '#1e40af', fontWeight: 500, margin: 0 }}>{progressMsg}</p>
            </div>
          )}

          {/* Footer */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
            <button onClick={onClose} style={{ padding: '9px 18px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
              Cancel
            </button>
            <button onClick={handleProcessImport} disabled={!parsedRows.length || isProcessing}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '9px 18px', background: parsedRows.length && !isProcessing ? '#1d4ed8' : '#cbd5e1', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: parsedRows.length && !isProcessing ? 'pointer' : 'not-allowed' }}>
              <Check style={{ width: 15, height: 15 }} /> Process & Import ({parsedRows.length} Cards)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
