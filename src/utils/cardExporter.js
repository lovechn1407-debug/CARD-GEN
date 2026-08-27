import jsPDF from 'jspdf';
import JSZip from 'jszip';
import QRCode from 'qrcode';
import { CARD_WIDTH, CARD_HEIGHT } from '../components/IDCardCanvas';
import { getTemplateConfig } from './storage';

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = src;
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
  });
}

/**
 * Renders Front Side of member card
 */
export async function renderMemberCardCanvas(member) {
  const canvas = document.createElement('canvas');
  canvas.width = CARD_WIDTH;
  canvas.height = CARD_HEIGHT;
  const ctx = canvas.getContext('2d');
  const cfg = getTemplateConfig();

  let bgImg = null;
  let fadeImg = null;
  try {
    bgImg = await loadImage('/card_bg.png');
  } catch (e) {
    try { bgImg = await loadImage('card_bg.png'); } catch (err) {}
  }

  try {
    fadeImg = await loadImage('/card_fade.png');
  } catch (e) {
    try { fadeImg = await loadImage('card_fade.png'); } catch (err) {}
  }

  let photoImg = null;
  if (member.photoUrl) {
    try {
      photoImg = await loadImage(member.photoUrl);
    } catch (e) {
      try {
        photoImg = await loadImage('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80');
      } catch (err) {}
    }
  }

  // Wait for Google Fonts
  if (document.fonts) {
    try {
      await document.fonts.ready;
    } catch (e) {}
  }

  ctx.clearRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

  // LAYER 1: Background Image
  if (bgImg) {
    ctx.drawImage(bgImg, 0, 0, CARD_WIDTH, CARD_HEIGHT);
  } else {
    ctx.fillStyle = '#060B28';
    ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);
  }

  // LAYER 2: Photo Layer
  const transform = member.photoTransform || { x: 0, y: -20, scale: 1, rotation: 0 };
  if (photoImg) {
    ctx.save();
    const centerX = CARD_WIDTH / 2 + transform.x;
    const centerY = CARD_HEIGHT * 0.40 + transform.y;

    ctx.translate(centerX, centerY);
    ctx.scale(transform.scale, transform.scale);
    if (transform.rotation) ctx.rotate((transform.rotation * Math.PI) / 180);

    const aspect = photoImg.width / photoImg.height;
    const drawWidth = 430;
    const drawHeight = drawWidth / aspect;

    const isGlowOn = cfg.glowEnabled ?? true;
    const blurAmt = cfg.glowBlur ?? 55;
    const intensity = cfg.glowIntensity ?? 0.95;
    const glowCol = cfg.glowColor || '#FFFFFF';

    // PASS 1: Aura Backlight Glow
    if (isGlowOn && intensity > 0 && blurAmt > 0) {
      ctx.save();
      ctx.shadowColor = glowCol;
      ctx.shadowBlur = blurAmt;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      ctx.globalAlpha = intensity;
      ctx.drawImage(photoImg, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
      ctx.drawImage(photoImg, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
      ctx.restore();
    }

    // PASS 2: Soft edge shadow for depth
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    ctx.shadowBlur = 20;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 6;
    ctx.drawImage(photoImg, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
    ctx.restore();

    // PASS 3: Crisp original PNG image on top
    ctx.drawImage(photoImg, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
    ctx.restore();
  }

  // LAYER 3: Black Fade Overlay
  ctx.save();
  const fadeStartY = CARD_HEIGHT * (cfg.fadeStartY ?? 0.46);
  const fadeHeight = CARD_HEIGHT - fadeStartY;
  ctx.globalAlpha = cfg.fadeOpacity ?? 1.0;

  if (fadeImg) {
    ctx.drawImage(fadeImg, 0, fadeStartY, CARD_WIDTH, fadeHeight);
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

  // LAYER 4: Dynamic Typography
  ctx.save();
  ctx.textAlign = 'center';

  const nameText = (member.name || 'MEMBER NAME').toUpperCase();
  const nameSize = cfg.nameFontSize || 72;
  ctx.font = `normal ${nameSize}px "Bebas Neue", "Arial Black", sans-serif`;
  ctx.fillStyle = cfg.nameColor || '#FFFFFF';
  ctx.letterSpacing = `${cfg.nameLetterSpacing ?? 1}px`;
  const nameYPos = CARD_HEIGHT * (cfg.nameY ?? 0.74);
  ctx.fillText(nameText, CARD_WIDTH / 2, nameYPos);

  const rawDesig = member.designation || 'Creative Designing';
  const desigText = cfg.desigQuotes !== false ? `“ ${rawDesig} ”` : rawDesig;
  const desigSize = cfg.desigFontSize || 32;
  ctx.font = `italic ${desigSize}px "Poppins", sans-serif`;
  ctx.fillStyle = cfg.desigColor || '#FFFFFF';
  ctx.letterSpacing = `${cfg.desigLetterSpacing ?? 0}px`;
  const desigYPos = CARD_HEIGHT * (cfg.desigY ?? 0.83);
  ctx.fillText(desigText, CARD_WIDTH / 2, desigYPos);

  ctx.restore();
  return canvas;
}

/**
 * Renders Back Side of member card
 */
export async function renderMemberCardBackCanvas(member) {
  const canvas = document.createElement('canvas');
  canvas.width = CARD_WIDTH;
  canvas.height = CARD_HEIGHT;
  const ctx = canvas.getContext('2d');
  const cfg = getTemplateConfig();

  // 1. Generate QR Code
  const rollNo = member?.collegeRollNo || member?.id || '2100290130085';
  const verifyUrl = `${window.location.origin}${window.location.pathname}#/verify?id=${encodeURIComponent(rollNo)}`;
  
  let qrImg = null;
  try {
    const qrDataUrl = await QRCode.toDataURL(verifyUrl, { width: 200, margin: 1, color: { dark: '#000000', light: '#ffffff' } });
    qrImg = await loadImage(qrDataUrl);
  } catch (e) {}

  // 2. Director Signature PNG
  let directorSignImg = null;
  if (cfg.directorSignUrl) {
    try {
      directorSignImg = await loadImage(cfg.directorSignUrl);
    } catch (e) {}
  }

  if (document.fonts) {
    try { await document.fonts.ready; } catch (e) {}
  }

  // 3. Render Background Gradient
  const bgGrad = ctx.createLinearGradient(0, 0, 0, CARD_HEIGHT);
  bgGrad.addColorStop(0, '#060a28');
  bgGrad.addColorStop(0.3, '#0b133b');
  bgGrad.addColorStop(1, '#050920');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

  // Top Bar Divider
  ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.fillRect(0, 80, CARD_WIDTH, 2);

  // 4. QR Code Container Box
  const qrBoxX = 40;
  const qrBoxY = 140;
  const qrBoxSize = 195;

  ctx.save();
  ctx.fillStyle = '#FFFFFF';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
  ctx.shadowBlur = 12;
  ctx.shadowOffsetY = 4;
  ctx.beginPath();
  ctx.roundRect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, 12);
  ctx.fill();
  ctx.restore();

  if (qrImg) {
    ctx.drawImage(qrImg, qrBoxX + 10, qrBoxY + 10, qrBoxSize - 20, qrBoxSize - 20);
  }

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 15px "Inter", sans-serif';
  ctx.textAlign = 'center';
  ctx.letterSpacing = '1px';
  ctx.fillText('VERIFICATION QR', qrBoxX + qrBoxSize / 2, qrBoxY + qrBoxSize + 32);

  // 5. Right Info Column
  const infoX = 275;
  let infoY = 165;

  ctx.font = '22px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('📞', infoX, infoY);
  ctx.font = '600 23px "Inter", sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(member?.phone || '8383090874', infoX + 42, infoY - 2);

  infoY += 55;
  ctx.font = '22px sans-serif';
  ctx.fillText('💧', infoX, infoY);
  ctx.font = '600 23px "Inter", sans-serif';
  ctx.fillStyle = '#FFFFFF';
  const bloodTxt = member?.bloodGroup ? (member.bloodGroup.includes('+') || member.bloodGroup.includes('-') ? member.bloodGroup : `${member.bloodGroup} +ve`) : 'B +ve';
  ctx.fillText(bloodTxt, infoX + 42, infoY - 2);

  infoY += 55;
  ctx.font = '22px sans-serif';
  ctx.fillText('🛡️', infoX, infoY);
  ctx.font = '600 23px "Inter", sans-serif';
  ctx.fillStyle = '#FFFFFF';
  const validTxt = member?.validTill ? (member.validTill.toUpperCase().includes('SEPT') ? member.validTill : `SEPT ${new Date(member.validTill).getFullYear() || 2029}`) : 'SEPT 2029';
  ctx.fillText(validTxt, infoX + 42, infoY - 2);

  // 6. Separator Line
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(40, 425);
  ctx.lineTo(CARD_WIDTH - 40, 425);
  ctx.stroke();

  // 7. Terms Paragraphs
  ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
  ctx.font = '400 21px "Inter", system-ui, sans-serif';
  ctx.textAlign = 'left';

  const wrapText = (text, x, startY, maxWidth, lineHeight) => {
    const words = text.split(' ');
    let line = '';
    let currentY = startY;
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      if (ctx.measureText(testLine).width > maxWidth && n > 0) {
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
  pY = wrapText('This card certifies that the holder is a registered Member/Head of E-Cell @ I.T.S ENGINEERIGN COLLEGE GREATER NOIDA.', 40, pY, CARD_WIDTH - 80, 32) + 16;
  pY = wrapText('The holder must produce this card upon request by campus security or library staff. Misuse of this card will result in disciplinary action.', 40, pY, CARD_WIDTH - 80, 32) + 16;
  pY = wrapText('If Found: Please drop this card into a mailbox or return it to the Student Services Office at NewGen ITSEC, Knowledge Park III Greater Noida.', 40, pY, CARD_WIDTH - 80, 32);

  // 8. Footer Row
  const footerY = 935;
  const now = new Date();
  const dateStr = `${now.getDate().toString().padStart(2, '0')}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

  ctx.textAlign = 'left';
  ctx.font = '18px "Inter", monospace';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.fillText(dateStr, 40, footerY - 24);
  ctx.font = 'bold 15px "Inter", sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('PRINT DATE', 40, footerY);

  ctx.textAlign = 'center';
  ctx.font = 'bold 16px "Inter", sans-serif';
  ctx.fillStyle = '#a855f7';
  ctx.fillText('A', CARD_WIDTH / 2 - 48, footerY);
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('AS STUDIOS', CARD_WIDTH / 2 + 6, footerY);

  const rightX = CARD_WIDTH - 40;
  ctx.textAlign = 'right';

  if (directorSignImg) {
    const signW = 120;
    const signH = (signW * directorSignImg.height) / directorSignImg.width;
    ctx.drawImage(directorSignImg, rightX - signW, footerY - 55 - signH, signW, signH);
  } else {
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

  return canvas;
}

/**
 * Combines Front + Back side-by-side with a 1px gap
 */
export async function renderMemberCardCombinedCanvas(member, includeBack = true) {
  const frontCanvas = await renderMemberCardCanvas(member);
  if (!includeBack) return frontCanvas;

  const backCanvas = await renderMemberCardBackCanvas(member);

  const combinedCanvas = document.createElement('canvas');
  // Front card width + 1px gap + Back card width
  combinedCanvas.width = CARD_WIDTH * 2 + 1;
  combinedCanvas.height = CARD_HEIGHT;
  const ctx = combinedCanvas.getContext('2d');

  // 1. Draw Front Card on Left
  ctx.drawImage(frontCanvas, 0, 0);

  // 2. Draw 1px Gap Divider
  ctx.fillStyle = '#e2e8f0';
  ctx.fillRect(CARD_WIDTH, 0, 1, CARD_HEIGHT);

  // 3. Draw Back Card on Right with 1px gap
  ctx.drawImage(backCanvas, CARD_WIDTH + 1, 0);

  return combinedCanvas;
}

export async function exportMembersToPdf(selectedMembers, onProgress, includeBack = true) {
  const pdfWidth = includeBack ? 2.125 * 2 + 0.003 : 2.125;
  const pdfHeight = 3.375;

  const pdf = new jsPDF({
    orientation: includeBack ? 'landscape' : 'portrait',
    unit: 'in',
    format: [pdfWidth, pdfHeight]
  });

  for (let i = 0; i < selectedMembers.length; i++) {
    const member = selectedMembers[i];
    if (onProgress) onProgress(i + 1, selectedMembers.length, member.name);

    const canvas = await renderMemberCardCombinedCanvas(member, includeBack);
    const imgData = canvas.toDataURL('image/png', 1.0);

    if (i > 0) pdf.addPage([pdfWidth, pdfHeight], includeBack ? 'landscape' : 'portrait');
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
  }

  pdf.save(`ECELL_ID_Cards_Print_${Date.now()}.pdf`);
}

export async function exportMembersToZip(selectedMembers, onProgress, includeBack = true) {
  const zip = new JSZip();

  for (let i = 0; i < selectedMembers.length; i++) {
    const member = selectedMembers[i];
    if (onProgress) onProgress(i + 1, selectedMembers.length, member.name);

    const canvas = await renderMemberCardCombinedCanvas(member, includeBack);
    const dataUrl = canvas.toDataURL('image/png', 1.0);
    const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');

    const fileName = `ECELL_ID_${member.collegeRollNo || member.id}_${member.name.replace(/[^a-zA-Z0-9]/g, '_')}${includeBack ? '_Front_Back' : '_Front'}.png`;
    zip.file(fileName, base64Data, { base64: true });
  }

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(zipBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ECELL_ID_Cards_Images_${Date.now()}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
