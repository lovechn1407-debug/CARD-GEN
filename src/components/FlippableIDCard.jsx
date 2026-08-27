import React, { useState } from 'react';
import IDCardCanvas from './IDCardCanvas';
import IDCardBackCanvas from './IDCardBackCanvas';
import { RotateCw } from 'lucide-react';

export default function FlippableIDCard({
  member,
  interactive = false,
  overlayOpacity = 1.0,
  templateConfig,
  onTransformChange,
  showFlipButton = true
}) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', width: '100%' }}>
      {/* 3D Flip Card Container */}
      <div style={{ perspective: '1000px', width: '100%' }}>
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
      </div>

      {/* Flip Toggle Button */}
      {showFlipButton && (
        <button
          type="button"
          onClick={() => setIsFlipped(!isFlipped)}
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
