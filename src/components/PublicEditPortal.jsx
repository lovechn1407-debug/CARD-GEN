import React, { useState, useEffect } from 'react';
import IDCardCanvas from './IDCardCanvas';
import { getMembers, saveBatchEdit } from '../utils/storage';
import { uploadToImgBB } from '../utils/imgbb';
import { ShieldCheck, Search, Eye, EyeOff, ZoomIn, ZoomOut, Move, RotateCw, Upload, CheckCircle2, Lock, ArrowRight, RefreshCw } from 'lucide-react';

export default function PublicEditPortal() {
  const [batchId, setBatchId] = useState('');
  const [collegeRollNo, setCollegeRollNo] = useState('');
  const [authenticatedMember, setAuthenticatedMember] = useState(null);
  const [authError, setAuthError] = useState('');

  // Editor states
  const [photoTransform, setPhotoTransform] = useState({ x: 0, y: -20, scale: 1, rotation: 0 });
  const [photoUrl, setPhotoUrl] = useState('');
  const [overlayOpacity, setOverlayOpacity] = useState(1.0);
  const [seeThrough, setSeeThrough] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    // Extract ?batch=... parameter from hash URL or query params
    const hash = window.location.hash;
    const match = hash.match(/batch=([^&]+)/) || window.location.search.match(/batch=([^&]+)/);
    if (match && match[1]) {
      setBatchId(decodeURIComponent(match[1]));
    }
  }, []);

  // Handle Authentication submit
  const handleAuthSubmit = (e) => {
    e.preventDefault();
    setAuthError('');

    const members = getMembers();
    const found = members.find((m) => {
      const matchRoll = m.collegeRollNo?.toLowerCase() === collegeRollNo.trim().toLowerCase();
      const matchBatch = !batchId || m.batchId === batchId;
      return matchRoll && matchBatch;
    });

    if (found) {
      setAuthenticatedMember(found);
      setPhotoUrl(found.photoUrl || '');
      setPhotoTransform(found.photoTransform || { x: 0, y: -20, scale: 1, rotation: 0 });
    } else {
      setAuthError(`No member record found for Roll No "${collegeRollNo}" in this batch. Please verify your ID.`);
    }
  };

  // Toggle see-through overlay mode
  const handleToggleSeeThrough = () => {
    if (seeThrough) {
      setSeeThrough(false);
      setOverlayOpacity(1.0);
    } else {
      setSeeThrough(true);
      setOverlayOpacity(0.3);
    }
  };

  // Upload image to ImgBB
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const hostedUrl = await uploadToImgBB(file);
      setPhotoUrl(hostedUrl);
    } catch (err) {
      alert('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  // Confirm and save edit submission
  const handleSubmitEdits = () => {
    if (!authenticatedMember) return;

    saveBatchEdit({
      batchId: authenticatedMember.batchId || batchId || 'DEFAULT',
      collegeRollNo: authenticatedMember.collegeRollNo,
      memberId: authenticatedMember.id,
      photoUrl: photoUrl,
      photoTransform: photoTransform
    });

    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-4 sm:p-6">
      {/* Top E-Cell Public Header */}
      <header className="max-w-4xl mx-auto w-full flex items-center justify-between py-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-bebas text-white text-xl shadow-md">
            EC
          </div>
          <div>
            <h1 className="font-bold text-slate-900 text-base leading-tight">E-CELL Member Portal</h1>
            <p className="text-xs text-slate-500 font-poppins italic">Self-Service Card Photo Editor</p>
          </div>
        </div>
        <a href="#/" className="hero-btn hero-btn-secondary text-xs">
          Admin Portal
        </a>
      </header>

      {/* Main Body */}
      <main className="max-w-4xl mx-auto w-full my-auto py-8">
        {!authenticatedMember ? (
          /* Step 1: Roll No Authentication Form */
          <div className="hero-card max-w-md mx-auto p-8 space-y-6 shadow-xl">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto border border-blue-100">
                <Lock className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Member Verification</h2>
              <p className="text-xs text-slate-500">
                Enter your College Roll No to access your ID Card photo editor.
              </p>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  College Roll No / Student ID
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. 2100290130085"
                    value={collegeRollNo}
                    onChange={(e) => setCollegeRollNo(e.target.value)}
                    className="hero-input pl-9"
                  />
                </div>
              </div>

              {authError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg font-medium">
                  {authError}
                </div>
              )}

              <button type="submit" className="hero-btn hero-btn-primary w-full justify-center">
                Verify ID & Load Card <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        ) : isSubmitted ? (
          /* Step 3: Success Submitted Screen */
          <div className="hero-card max-w-md mx-auto p-8 text-center space-y-4 shadow-xl">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
            <h2 className="text-xl font-bold text-slate-900">Card Photo Edits Submitted!</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Thank you, <strong className="font-bebas text-sm text-slate-900">{authenticatedMember.name}</strong>! Your updated photo positioning has been recorded and submitted for final admin review.
            </p>
            <div className="pt-4 border-t border-slate-200">
              <button
                onClick={() => {
                  setIsSubmitted(false);
                  setAuthenticatedMember(null);
                  setCollegeRollNo('');
                }}
                className="hero-btn hero-btn-secondary text-xs"
              >
                Edit Another Card
              </button>
            </div>
          </div>
        ) : (
          /* Step 2: Member Photo Adjuster Studio */
          <div className="hero-card p-6 md:p-8 space-y-6 shadow-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <span className="hero-badge hero-badge-green text-xs font-mono mb-1">
                  Verified Roll No: {authenticatedMember.collegeRollNo}
                </span>
                <h2 className="text-2xl font-bold text-slate-900 font-bebas tracking-wide">
                  {authenticatedMember.name}
                </h2>
                <p className="text-xs text-slate-500 font-poppins italic">
                  {authenticatedMember.designation}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleToggleSeeThrough}
                  className={`hero-btn hero-btn-xs text-xs py-1.5 px-3 ${
                    seeThrough ? 'hero-btn-primary bg-amber-600 hover:bg-amber-700' : 'hero-btn-secondary'
                  }`}
                >
                  {seeThrough ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  {seeThrough ? 'Overlay Transparent' : 'See Through Overlay'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              {/* Card Canvas */}
              <div className="md:col-span-6 flex flex-col items-center justify-center bg-slate-100 p-4 rounded-xl border border-slate-200">
                <div className="w-full max-w-[340px] shadow-2xl rounded-xl overflow-hidden">
                  <IDCardCanvas
                    member={{ ...authenticatedMember, photoUrl, photoTransform }}
                    interactive={true}
                    overlayOpacity={overlayOpacity}
                    onTransformChange={setPhotoTransform}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-3 flex items-center gap-1.5">
                  <Move className="w-3.5 h-3.5 text-blue-600" />
                  <span>Touch or drag photo on card canvas to move</span>
                </p>
              </div>

              {/* Controls */}
              <div className="md:col-span-6 flex flex-col justify-between space-y-6">
                <div className="space-y-5">
                  {/* Overlay Opacity Slider */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex justify-between text-xs text-slate-700 font-semibold">
                      <span>See Through Opacity</span>
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

                  {/* Zoom Slider */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                      <span className="flex items-center gap-1.5">
                        <ZoomIn className="w-4 h-4 text-blue-600" /> Zoom & Scale
                      </span>
                      <span>{photoTransform.scale.toFixed(2)}x</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() =>
                          setPhotoTransform((prev) => ({ ...prev, scale: Math.max(0.4, prev.scale - 0.05) }))
                        }
                        className="p-1.5 hero-btn-secondary rounded-md"
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
                      >
                        <ZoomIn className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Rotation */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                      <span className="flex items-center gap-1.5">
                        <RotateCw className="w-4 h-4 text-blue-600" /> Rotate Angle
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

                  {/* Upload new photo */}
                  <div className="pt-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Upload New Photo (Auto ImgBB Host)
                    </label>
                    <label className="flex items-center justify-center gap-2 p-3 bg-white border border-dashed border-slate-300 rounded-xl cursor-pointer hover:bg-slate-50 transition">
                      <Upload className="w-4 h-4 text-slate-500" />
                      <span className="text-xs text-slate-600">
                        {isUploading ? 'Uploading Image...' : 'Select File'}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={isUploading}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-200 gap-3">
                  <button
                    onClick={() => setPhotoTransform({ x: 0, y: -20, scale: 1, rotation: 0 })}
                    className="hero-btn hero-btn-secondary text-xs"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Reset
                  </button>
                  <button onClick={handleSubmitEdits} className="hero-btn hero-btn-primary text-xs">
                    <ShieldCheck className="w-4 h-4" /> Confirm & Submit Photo
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="text-center py-4 text-xs text-slate-400">
        © 2026 E-CELL I.T.S Engineering College • All Rights Reserved
      </footer>
    </div>
  );
}
