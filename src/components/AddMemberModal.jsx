import React, { useState } from 'react';
import { uploadToImgBB } from '../utils/imgbb';
import { X, Upload, Check, UserPlus, Image as ImageIcon } from 'lucide-react';

export default function AddMemberModal({ onClose, onAddMember }) {
  const [formData, setFormData] = useState({
    collegeRollNo: '',
    name: '',
    designation: '',
    validTill: '2026-08-31',
    phone: '',
    bloodGroup: 'O+',
    photoUrl: 'https://i.imgur.com/8Q9Z5b4.png'
  });

  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const hostedUrl = await uploadToImgBB(file);
      setFormData((prev) => ({ ...prev, photoUrl: hostedUrl }));
    } catch (err) {
      alert('Failed to upload image to ImgBB. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.collegeRollNo) {
      alert('Please enter Name and College Roll No / ID');
      return;
    }

    const newMember = {
      id: `ECELL-${Date.now().toString().slice(-6)}`,
      ...formData,
      batchId: 'BATCH-MANUAL',
      photoTransform: { x: 0, y: -20, scale: 1, rotation: 0 },
      createdAt: new Date().toISOString()
    };

    onAddMember(newMember);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="hero-card w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col my-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-bold text-slate-900">Add New Member (Manual)</h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                College Roll No / Member ID *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 2100290130085"
                value={formData.collegeRollNo}
                onChange={(e) => setFormData({ ...formData, collegeRollNo: e.target.value })}
                className="hero-input"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Member Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. LOVE CHAUHAN"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="hero-input font-bebas uppercase text-base"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Designation *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Creative Designing"
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                className="hero-input font-poppins italic"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Valid Till Date
              </label>
              <input
                type="date"
                value={formData.validTill}
                onChange={(e) => setFormData({ ...formData, validTill: e.target.value })}
                className="hero-input"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                placeholder="e.g. +91 9876543210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="hero-input"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Blood Group
              </label>
              <select
                value={formData.bloodGroup}
                onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                className="hero-input"
              >
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>
          </div>

          {/* ImgBB Image Upload */}
          <div className="pt-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Member Photo (Uploaded directly to ImgBB)
            </label>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl border border-slate-200 overflow-hidden bg-slate-100 flex items-center justify-center shrink-0">
                {formData.photoUrl ? (
                  <img src={formData.photoUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-6 h-6 text-slate-400" />
                )}
              </div>
              <label className="flex-1 flex items-center justify-center gap-2 p-3 border border-dashed border-slate-300 rounded-xl cursor-pointer hover:bg-slate-50 transition">
                <Upload className="w-4 h-4 text-slate-500" />
                <span className="text-xs font-medium text-slate-600">
                  {isUploading ? 'Uploading to ImgBB...' : 'Choose Profile Image'}
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

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button type="button" onClick={onClose} className="hero-btn hero-btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={isUploading} className="hero-btn hero-btn-primary">
              <Check className="w-4 h-4" /> Confirm & Add Member
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
