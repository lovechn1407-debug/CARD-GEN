import React, { useEffect, useRef, useState } from 'react';

// Exact Canvas Dimensions matching original background PNG aspect ratio (608px x 1000px)
export const CARD_WIDTH = 608;
export const CARD_HEIGHT = 1000;

export default function IDCardCanvas({
  member,
  interactive = false,
  overlayOpacity = 1.0,
  onTransformChange,
  className = ''
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const transform = member?.photoTransform || { x: 0, y: -20, scale: 1, rotation: 0 };

  const [bgImage, setBgImage] = useState(null);
  const [fadeOverlayImage, setFadeOverlayImage] = useState(null);
  const [photoImage, setPhotoImage] = useState(null);

  // 1. Load exact User Background PNG
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = '/card_bg.png';
    img.onload = () => setBgImage(img);
    img.onerror = () => {
      // Fallback relative path
      const img2 = new Image();
      img2.src = 'card_bg.png';
      img2.onload = () => setBgImage(img2);
    };
  }, []);

  // 2. Load exact User Black Fade Overlay PNG
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

  // Render 3-Layer Canvas (Background PNG -> Member Photo -> Black Fade PNG -> Name & Designation ONLY)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

    // LAYER 1: Exact User Background Image (Header + Navy Gradient + Watermark)
    if (bgImage) {
      ctx.drawImage(bgImage, 0, 0, CARD_WIDTH, CARD_HEIGHT);
    } else {
      ctx.fillStyle = '#060B28';
      ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);
    }

    // LAYER 2: Member Photo (Positioned & Scaled)
    if (photoImage) {
      ctx.save();
      const centerX = CARD_WIDTH / 2 + transform.x;
      const centerY = CARD_HEIGHT * 0.42 + transform.y;

      ctx.translate(centerX, centerY);
      ctx.scale(transform.scale, transform.scale);
      if (transform.rotation) ctx.rotate((transform.rotation * Math.PI) / 180);

      const aspect = photoImage.width / photoImage.height;
      const drawWidth = 430;
      const drawHeight = drawWidth / aspect;

      ctx.drawImage(
        photoImage,
        -drawWidth / 2,
        -drawHeight / 2,
        drawWidth,
        drawHeight
      );

      ctx.restore();
    }

    // LAYER 3: Exact User Black Fade Overlay
    if (fadeOverlayImage) {
      ctx.save();
      ctx.globalAlpha = overlayOpacity;
      ctx.drawImage(fadeOverlayImage, 0, 0, CARD_WIDTH, CARD_HEIGHT);
      ctx.restore();
    }

    // LAYER 4: Typography ONLY (Exact Name in Bebas Neue & Designation in Poppins Italics)
    ctx.save();
    ctx.textAlign = 'center';

    // 4A. NAME in BEBAS NEUE BOLD (Exact reference style)
    const nameText = (member?.name || 'LOVE CHAUHAN').toUpperCase();
    ctx.font = 'bold 72px "Bebas Neue", "Arial Black", sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.letterSpacing = '1px';
    ctx.fillText(nameText, CARD_WIDTH / 2, CARD_HEIGHT * 0.72);

    // 4B. DESIGNATION in POPPINS ITALICS (Exact reference style inside quotes)
    const rawDesig = member?.designation || 'Creative Designing';
    const desigText = `“ ${rawDesig} ”`;
    ctx.font = 'italic 32px "Poppins", sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(desigText, CARD_WIDTH / 2, CARD_HEIGHT * 0.81);

    ctx.restore();
  }, [bgImage, fadeOverlayImage, photoImage, member, transform, overlayOpacity]);

  // Pointer event handlers for drag positioning
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
      className={`relative inline-block overflow-hidden rounded-xl shadow-lg select-none ${className}`}
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
      style={{ cursor: interactive ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
    >
      <canvas
        ref={canvasRef}
        width={CARD_WIDTH}
        height={CARD_HEIGHT}
        className="w-full h-auto block"
        style={{ aspectRatio: '608 / 1000' }}
      />
    </div>
  );
}
