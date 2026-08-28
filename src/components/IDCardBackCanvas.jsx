import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { CARD_WIDTH, CARD_HEIGHT } from './IDCardCanvas';
import { getTemplateConfig, getCardTemplateById, DEFAULT_TEMPLATE_CONFIG } from '../utils/storage';

export default function IDCardBackCanvas({
  member,
  templateConfig: customConfig,
  cardTemplate: customCardTemplate,
  className = '',
  style = {}
}) {
  const canvasRef = useRef(null);
  const activeTemplate = customCardTemplate || getCardTemplateById(member?.cardId || 'default');
  const cfg = customConfig || (activeTemplate?.config ? { ...DEFAULT_TEMPLATE_CONFIG, ...activeTemplate.config } : getTemplateConfig());

  const [backBgImg, setBackBgImg] = useState(null);
  const [qrImage, setQrImage] = useState(null);
  const [directorSignImg, setDirectorSignImg] = useState(null);
  const [isImageLoading, setIsImageLoading] = useState(true);

  // Safety fallback timer for back side image loading
  useEffect(() => {
    setIsImageLoading(true);
    const timer = setTimeout(() => {
      setIsImageLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, [member?.id, member?.cardId]);

  // 1. Load User's Back Card Background Template PNG
  useEffect(() => {
    const backSrc = activeTemplate?.backBgUrl || '/card_back.png';
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = backSrc;
    img.onload = () => {
      setBackBgImg(img);
      setIsImageLoading(false);
    };
    img.onerror = () => {
      if (backSrc !== 'card_back.png' && !backSrc.startsWith('http')) {
        const img2 = new Image();
        img2.src = 'card_back.png';
        img2.onload = () => {
          setBackBgImg(img2);
          setIsImageLoading(false);
        };
      } else {
        setBackBgImg(null);
        setIsImageLoading(false);
      }
    };
  }, [activeTemplate?.backBgUrl, member?.cardId]);

  // 2. Generate QR Code Image
  useEffect(() => {
    const verifyId = member?.id || member?.collegeRollNo || '2100290130085';
    const verifyUrl = `${window.location.origin}${window.location.pathname}#/verify?id=${encodeURIComponent(verifyId)}`;

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
          <div className="chatgpt-shimmer-wave-back" />

          {/* Scanning Laser Beam */}
          <div className="chatgpt-scan-beam-back" />

          {/* Center Glow Badge */}
          <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', width: '80%' }}>
            {/* QR Box Skeleton */}
            <div style={{ position: 'relative', width: '90px', height: '90px', borderRadius: '12px', background: 'rgba(255,255,255,0.04)', border: '2px dashed rgba(0, 210, 255, 0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 25px rgba(0, 210, 255, 0.15)' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '8px', background: 'rgba(255,255,255,0.07)' }} />
            </div>

            {/* ChatGPT Status Badge */}
            <div style={{ background: 'rgba(15, 23, 42, 0.85)', border: '1px solid rgba(0, 210, 255, 0.4)', borderRadius: '20px', padding: '6px 14px', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 15px rgba(0, 210, 255, 0.2)' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#00d2ff', animation: 'pingPulse 1.2s ease-in-out infinite' }} />
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#f1f5f9', letterSpacing: '0.6px', textTransform: 'uppercase', fontFamily: 'sans-serif' }}>
                Loading Card Back<span className="dot-anim">...</span>
              </span>
            </div>

            {/* Text Skeleton Bars */}
            <div style={{ width: '70%', height: '14px', borderRadius: '7px', background: 'rgba(255,255,255,0.08)' }} />
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
            .chatgpt-shimmer-wave-back {
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
            .chatgpt-scan-beam-back {
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
