import React, { useEffect, useRef, useState } from 'react';
import { CARD_WIDTH, CARD_HEIGHT, DEFAULT_BG_OVERLAY_SVG, DEFAULT_FADE_OVERLAY_SVG, getSvgDataUrl } from '../assets/overlayData';
import QRCode from 'qrcode';

/**
 * IDCardCanvas - Core High-Res Card Rendering Engine (300 DPI Target: 638x1013)
 * @param {Object} props
 * @param {Object} props.member - Member object containing name, designation, rollNo, photoUrl, photoTransform, etc.
 * @param {boolean} props.interactive - Whether user can click/drag/scale photo
 * @param {number} props.overlayOpacity - Opacity of the Black Fade Overlay (0 to 1) for "See Through Overlay" mode
 * @param {Function} props.onTransformChange - Callback when photo transform changes in edit mode
 * @param {string} props.className - Custom CSS container classes
 */
export default function IDCardCanvas({
  member,
  interactive = false,
  overlayOpacity = 1.0,
  onTransformChange,
  className = ''
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  // State for dragging/scaling in interactive mode
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Photo transform values: { x, y, scale, rotation }
  const transform = member?.photoTransform || { x: 0, y: 0, scale: 1, rotation: 0 };

  const [bgImage, setBgImage] = useState(null);
  const [fadeOverlayImage, setFadeOverlayImage] = useState(null);
  const [photoImage, setPhotoImage] = useState(null);
  const [qrImage, setQrImage] = useState(null);

  // 1. Load Background SVG Overlay
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = getSvgDataUrl(DEFAULT_BG_OVERLAY_SVG);
    img.onload = () => setBgImage(img);
  }, []);

  // 2. Load Fade Overlay SVG
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = getSvgDataUrl(DEFAULT_FADE_OVERLAY_SVG);
    img.onload = () => setFadeOverlayImage(img);
  }, []);

  // 3. Load Member Photo
  useEffect(() => {
    if (!member?.photoUrl) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = member.photoUrl;
    img.onload = () => setPhotoImage(img);
    img.onerror = () => {
      // Fallback placeholder photo if image fails to load
      const fallback = new Image();
      fallback.crossOrigin = 'anonymous';
      fallback.src = 'https://i.imgur.com/8Q9Z5b4.png';
      fallback.onload = () => setPhotoImage(fallback);
    };
  }, [member?.photoUrl]);

  // 4. Generate Verification QR Code
  useEffect(() => {
    const memberId = member?.collegeRollNo || member?.id || 'VERIFY';
    const verifyUrl = `${window.location.origin}${window.location.pathname}#/verify?id=${encodeURIComponent(memberId)}`;
    
    QRCode.toDataURL(verifyUrl, {
      margin: 1,
      width: 120,
      color: {
        dark: '#FFFFFF',
        light: '#00000000' // Transparent background
      }
    })
      .then(url => {
        const img = new Image();
        img.src = url;
        img.onload = () => setQrImage(img);
      })
      .catch(console.error);
  }, [member?.collegeRollNo, member?.id]);

  // Render 4-Layer Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear Canvas
    ctx.clearRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

    // LAYER 1: Background Graphic & Header
    if (bgImage) {
      ctx.drawImage(bgImage, 0, 0, CARD_WIDTH, CARD_HEIGHT);
    } else {
      ctx.fillStyle = '#0a123d';
      ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);
    }

    // LAYER 2: Member Photo (Transformed & Positioned)
    if (photoImage) {
      ctx.save();
      // Calculate photo position centered around canvas
      const centerX = CARD_WIDTH / 2 + transform.x;
      const centerY = CARD_HEIGHT * 0.44 + transform.y; // Centered vertically in middle chest area

      ctx.translate(centerX, centerY);
      ctx.scale(transform.scale, transform.scale);
      if (transform.rotation) ctx.rotate((transform.rotation * Math.PI) / 180);

      // Render photo proportionally
      const aspect = photoImage.width / photoImage.height;
      const drawWidth = 420;
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

    // LAYER 3: Black Fade Overlay (Controlled by overlayOpacity for See-Through Mode)
    if (fadeOverlayImage) {
      ctx.save();
      ctx.globalAlpha = overlayOpacity;
      ctx.drawImage(fadeOverlayImage, 0, 0, CARD_WIDTH, CARD_HEIGHT);
      ctx.restore();
    }

    // LAYER 4: Foreground Text & Typography
    ctx.save();
    ctx.textAlign = 'center';

    // 4A. Member Name in BEBAS NEUE BOLD
    const nameText = (member?.name || 'MEMBER NAME').toUpperCase();
    ctx.font = 'bold 56px "Bebas Neue", "Arial Black", sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.letterSpacing = '2px';
    ctx.fillText(nameText, CARD_WIDTH / 2, CARD_HEIGHT * 0.74);

    // 4B. Member Designation in POPPINS ITALICS
    const rawDesig = member?.designation || 'E-Cell Member';
    const desigText = `“ ${rawDesig} ”`;
    ctx.font = 'italic 28px "Poppins", sans-serif';
    ctx.fillStyle = '#E2E8F0';
    ctx.fillText(desigText, CARD_WIDTH / 2, CARD_HEIGHT * 0.81);

    // 4C. Member Roll No / ID Badge
    ctx.font = '600 20px "Inter", sans-serif';
    ctx.fillStyle = '#94A3B8';
    const rollNo = member?.collegeRollNo ? `ID: ${member.collegeRollNo}` : `ID: ${member?.id || 'N/A'}`;
    ctx.fillText(rollNo, CARD_WIDTH / 2, CARD_HEIGHT * 0.86);

    // 4D. Additional Specs Row (Phone & Blood Group if present)
    const extraDetails = [
      member?.bloodGroup ? `Blood: ${member.bloodGroup}` : null,
      member?.phone ? `Mob: ${member.phone}` : null
    ].filter(Boolean).join('  |  ');

    if (extraDetails) {
      ctx.font = '500 16px "Inter", sans-serif';
      ctx.fillStyle = '#64748B';
      ctx.fillText(extraDetails, CARD_WIDTH / 2, CARD_HEIGHT * 0.90);
    }

    // 4E. Render QR Code (Bottom Center)
    if (qrImage) {
      const qrSize = 64;
      const qrX = CARD_WIDTH / 2 - qrSize / 2;
      const qrY = CARD_HEIGHT * 0.92;
      ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize);
    }

    ctx.restore();
  }, [bgImage, fadeOverlayImage, photoImage, qrImage, member, transform, overlayOpacity]);

  // Pointer / Mouse events for interactive drag adjustment
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

  const handleMouseUp = () => {
    setIsDragging(false);
  };

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
        style={{ aspectRatio: '638 / 1013' }}
      />
    </div>
  );
}
