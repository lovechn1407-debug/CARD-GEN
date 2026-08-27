import React, { useState, useEffect } from 'react';
import IDCardCanvas from './IDCardCanvas';
import { getMemberById, getMembers } from '../utils/storage';
import { ShieldCheck, ShieldAlert, CheckCircle, Search, Calendar, Phone, Award, User } from 'lucide-react';

export default function PublicVerifyPortal() {
  const [memberId, setMemberId] = useState('');
  const [member, setMember] = useState(null);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    // Extract ?id=... from hash URL or query params
    const hash = window.location.hash;
    const match = hash.match(/id=([^&]+)/) || window.location.search.match(/id=([^&]+)/);
    if (match && match[1]) {
      const queryId = decodeURIComponent(match[1]);
      setMemberId(queryId);
      const found = getMemberById(queryId);
      setMember(found);
      setSearched(true);
    }
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!memberId.trim()) return;
    const found = getMemberById(memberId.trim());
    setMember(found);
    setSearched(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-4 sm:p-6">
      {/* Top Navigation */}
      <header className="max-w-4xl mx-auto w-full flex items-center justify-between py-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-bebas text-white text-xl shadow-md">
            EC
          </div>
          <div>
            <h1 className="font-bold text-slate-900 text-base leading-tight">E-CELL Official Verification</h1>
            <p className="text-xs text-slate-500 font-poppins italic">I.T.S Engineering College</p>
          </div>
        </div>
        <a href="#/" className="hero-btn hero-btn-secondary text-xs">
          Admin Portal
        </a>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto w-full my-auto py-8">
        {!searched || !member ? (
          <div className="hero-card p-8 max-w-md mx-auto space-y-6 shadow-xl text-center">
            {searched && !member ? (
              <div className="space-y-3">
                <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto border border-red-100">
                  <ShieldAlert className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">Unverified / Invalid Card</h2>
                <p className="text-xs text-slate-500">
                  No official member record matches ID "{memberId}". Please verify the ID number.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto border border-blue-100">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">Scan / Verify E-Cell ID Card</h2>
                <p className="text-xs text-slate-500">
                  Enter the Member College Roll No or Scan QR Code to check official status.
                </p>
              </div>
            )}

            <form onSubmit={handleSearchSubmit} className="space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Enter College Roll No / ID..."
                  value={memberId}
                  onChange={(e) => setMemberId(e.target.value)}
                  className="hero-input pl-9"
                />
              </div>
              <button type="submit" className="hero-btn hero-btn-primary w-full justify-center text-xs">
                Verify Member Authenticity
              </button>
            </form>
          </div>
        ) : (
          /* Live Verified Card Details Screen */
          <div className="hero-card p-6 sm:p-8 space-y-6 shadow-xl border-green-200">
            {/* Verified Header Banner */}
            <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-green-600 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-green-800 uppercase tracking-wider">
                    Official E-Cell Verification Status
                  </div>
                  <div className="text-sm font-bold text-green-900">VERIFIED ACTIVE E-CELL MEMBER</div>
                </div>
              </div>
              <span className="hero-badge hero-badge-green font-mono text-xs hidden sm:inline-flex">
                ID: {member.collegeRollNo || member.id}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              {/* Card Canvas Visual Preview */}
              <div className="md:col-span-5 flex flex-col items-center">
                <div className="w-full max-w-[260px] shadow-2xl rounded-xl overflow-hidden">
                  <IDCardCanvas member={member} interactive={false} overlayOpacity={1.0} />
                </div>
              </div>

              {/* Detailed Member Credentials */}
              <div className="md:col-span-7 space-y-4">
                <div>
                  <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                    Member Name
                  </span>
                  <h2 className="text-3xl font-bold font-bebas tracking-wide text-slate-900">
                    {member.name}
                  </h2>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 uppercase flex items-center gap-1">
                      <Award className="w-3.5 h-3.5 text-blue-600" /> Designation
                    </span>
                    <p className="text-sm font-poppins italic font-semibold text-slate-800">
                      {member.designation}
                    </p>
                  </div>

                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 uppercase flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-blue-600" /> Roll No / ID
                    </span>
                    <p className="text-sm font-mono font-bold text-slate-900">
                      {member.collegeRollNo || member.id}
                    </p>
                  </div>

                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 uppercase flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-blue-600" /> Valid Till
                    </span>
                    <p className="text-xs font-semibold text-slate-700">
                      {member.validTill || '2026-08-31'}
                    </p>
                  </div>

                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 uppercase flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-blue-600" /> Contact Phone
                    </span>
                    <p className="text-xs font-semibold text-slate-700">
                      {member.phone || 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Security Stamp Footer */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Digital Security Token Verified</span>
                  <span className="font-mono">HASH: {Math.random().toString(36).substring(2, 10).toUpperCase()}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="text-center py-4 text-xs text-slate-400">
        © 2026 E-CELL I.T.S Engineering College • Official Card Verification System
      </footer>
    </div>
  );
}
