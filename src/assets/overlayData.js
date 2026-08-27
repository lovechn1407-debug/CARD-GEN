// Vector SVG Assets & Overlay Generators for 100% Crisp Resolution (Target: 3.375" x 2.125" Portrait at 300 DPI: 638px x 1013px)

export const CARD_WIDTH = 638;
export const CARD_HEIGHT = 1013;

// SVG Data URL for Background Layer (Header + ECELL Watermark + Dark Blue Gradient)
export const DEFAULT_BG_OVERLAY_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 638 1013" width="638" height="1013">
  <defs>
    <!-- Dark Navy Background Gradient -->
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#0b102b" />
      <stop offset="45%" stop-color="#0a123d" />
      <stop offset="100%" stop-color="#02040b" />
    </linearGradient>
    
    <!-- Watermark ECELL Text Gradient -->
    <linearGradient id="watermarkGradient" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#5885fa" stop-opacity="0.45" />
      <stop offset="100%" stop-color="#9bb7fc" stop-opacity="0.25" />
    </linearGradient>
  </defs>

  <!-- Dark Blue Body Background -->
  <rect x="0" y="0" width="638" height="1013" fill="url(#bgGradient)" />

  <!-- Top Header Bar -->
  <rect x="0" y="0" width="638" height="98" fill="#dedede" />

  <!-- Lanyard Hole Slot (Center) -->
  <rect x="234" y="28" width="170" height="42" rx="21" ry="21" fill="#000000" />

  <!-- E-CELL Logo (Left) -->
  <g transform="translate(18, 12)">
    <!-- E Emblem -->
    <path d="M 0 5 L 42 5 C 50 5, 54 12, 48 20 L 22 52 C 18 57, 24 64, 32 64 L 62 64 L 62 76 L 0 76 C -6 76, -10 68, -4 60 L 22 28 C 26 23, 20 16, 12 16 L 0 16 Z" fill="#0072ce"/>
    <!-- CELL Text -->
    <text x="68" y="44" font-family="'Inter', sans-serif" font-weight="900" font-size="24" fill="#0072ce" letter-spacing="1">CELL</text>
    <text x="69" y="58" font-family="'Inter', sans-serif" font-weight="700" font-size="7.5" fill="#00569e" letter-spacing="0.5">I.T.S ENGINEERING COLLEGE</text>
  </g>

  <!-- ITS Engineering College Logo (Right) -->
  <g transform="translate(438, 14)">
    <text x="0" y="32" font-family="'Bebas Neue', 'Arial Black', sans-serif" font-weight="bold" font-size="34" fill="#a81010" letter-spacing="0.5">ITS</text>
    <text x="44" y="24" font-family="'Inter', sans-serif" font-weight="900" font-size="14" fill="#a81010" letter-spacing="1">ENGINEERING</text>
    <text x="44" y="40" font-family="'Inter', sans-serif" font-weight="900" font-size="16" fill="#a81010" letter-spacing="1.5">COLLEGE</text>
  </g>

  <!-- Giant Background ECELL Watermark Text -->
  <text x="319" y="430" font-family="'Bebas Neue', 'Impact', sans-serif" font-size="300" font-weight="bold" fill="url(#watermarkGradient)" text-anchor="middle" letter-spacing="6">ECELL</text>
</svg>`;

// SVG Data URL for Black Fade Overlay Layer
export const DEFAULT_FADE_OVERLAY_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 638 1013" width="638" height="1013">
  <defs>
    <!-- Smooth Black Fade Gradient -->
    <linearGradient id="blackFadeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#000000" stop-opacity="0" />
      <stop offset="35%" stop-color="#000000" stop-opacity="0.05" />
      <stop offset="60%" stop-color="#000000" stop-opacity="0.75" />
      <stop offset="78%" stop-color="#000000" stop-opacity="0.96" />
      <stop offset="100%" stop-color="#000000" stop-opacity="1" />
    </linearGradient>
  </defs>

  <!-- Black Gradient Fill covering bottom half -->
  <rect x="0" y="0" width="638" height="1013" fill="url(#blackFadeGrad)" />
</svg>`;

export function getSvgDataUrl(svgString) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`;
}
