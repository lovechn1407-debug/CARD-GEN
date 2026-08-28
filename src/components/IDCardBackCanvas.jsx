import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { CARD_WIDTH, CARD_HEIGHT } from './IDCardCanvas';
import { getTemplateConfig, getCardTemplateById } from '../utils/storage';

export default function IDCardBackCanvas({
  member,
  templateConfig: customConfig,
  cardTemplate: customCardTemplate,
  className = '',
  style = {}
}) {
  const canvasRef = useRef(null);
  const activeTemplate = customCardTemplate || getCardTemplateById(member?.cardId || 'default');
  const cfg = customConfig || activeTemplate?.config || getTemplateConfig();

  const [backBgImg, setBackBgImg] = useState(null);
  const [qrImage, setQrImage] = useState(null);
  const [directorSignImg, setDirectorSignImg] = useState(null);

  // 1. Load User's Back Card Background Template PNG
  useEffect(() => {
    const backSrc = activeTemplate?.backBgUrl || '/card_back.png';
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = backSrc;
    img.onload = () => setBackBgImg(img);
    img.onerror = () => {
      if (backSrc !== 'card_back.png' && !backSrc.startsWith('http')) {
        const img2 = new Image();
        img2.src = 'card_back.png';
        img2.onload = () => setBackBgImg(img2);
      } else {
        setBackBgImg(null);
      }
    };
  }, [activeTemplate?.backBgUrl, member?.cardId]);

  // 2. Generate QR Code Image
  useEffect(() => {
    const rollNo = member?.collegeRollNo || member?.id || '2100290130085';
    const verifyUrl = `${window.location.origin}${window.location.pathname}#/verify?id=${encodeURIComponent(rollNo)}`;

    QRCode.toDataURL(verifyUrl, { width: 200, margin: 1, color: { dark: '#000000', light: '#ffffff' } })
      .then((url) => {
        const img = new Image();
        img.src = url;
        img.onload = () => setQrImage(img);
      })
      .catch((err) => console.error('QR code generation error:', err));
  }, [member]);

  // 3. Load Director Signature Image if configured
  useEffect(() => {
    const signUrl = cfg.directorSignUrl;
    if (!signUrl) {
      setDirectorSignImg(null);
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = signUrl;
    img.onload = () => setDirectorSignImg(img);
    img.onerror = () => setDirectorSignImg(null);
  }, [cfg.directorSignUrl]);

  // Render Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

    // LAYER 1: Draw User's Back Card Template Image
    if (backBgImg) {
      ctx.drawImage(backBgImg, 0, 0, CARD_WIDTH, CARD_HEIGHT);
    } else {
      const bgGrad = ctx.createLinearGradient(0, 0, 0, CARD_HEIGHT);
      bgGrad.addColorStop(0, '#060a28');
      bgGrad.addColorStop(0.3, '#0b133b');
      bgGrad.addColorStop(1, '#050920');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);
    }

    // LAYER 2: Dynamic Overlays on top of the Template

    // 2A. QR CODE inside template QR white box
    const qrBoxX = cfg.backQrX ?? 42;
    const qrBoxY = cfg.backQrY ?? 140;
    const qrBoxSize = cfg.backQrSize ?? 195;

    if (qrImage) {
      ctx.save();
      ctx.drawImage(qrImage, qrBoxX + 10, qrBoxY + 10, qrBoxSize - 20, qrBoxSize - 20);
      ctx.restore();
    }

    // 2B. MEMBER METADATA NEXT TO ICONS (Phone, Blood Group, Valid Till)
    const infoX = cfg.backTextX ?? 315;
    const startY = cfg.backTextY ?? 194;
    const fontSize = cfg.backTextFontSize ?? 23;
    const lineGap = Math.round(fontSize * 2.4);

    ctx.textAlign = 'left';
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `600 ${fontSize}px "Inter", sans-serif`;

    // Phone
    ctx.fillText(member?.phone || '8383090874', infoX, startY);

    // Blood Group
    const bloodTxt = member?.bloodGroup
      ? (member.bloodGroup.includes('+') || member.bloodGroup.includes('-') ? member.bloodGroup : `${member.bloodGroup} +ve`)
      : 'B +ve';
    ctx.fillText(bloodTxt, infoX, startY + lineGap);

    // Valid Till
    const validTxt = member?.validTill
      ? (member.validTill.toUpperCase().includes('SEPT') ? member.validTill : `SEPT ${new Date(member.validTill).getFullYear() || 2029}`)
      : 'SEPT 2029';
    ctx.fillText(validTxt, infoX, startY + lineGap * 2);

    // 2C. PRINT DATE TIMESTAMP (Above "PRINT DATE" label at bottom left)
    const now = new Date();
    const dateStr = `${now.getDate().toString().padStart(2, '0')}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    ctx.textAlign = 'left';
    ctx.font = '17px "Inter", monospace';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillText(dateStr, 36, 922);

    // 2D. DIRECTOR SIGNATURE (Above "DIRECTOR" label at bottom right)
    const signX = cfg.backSignX ?? (CARD_WIDTH - 40);
    const signY = cfg.backSignY ?? 875;
    const signW = cfg.backSignWidth ?? 120;

    if (directorSignImg) {
      const signH = (signW * directorSignImg.height) / directorSignImg.width;
      ctx.drawImage(directorSignImg, signX - signW, signY + 50 - signH, signW, signH);
    } else {
      ctx.save();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(signX - 110, signY + 15);
      ctx.bezierCurveTo(signX - 90, signY - 15, signX - 70, signY + 35, signX - 50, signY + 5);
      ctx.bezierCurveTo(signX - 40, signY - 10, signX - 30, signY + 25, signX - 10, signY + 10);
      ctx.stroke();
      ctx.restore();
    }

  }, [backBgImg, member, qrImage, directorSignImg, cfg]);

  return (
    <div
      style={{
        position: 'relative',
        display: 'inline-block',
        overflow: 'hidden',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        userSelect: 'none',
        lineHeight: 0,
        ...style
      }}
      className={className}
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
