import jsPDF from 'jspdf';
import JSZip from 'jszip';
import { CARD_WIDTH, CARD_HEIGHT, DEFAULT_BG_OVERLAY_SVG, DEFAULT_FADE_OVERLAY_SVG, getSvgDataUrl } from '../assets/overlayData';
import QRCode from 'qrcode';

// Load SVG Overlay Image Helper
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
 * Renders a single member ID card onto a high-res offscreen canvas
 * @param {Object} member
 * @returns {Promise<HTMLCanvasElement>}
 */
export async function renderMemberCardCanvas(member) {
  const canvas = document.createElement('canvas');
  canvas.width = CARD_WIDTH;
  canvas.height = CARD_HEIGHT;
  const ctx = canvas.getContext('2d');

  // Load Overlays
  const bgImg = await loadImage(getSvgDataUrl(DEFAULT_BG_OVERLAY_SVG));
  const fadeImg = await loadImage(getSvgDataUrl(DEFAULT_FADE_OVERLAY_SVG));

  // Load Member Photo
  let photoImg = null;
  if (member.photoUrl) {
    try {
      photoImg = await loadImage(member.photoUrl);
    } catch (e) {
      try {
        photoImg = await loadImage('https://i.imgur.com/8Q9Z5b4.png');
      } catch (err) {}
    }
  }

  // Load QR Code
  const memberId = member.collegeRollNo || member.id || 'VERIFY';
  const verifyUrl = `${window.location.origin}${window.location.pathname}#/verify?id=${encodeURIComponent(memberId)}`;
  const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
    margin: 1,
    width: 140,
    color: { dark: '#FFFFFF', light: '#00000000' }
  });
  const qrImg = await loadImage(qrDataUrl);

  // Clear Canvas
  ctx.clearRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

  // LAYER 1: Background Graphic
  ctx.drawImage(bgImg, 0, 0, CARD_WIDTH, CARD_HEIGHT);

  // LAYER 2: Photo Layer
  const transform = member.photoTransform || { x: 0, y: -20, scale: 1, rotation: 0 };
  if (photoImg) {
    ctx.save();
    const centerX = CARD_WIDTH / 2 + transform.x;
    const centerY = CARD_HEIGHT * 0.44 + transform.y;

    ctx.translate(centerX, centerY);
    ctx.scale(transform.scale, transform.scale);
    if (transform.rotation) ctx.rotate((transform.rotation * Math.PI) / 180);

    const aspect = photoImg.width / photoImg.height;
    const drawWidth = 420;
    const drawHeight = drawWidth / aspect;

    ctx.drawImage(photoImg, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
    ctx.restore();
  }

  // LAYER 3: Black Fade Overlay
  ctx.drawImage(fadeImg, 0, 0, CARD_WIDTH, CARD_HEIGHT);

  // LAYER 4: Typography & Details
  ctx.save();
  ctx.textAlign = 'center';

  // 4A. Name in Bebas Neue
  const nameText = (member.name || 'MEMBER NAME').toUpperCase();
  ctx.font = 'bold 56px "Bebas Neue", "Arial Black", sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.letterSpacing = '2px';
  ctx.fillText(nameText, CARD_WIDTH / 2, CARD_HEIGHT * 0.74);

  // 4B. Designation in Poppins Italics
  const desigText = `“ ${member.designation || 'E-Cell Member'} ”`;
  ctx.font = 'italic 28px "Poppins", sans-serif';
  ctx.fillStyle = '#E2E8F0';
  ctx.fillText(desigText, CARD_WIDTH / 2, CARD_HEIGHT * 0.81);

  // 4C. Roll No / ID
  ctx.font = '600 20px "Inter", sans-serif';
  ctx.fillStyle = '#94A3B8';
  const rollNo = member.collegeRollNo ? `ID: ${member.collegeRollNo}` : `ID: ${member.id}`;
  ctx.fillText(rollNo, CARD_WIDTH / 2, CARD_HEIGHT * 0.86);

  // 4D. Phone & Blood Group
  const extra = [
    member.bloodGroup ? `Blood: ${member.bloodGroup}` : null,
    member.phone ? `Mob: ${member.phone}` : null
  ].filter(Boolean).join('  |  ');

  if (extra) {
    ctx.font = '500 16px "Inter", sans-serif';
    ctx.fillStyle = '#64748B';
    ctx.fillText(extra, CARD_WIDTH / 2, CARD_HEIGHT * 0.90);
  }

  // 4E. QR Code
  if (qrImg) {
    const qrSize = 64;
    ctx.drawImage(qrImg, CARD_WIDTH / 2 - qrSize / 2, CARD_HEIGHT * 0.92, qrSize, qrSize);
  }

  ctx.restore();
  return canvas;
}

/**
 * Export selected members as a multi-page PDF where each page matches exact ID Card dimensions (2.125 in x 3.375 in)
 * @param {Array} selectedMembers 
 * @param {Function} onProgress 
 */
export async function exportMembersToPdf(selectedMembers, onProgress) {
  // Dimensions in inches: 2.125" width x 3.375" height (portrait ID card)
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'in',
    format: [2.125, 3.375]
  });

  for (let i = 0; i < selectedMembers.length; i++) {
    const member = selectedMembers[i];
    if (onProgress) onProgress(i + 1, selectedMembers.length, member.name);

    const canvas = await renderMemberCardCanvas(member);
    const imgData = canvas.toDataURL('image/png', 1.0);

    if (i > 0) pdf.addPage([2.125, 3.375], 'portrait');
    pdf.addImage(imgData, 'PNG', 0, 0, 2.125, 3.375);
  }

  pdf.save(`ECELL_ID_Cards_Print_${Date.now()}.pdf`);
}

/**
 * Export selected members as a ZIP file containing high-resolution 3.375" x 2.125" PNG images
 * @param {Array} selectedMembers 
 * @param {Function} onProgress 
 */
export async function exportMembersToZip(selectedMembers, onProgress) {
  const zip = new JSZip();

  for (let i = 0; i < selectedMembers.length; i++) {
    const member = selectedMembers[i];
    if (onProgress) onProgress(i + 1, selectedMembers.length, member.name);

    const canvas = await renderMemberCardCanvas(member);
    const dataUrl = canvas.toDataURL('image/png', 1.0);
    const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');

    const fileName = `ECELL_ID_${member.collegeRollNo || member.id}_${member.name.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
    zip.file(fileName, base64Data, { base64: true });
  }

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(zipBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ECELL_ID_Cards_HighRes_Images_${Date.now()}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
