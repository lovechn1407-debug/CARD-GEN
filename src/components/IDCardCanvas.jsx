import React, { useEffect, useRef, useState } from 'react';
import { getTemplateConfig, getCardTemplateById, DEFAULT_TEMPLATE_CONFIG } from '../utils/storage';

export const CARD_WIDTH = 608;
export const CARD_HEIGHT = 1000;

export default function IDCardCanvas({
  member,
  interactive = false,
  overlayOpacity = 1.0,
  templateConfig: customConfig,
  cardTemplate: customCardTemplate,
  onTransformChange,
  className = ''
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const transform = member?.photoTransform || { x: 0, y: -20, scale: 1, rotation: 0 };
  const activeTemplate = customCardTemplate || getCardTemplateById(member?.cardId || 'default');
  const cfg = customConfig || (activeTemplate?.config ? { ...DEFAULT_TEMPLATE_CONFIG, ...activeTemplate.config } : getTemplateConfig());

  const [bgImage, setBgImage] = useState(null);
  const [fadeOverlayImage, setFadeOverlayImage] = useState(null);
  const [photoImage, setPhotoImage] = useState(null);
  const [refGuideImage, setRefGuideImage] = useState(null);
  const [isImageLoading, setIsImageLoading] = useState(true);

  // Safety fallback timer to prevent infinite loading state
  useEffect(() => {
    setIsImageLoading(true);
    const timer = setTimeout(() => {
      setIsImageLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, [member?.id, member?.cardId, member?.photoUrl]);

  // Lock mobile page scrolling on touch drag when interactive
  useEffect(() => {
    const el = containerRef.current;
    if (!el || !interactive) return;

    const preventTouchScroll = (e) => {
      if (e.cancelable) e.preventDefault();
    };

    el.addEventListener('touchmove', preventTouchScroll, { passive: false });
    el.addEventListener('touchstart', preventTouchScroll, { passive: false });

    return () => {
      el.removeEventListener('touchmove', preventTouchScroll);
      el.removeEventListener('touchstart', preventTouchScroll);
    };
  }, [interactive]);

  // 1. Load Background PNG (Custom Card Template or Default)
  useEffect(() => {
    const bgSrc = activeTemplate?.bgUrl || '/card_bg.png';
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = bgSrc;
    img.onload = () => {
      setBgImage(img);
      if (!member?.photoUrl || photoImage) setIsImageLoading(false);
    };
    img.onerror = () => {
      if (bgSrc !== 'card_bg.png' && !bgSrc.startsWith('http')) {
        const img2 = new Image();
        img2.src = 'card_bg.png';
        img2.onload = () => {
          setBgImage(img2);
          setIsImageLoading(false);
        };
      } else {
        setBgImage(null);
        setIsImageLoading(false);
      }
    };
  }, [activeTemplate?.bgUrl, member?.cardId]);

  // 2. Load Black Fade Overlay PNG
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = '/card_fade.png';
    img.onload = () => setFadeOverlayImage(img);
    img.onerror = () => {
      const img2 = new Image();
      img2.src = 'card_fade.png';
      img2.onload = () => setFadeOverlayImage(img2);
    };
  }, []);

  // 3. Load Member Photo
  useEffect(() => {
    if (!member?.photoUrl) {
      setPhotoImage(null);
      if (bgImage) setIsImageLoading(false);
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = member.photoUrl;
    img.onload = () => {
      setPhotoImage(img);
      setIsImageLoading(false);
    };
    img.onerror = () => {
      setPhotoImage(null);
      setIsImageLoading(false);
    };
  }, [member?.photoUrl]);

  // 4. Load Reference Guide Overlay Image
  useEffect(() => {
    if (!cfg.showRefGuide) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = '/card_reference.png';
    img.onload = () => setRefGuideImage(img);
    img.onerror = () => {
      const img2 = new Image();
      img2.src = 'card_reference.png';
      img2.onload = () => setRefGuideImage(img2);
    };
  }, [cfg.showRefGuide]);

  // Render Canvas with Dynamic Template Controls
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

    // LAYER 1: Background Graphic
    if (bgImage) {
      ctx.drawImage(bgImage, 0, 0, CARD_WIDTH, CARD_HEIGHT);
    } else {
      ctx.fillStyle = '#060B28';
      ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);
    }

    // LAYER 2: Member Photo
    if (photoImage) {
      ctx.save();
      const centerX = CARD_WIDTH / 2 + transform.x;
      const centerY = CARD_HEIGHT * 0.40 + transform.y;

      ctx.translate(centerX, centerY);
      ctx.scale(transform.scale, transform.scale);
      if (transform.rotation) ctx.rotate((transform.rotation * Math.PI) / 180);

      const aspect = photoImage.width / photoImage.height;
      const drawWidth = 430;
      const drawHeight = drawWidth / aspect;

      const isGlowOn = cfg.glowEnabled ?? true;
      const blurAmt = cfg.glowBlur ?? 55;
      const intensity = cfg.glowIntensity ?? 0.95;
      const glowCol = cfg.glowColor || '#FFFFFF';

      // PASS 1: Dynamic Aura Backlight Glow behind transparent PNG cutout
      if (isGlowOn && intensity > 0 && blurAmt > 0) {
        ctx.save();
        ctx.shadowColor = glowCol;
        ctx.shadowBlur = blurAmt;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.globalAlpha = intensity;
        ctx.drawImage(photoImage, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
        ctx.drawImage(photoImage, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
        ctx.restore();
      }

      // PASS 2: Soft edge shadow for depth
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
      ctx.shadowBlur = 20;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 6;
      ctx.drawImage(photoImage, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
      ctx.restore();

      // PASS 3: Crisp original PNG image on top
      ctx.drawImage(photoImage, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
      ctx.restore();
    } else {
      // Draw Red Highlight Box for missing photo on canvas
      ctx.save();
      const centerX = CARD_WIDTH / 2 + transform.x;
      const centerY = CARD_HEIGHT * 0.40 + transform.y;
      const boxW = 280;
      const boxH = 340;

      ctx.fillStyle = 'rgba(239, 68, 68, 0.18)';
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(centerX - boxW / 2, centerY - boxH / 2, boxW, boxH, 16);
      } else {
        ctx.rect(centerX - boxW / 2, centerY - boxH / 2, boxW, boxH);
      }
      ctx.fill();

      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 3;
      ctx.setLineDash([8, 8]);
      ctx.stroke();

      ctx.setLineDash([]);
      ctx.fillStyle = '#dc2626';
      ctx.font = 'bold 22px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('⚠️ NO PHOTO UPLOADED', centerX, centerY);
      ctx.restore();
    }

    // LAYER 3: Black Fade Overlay (Custom Start Y and Opacity)
    ctx.save();
    const effectiveOpacity = overlayOpacity * (cfg.fadeOpacity ?? 1.0);
    ctx.globalAlpha = effectiveOpacity;

    const fadeStartY = CARD_HEIGHT * (cfg.fadeStartY ?? 0.46);
    const fadeHeight = CARD_HEIGHT - fadeStartY;

    if (fadeOverlayImage) {
      ctx.drawImage(fadeOverlayImage, 0, fadeStartY, CARD_WIDTH, fadeHeight);
    } else {
      const fadeGrad = ctx.createLinearGradient(0, fadeStartY, 0, fadeStartY + CARD_HEIGHT * 0.22);
      fadeGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
      fadeGrad.addColorStop(0.5, 'rgba(0, 0, 0, 0.6)');
      fadeGrad.addColorStop(1, 'rgba(0, 0, 0, 1.0)');

      ctx.fillStyle = fadeGrad;
      ctx.fillRect(0, fadeStartY, CARD_WIDTH, CARD_HEIGHT * 0.22);
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, fadeStartY + CARD_HEIGHT * 0.22, CARD_WIDTH, CARD_HEIGHT);
    }
    ctx.restore();

    // LAYER 4: Dynamic Typography (Name & Designation)
    ctx.save();
    ctx.textAlign = 'center';

    // 4A. MEMBER NAME (With Auto-Fit Font Scaling, Vertical Height Stretch & Gradient Fill)
    const rawName = (member?.name || 'MEMBER NAME').toUpperCase().trim();
    let nameSize = (cfg.nameFontSize || 72) * (member?.nameFontSizeScale || 1.0);
    const scaleY = cfg.nameScaleY ?? 1.0;
    const maxAllowedWidth = CARD_WIDTH - 60; // 548px max printable width
    const nameYPos = CARD_HEIGHT * (cfg.nameY ?? 0.74);
    const nameMode = member?.nameMode || 'AUTO';

    ctx.letterSpacing = `${cfg.nameLetterSpacing ?? 1}px`;

    // Helper to get FillStyle (Solid vs Gradient with Direction)
    const getNameFillStyle = (textWidth, height) => {
      if (cfg.nameColorType === 'GRADIENT') {
        let grad;
        const dir = cfg.nameGradientDirection || 'TOP_TO_BOTTOM';
        const halfW = textWidth / 2;
        const halfH = height / 2;

        if (dir === 'LEFT_TO_RIGHT') {
          grad = ctx.createLinearGradient(-halfW, 0, halfW, 0);
        } else if (dir === 'RIGHT_TO_LEFT') {
          grad = ctx.createLinearGradient(halfW, 0, -halfW, 0);
        } else if (dir === 'BOTTOM_TO_TOP') {
          grad = ctx.createLinearGradient(0, halfH, 0, -halfH);
        } else if (dir === 'DIAGONAL') {
          grad = ctx.createLinearGradient(-halfW, -halfH, halfW, halfH);
        } else {
          // TOP_TO_BOTTOM (Default)
          grad = ctx.createLinearGradient(0, -halfH, 0, halfH);
        }

        grad.addColorStop(0, cfg.nameGradientColor1 || '#FFFFFF');
        grad.addColorStop(1, cfg.nameGradientColor2 || '#FFD700');
        return grad;
      }
      return cfg.nameColor || '#FFFFFF';
    };

    if (nameMode === 'TWO_LINES' || (nameMode === 'AUTO' && member?.nameWrap)) {
      // Split into 2 lines
      const words = rawName.split(' ');
      let line1 = rawName;
      let line2 = '';

      if (words.length > 1) {
        const mid = Math.ceil(words.length / 2);
        line1 = words.slice(0, mid).join(' ');
        line2 = words.slice(mid).join(' ');
      }

      const twoLineSize = Math.min(nameSize * 0.75, 52);
      ctx.font = `normal ${twoLineSize}px "Bebas Neue", "Arial Black", sans-serif`;

      let w1 = ctx.measureText(line1).width;
      let w2 = line2 ? ctx.measureText(line2).width : 0;
      let maxW = Math.max(w1, w2);
      if (maxW > maxAllowedWidth) {
        const scale = maxAllowedWidth / maxW;
        ctx.font = `normal ${Math.floor(twoLineSize * scale)}px "Bebas Neue", "Arial Black", sans-serif`;
      }

      ctx.save();
      ctx.translate(CARD_WIDTH / 2, nameYPos);
      if (scaleY !== 1.0) ctx.scale(1, scaleY);
      ctx.fillStyle = getNameFillStyle(maxW, twoLineSize * 2);

      if (line2) {
        ctx.fillText(line1, 0, -twoLineSize * 0.4);
        ctx.fillText(line2, 0, twoLineSize * 0.5);
      } else {
        ctx.fillText(line1, 0, 0);
      }
      ctx.restore();
    } else {
      // Single line mode with AUTO-FIT scaling & Vertical Stretch
      ctx.font = `normal ${nameSize}px "Bebas Neue", "Arial Black", sans-serif`;
      let textWidth = ctx.measureText(rawName).width;

      if (textWidth > maxAllowedWidth && nameMode !== 'CUSTOM') {
        const fitSize = Math.floor(nameSize * (maxAllowedWidth / textWidth));
        nameSize = Math.max(28, fitSize);
        ctx.font = `normal ${nameSize}px "Bebas Neue", "Arial Black", sans-serif`;
        textWidth = ctx.measureText(rawName).width;
      }

      ctx.save();
      ctx.translate(CARD_WIDTH / 2, nameYPos);
      if (scaleY !== 1.0) ctx.scale(1, scaleY);
      ctx.fillStyle = getNameFillStyle(textWidth, nameSize);
      ctx.fillText(rawName, 0, 0);
      ctx.restore();
    }

    // 4B. DESIGNATION
    const rawDesig = member?.designation || 'Creative Designing';
    const desigText = cfg.desigQuotes ? `“ ${rawDesig} ”` : rawDesig;
    const desigSize = cfg.desigFontSize || 32;
    ctx.font = `italic ${desigSize}px "Poppins", sans-serif`;
    ctx.fillStyle = cfg.desigColor || '#FFFFFF';
    ctx.letterSpacing = `${cfg.desigLetterSpacing ?? 0}px`;
    const desigYPos = CARD_HEIGHT * (cfg.desigY ?? 0.83);
    ctx.fillText(desigText, CARD_WIDTH / 2, desigYPos);

    ctx.restore();

    // LAYER 5: Reference Guide Overlay (If enabled for alignment preview)
    if (cfg.showRefGuide && refGuideImage) {
      ctx.save();
      ctx.globalAlpha = cfg.refGuideOpacity ?? 0.4;
      ctx.drawImage(refGuideImage, 0, 0, CARD_WIDTH, CARD_HEIGHT);
      ctx.restore();
    }
  }, [bgImage, fadeOverlayImage, photoImage, refGuideImage, member, transform, overlayOpacity, cfg]);

  // Pointer drag handlers
  const handleMouseDown = (e) => {
    if (!interactive) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e) => {
    if (!interactive || !isDragging) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    setDragStart({ x: e.clientX, y: e.clientY });

    const newTransform = {
      ...transform,
      x: transform.x + dx * 1.5,
      y: transform.y + dy * 1.5
    };
    if (onTransformChange) onTransformChange(newTransform);
  };

  const handleMouseUp = () => setIsDragging(false);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        display: 'inline-block',
        overflow: 'hidden',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        userSelect: 'none',
        touchAction: interactive ? 'none' : 'auto',
        cursor: interactive ? (isDragging ? 'grabbing' : 'grab') : 'default',
        lineHeight: 0
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={(e) => {
        if (!interactive || e.touches.length !== 1) return;
        if (e.cancelable) e.preventDefault();
        setIsDragging(true);
        setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
      }}
      onTouchMove={(e) => {
        if (!interactive || !isDragging || e.touches.length !== 1) return;
        if (e.cancelable) e.preventDefault();
        const dx = e.touches[0].clientX - dragStart.x;
        const dy = e.touches[0].clientY - dragStart.y;
        setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
        const newTransform = {
          ...transform,
          x: transform.x + dx * 1.5,
          y: transform.y + dy * 1.5
        };
        if (onTransformChange) onTransformChange(newTransform);
      }}
      onTouchEnd={() => setIsDragging(false)}
    >
      <canvas
        ref={canvasRef}
        width={CARD_WIDTH}
        height={CARD_HEIGHT}
        style={{ width: '100%', height: 'auto', display: 'block', aspectRatio: '608 / 1000' }}
      />

      {/* ChatGPT DALL-E Style Shimmer Loading Overlay */}
      {isImageLoading && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '12px',
            overflow: 'hidden',
            background: 'linear-gradient(135deg, #090d16 0%, #111827 50%, #0f172a 100%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 20,
            pointerEvents: 'none',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            border: '1px solid rgba(255,255,255,0.08)'
          }}
        >
          {/* ChatGPT Diagonal Shimmer Wave */}
          <div className="chatgpt-shimmer-wave" />

          {/* Scanning Laser Beam */}
          <div className="chatgpt-scan-beam" />

          {/* Center Glow Badge */}
          <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', width: '80%' }}>
            {/* Circle Photo Skeleton */}
            <div style={{ position: 'relative', width: '110px', height: '110px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)', border: '2px dashed rgba(0, 210, 255, 0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 25px rgba(0, 210, 255, 0.15)' }}>
              <div style={{ width: '85px', height: '85px', borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />
            </div>

            {/* ChatGPT Status Badge */}
            <div style={{ background: 'rgba(15, 23, 42, 0.85)', border: '1px solid rgba(0, 210, 255, 0.4)', borderRadius: '20px', padding: '6px 14px', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 15px rgba(0, 210, 255, 0.2)' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#00d2ff', animation: 'pingPulse 1.2s ease-in-out infinite' }} />
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#f1f5f9', letterSpacing: '0.6px', textTransform: 'uppercase', fontFamily: 'sans-serif' }}>
                Rendering ID Card<span className="dot-anim">...</span>
              </span>
            </div>

            {/* Text Skeleton Bars */}
            <div style={{ width: '70%', height: '14px', borderRadius: '7px', background: 'rgba(255,255,255,0.08)' }} />
            <div style={{ width: '45%', height: '10px', borderRadius: '5px', background: 'rgba(255,255,255,0.05)' }} />
          </div>

          <style>{`
            @keyframes chatgptShimmer {
              0% { transform: translateX(-150%) rotate(25deg); }
              100% { transform: translateX(150%) rotate(25deg); }
            }
            @keyframes scanBeam {
              0% { top: 0%; opacity: 0.1; }
              50% { top: 92%; opacity: 0.95; }
              100% { top: 0%; opacity: 0.1; }
            }
            @keyframes pingPulse {
              0% { transform: scale(0.9); opacity: 0.6; box-shadow: 0 0 0 0 rgba(0,210,255,0.7); }
              50% { transform: scale(1.2); opacity: 1; box-shadow: 0 0 10px 4px rgba(0,210,255,0.9); }
              100% { transform: scale(0.9); opacity: 0.6; box-shadow: 0 0 0 0 rgba(0,210,255,0.7); }
            }
            @keyframes dotPulse {
              0%, 100% { opacity: 0.2; }
              50% { opacity: 1; }
            }
            .chatgpt-shimmer-wave {
              position: absolute;
              top: -60%;
              left: -60%;
              width: 220%;
              height: 220%;
              background: linear-gradient(
                90deg,
                rgba(255, 255, 255, 0) 0%,
                rgba(255, 255, 255, 0.05) 42%,
                rgba(0, 210, 255, 0.22) 50%,
                rgba(255, 255, 255, 0.05) 58%,
                rgba(255, 255, 255, 0) 100%
              );
              animation: chatgptShimmer 2.2s infinite linear;
              pointer-events: none;
            }
            .chatgpt-scan-beam {
              position: absolute;
              left: 0;
              right: 0;
              height: 3px;
              background: linear-gradient(90deg, transparent, #00d2ff, #3b82f6, #00d2ff, transparent);
              box-shadow: 0 0 18px #00d2ff, 0 0 35px #3b82f6;
              animation: scanBeam 2.5s ease-in-out infinite;
              pointer-events: none;
            }
            .dot-anim {
              animation: dotPulse 1.4s infinite;
            }
          `}</style>
        </div>
      )}
    </div>
  );
}
