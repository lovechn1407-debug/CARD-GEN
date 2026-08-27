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
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Studio Header Bar */}
      <div style={{ background: 'linear-gradient(to right, #eff6ff, #eef2ff)', border: '1px solid #dbeafe', borderRadius: '12px', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            <Sliders style={{ width: '20px', height: '20px', color: '#0072ce' }} /> Card Design & Layout Studio
          </h3>
          <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0 0' }}>
            Fine-tune typography positions, font sizes, text letter spacing, black fade height, and reference guide overlay live.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button onClick={handleReset} className="hero-btn hero-btn-secondary" style={{ fontSize: '12px', padding: '8px 14px' }}>
            <RotateCcw style={{ width: '14px', height: '14px' }} /> Reset Defaults
          </button>
          <button onClick={handleSave} className="hero-btn hero-btn-primary" style={{ fontSize: '12px', padding: '8px 14px' }}>
            {savedSuccess ? <Check style={{ width: '14px', height: '14px', color: '#86efac' }} /> : <Save style={{ width: '14px', height: '14px' }} />}
            {savedSuccess ? 'Layout Saved!' : 'Save Layout Settings'}
          </button>
        </div>
      </div>

      {/* Main Studio 2-Column Split Layout */}
      <div className="studio-container" style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 310px) 1fr', gap: '24px', alignItems: 'start' }}>
        
        {/* LEFT COLUMN: Sticky Card Preview (Fixed 280px-310px width, sticky top 80px) */}
        <div style={{ position: 'sticky', top: '80px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          
          <div style={{ width: '100%', display: 'flex', itemsAlign: 'center', justifyContent: 'space-between', fontSize: '12px', fontWeight: 'bold', color: '#334155' }}>
            <span>Live Card Preview</span>
            <select
              value={selectedMemberIndex}
              onChange={(e) => setSelectedMemberIndex(parseInt(e.target.value))}
              style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', background: '#ffffff' }}
            >
              {members.map((m, idx) => (
                <option key={m.id} value={idx}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          {/* ID Card Canvas Container */}
          <div style={{ width: '270px', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 15px 30px rgba(0,0,0,0.2)', border: '1px solid #cbd5e1', background: '#0f172a' }}>
            <IDCardCanvas
              member={sampleMember}
              interactive={false}
              overlayOpacity={1.0}
              templateConfig={config}
            />
          </div>

          <p style={{ fontSize: '11px', color: '#64748b', textAlign: 'center', margin: 0 }}>
            Standard Size: 2.125" × 3.375" (Portrait ID)
          </p>
        </div>

        {/* RIGHT COLUMN: Edit Controls Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Reference Overlay Guide Section */}
          <div style={{ background: 'rgba(254, 243, 199, 0.4)', border: '1px solid #fde68a', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {config.showRefGuide ? (
                  <Eye style={{ width: '20px', height: '20px', color: '#d97706' }} />
                ) : (
                  <EyeOff style={{ width: '20px', height: '20px', color: '#94a3b8' }} />
                )}
                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>
                    Reference ID Card Overlay Guide
                  </h4>
                  <p style={{ fontSize: '11px', color: '#64748b', margin: '2px 0 0 0' }}>
                    Overlays target card image guide to check pixel alignment
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setConfig({ ...config, showRefGuide: !config.showRefGuide })}
                className="hero-btn"
                style={{
                  fontSize: '12px',
                  padding: '6px 12px',
                  backgroundColor: config.showRefGuide ? '#d97706' : '#ffffff',
                  color: config.showRefGuide ? '#ffffff' : '#334155',
                  borderColor: config.showRefGuide ? 'transparent' : '#cbd5e1'
                }}
              >
                {config.showRefGuide ? 'Guide Enabled' : 'Enable Guide'}
              </button>
            </div>

            {config.showRefGuide && (
              <div style={{ paddingTop: '10px', borderTop: '1px solid #fde68a', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '600', color: '#334155' }}>
                  <span>Guide Opacity Transparency</span>
                  <span>{Math.round(config.refGuideOpacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={config.refGuideOpacity}
                  onChange={(e) => setConfig({ ...config, refGuideOpacity: parseFloat(e.target.value) })}
                  style={{ width: '100%', height: '6px', accentColor: '#d97706', cursor: 'pointer' }}
                />
              </div>
            )}
          </div>

          {/* Member Name Controls Card */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h4 style={{ fontSize: '13px', fontWeight: 'bold', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0, paddingBottom: '8px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Type style={{ width: '16px', height: '16px', color: '#0072ce' }} /> Member Name Controls (Bebas Neue)
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              
              {/* Name Y Position */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '600', color: '#334155' }}>
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
                  style={{ width: '100%', height: '6px', accentColor: '#0072ce', cursor: 'pointer' }}
                />
              </div>

              {/* Name Font Size */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '600', color: '#334155' }}>
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
                  style={{ width: '100%', height: '6px', accentColor: '#0072ce', cursor: 'pointer' }}
                />
              </div>

              {/* Name Letter Spacing */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '600', color: '#334155' }}>
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
                  style={{ width: '100%', height: '6px', accentColor: '#0072ce', cursor: 'pointer' }}
                />
              </div>

              {/* Name Color */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155' }}>Text Color</label>
                <input
                  type="color"
                  value={config.nameColor}
                  onChange={(e) => setConfig({ ...config, nameColor: e.target.value })}
                  style={{ height: '32px', width: '100%', borderRadius: '6px', border: '1px solid #cbd5e1', cursor: 'pointer' }}
                />
              </div>
            </div>
          </div>

          {/* Designation Controls Card */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h4 style={{ fontSize: '13px', fontWeight: 'bold', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0, paddingBottom: '8px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Type style={{ width: '16px', height: '16px', color: '#9333ea' }} /> Designation Controls (Poppins Italics)
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              
              {/* Designation Y Position */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '600', color: '#334155' }}>
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
                  style={{ width: '100%', height: '6px', accentColor: '#9333ea', cursor: 'pointer' }}
                />
              </div>

              {/* Designation Font Size */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '600', color: '#334155' }}>
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
                  style={{ width: '100%', height: '6px', accentColor: '#9333ea', cursor: 'pointer' }}
                />
              </div>

              {/* Designation Letter Spacing */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '600', color: '#334155' }}>
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
                  style={{ width: '100%', height: '6px', accentColor: '#9333ea', cursor: 'pointer' }}
                />
              </div>

              {/* Designation Color */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155' }}>Text Color</label>
                <input
                  type="color"
                  value={config.desigColor}
                  onChange={(e) => setConfig({ ...config, desigColor: e.target.value })}
                  style={{ height: '32px', width: '100%', borderRadius: '6px', border: '1px solid #cbd5e1', cursor: 'pointer' }}
                />
              </div>
            </div>
          </div>

          {/* Black Fade Overlay Controls Card */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h4 style={{ fontSize: '13px', fontWeight: 'bold', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0, paddingBottom: '8px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Layers style={{ width: '16px', height: '16px', color: '#334155' }} /> Black Fade Overlay Position
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '600', color: '#334155' }}>
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
                  style={{ width: '100%', height: '6px', accentColor: '#0f172a', cursor: 'pointer' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '600', color: '#334155' }}>
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
                  style={{ width: '100%', height: '6px', accentColor: '#0f172a', cursor: 'pointer' }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
