import jsPDF from 'jspdf';
import JSZip from 'jszip';
import { CARD_WIDTH, CARD_HEIGHT } from '../components/IDCardCanvas';

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
 * Renders member card using exact user PNG overlays and lower chest fade height
 */
export async function renderMemberCardCanvas(member) {
  const canvas = document.createElement('canvas');
  canvas.width = CARD_WIDTH;
  canvas.height = CARD_HEIGHT;
  const ctx = canvas.getContext('2d');

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
        photoImg = await loadImage('https://i.imgur.com/8Q9Z5b4.png');
      } catch (err) {}
    }
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

    // Soft ambient drop shadow / glow behind transparent PNG person cutout
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 40;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 10;

    ctx.drawImage(photoImg, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
    ctx.restore();
  }

  // LAYER 3: Black Fade Overlay (Scoped to lower chest starting at y = 460px)
  if (fadeImg) {
    ctx.save();
    const fadeStartY = CARD_HEIGHT * 0.46;
    const fadeHeight = CARD_HEIGHT - fadeStartY;
    ctx.drawImage(fadeImg, 0, fadeStartY, CARD_WIDTH, fadeHeight);
    ctx.restore();
  } else {
    ctx.save();
    const fadeGrad = ctx.createLinearGradient(0, CARD_HEIGHT * 0.46, 0, CARD_HEIGHT * 0.68);
    fadeGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    fadeGrad.addColorStop(0.5, 'rgba(0, 0, 0, 0.6)');
    fadeGrad.addColorStop(1, 'rgba(0, 0, 0, 1.0)');

    ctx.fillStyle = fadeGrad;
    ctx.fillRect(0, CARD_HEIGHT * 0.46, CARD_WIDTH, CARD_HEIGHT * 0.22);
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, CARD_HEIGHT * 0.68, CARD_WIDTH, CARD_HEIGHT * 0.32);
    ctx.restore();
  }

  // LAYER 4: Typography ONLY
  ctx.save();
  ctx.textAlign = 'center';

  // Name in Bebas Neue
  const nameText = (member.name || 'MEMBER NAME').toUpperCase();
  ctx.font = 'bold 72px "Bebas Neue", "Arial Black", sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.letterSpacing = '1px';
  ctx.fillText(nameText, CARD_WIDTH / 2, CARD_HEIGHT * 0.74);

  // Designation in Poppins Italics
  const desigText = `“ ${member.designation || 'E-Cell Team'} ”`;
  ctx.font = 'italic 32px "Poppins", sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(desigText, CARD_WIDTH / 2, CARD_HEIGHT * 0.83);

  ctx.restore();
  return canvas;
}

export async function exportMembersToPdf(selectedMembers, onProgress) {
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
  a.download = `ECELL_ID_Cards_Images_${Date.now()}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
