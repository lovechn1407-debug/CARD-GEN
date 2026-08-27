import React, { useState } from 'react';
import IDCardCanvas from './IDCardCanvas';
import { getTemplateConfig, saveTemplateConfig, DEFAULT_TEMPLATE_CONFIG } from '../utils/storage';
import { Sliders, Type, Layers, Eye, EyeOff, Save, RotateCcw, Check } from 'lucide-react';

export default function AdminTemplateStudio({ members, onConfigSaved }) {
  const [config, setConfig] = useState(getTemplateConfig());
  const [selectedMemberIndex, setSelectedMemberIndex] = useState(0);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const sampleMember = members[selectedMemberIndex] || members[0] || {
    name: 'LOVE CHAUHAN',
    designation: 'Creative Designing',
    photoUrl: 'https://i.imgur.com/8Q9Z5b4.png',
    photoTransform: { x: 0, y: -20, scale: 1.05, rotation: 0 }
  };

  const handleSave = () => {
    saveTemplateConfig(config);
    setSavedSuccess(true);
    if (onConfigSaved) onConfigSaved(config);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleReset = () => {
    if (confirm('Reset card design layout to original default settings?')) {
      setConfig(DEFAULT_TEMPLATE_CONFIG);
      saveTemplateConfig(DEFAULT_TEMPLATE_CONFIG);
      if (onConfigSaved) onConfigSaved(DEFAULT_TEMPLATE_CONFIG);
    }
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Compact Studio Header */}
      <div className="hero-card p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-blue-600" /> Card Design & Layout Studio
          </h3>
          <p className="text-xs text-slate-500">
            Adjust typography positions, font sizes, text letter spacing, and overlay start height live.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button onClick={handleReset} className="hero-btn hero-btn-secondary text-xs py-1.5 px-3">
            <RotateCcw className="w-3.5 h-3.5" /> Reset Defaults
          </button>
          <button onClick={handleSave} className="hero-btn hero-btn-primary text-xs py-1.5 px-3">
            {savedSuccess ? <Check className="w-3.5 h-3.5 text-green-300" /> : <Save className="w-3.5 h-3.5" />}
            {savedSuccess ? 'Saved!' : 'Save Layout'}
          </button>
        </div>
      </div>

      {/* Side-by-Side 2-Column Studio Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Sticky Compact Card Preview (Max-Width 260px, fits completely on screen without scrolling!) */}
        <div className="md:col-span-4 sticky top-20 flex flex-col items-center">
          <div className="hero-card p-4 w-full flex flex-col items-center space-y-3 bg-slate-900/5">
            <div className="flex items-center justify-between w-full text-xs font-semibold text-slate-700">
              <span>Card Preview</span>
              <select
                value={selectedMemberIndex}
                onChange={(e) => setSelectedMemberIndex(parseInt(e.target.value))}
                className="hero-input py-1 px-2 text-xs w-auto bg-white"
              >
                {members.map((m, idx) => (
                  <option key={m.id} value={idx}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Compact ID Card Container */}
            <div className="w-full max-w-[260px] shadow-xl rounded-xl overflow-hidden bg-slate-900 border border-slate-200">
              <IDCardCanvas
                member={sampleMember}
                interactive={false}
                overlayOpacity={1.0}
                templateConfig={config}
              />
            </div>

            <p className="text-[11px] text-slate-500 text-center">
              Target ID Card Size: 2.125" × 3.375" (Portrait)
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: Edit Controls Panel */}
        <div className="md:col-span-8 space-y-4">
          {/* Reference Overlay Guide Toggle */}
          <div className="hero-card p-4 border-amber-200 bg-amber-50/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {config.showRefGuide ? (
                  <Eye className="w-4 h-4 text-amber-600" />
                ) : (
                  <EyeOff className="w-4 h-4 text-slate-400" />
                )}
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Reference ID Card Overlay Guide</h4>
                  <p className="text-[11px] text-slate-500">Overlay target image guide to check pixel alignment</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setConfig({ ...config, showRefGuide: !config.showRefGuide })}
                className={`hero-btn text-xs py-1 px-2.5 ${
                  config.showRefGuide ? 'hero-btn-primary bg-amber-600 hover:bg-amber-700' : 'hero-btn-secondary'
                }`}
              >
                {config.showRefGuide ? 'Guide On' : 'Guide Off'}
              </button>
            </div>

            {config.showRefGuide && (
              <div className="pt-2 border-t border-amber-200 space-y-1">
                <div className="flex justify-between text-xs text-slate-700 font-medium">
                  <span>Guide Opacity</span>
                  <span>{Math.round(config.refGuideOpacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={config.refGuideOpacity}
                  onChange={(e) => setConfig({ ...config, refGuideOpacity: parseFloat(e.target.value) })}
                  className="w-full h-1.5 bg-amber-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
                />
              </div>
            )}
          </div>

          {/* Member Name Controls */}
          <div className="hero-card p-4 space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <Type className="w-4 h-4 text-blue-600" /> Member Name Controls (Bebas Neue)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <div className="flex justify-between text-slate-700 font-medium">
                  <span>Vertical Y Position</span>
                  <span>{Math.round(config.nameY * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.55"
                  max="0.88"
                  step="0.005"
                  value={config.nameY}
                  onChange={(e) => setConfig({ ...config, nameY: parseFloat(e.target.value) })}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-slate-700 font-medium">
                  <span>Font Size</span>
                  <span>{config.nameFontSize}px</span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="100"
                  step="2"
                  value={config.nameFontSize}
                  onChange={(e) => setConfig({ ...config, nameFontSize: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-slate-700 font-medium">
                  <span>Letter / Text Spacing</span>
                  <span>{config.nameLetterSpacing}px</span>
                </div>
                <input
                  type="range"
                  min="-4"
                  max="20"
                  step="1"
                  value={config.nameLetterSpacing}
                  onChange={(e) => setConfig({ ...config, nameLetterSpacing: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-slate-700 font-medium mb-1">Text Color</label>
                <input
                  type="color"
                  value={config.nameColor}
                  onChange={(e) => setConfig({ ...config, nameColor: e.target.value })}
                  className="h-7 w-full rounded-md border border-slate-300 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Designation Controls */}
          <div className="hero-card p-4 space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <Type className="w-4 h-4 text-purple-600" /> Designation Controls (Poppins Italics)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <div className="flex justify-between text-slate-700 font-medium">
                  <span>Vertical Y Position</span>
                  <span>{Math.round(config.desigY * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.65"
                  max="0.95"
                  step="0.005"
                  value={config.desigY}
                  onChange={(e) => setConfig({ ...config, desigY: parseFloat(e.target.value) })}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-slate-700 font-medium">
                  <span>Font Size</span>
                  <span>{config.desigFontSize}px</span>
                </div>
                <input
                  type="range"
                  min="16"
                  max="54"
                  step="1"
                  value={config.desigFontSize}
                  onChange={(e) => setConfig({ ...config, desigFontSize: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-slate-700 font-medium">
                  <span>Letter / Text Spacing</span>
                  <span>{config.desigLetterSpacing}px</span>
                </div>
                <input
                  type="range"
                  min="-4"
                  max="20"
                  step="1"
                  value={config.desigLetterSpacing}
                  onChange={(e) => setConfig({ ...config, desigLetterSpacing: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-slate-700 font-medium mb-1">Text Color</label>
                <input
                  type="color"
                  value={config.desigColor}
                  onChange={(e) => setConfig({ ...config, desigColor: e.target.value })}
                  className="h-7 w-full rounded-md border border-slate-300 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Black Fade Overlay Controls */}
          <div className="hero-card p-4 space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <Layers className="w-4 h-4 text-slate-700" /> Black Fade Overlay Position
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <div className="flex justify-between text-slate-700 font-medium">
                  <span>Fade Start Height (Y Position)</span>
                  <span>{Math.round(config.fadeStartY * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.20"
                  max="0.80"
                  step="0.01"
                  value={config.fadeStartY}
                  onChange={(e) => setConfig({ ...config, fadeStartY: parseFloat(e.target.value) })}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-800"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-slate-700 font-medium">
                  <span>Overlay Transparency</span>
                  <span>{Math.round(config.fadeOpacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={config.fadeOpacity}
                  onChange={(e) => setConfig({ ...config, fadeOpacity: parseFloat(e.target.value) })}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-800"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
