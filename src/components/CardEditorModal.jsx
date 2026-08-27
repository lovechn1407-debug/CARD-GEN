import React, { useState } from 'react';
import IDCardCanvas from './IDCardCanvas';
import { uploadToImgBB } from '../utils/imgbb';
import { X, ZoomIn, ZoomOut, Move, RotateCw, Eye, EyeOff, Upload, Check, RefreshCw } from 'lucide-react';

export default function CardEditorModal({ member, onClose, onSave }) {
  const [photoTransform, setPhotoTransform] = useState(
    member?.photoTransform || { x: 0, y: -20, scale: 1, rotation: 0 }
  );
  const [photoUrl, setPhotoUrl] = useState(member?.photoUrl || '');
  const [overlayOpacity, setOverlayOpacity] = useState(1.0);
  const [seeThrough, setSeeThrough] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleToggleSeeThrough = () => {
    if (seeThrough) {
      setSeeThrough(false);
      setOverlayOpacity(1.0);
    } else {
      setSeeThrough(true);
      setOverlayOpacity(0.3);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const hostedUrl = await uploadToImgBB(file);
      setPhotoUrl(hostedUrl);
    } catch (err) {
      alert('Failed to upload image to ImgBB.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = () => {
    onSave({
      ...member,
      photoUrl,
      photoTransform
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="hero-card w-full max-w-4xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 bg-slate-50 shrink-0">
          <div>
            <h3 className="text-base font-bold text-slate-900">Modify Member ID Card</h3>
            <p className="text-xs text-slate-500">
              Drag photo directly on canvas to reposition, or adjust scale and crop on the right.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body: Left Canvas (Compact Max Width 260px) & Right Controls */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-5 overflow-y-auto">
          {/* Left Canvas Preview */}
          <div className="md:col-span-5 flex flex-col items-center justify-center bg-slate-100 p-3 rounded-xl border border-slate-200">
            <div className="w-full max-w-[260px] shadow-xl rounded-xl overflow-hidden bg-slate-900">
              <IDCardCanvas
                member={{ ...member, photoUrl, photoTransform }}
                interactive={true}
                overlayOpacity={overlayOpacity}
                onTransformChange={setPhotoTransform}
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-2 flex items-center gap-1">
              <Move className="w-3 h-3 text-blue-600" />
              <span>Drag photo on card to move position</span>
            </p>
          </div>

          {/* Right Controls Area */}
          <div className="md:col-span-7 flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              {/* Target Member Meta */}
              <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-lg flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900 font-bebas text-lg leading-tight">{member?.name}</div>
                  <div className="text-xs text-slate-600 font-poppins italic">{member?.designation}</div>
                </div>
                <span className="hero-badge hero-badge-blue text-[10px]">ID: {member?.collegeRollNo || member?.id}</span>
              </div>

              {/* See Through Overlay Toggle */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {seeThrough ? <EyeOff className="w-4 h-4 text-amber-600" /> : <Eye className="w-4 h-4 text-blue-600" />}
                    <span className="text-xs font-semibold text-slate-800">See Through Overlay</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleToggleSeeThrough}
                    className={`hero-btn text-[11px] py-1 px-2.5 ${
                      seeThrough ? 'hero-btn-primary bg-amber-600 hover:bg-amber-700' : 'hero-btn-secondary'
                    }`}
                  >
                    {seeThrough ? 'Overlay Transparent' : 'Show Overlay'}
                  </button>
                </div>
                <div>
                  <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                    <span>Overlay Transparency</span>
                    <span>{Math.round(overlayOpacity * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.05"
                    value={overlayOpacity}
                    onChange={(e) => setOverlayOpacity(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>
              </div>

              {/* Zoom & Scale */}
              <div className="space-y-1 text-xs">
                <div className="flex items-center justify-between font-medium text-slate-700">
                  <span className="flex items-center gap-1">
                    <ZoomIn className="w-3.5 h-3.5 text-blue-600" /> Photo Zoom / Scale
                  </span>
                  <span>{photoTransform.scale.toFixed(2)}x</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPhotoTransform((prev) => ({ ...prev, scale: Math.max(0.4, prev.scale - 0.05) }))}
                    className="p-1 hero-btn-secondary rounded-md"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <input
                    type="range"
                    min="0.4"
                    max="2.5"
                    step="0.02"
                    value={photoTransform.scale}
                    onChange={(e) => setPhotoTransform((prev) => ({ ...prev, scale: parseFloat(e.target.value) }))}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <button
                    onClick={() => setPhotoTransform((prev) => ({ ...prev, scale: Math.min(2.5, prev.scale + 0.05) }))}
                    className="p-1 hero-btn-secondary rounded-md"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Rotation */}
              <div className="space-y-1 text-xs">
                <div className="flex items-center justify-between font-medium text-slate-700">
                  <span className="flex items-center gap-1">
                    <RotateCw className="w-3.5 h-3.5 text-blue-600" /> Rotation
                  </span>
                  <span>{photoTransform.rotation || 0}°</span>
                </div>
                <input
                  type="range"
                  min="-45"
                  max="45"
                  step="1"
                  value={photoTransform.rotation || 0}
                  onChange={(e) => setPhotoTransform((prev) => ({ ...prev, rotation: parseInt(e.target.value) }))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>

              {/* Upload photo */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Replace Photo (Auto ImgBB Host)
                </label>
                <label className="flex items-center justify-center gap-2 p-2 bg-white border border-dashed border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 transition">
                  <Upload className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-xs text-slate-600">
                    {isUploading ? 'Uploading...' : 'Choose image'}
                  </span>
                  <input type="file" accept="image/*" onChange={handleFileChange} disabled={isUploading} className="hidden" />
                </label>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-200 gap-2">
              <button
                onClick={() => setPhotoTransform({ x: 0, y: -20, scale: 1, rotation: 0 })}
                className="hero-btn hero-btn-secondary text-xs py-1.5 px-3"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Reset
              </button>
              <div className="flex items-center gap-2">
                <button onClick={onClose} className="hero-btn hero-btn-secondary text-xs py-1.5 px-3">
                  Cancel
                </button>
                <button onClick={handleSave} className="hero-btn hero-btn-primary text-xs py-1.5 px-3">
                  <Check className="w-4 h-4" /> Save Card Edits
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
