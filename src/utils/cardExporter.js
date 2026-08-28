import jsPDF from 'jspdf';
import JSZip from 'jszip';
import QRCode from 'qrcode';
import { CARD_WIDTH, CARD_HEIGHT } from '../components/IDCardCanvas';
import { getTemplateConfig, getCardTemplateById, DEFAULT_TEMPLATE_CONFIG } from './storage';

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
  
  const activeTemplate = getCardTemplateById(member?.cardId || 'default');
  const cfg = activeTemplate?.config ? { ...DEFAULT_TEMPLATE_CONFIG, ...activeTemplate.config } : getTemplateConfig();

  let bgImg = null;
  let fadeImg = null;
  const frontSrc = activeTemplate?.bgUrl || '/card_bg.png';
  try {
    bgImg = await loadImage(frontSrc);
  } catch (e) {
    try { bgImg = await loadImage('card_bg.png'); } catch (err) {}
  }

  try {
    fadeImg = await loadImage('/card_fade.png');
  } catch (e) {
    try { fadeImg = await loadImage('card_fade.png'); } catch (err) {}
  }

  let photoImg = null;
  if (member.photoUrl && !member.photoUrl.includes('unsplash')) {
    try {
      photoImg = await loadImage(member.photoUrl);
    } catch (e) {
      photoImg = null;
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
  
  const activeTemplate = getCardTemplateById(member?.cardId || 'default');
  const cfg = activeTemplate?.config ? { ...DEFAULT_TEMPLATE_CONFIG, ...activeTemplate.config } : getTemplateConfig();

  let backBgImg = null;
  const backSrc = activeTemplate?.backBgUrl || '/card_back.png';
  try {
    backBgImg = await loadImage(backSrc);
  } catch (e) {
    try { backBgImg = await loadImage('card_back.png'); } catch (err) {}
  }

  // 1. Generate QR Code
  const targetId = member?.id || member?.collegeRollNo || '2100290130085';
  const targetCardId = member?.cardId || 'default';
  const verifyUrl = `${window.location.origin}${window.location.pathname}#/verify?id=${encodeURIComponent(targetId)}&cardId=${encodeURIComponent(targetCardId)}`;
  
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

  ctx.clearRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

  // 3. Render Background Image Template
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

  // 4. QR CODE OVERLAY
  const qrBoxX = cfg.backQrX ?? 42;
  const qrBoxY = cfg.backQrY ?? 140;
  const qrBoxSize = cfg.backQrSize ?? 195;

  if (qrImg) {
    ctx.save();
    ctx.drawImage(qrImg, qrBoxX + 10, qrBoxY + 10, qrBoxSize - 20, qrBoxSize - 20);
    ctx.restore();
  }

  // 5. MEMBER METADATA NEXT TO ICONS
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

  // 6. PRINT DATE TIMESTAMP
  const now = new Date();
  const dateStr = `${now.getDate().toString().padStart(2, '0')}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  
  ctx.textAlign = 'left';
  ctx.font = '17px "Inter", monospace';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.fillText(dateStr, 36, 922);

  // 7. DIRECTOR SIGNATURE
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
