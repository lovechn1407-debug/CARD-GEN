import React, { useState, useEffect } from 'react';
import IDCardCanvas from './IDCardCanvas';
import FlippableIDCard from './FlippableIDCard';
import { 
  getTemplateConfig, 
  saveTemplateConfig, 
  subscribeTemplateConfig, 
  DEFAULT_TEMPLATE_CONFIG,
  subscribeCardTemplates,
  saveCardTemplate,
  deleteCardTemplate
} from '../utils/storage';
import { uploadToImgBB } from '../utils/imgbb';
import { Sliders, Type, Layers, Eye, EyeOff, Save, RotateCcw, Check, Upload, FileText, CreditCard, Plus, Trash2, Image as ImageIcon, X } from 'lucide-react';

export default function AdminTemplateStudio({ members, onConfigSaved }) {
  const [config, setConfig] = useState(getTemplateConfig());
  const [cardTemplates, setCardTemplates] = useState({});
  const [activeCardId, setActiveCardId] = useState('default');
  const [selectedMemberIndex, setSelectedMemberIndex] = useState(0);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isUploadingSign, setIsUploadingSign] = useState(false);
  const [isUploadingFrontBg, setIsUploadingFrontBg] = useState(false);
  const [isUploadingBackBg, setIsUploadingBackBg] = useState(false);

  // New Card Modal State
  const [showNewCardModal, setShowNewCardModal] = useState(false);
  const [newCardData, setNewCardData] = useState({
    name: '',
    bgUrl: '',
    backBgUrl: ''
  });
  const [isUploadingNewFront, setIsUploadingNewFront] = useState(false);
  const [isUploadingNewBack, setIsUploadingNewBack] = useState(false);

  // Load real config and card templates from Firebase Realtime Database
  useEffect(() => {
    const unsubConfig = subscribeTemplateConfig((dbConfig) => {
      setConfig(dbConfig);
    });
    const unsubTemplates = subscribeCardTemplates((templates) => {
      setCardTemplates(templates);
    });
    return () => {
      unsubConfig && unsubConfig();
      unsubTemplates && unsubTemplates();
    };
  }, []);

  const activeTemplate = cardTemplates[activeCardId] || cardTemplates['default'] || {
    id: 'default',
    name: 'Core Team (Default)',
    bgUrl: '',
    backBgUrl: '',
    config
  };

  const handleDirectorSignUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingSign(true);
    try {
      const hostedUrl = await uploadToImgBB(file);
      const updatedConfig = { ...config, directorSignUrl: hostedUrl };
      setConfig(updatedConfig);
      saveTemplateConfig(updatedConfig);
      if (activeCardId) {
        saveCardTemplate({
          ...activeTemplate,
          config: updatedConfig
        });
      }
      if (onConfigSaved) onConfigSaved(updatedConfig);
    } catch (err) {
      alert('Failed to upload Director Signature PNG.');
    } finally {
      setIsUploadingSign(false);
    }
  };

  const handleFrontBgUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingFrontBg(true);
    try {
      const hostedUrl = await uploadToImgBB(file);
      const updatedTemplate = {
        ...activeTemplate,
        bgUrl: hostedUrl
      };
      saveCardTemplate(updatedTemplate);
    } catch (err) {
      alert('Failed to upload front background image to ImgBB.');
    } finally {
      setIsUploadingFrontBg(false);
    }
  };

  const handleBackBgUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingBackBg(true);
    try {
      const hostedUrl = await uploadToImgBB(file);
      const updatedTemplate = {
        ...activeTemplate,
        backBgUrl: hostedUrl
      };
      saveCardTemplate(updatedTemplate);
    } catch (err) {
      alert('Failed to upload back background image to ImgBB.');
    } finally {
      setIsUploadingBackBg(false);
    }
  };

  const handleCreateNewCard = async (e) => {
    e.preventDefault();
    if (!newCardData.name.trim()) {
      alert('Please enter a name for the new card template');
      return;
    }
    const newId = `card_${Date.now().toString().slice(-6)}`;
    const templateObj = {
      id: newId,
      name: newCardData.name.trim(),
      bgUrl: newCardData.bgUrl || '',
      backBgUrl: newCardData.backBgUrl || '',
      config: { ...config }
    };
    await saveCardTemplate(templateObj);
    setActiveCardId(newId);
    setShowNewCardModal(false);
    setNewCardData({ name: '', bgUrl: '', backBgUrl: '' });
  };

  const handleDeleteCard = async (cardId) => {
    if (cardId === 'default') {
      alert('The Default Core Team card template cannot be deleted.');
      return;
    }
    const name = cardTemplates[cardId]?.name || 'this card template';
    if (confirm(`Are you sure you want to delete "${name}"? Members assigned to this card will fallback to default.`)) {
      await deleteCardTemplate(cardId);
      setActiveCardId('default');
    }
  };

  const sampleMember = {
    ...(members[selectedMemberIndex] || members[0] || {
      name: 'LOVE CHAUHAN',
      designation: 'Creative Designing',
      photoUrl: 'https://i.imgur.com/8Q9Z5b4.png',
      photoTransform: { x: 0, y: -20, scale: 1.05, rotation: 0 }
    }),
    cardId: activeCardId
  };

  const handleSave = () => {
    saveTemplateConfig(config);
    if (activeCardId) {
      saveCardTemplate({
        ...activeTemplate,
        config
      });
    }
    setSavedSuccess(true);
    if (onConfigSaved) onConfigSaved(config);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleReset = () => {
    if (confirm('Reset card design layout to original default settings?')) {
      setConfig(DEFAULT_TEMPLATE_CONFIG);
      saveTemplateConfig(DEFAULT_TEMPLATE_CONFIG);
      if (activeCardId) {
        saveCardTemplate({
          ...activeTemplate,
          config: DEFAULT_TEMPLATE_CONFIG
        });
      }
      if (onConfigSaved) onConfigSaved(DEFAULT_TEMPLATE_CONFIG);
    }
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* CARD TEMPLATES SELECTOR BAR */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CreditCard style={{ width: 22, height: 22, color: '#1d4ed8' }} />
          <div>
            <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', margin: 0 }}>Card Design Templates & Options</h4>
            <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0' }}>Select a card template to edit or generate new card designs for events, volunteers, etc.</p>
          </div>
        </div>

        {/* Card Switcher Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {Object.values(cardTemplates).map((template) => {
            const isSelected = activeCardId === template.id;
            return (
              <div key={template.id} style={{ display: 'flex', alignItems: 'center' }}>
                <button
                  onClick={() => {
                    setActiveCardId(template.id);
                    if (template.config) setConfig({ ...DEFAULT_TEMPLATE_CONFIG, ...template.config });
                  }}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: isSelected ? '2px solid #1d4ed8' : '1px solid #cbd5e1',
                    background: isSelected ? '#1d4ed8' : '#ffffff',
                    color: isSelected ? '#ffffff' : '#334155',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: isSelected ? '0 2px 6px rgba(29,78,216,0.25)' : 'none'
                  }}
                >
                  <CreditCard style={{ width: 14, height: 14 }} />
                  {template.name}
                </button>
              </div>
            );
          })}

          <button
            onClick={() => setShowNewCardModal(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              background: '#16a34a',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(22,163,74,0.25)'
            }}
          >
            <Plus style={{ width: 16, height: 16 }} /> Generate New Card
          </button>
        </div>
      </div>

      {/* ACTIVE CARD BACKGROUND & DETAILS BAR */}
      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ background: '#eff6ff', color: '#1d4ed8', fontSize: '11px', fontWeight: 800, padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
              Editing Template:
            </span>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>{activeTemplate.name}</h3>
          </div>
          <p style={{ fontSize: '11px', color: '#64748b', margin: '4px 0 0' }}>
            Upload custom front and back background artwork PNGs specifically for this card option.
          </p>
        </div>

        {/* Upload Custom Front/Back Background Buttons for Active Card */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Front Background Upload */}
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 12px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '12px', fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
            <Upload style={{ width: 14, height: 14, color: '#1d4ed8' }} />
            {isUploadingFrontBg ? 'Uploading Front...' : 'Upload Front BG PNG'}
            <input type="file" accept="image/*" onChange={handleFrontBgUpload} disabled={isUploadingFrontBg} style={{ display: 'none' }} />
          </label>

          {/* Back Side Background Upload */}
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 12px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '12px', fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
            <Upload style={{ width: 14, height: 14, color: '#9333ea' }} />
            {isUploadingBackBg ? 'Uploading Back...' : 'Upload Back Side BG PNG'}
            <input type="file" accept="image/*" onChange={handleBackBgUpload} disabled={isUploadingBackBg} style={{ display: 'none' }} />
          </label>

          {activeCardId !== 'default' && (
            <button
              onClick={() => handleDeleteCard(activeCardId)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '8px 12px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', fontSize: '12px', fontWeight: 600, color: '#dc2626', cursor: 'pointer' }}
            >
              <Trash2 style={{ width: 14, height: 14 }} /> Delete Card
            </button>
          )}
        </div>
      </div>

      {/* Studio Header Bar */}
      <div style={{ background: 'linear-gradient(to right, #eff6ff, #eef2ff)', border: '1px solid #dbeafe', borderRadius: '12px', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            <Sliders style={{ width: '20px', height: '20px', color: '#0072ce' }} /> Layout & Fine-Tuning Studio ({activeTemplate.name})
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
          <div style={{ width: '270px' }}>
            <FlippableIDCard
              member={sampleMember}
              interactive={false}
              overlayOpacity={1.0}
              templateConfig={config}
              showFlipButton={true}
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

          {/* Photo Backlight Glow Controls Card */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #f1f5f9' }}>
              <h4 style={{ fontSize: '13px', fontWeight: 'bold', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sliders style={{ width: '16px', height: '16px', color: '#eab308' }} /> Photo Cutout Aura / Backlight Glow
              </h4>
              <button
                type="button"
                onClick={() => setConfig({ ...config, glowEnabled: !config.glowEnabled })}
                className="hero-btn"
                style={{
                  fontSize: '11px',
                  padding: '4px 10px',
                  backgroundColor: config.glowEnabled ? '#16a34a' : '#94a3b8',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                {config.glowEnabled ? 'Glow Enabled' : 'Glow Disabled'}
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              {/* Glow Blur Radius */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '600', color: '#334155' }}>
                  <span>Glow Blur Amount</span>
                  <span>{config.glowBlur ?? 55}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="120"
                  step="2"
                  value={config.glowBlur ?? 55}
                  onChange={(e) => setConfig({ ...config, glowBlur: parseInt(e.target.value) })}
                  style={{ width: '100%', height: '6px', accentColor: '#eab308', cursor: 'pointer' }}
                />
              </div>

              {/* Glow Intensity / Opacity */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '600', color: '#334155' }}>
                  <span>Glow Intensity / Opacity</span>
                  <span>{Math.round((config.glowIntensity ?? 0.95) * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="1.0"
                  step="0.05"
                  value={config.glowIntensity ?? 0.95}
                  onChange={(e) => setConfig({ ...config, glowIntensity: parseFloat(e.target.value) })}
                  style={{ width: '100%', height: '6px', accentColor: '#eab308', cursor: 'pointer' }}
                />
              </div>

              {/* Glow Color */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155' }}>Glow Aura Color</label>
                <input
                  type="color"
                  value={config.glowColor || '#FFFFFF'}
                  onChange={(e) => setConfig({ ...config, glowColor: e.target.value })}
                  style={{ height: '32px', width: '100%', borderRadius: '6px', border: '1px solid #cbd5e1', cursor: 'pointer' }}
                />
              </div>
            </div>
          </div>

          {/* Director Signature PNG Controls Card */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h4 style={{ fontSize: '13px', fontWeight: 'bold', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0, paddingBottom: '8px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FileText style={{ width: '16px', height: '16px', color: '#16a34a' }} /> Back Side Director Signature PNG
            </h4>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '130px', height: '60px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#0b133b', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', padding: '4px', flexShrink: 0 }}>
                {config.directorSignUrl ? (
                  <img src={config.directorSignUrl} alt="Director Signature" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                ) : (
                  <span style={{ fontSize: '11px', color: '#94a3b8', fontStyle: 'italic' }}>Default Signature</span>
                )}
              </div>

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>
                  Upload custom PNG transparent signature of the Director to appear on the back of all cards above the "DIRECTOR" text label.
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: '#1d4ed8', color: '#ffffff', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                    <Upload style={{ width: 14, height: 14 }} />
                    {isUploadingSign ? 'Uploading...' : 'Import Director Signature PNG'}
                    <input type="file" accept="image/png,image/*" onChange={handleDirectorSignUpload} disabled={isUploadingSign} style={{ display: 'none' }} />
                  </label>
                  {config.directorSignUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        const updated = { ...config, directorSignUrl: '' };
                        setConfig(updated);
                        saveTemplateConfig(updated);
                        if (onConfigSaved) onConfigSaved(updated);
                      }}
                      style={{ padding: '6px 10px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '11px', fontWeight: 600, color: '#dc2626', cursor: 'pointer' }}
                    >
                      Reset Default
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Single Authorized Admin Gmail Whitelist Control Card */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h4 style={{ fontSize: '13px', fontWeight: 'bold', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0, paddingBottom: '8px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Eye style={{ width: '16px', height: '16px', color: '#dc2626' }} /> Authorized Admin Gmail Lock
            </h4>
            <p style={{ fontSize: '11px', color: '#64748b', margin: 0, lineHeight: 1.4 }}>
              Specify the single authorized Gmail address permitted to sign in and access this Admin Panel. All other Gmail accounts will be automatically blocked.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="email"
                placeholder="Enter single authorized admin email (e.g. lovechn1407@gmail.com)..."
                value={config.allowedAdminEmail || ''}
                onChange={(e) => setConfig({ ...config, allowedAdminEmail: e.target.value })}
                style={{ flex: 1, padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '12px', outline: 'none', background: '#fff', color: '#0f172a' }}
              />
              <button
                type="button"
                onClick={() => {
                  saveTemplateConfig(config);
                  alert(`Authorized Admin Gmail locked to: ${config.allowedAdminEmail || 'First Google Login'}`);
                }}
                style={{ padding: '8px 14px', background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}
              >
                Save Lock Email
              </button>
            </div>
          </div>

          {/* Back Side Layout Controls Card */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h4 style={{ fontSize: '13px', fontWeight: 'bold', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0, paddingBottom: '8px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sliders style={{ width: '16px', height: '16px', color: '#2563eb' }} /> Back Side QR Code & Details Move / Zoom Controls
            </h4>

            {/* QR Code Move & Zoom */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b' }}>1. Verification QR Code Area</span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 600, color: '#475569' }}>
                    <span>QR Position X</span><span>{config.backQrX ?? 42}px</span>
                  </div>
                  <input type="range" min="10" max="250" step="1" value={config.backQrX ?? 42}
                    onChange={(e) => setConfig({ ...config, backQrX: parseInt(e.target.value) })}
                    style={{ width: '100%', height: '5px', accentColor: '#2563eb', cursor: 'pointer' }} />
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 600, color: '#475569' }}>
                    <span>QR Position Y</span><span>{config.backQrY ?? 140}px</span>
                  </div>
                  <input type="range" min="80" max="300" step="1" value={config.backQrY ?? 140}
                    onChange={(e) => setConfig({ ...config, backQrY: parseInt(e.target.value) })}
                    style={{ width: '100%', height: '5px', accentColor: '#2563eb', cursor: 'pointer' }} />
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 600, color: '#475569' }}>
                    <span>QR Size (Zoom)</span><span>{config.backQrSize ?? 195}px</span>
                  </div>
                  <input type="range" min="100" max="280" step="2" value={config.backQrSize ?? 195}
                    onChange={(e) => setConfig({ ...config, backQrSize: parseInt(e.target.value) })}
                    style={{ width: '100%', height: '5px', accentColor: '#2563eb', cursor: 'pointer' }} />
                </div>
              </div>
            </div>

            {/* Back Text Details Move & Zoom */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b' }}>2. Back Details Text (Phone, Blood Group, Valid Till)</span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 600, color: '#475569' }}>
                    <span>Text Position X</span><span>{config.backTextX ?? 315}px</span>
                  </div>
                  <input type="range" min="150" max="450" step="1" value={config.backTextX ?? 315}
                    onChange={(e) => setConfig({ ...config, backTextX: parseInt(e.target.value) })}
                    style={{ width: '100%', height: '5px', accentColor: '#2563eb', cursor: 'pointer' }} />
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 600, color: '#475569' }}>
                    <span>Text Start Y</span><span>{config.backTextY ?? 194}px</span>
                  </div>
                  <input type="range" min="100" max="300" step="1" value={config.backTextY ?? 194}
                    onChange={(e) => setConfig({ ...config, backTextY: parseInt(e.target.value) })}
                    style={{ width: '100%', height: '5px', accentColor: '#2563eb', cursor: 'pointer' }} />
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 600, color: '#475569' }}>
                    <span>Text Font Size (Zoom)</span><span>{config.backTextFontSize ?? 23}px</span>
                  </div>
                  <input type="range" min="14" max="36" step="1" value={config.backTextFontSize ?? 23}
                    onChange={(e) => setConfig({ ...config, backTextFontSize: parseInt(e.target.value) })}
                    style={{ width: '100%', height: '5px', accentColor: '#2563eb', cursor: 'pointer' }} />
                </div>
              </div>
            </div>

            {/* Director Signature Move & Zoom */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b' }}>3. Director Signature Area</span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 600, color: '#475569' }}>
                    <span>Sign Position X</span><span>{config.backSignX ?? 568}px</span>
                  </div>
                  <input type="range" min="300" max="608" step="1" value={config.backSignX ?? 568}
                    onChange={(e) => setConfig({ ...config, backSignX: parseInt(e.target.value) })}
                    style={{ width: '100%', height: '5px', accentColor: '#2563eb', cursor: 'pointer' }} />
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 600, color: '#475569' }}>
                    <span>Sign Position Y</span><span>{config.backSignY ?? 875}px</span>
                  </div>
                  <input type="range" min="700" max="950" step="1" value={config.backSignY ?? 875}
                    onChange={(e) => setConfig({ ...config, backSignY: parseInt(e.target.value) })}
                    style={{ width: '100%', height: '5px', accentColor: '#2563eb', cursor: 'pointer' }} />
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 600, color: '#475569' }}>
                    <span>Sign Width (Zoom)</span><span>{config.backSignWidth ?? 120}px</span>
                  </div>
                  <input type="range" min="60" max="220" step="2" value={config.backSignWidth ?? 120}
                    onChange={(e) => setConfig({ ...config, backSignWidth: parseInt(e.target.value) })}
                    style={{ width: '100%', height: '5px', accentColor: '#2563eb', cursor: 'pointer' }} />
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* NEW CARD TEMPLATE GENERATOR MODAL */}
      {showNewCardModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', background: 'rgba(15,23,42,0.65)' }}>
          <div style={{ background: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '520px', boxShadow: '0 25px 50px rgba(0,0,0,0.25)', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Plus style={{ width: 18, height: 18, color: '#16a34a' }} />
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', margin: 0 }}>Generate New Card Option</h3>
              </div>
              <button onClick={() => setShowNewCardModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                <X style={{ width: 18, height: 18 }} />
              </button>
            </div>

            <form onSubmit={handleCreateNewCard} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#334155', textTransform: 'uppercase', marginBottom: '5px' }}>
                  Card Template Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Event Pass, Volunteer Card, V.I.P Member"
                  value={newCardData.name}
                  onChange={(e) => setNewCardData({ ...newCardData, name: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', color: '#0f172a', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              {/* Upload Card Front Background */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#334155', textTransform: 'uppercase', marginBottom: '5px' }}>
                  Upload Card Front Background Artwork (Optional)
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <label style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', border: '2px dashed #cbd5e1', borderRadius: '8px', cursor: 'pointer', background: '#f8fafc' }}>
                    <Upload style={{ width: 14, height: 14, color: '#1d4ed8' }} />
                    <span style={{ fontSize: '12px', color: '#475569', fontWeight: 600 }}>
                      {isUploadingNewFront ? 'Uploading Front...' : (newCardData.bgUrl ? 'Front Image Uploaded ✓' : 'Choose Front Artwork PNG')}
                    </span>
                    <input type="file" accept="image/*" onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setIsUploadingNewFront(true);
                      try {
                        const url = await uploadToImgBB(file);
                        setNewCardData((prev) => ({ ...prev, bgUrl: url }));
                      } catch (err) {
                        alert('Failed to upload front image');
                      } finally {
                        setIsUploadingNewFront(false);
                      }
                    }} disabled={isUploadingNewFront} style={{ display: 'none' }} />
                  </label>
                </div>
              </div>

              {/* Upload Card Back Side Background */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#334155', textTransform: 'uppercase', marginBottom: '5px' }}>
                  Upload Card Back Side Artwork (Optional)
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <label style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', border: '2px dashed #cbd5e1', borderRadius: '8px', cursor: 'pointer', background: '#f8fafc' }}>
                    <Upload style={{ width: 14, height: 14, color: '#9333ea' }} />
                    <span style={{ fontSize: '12px', color: '#475569', fontWeight: 600 }}>
                      {isUploadingNewBack ? 'Uploading Back...' : (newCardData.backBgUrl ? 'Back Image Uploaded ✓' : 'Choose Back Side Artwork PNG')}
                    </span>
                    <input type="file" accept="image/*" onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setIsUploadingNewBack(true);
                      try {
                        const url = await uploadToImgBB(file);
                        setNewCardData((prev) => ({ ...prev, backBgUrl: url }));
                      } catch (err) {
                        alert('Failed to upload back image');
                      } finally {
                        setIsUploadingNewBack(false);
                      }
                    }} disabled={isUploadingNewBack} style={{ display: 'none' }} />
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
                <button type="button" onClick={() => setShowNewCardModal(false)}
                  style={{ padding: '8px 16px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '12px', fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" disabled={isUploadingNewFront || isUploadingNewBack}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 18px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
                  <Check style={{ width: 14, height: 14 }} /> Create & Save Card Option
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
