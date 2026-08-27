import React from 'react';
import { Users, Clock, Printer, ShieldCheck, UserCheck, Plus, FileSpreadsheet } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, onOpenAddModal, onOpenBulkModal }) {
  const tabs = [
    { id: 'members', label: 'All Members', icon: Users },
    { id: 'batches', label: 'Batch Edits & Links', icon: Clock },
    { id: 'export', label: 'Print & Export', icon: Printer },
    { id: 'verify', label: 'Public Verify Portal', icon: ShieldCheck },
    { id: 'edit-portal', label: 'Public Self-Edit', icon: UserCheck }
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-bebas text-white text-xl shadow-md tracking-wider">
              EC
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 text-lg tracking-tight">CARD-GEN</span>
                <span className="hero-badge hero-badge-blue text-[10px]">E-CELL V3</span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">I.T.S Engineering College</p>
            </div>
          </div>

          {/* Nav Tabs */}
          <nav className="hidden lg:flex items-center space-x-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2">
            <button onClick={onOpenAddModal} className="hero-btn hero-btn-primary text-xs py-1.5 px-3">
              <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Add Member</span>
            </button>
            <button onClick={onOpenBulkModal} className="hero-btn hero-btn-secondary text-xs py-1.5 px-3">
              <FileSpreadsheet className="w-4 h-4 text-green-600" /> <span className="hidden sm:inline">Bulk CSV</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Tabs Bar */}
        <div className="flex lg:hidden overflow-x-auto py-2 border-t border-slate-100 space-x-1 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 ${
                  isActive ? 'bg-blue-600 text-white' : 'text-slate-600 bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
