import React, { useState } from 'react';
import IDCardCanvas from './IDCardCanvas';
import IDCardBackCanvas from './IDCardBackCanvas';
import { RotateCw, Edit3 } from 'lucide-react';

export default function FlippableIDCard({
  member,
  interactive = false,
  overlayOpacity = 1.0,
  templateConfig,
  onTransformChange,
  showFlipButton = true,
  isFlipped: controlledFlipped,
  onFlipToggle,
  onModifyClick
}) {
  const [internalFlipped, setInternalFlipped] = useState(false);
  const isFlipped = controlledFlipped !== undefined ? controlledFlipped : internalFlipped;

  const handleToggleFlip = (e) => {
    if (e) e.stopPropagation();
    if (onFlipToggle) {
      onFlipToggle(!isFlipped);
    } else {
      setInternalFlipped(!isFlipped);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', width: '100%' }}>
      {/* 3D Flip Card Container */}
      <div style={{ perspective: '1000px', width: '100%', position: 'relative' }}>
        <div
          style={{
            position: 'relative',
            width: '100%',
            transition: 'transform 0.6s cubic-bezier(0.4, 0.2, 0.2, 1)',
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
          }}
        >
          {/* FRONT SIDE */}
          <div
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              width: '100%'
            }}
          >
            <IDCardCanvas
              member={member}
              interactive={interactive}
              overlayOpacity={overlayOpacity}
              templateConfig={templateConfig}
              onTransformChange={onTransformChange}
            />
          </div>

          {/* BACK SIDE */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              width: '100%'
            }}
          >
            <IDCardBackCanvas member={member} templateConfig={templateConfig} />
          </div>
        </div>

        {/* Hover Overlay with 2 Buttons if onModifyClick is provided */}
        {onModifyClick && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(15, 23, 42, 0.75)',
              borderRadius: '12px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justify: 'center',
              gap: '10px',
              opacity: 0,
              transition: 'opacity 0.2s ease',
              backdropFilter: 'blur(2px)',
              zIndex: 10
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = 1)}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = 0)}
          >
            {/* Button 1: Modify Card */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onModifyClick();
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                background: '#1d4ed8',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                width: '140px',
                justifyContent: 'center'
              }}
            >
              <Edit3 style={{ width: 14, height: 14 }} /> Modify Card
            </button>

            {/* Button 2: View Back / Front Side */}
            <button
              type="button"
              onClick={handleToggleFlip}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                background: '#ffffff',
                color: '#0f172a',
                border: 'none',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                width: '140px',
                justifyContent: 'center'
              }}
            >
              <RotateCw style={{ width: 14, height: 14, color: '#1d4ed8' }} />
              {isFlipped ? 'View Front Side' : 'View Back Side'}
            </button>
          </div>
        )}
      </div>

      {/* Standalone Flip Button if showFlipButton is true and no modify click */}
      {showFlipButton && !onModifyClick && (
        <button
          type="button"
          onClick={handleToggleFlip}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            background: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: 600,
            color: '#334155',
            cursor: 'pointer',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#1d4ed8';
            e.currentTarget.style.color = '#1d4ed8';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#cbd5e1';
            e.currentTarget.style.color = '#334155';
          }}
        >
          <RotateCw style={{ width: 14, height: 14, color: '#1d4ed8' }} />
          {isFlipped ? 'View Front Side' : 'View Back Side'}
        </button>
      )}
    </div>
  );
}
