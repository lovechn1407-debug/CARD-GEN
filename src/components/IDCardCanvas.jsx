import React, { useEffect, useRef, useState } from 'react';
import { getTemplateConfig } from '../utils/storage';

export const CARD_WIDTH = 608;
export const CARD_HEIGHT = 1000;

export default function IDCardCanvas({
  member,
  interactive = false,
  overlayOpacity = 1.0,
  templateConfig: customConfig,
  onTransformChange,
  className = ''
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const transform = member?.photoTransform || { x: 0, y: -20, scale: 1, rotation: 0 };
  const cfg = customConfig || getTemplateConfig();

  const [bgImage, setBgImage] = useState(null);
  const [fadeOverlayImage, setFadeOverlayImage] = useState(null);
  const [photoImage, setPhotoImage] = useState(null);
  const [refGuideImage, setRefGuideImage] = useState(null);

  // 1. Load Background PNG
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = '/card_bg.png';
    img.onload = () => setBgImage(img);
    img.onerror = () => {
      const img2 = new Image();
      img2.src = 'card_bg.png';
      img2.onload = () => setBgImage(img2);
    };
  }, []);

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
    if (!member?.photoUrl) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = member.photoUrl;
    img.onload = () => setPhotoImage(img);
    img.onerror = () => {
      const fallback = new Image();
      fallback.crossOrigin = 'anonymous';
      fallback.src = 'https://i.imgur.com/8Q9Z5b4.png';
      fallback.onload = () => setPhotoImage(fallback);
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

      // Soft ambient drop shadow / glow behind transparent PNG person cutout
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.shadowBlur = 40;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 10;

      ctx.drawImage(photoImage, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
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

    // 4A. MEMBER NAME
    const nameText = (member?.name || 'MEMBER NAME').toUpperCase();
    const nameSize = cfg.nameFontSize || 72;
    ctx.font = `normal ${nameSize}px "Bebas Neue", "Arial Black", sans-serif`;
    ctx.fillStyle = cfg.nameColor || '#FFFFFF';
    ctx.letterSpacing = `${cfg.nameLetterSpacing ?? 1}px`;
    const nameYPos = CARD_HEIGHT * (cfg.nameY ?? 0.74);
    ctx.fillText(nameText, CARD_WIDTH / 2, nameYPos);

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
        cursor: interactive ? (isDragging ? 'grabbing' : 'grab') : 'default',
        lineHeight: 0
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={(e) => {
        if (!interactive || e.touches.length !== 1) return;
        setIsDragging(true);
        setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
      }}
      onTouchMove={(e) => {
        if (!interactive || !isDragging || e.touches.length !== 1) return;
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
    </div>
  );
}
