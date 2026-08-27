import React, { useEffect, useRef, useState } from 'react';

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

  // Render 3-Layer Canvas with Precise Fade Height Masking
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

    // LAYER 1: Background Image (Header + Navy Gradient + Watermark)
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
      const centerY = CARD_HEIGHT * 0.40 + transform.y; // Centered nicely in upper-middle area

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

    // LAYER 3: Black Fade Overlay (Scoping fade to start at lower chest y = 460px so face remains 100% bright!)
    ctx.save();
    ctx.globalAlpha = overlayOpacity;

    if (fadeOverlayImage) {
      // Draw fade overlay starting at lower chest area (y = 460) down to bottom
      const fadeStartY = CARD_HEIGHT * 0.46;
      const fadeHeight = CARD_HEIGHT - fadeStartY;
      ctx.drawImage(fadeOverlayImage, 0, fadeStartY, CARD_WIDTH, fadeHeight);
    } else {
      // Smooth gradient fallback starting at lower chest
      const fadeGrad = ctx.createLinearGradient(0, CARD_HEIGHT * 0.46, 0, CARD_HEIGHT * 0.68);
      fadeGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
      fadeGrad.addColorStop(0.5, 'rgba(0, 0, 0, 0.6)');
      fadeGrad.addColorStop(1, 'rgba(0, 0, 0, 1.0)');

      ctx.fillStyle = fadeGrad;
      ctx.fillRect(0, CARD_HEIGHT * 0.46, CARD_WIDTH, CARD_HEIGHT * 0.22);
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, CARD_HEIGHT * 0.68, CARD_WIDTH, CARD_HEIGHT * 0.32);
    }
    ctx.restore();

    // LAYER 4: Typography ONLY (Exact Name in Bebas Neue & Designation in Poppins Italics)
    ctx.save();
    ctx.textAlign = 'center';

    // 4A. NAME in BEBAS NEUE BOLD
    const nameText = (member?.name || 'MEMBER NAME').toUpperCase();
    ctx.font = 'bold 72px "Bebas Neue", "Arial Black", sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.letterSpacing = '1px';
    ctx.fillText(nameText, CARD_WIDTH / 2, CARD_HEIGHT * 0.74);

    // 4B. DESIGNATION in POPPINS ITALICS
    const rawDesig = member?.designation || 'E-Cell Team';
    const desigText = `“ ${rawDesig} ”`;
    ctx.font = 'italic 32px "Poppins", sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(desigText, CARD_WIDTH / 2, CARD_HEIGHT * 0.83);

    ctx.restore();
  }, [bgImage, fadeOverlayImage, photoImage, member, transform, overlayOpacity]);

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
