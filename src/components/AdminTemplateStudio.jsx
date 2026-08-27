import React, { useState } from 'react';
import IDCardCanvas from './IDCardCanvas';
import { getTemplateConfig, saveTemplateConfig, DEFAULT_TEMPLATE_CONFIG } from '../utils/storage';
import { Sliders, Type, Layers, Eye, EyeOff, Save, RotateCcw, Sparkles, Check } from 'lucide-react';

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
    <div className="space-y-6">
      {/* Studio Header */}
      <div className="hero-card p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Sliders className="w-5 h-5 text-blue-600" /> Global Card Design & Layout Studio
          </h3>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl">
            Customize typography positions, font sizes, text letter spacing, black fade height, and enable the Reference Card Guide Overlay for 100% pixel-perfect card alignment.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={handleReset} className="hero-btn hero-btn-secondary text-xs">
            <RotateCcw className="w-4 h-4" /> Reset Defaults
          </button>
          <button onClick={handleSave} className="hero-btn hero-btn-primary text-xs">
            {savedSuccess ? <Check className="w-4 h-4 text-green-300" /> : <Save className="w-4 h-4" />}
            {savedSuccess ? 'Layout Saved!' : 'Save Layout Settings'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Live Canvas Preview */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="hero-card p-5 w-full flex flex-col items-center space-y-4 bg-slate-900/5">
            <div className="flex items-center justify-between w-full text-xs font-semibold text-slate-700 pb-2 border-b border-slate-200">
              <span>Live Card Layout Preview</span>
              <select
                value={selectedMemberIndex}
                onChange={(e) => setSelectedMemberIndex(parseInt(e.target.value))}
                className="hero-input py-1 px-2 text-xs w-auto bg-white"
              >
                {members.map((m, idx) => (
                  <option key={m.id} value={idx}>
                    Preview: {m.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="w-full max-w-[340px] shadow-2xl rounded-xl overflow-hidden">
              <IDCardCanvas
                member={sampleMember}
                interactive={false}
                overlayOpacity={1.0}
                templateConfig={config}
              />
            </div>

            <p className="text-[11px] text-slate-500 text-center">
              All member cards, batch self-edits, PDF prints, and ZIP downloads will use this exact layout!
            </p>
          </div>
        </div>

        {/* Right Layout Controls Panel */}
        <div className="lg:col-span-7 space-y-6">
          {/* Reference Overlay Guide Toggle */}
          <div className="hero-card p-5 border-amber-200 bg-amber-50/40 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {config.showRefGuide ? (
                  <Eye className="w-5 h-5 text-amber-600" />
                ) : (
                  <EyeOff className="w-5 h-5 text-slate-400" />
                )}
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Reference ID Card Overlay Guide</h4>
                  <p className="text-xs text-slate-500">Overlays original target card guide to align text & photos</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setConfig({ ...config, showRefGuide: !config.showRefGuide })}
                className={`hero-btn hero-btn-xs text-xs py-1.5 px-3 ${
                  config.showRefGuide ? 'hero-btn-primary bg-amber-600 hover:bg-amber-700' : 'hero-btn-secondary'
                }`}
              >
                {config.showRefGuide ? 'Guide Enabled' : 'Enable Guide'}
              </button>
            </div>

            {config.showRefGuide && (
              <div className="pt-2 border-t border-amber-200 space-y-2">
                <div className="flex justify-between text-xs text-slate-700 font-semibold">
                  <span>Reference Guide Transparency</span>
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

          {/* Name Text Controls */}
          <div className="hero-card p-5 space-y-4">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-2 font-bebas text-lg tracking-wide">
              <Type className="w-4 h-4 text-blue-600" /> Member Name Controls (Bebas Neue)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Name Y Position */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-700 font-semibold">
                  <span>Vertical Position (Y)</span>
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

              {/* Name Font Size */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-700 font-semibold">
                  <span>Font Size (Zoom)</span>
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

              {/* Name Letter Spacing */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-700 font-semibold">
                  <span>Text / Letter Spacing</span>
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

              {/* Name Color */}
              <div className="space-y-1">
                <label className="block text-xs text-slate-700 font-semibold mb-1">Text Color</label>
                <input
                  type="color"
                  value={config.nameColor}
                  onChange={(e) => setConfig({ ...config, nameColor: e.target.value })}
                  className="h-8 w-full rounded-md border border-slate-300 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Designation Text Controls */}
          <div className="hero-card p-5 space-y-4">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-2 font-poppins italic">
              <Type className="w-4 h-4 text-purple-600" /> Designation Controls (Poppins Italics)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Designation Y Position */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-700 font-semibold">
                  <span>Vertical Position (Y)</span>
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

              {/* Designation Font Size */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-700 font-semibold">
                  <span>Font Size (Zoom)</span>
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

              {/* Designation Letter Spacing */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-700 font-semibold">
                  <span>Text / Letter Spacing</span>
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

              {/* Designation Color */}
              <div className="space-y-1">
                <label className="block text-xs text-slate-700 font-semibold mb-1">Text Color</label>
                <input
                  type="color"
                  value={config.desigColor}
                  onChange={(e) => setConfig({ ...config, desigColor: e.target.value })}
                  className="h-8 w-full rounded-md border border-slate-300 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Black Overlay Repositioning Controls */}
          <div className="hero-card p-5 space-y-4">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-2">
              <Layers className="w-4 h-4 text-slate-700" /> Black Fade Overlay Repositioning
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-700 font-semibold">
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
                <div className="flex justify-between text-xs text-slate-700 font-semibold">
                  <span>Global Fade Opacity</span>
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
