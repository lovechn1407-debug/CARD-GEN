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

  // Toggle see-through mode
  const handleToggleSeeThrough = () => {
    if (seeThrough) {
      setSeeThrough(false);
      setOverlayOpacity(1.0);
    } else {
      setSeeThrough(true);
      setOverlayOpacity(0.3); // Semi-transparent so photo is visible under overlay
    }
  };

  // Upload new photo to ImgBB
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const hostedUrl = await uploadToImgBB(file);
      setPhotoUrl(hostedUrl);
    } catch (err) {
      alert('Failed to upload image to ImgBB. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  // Save changes
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
      <div className="hero-card w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col my-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Modify Member ID Card</h3>
            <p className="text-xs text-slate-500">
              Adjust photo position, scale, and crop while preserving exact card overlays.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6 overflow-y-auto">
          {/* Left Canvas Preview Area */}
          <div className="md:col-span-6 flex flex-col items-center justify-center bg-slate-100 p-4 rounded-xl border border-slate-200">
            <div className="w-full max-w-[340px] shadow-2xl rounded-xl overflow-hidden">
              <IDCardCanvas
                member={{ ...member, photoUrl, photoTransform }}
                interactive={true}
                overlayOpacity={overlayOpacity}
                onTransformChange={setPhotoTransform}
              />
            </div>
            <p className="text-xs text-slate-500 mt-3 flex items-center gap-1.5">
              <Move className="w-3.5 h-3.5 text-blue-600" />
              <span>Drag directly on card canvas to move photo</span>
            </p>
          </div>

          {/* Right Controls Area */}
          <div className="md:col-span-6 flex flex-col justify-between space-y-6">
            <div className="space-y-5">
              {/* Member Details Readonly Badge */}
              <div className="p-3.5 bg-blue-50/50 border border-blue-100 rounded-lg">
                <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Target Member</div>
                <div className="font-bold text-slate-900 text-base font-bebas tracking-wide mt-0.5">{member?.name}</div>
                <div className="text-xs text-slate-600 font-poppins italic">{member?.designation}</div>
                <div className="text-xs text-slate-500 mt-1 font-mono">ID: {member?.collegeRollNo || member?.id}</div>
              </div>

              {/* See Through Overlay Toggle */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {seeThrough ? (
                      <EyeOff className="w-4 h-4 text-amber-600" />
                    ) : (
                      <Eye className="w-4 h-4 text-blue-600" />
                    )}
                    <span className="text-sm font-semibold text-slate-800">See Through Overlay</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleToggleSeeThrough}
                    className={`hero-btn hero-btn-xs text-xs py-1 px-3 ${
                      seeThrough ? 'hero-btn-primary bg-amber-600 hover:bg-amber-700' : 'hero-btn-secondary'
                    }`}
                  >
                    {seeThrough ? 'Overlay Transparent' : 'Show Overlay'}
                  </button>
                </div>
                <div>
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>Overlay Opacity</span>
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

              {/* Scale / Zoom Control */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <ZoomIn className="w-4 h-4 text-blue-600" /> Photo Zoom / Scale
                  </span>
                  <span>{photoTransform.scale.toFixed(2)}x</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() =>
                      setPhotoTransform((prev) => ({ ...prev, scale: Math.max(0.4, prev.scale - 0.05) }))
                    }
                    className="p-1.5 hero-btn-secondary rounded-md"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <input
                    type="range"
                    min="0.4"
                    max="2.5"
                    step="0.02"
                    value={photoTransform.scale}
                    onChange={(e) =>
                      setPhotoTransform((prev) => ({ ...prev, scale: parseFloat(e.target.value) }))
                    }
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <button
                    onClick={() =>
                      setPhotoTransform((prev) => ({ ...prev, scale: Math.min(2.5, prev.scale + 0.05) }))
                    }
                    className="p-1.5 hero-btn-secondary rounded-md"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Rotation Control */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <RotateCw className="w-4 h-4 text-blue-600" /> Photo Rotation
                  </span>
                  <span>{photoTransform.rotation || 0}°</span>
                </div>
                <input
                  type="range"
                  min="-45"
                  max="45"
                  step="1"
                  value={photoTransform.rotation || 0}
                  onChange={(e) =>
                    setPhotoTransform((prev) => ({ ...prev, rotation: parseInt(e.target.value) }))
                  }
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>

              {/* Replace Photo File Input */}
              <div className="pt-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Replace Member Photo (Auto-hosts on ImgBB)
                </label>
                <label className="flex items-center justify-center gap-2 w-full p-2.5 bg-white border border-dashed border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 transition">
                  <Upload className="w-4 h-4 text-slate-500" />
                  <span className="text-xs text-slate-600">
                    {isUploading ? 'Uploading to ImgBB...' : 'Choose new photo file'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={isUploading}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Actions Footer Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200 gap-3">
              <button
                onClick={() =>
                  setPhotoTransform({ x: 0, y: -20, scale: 1, rotation: 0 })
                }
                className="hero-btn hero-btn-secondary text-xs"
                title="Reset Position"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Reset
              </button>
              <div className="flex items-center gap-2">
                <button onClick={onClose} className="hero-btn hero-btn-secondary text-xs">
                  Cancel
                </button>
                <button onClick={handleSave} className="hero-btn hero-btn-primary text-xs">
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
