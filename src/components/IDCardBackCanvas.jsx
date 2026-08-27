import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { CARD_WIDTH, CARD_HEIGHT } from './IDCardCanvas';
import { getTemplateConfig } from '../utils/storage';

export default function IDCardBackCanvas({
  member,
  templateConfig: customConfig,
  className = '',
  style = {}
}) {
  const canvasRef = useRef(null);
  const cfg = customConfig || getTemplateConfig();
  const [qrImage, setQrImage] = useState(null);
  const [directorSignImg, setDirectorSignImg] = useState(null);

  // 1. Generate QR Code Image
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

  // 2. Load Director Signature Image if configured
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

    // 1. BACKGROUND GRADIENT
    const bgGrad = ctx.createLinearGradient(0, 0, 0, CARD_HEIGHT);
    bgGrad.addColorStop(0, '#060a28');
    bgGrad.addColorStop(0.3, '#0b133b');
    bgGrad.addColorStop(1, '#050920');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

    // Top Header Bar Divider
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.fillRect(0, 80, CARD_WIDTH, 2);

    // 2. TOP LEFT: QR CODE CONTAINER BOX
    const qrBoxX = 40;
    const qrBoxY = 140;
    const qrBoxSize = 195;

    // White rounded card background for QR
    ctx.save();
    ctx.fillStyle = '#FFFFFF';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 4;
    ctx.beginPath();
    ctx.roundRect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, 12);
    ctx.fill();
    ctx.restore();

    // Draw QR Code Image
    if (qrImage) {
      ctx.drawImage(qrImage, qrBoxX + 10, qrBoxY + 10, qrBoxSize - 20, qrBoxSize - 20);
    }

    // QR Label
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 15px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.letterSpacing = '1px';
    ctx.fillText('VERIFICATION QR', qrBoxX + qrBoxSize / 2, qrBoxY + qrBoxSize + 32);

    // 3. TOP RIGHT INFO COLUMN (Phone, Blood Group, Valid Till)
    const infoX = 275;
    let infoY = 165;

    // 3A. PHONE
    ctx.font = '22px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('📞', infoX, infoY);
    ctx.font = '600 23px "Inter", sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(member?.phone || '8383090874', infoX + 42, infoY - 2);

    // 3B. BLOOD GROUP
    infoY += 55;
    ctx.font = '22px sans-serif';
    ctx.fillText('💧', infoX, infoY);
    ctx.font = '600 23px "Inter", sans-serif';
    ctx.fillStyle = '#FFFFFF';
    const bloodTxt = member?.bloodGroup ? (member.bloodGroup.includes('+') || member.bloodGroup.includes('-') ? member.bloodGroup : `${member.bloodGroup} +ve`) : 'B +ve';
    ctx.fillText(bloodTxt, infoX + 42, infoY - 2);

    // 3C. VALID TILL
    infoY += 55;
    ctx.font = '22px sans-serif';
    ctx.fillText('🛡️', infoX, infoY);
    ctx.font = '600 23px "Inter", sans-serif';
    ctx.fillStyle = '#FFFFFF';
    const validTxt = member?.validTill ? (member.validTill.toUpperCase().includes('SEPT') ? member.validTill : `SEPT ${new Date(member.validTill).getFullYear() || 2029}`) : 'SEPT 2029';
    ctx.fillText(validTxt, infoX + 42, infoY - 2);

    // 4. SEPARATOR LINE
    const sepY = 425;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(40, sepY);
    ctx.lineTo(CARD_WIDTH - 40, sepY);
    ctx.stroke();

    // 5. TERMS & CONDITIONS PARAGRAPHS
    ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
    ctx.font = '400 21px "Inter", system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.letterSpacing = '0px';

    const wrapText = (text, x, startY, maxWidth, lineHeight) => {
      const words = text.split(' ');
      let line = '';
      let currentY = startY;

      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
          ctx.fillText(line, x, currentY);
          line = words[n] + ' ';
          currentY += lineHeight;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, x, currentY);
      return currentY + lineHeight;
    };

    let pY = 475;
    pY = wrapText(
      'This card certifies that the holder is a registered Member/Head of E-Cell @ I.T.S ENGINEERIGN COLLEGE GREATER NOIDA.',
      40, pY, CARD_WIDTH - 80, 32
    ) + 16;

    pY = wrapText(
      'The holder must produce this card upon request by campus security or library staff. Misuse of this card will result in disciplinary action.',
      40, pY, CARD_WIDTH - 80, 32
    ) + 16;

    pY = wrapText(
      'If Found: Please drop this card into a mailbox or return it to the Student Services Office at NewGen ITSEC, Knowledge Park III Greater Noida.',
      40, pY, CARD_WIDTH - 80, 32
    );

    // 6. BOTTOM FOOTER ROW
    const footerY = 935;

    // 6A. LEFT: PRINT DATE
    const now = new Date();
    const dateStr = `${now.getDate().toString().padStart(2, '0')}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    ctx.textAlign = 'left';
    ctx.font = '18px "Inter", monospace';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fillText(dateStr, 40, footerY - 24);
    ctx.font = 'bold 15px "Inter", sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('PRINT DATE', 40, footerY);

    // 6B. CENTER: AS STUDIOS LOGO
    ctx.textAlign = 'center';
    ctx.font = 'bold 16px "Inter", sans-serif';
    ctx.fillStyle = '#a855f7';
    ctx.fillText('A', CARD_WIDTH / 2 - 48, footerY);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('AS STUDIOS', CARD_WIDTH / 2 + 6, footerY);

    // 6C. RIGHT: DIRECTOR SIGNATURE & LABEL
    const rightX = CARD_WIDTH - 40;
    ctx.textAlign = 'right';

    if (directorSignImg) {
      // Custom PNG Director Signature
      const signW = 120;
      const signH = (signW * directorSignImg.height) / directorSignImg.width;
      ctx.drawImage(directorSignImg, rightX - signW, footerY - 55 - signH, signW, signH);
    } else {
      // Default Cursive Vector Director Signature
      ctx.save();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(rightX - 110, footerY - 45);
      ctx.bezierCurveTo(rightX - 90, footerY - 75, rightX - 70, footerY - 25, rightX - 50, footerY - 55);
      ctx.bezierCurveTo(rightX - 40, footerY - 70, rightX - 30, footerY - 35, rightX - 10, footerY - 50);
      ctx.stroke();
      ctx.restore();
    }

    ctx.font = 'bold 15px "Inter", sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('DIRECTOR', rightX, footerY);

  }, [member, qrImage, directorSignImg, cfg]);

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
