import React, { useState } from 'react';
import Papa from 'papaparse';
import { uploadToImgBB } from '../utils/imgbb';
import { X, FileSpreadsheet, Upload, Check, AlertCircle, Sparkles } from 'lucide-react';

export default function BulkCsvModal({ onClose, onImportSuccess }) {
  const [csvFile, setCsvFile] = useState(null);
  const [parsedRows, setParsedRows] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [batchName, setBatchName] = useState(`Batch ${new Date().toLocaleDateString('en-GB')}`);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');

  // Column Mappings
  const [mappings, setMappings] = useState({
    collegeRollNo: '',
    name: '',
    designation: '',
    validTill: '',
    phone: '',
    bloodGroup: '',
    photoUrl: ''
  });

  // Batch Image Files (optional ZIP/multiple images mapped by roll no)
  const [imageFiles, setImageFiles] = useState([]);

  // Handle CSV file upload & parsing
  const handleCsvChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvFile(file);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.data && results.data.length > 0) {
          setParsedRows(results.data);
          const fields = results.meta.fields || [];
          setHeaders(fields);

          // Auto-detect column mapping matches
          const autoMap = { ...mappings };
          fields.forEach((field) => {
            const lower = field.toLowerCase();
            if (lower.includes('roll') || lower.includes('id')) autoMap.collegeRollNo = field;
            else if (lower.includes('name')) autoMap.name = field;
            else if (lower.includes('designation') || lower.includes('role')) autoMap.designation = field;
            else if (lower.includes('valid') || lower.includes('date')) autoMap.validTill = field;
            else if (lower.includes('phone') || lower.includes('mobile') || lower.includes('contact')) autoMap.phone = field;
            else if (lower.includes('blood')) autoMap.bloodGroup = field;
            else if (lower.includes('photo') || lower.includes('image') || lower.includes('url')) autoMap.photoUrl = field;
          });
          setMappings(autoMap);
        }
      }
    });
  };

  const handleBatchImageUpload = (e) => {
    if (e.target.files) {
      setImageFiles(Array.from(e.target.files));
    }
  };

  // Perform Bulk Import & ImgBB Upload Processing
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
      const valid = row[mappings.validTill] || '2026-08-31';
      const phone = row[mappings.phone] || '';
      const blood = row[mappings.bloodGroup] || 'O+';
      let photoUrl = row[mappings.photoUrl] || '';

      setProgressMsg(`Processing record ${i + 1} of ${parsedRows.length}: ${name}`);

      // Check if user uploaded a matching batch image file (file name contains rollNo or member name)
      const matchedFile = imageFiles.find((f) => {
        const fname = f.name.toLowerCase();
        return fname.includes(rollNo.toLowerCase()) || fname.includes(name.toLowerCase());
      });

      if (matchedFile) {
        try {
          setProgressMsg(`Uploading photo for ${name} to ImgBB...`);
          photoUrl = await uploadToImgBB(matchedFile);
        } catch (e) {
          console.warn(`Failed to upload photo for ${name}`, e);
        }
      } else if (photoUrl && photoUrl.startsWith('data:')) {
        try {
          photoUrl = await uploadToImgBB(photoUrl);
        } catch (e) {}
      }

      if (!photoUrl) {
        photoUrl = 'https://i.imgur.com/8Q9Z5b4.png';
      }

      importedMembers.push({
        id: `ECELL-${Date.now()}-${i}`,
        collegeRollNo: rollNo,
        name: name,
        designation: desig,
        validTill: valid,
        phone: phone,
        bloodGroup: blood,
        photoUrl: photoUrl,
        batchId: batchId,
        photoTransform: { x: 0, y: -20, scale: 1, rotation: 0 },
        createdAt: new Date().toISOString()
      });
    }

    setIsProcessing(false);
    onImportSuccess(importedMembers, {
      batchId,
      name: batchName,
      createdAt: new Date().toISOString(),
      memberCount: importedMembers.length,
      memberIds: importedMembers.map((m) => m.collegeRollNo),
      isPublic: true,
      publicToken: `token-${Math.random().toString(36).substring(2, 9)}`
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="hero-card w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col my-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-bold text-slate-900">Bulk CSV Member Entry</h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Step 1: Upload CSV & Batch Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Batch Identifier Name</label>
              <input
                type="text"
                value={batchName}
                onChange={(e) => setBatchName(e.target.value)}
                className="hero-input"
                placeholder="e.g. Core Team Batch 2026"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Upload CSV File</label>
              <input
                type="file"
                accept=".csv"
                onChange={handleCsvChange}
                className="hero-input text-xs"
              />
            </div>
          </div>

          {/* Optional: Batch Images Drag Drop */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Upload Batch Photos (Optional - Name files with Roll No or Name)
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleBatchImageUpload}
              className="hero-input text-xs"
            />
            {imageFiles.length > 0 && (
              <p className="text-xs text-blue-600 font-medium mt-1">
                ✓ {imageFiles.length} photo files selected for automatic mapping & ImgBB hosting
              </p>
            )}
          </div>

          {/* Step 2: Interactive CSV Column Mapper */}
          {headers.length > 0 && (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-blue-600" /> Map CSV Columns to ID Card Fields
                </h4>
                <span className="hero-badge hero-badge-blue">{parsedRows.length} Rows Detected</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { key: 'collegeRollNo', label: 'ID / Roll No *' },
                  { key: 'name', label: 'Full Name *' },
                  { key: 'designation', label: 'Designation *' },
                  { key: 'validTill', label: 'Valid Till Date' },
                  { key: 'phone', label: 'Phone Number' },
                  { key: 'bloodGroup', label: 'Blood Group' },
                  { key: 'photoUrl', label: 'Photo URL Column' }
                ].map((field) => (
                  <div key={field.key}>
                    <label className="block text-xs font-medium text-slate-600 mb-1">{field.label}</label>
                    <select
                      value={mappings[field.key]}
                      onChange={(e) => setMappings({ ...mappings, [field.key]: e.target.value })}
                      className="hero-input text-xs py-1.5"
                    >
                      <option value="">-- Ignore / Default --</option>
                      {headers.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}

          {isProcessing && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin shrink-0" />
              <p className="text-xs font-medium text-blue-700">{progressMsg}</p>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button onClick={onClose} className="hero-btn hero-btn-secondary">
              Cancel
            </button>
            <button
              onClick={handleProcessImport}
              disabled={!parsedRows.length || isProcessing}
              className="hero-btn hero-btn-primary"
            >
              <Check className="w-4 h-4" /> Process & Import Batch ({parsedRows.length} Cards)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
