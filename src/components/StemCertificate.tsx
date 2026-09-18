import React, { useRef, useState } from 'react';
import { Download } from 'lucide-react';
import { audioManager } from '../services/AudioManager';

interface StemCertificateProps {
  playerName: string;
  playerSchool?: string;
  completionDate?: string;
  onDownloadDone?: () => void;
  className?: string;
}

export const StemCertificate: React.FC<StemCertificateProps> = ({
  playerName,
  playerSchool,
  completionDate,
  onDownloadDone,
  className = ''
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Formatted date (DD/MM/YYYY)
  const today = new Date();
  const dateFormatted =
    completionDate ||
    `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;

  // Keep original user input without hardcoded names or altering diacritics
  const displayName = (playerName && playerName.trim()) ? playerName.trim().toUpperCase() : 'THÍ SINH STEM';
  const displaySchool = (playerSchool && playerSchool.trim()) ? playerSchool.trim() : 'Hệ thống Trường Phổ thông FPT';

  // High-Resolution Certificate Export Handler (PNG)
  const handleDownload = async () => {
    try {
      setIsExporting(true);
      audioManager.playClick();
      const svgElement = svgRef.current;
      if (!svgElement) return;

      // 1. Serialize SVG to high-res data URL
      const serializer = new XMLSerializer();
      let source = serializer.serializeToString(svgElement);

      if (!source.match(/^<svg[^>]+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/)) {
        source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
      }
      if (!source.match(/^<svg[^>]+xmlns:xlink="http:\/\/www\.w3\.org\/1999\/xlink"/)) {
        source = source.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
      }

      const svgBlob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
      const URL = window.URL || window.webkitURL || window;
      const blobURL = URL.createObjectURL(svgBlob);

      const image = new Image();
      image.onload = () => {
        // High-res 2400 x 1600 printable canvas
        const canvas = document.createElement('canvas');
        canvas.width = 2400;
        canvas.height = 1600;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        ctx.drawImage(image, 0, 0, 2400, 1600);
        URL.revokeObjectURL(blobURL);

        const safeFileName = displayName.replace(/[^a-zA-Z0-9_\u00C0-\u024F\u1EA0-\u1EF9]/g, '_');
        const link = document.createElement('a');
        link.download = `Giay_Chung_Nhan_STEM_${safeFileName}.png`;
        link.href = canvas.toDataURL('image/png', 1.0);
        link.click();

        setIsExporting(false);
        audioManager.playScoreTargetReached();
        if (onDownloadDone) onDownloadDone();
      };

      image.onerror = () => {
        console.error('Failed to convert SVG to image, falling back to direct canvas export');
        fallbackCanvasDownload();
        setIsExporting(false);
      };

      image.src = blobURL;
    } catch (err) {
      console.error('Error downloading certificate:', err);
      fallbackCanvasDownload();
      setIsExporting(false);
    }
  };

  const fallbackCanvasDownload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1800;
    canvas.height = 1200;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background
    ctx.fillStyle = '#071638';
    ctx.fillRect(0, 0, 1800, 1200);

    // Border
    ctx.strokeStyle = '#00F0FF';
    ctx.lineWidth = 10;
    ctx.strokeRect(40, 40, 1720, 1120);

    ctx.strokeStyle = '#FFC107';
    ctx.lineWidth = 4;
    ctx.strokeRect(55, 55, 1690, 1090);

    // Text
    ctx.textAlign = 'center';
    ctx.fillStyle = '#FFC107';
    ctx.font = 'bold 64px "Be Vietnam Pro", sans-serif';
    ctx.fillText('CHÚC MỪNG NHÀ THÁM HIỂM STEM', 900, 250);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 76px "Be Vietnam Pro", sans-serif';
    ctx.fillText(displayName, 900, 440);

    ctx.fillStyle = '#38BDF8';
    ctx.font = 'bold 42px "Be Vietnam Pro", sans-serif';
    ctx.fillText(`TRƯỜNG: ${displaySchool}`, 900, 530);

    ctx.fillStyle = '#E2E8F0';
    ctx.font = 'bold 36px "Be Vietnam Pro", sans-serif';
    ctx.fillText('ĐÃ HOÀN THÀNH XUẤT SẮC', 900, 630);

    ctx.fillStyle = '#FFC107';
    ctx.font = 'bold 48px "Be Vietnam Pro", sans-serif';
    ctx.fillText('THỬ THÁCH KHUÔN MẶT', 900, 720);
    ctx.fillText('GHÉP TRANH BÍ ẨN', 900, 780);

    ctx.fillStyle = '#94A3B8';
    ctx.font = '32px "Be Vietnam Pro", sans-serif';
    ctx.fillText(`Ngày hoàn thành: ${dateFormatted}`, 900, 950);

    const safeFileName = displayName.replace(/[^a-zA-Z0-9_\u00C0-\u024F\u1EA0-\u1EF9]/g, '_');
    const link = document.createElement('a');
    link.download = `Giay_Chung_Nhan_STEM_${safeFileName}.png`;
    link.href = canvas.toDataURL('image/png', 0.95);
    link.click();
  };

  return (
    <div className={`flex flex-col items-center w-full select-none ${className}`}>
      {/* SVG Certificate Canvas (Vector Crisp, 1200x800 Aspect Ratio 3:2) */}
      <div className="relative w-full max-w-4xl rounded-3xl overflow-hidden shadow-[0_20px_70px_rgba(0,0,0,0.9),0_0_50px_rgba(0,240,255,0.35)] border-4 border-cyan-400/90 bg-[#03091e]">
        <svg
          ref={svgRef}
          viewBox="0 0 1200 800"
          className="w-full h-auto block select-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Background Cosmic Gradients */}
            <radialGradient id="bgCosmic" cx="50%" cy="40%" r="65%">
              <stop offset="0%" stopColor="#0d2b6b" />
              <stop offset="45%" stopColor="#081c47" />
              <stop offset="85%" stopColor="#030b1e" />
              <stop offset="100%" stopColor="#010612" />
            </radialGradient>

            <linearGradient id="cyberBorder" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00F0FF" />
              <stop offset="35%" stopColor="#0077FE" />
              <stop offset="70%" stopColor="#FFC107" />
              <stop offset="100%" stopColor="#00F0FF" />
            </linearGradient>

            {/* Gold 3D Text Gradient */}
            <linearGradient id="goldTextGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFDE7" />
              <stop offset="25%" stopColor="#FFF59D" />
              <stop offset="55%" stopColor="#FFD54F" />
              <stop offset="85%" stopColor="#FFA000" />
              <stop offset="100%" stopColor="#FF8F00" />
            </linearGradient>

            {/* Cyan Neon Glow Gradient */}
            <linearGradient id="cyanNeonGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00F0FF" />
              <stop offset="50%" stopColor="#38BDF8" />
              <stop offset="100%" stopColor="#00F0FF" />
            </linearGradient>

            {/* Name Badge Gradient */}
            <linearGradient id="nameBadgeBg" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0a2561" stopOpacity="0.92" />
              <stop offset="100%" stopColor="#041233" stopOpacity="0.96" />
            </linearGradient>

            {/* School Badge Gradient */}
            <linearGradient id="schoolBadgeBg" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#082b5e" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#0f3b7d" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#082b5e" stopOpacity="0.9" />
            </linearGradient>

            {/* Arched Ribbon Gradient */}
            <linearGradient id="ribbonGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0284C7" />
              <stop offset="45%" stopColor="#0369A1" />
              <stop offset="100%" stopColor="#075985" />
            </linearGradient>

            {/* Moon Landscape Gradient */}
            <linearGradient id="moonGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#22427a" />
              <stop offset="50%" stopColor="#13274f" />
              <stop offset="100%" stopColor="#081329" />
            </linearGradient>

            {/* Cloud Puff Gradient */}
            <radialGradient id="cloudGrad" cx="50%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.45" />
              <stop offset="70%" stopColor="#1e3a8a" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
            </radialGradient>

            {/* Filters for Glow */}
            <filter id="glowCyan" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            <filter id="glowGold" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="7" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            {/* EXACT CURVED BASELINE PATHS FOR “NHÀ THÁM HIỂM STEM” */}
            {/* Symmetrical arc from X=140 to X=1060, midpoint at X=600 */}
            <path
              id="stemTitlePath"
              d="M 140,268 Q 600,165 1060,268"
              fill="none"
            />
            {/* 3D Extrusion shadow paths along the exact same curve offset downward */}
            <path
              id="stemTitleShadowPath1"
              d="M 140,271 Q 600,168 1060,271"
              fill="none"
            />
            <path
              id="stemTitleShadowPath2"
              d="M 140,274 Q 600,171 1060,274"
              fill="none"
            />

            {/* Star Shape Symbols */}
            <g id="star4">
              <path
                d="M 0 -12 Q 1 -2 12 0 Q 1 2 0 12 Q -1 2 -12 0 Q -1 -2 0 -12 Z"
                fill="#FFD54F"
                filter="url(#glowGold)"
              />
              <circle cx="0" cy="0" r="3" fill="#FFFFFF" />
            </g>

            <g id="star5">
              <polygon
                points="0,-10 3,-3 10,-3 4,2 6,9 0,5 -6,9 -4,2 -10,-3 -3,-3"
                fill="#FFCA28"
              />
            </g>

            <g id="puzzlePieceCyan">
              <path
                d="M 0 0 L 12 0 C 12 -4 16 -6 19 -4 C 22 -2 22 2 19 4 C 16 6 12 4 12 0 L 26 0 L 26 12 C 30 12 32 16 30 19 C 28 22 24 22 22 19 C 20 16 22 12 26 12 L 26 26 L 14 26 C 14 22 10 20 7 22 C 4 24 4 28 7 30 C 10 32 14 30 14 26 L 0 26 L 0 14 C -4 14 -6 10 -4 7 C -2 4 2 4 4 7 C 6 10 4 14 0 14 Z"
                fill="#00E5FF"
                opacity="0.85"
                filter="url(#glowCyan)"
              />
            </g>

            <g id="puzzlePieceGold">
              <path
                d="M 0 0 L 15 0 C 15 -5 20 -7 24 -5 C 27 -2 27 3 24 6 C 20 8 15 5 15 0 L 32 0 L 32 15 C 37 15 39 20 37 24 C 35 27 30 27 27 24 C 25 20 27 15 32 15 L 32 32 L 17 32 C 17 27 12 25 9 27 C 5 30 5 35 9 37 C 12 39 17 37 17 32 L 0 32 L 0 17 C -5 17 -7 12 -5 9 C -2 5 3 5 5 9 C 8 12 5 17 0 17 Z"
                fill="#FFC107"
                filter="url(#glowGold)"
              />
            </g>
          </defs>

          {/* ================= 1. COSMIC BACKGROUND ================= */}
          <rect width="1200" height="800" fill="url(#bgCosmic)" />

          {/* Glowing cosmic stars pattern */}
          <circle cx="120" cy="180" r="2.5" fill="#00F0FF" opacity="0.8" />
          <circle cx="220" cy="80" r="3" fill="#FFFFFF" opacity="0.9" />
          <circle cx="340" cy="240" r="2" fill="#FFD54F" opacity="0.7" />
          <circle cx="440" cy="110" r="2.5" fill="#00F0FF" opacity="0.6" />
          <circle cx="760" cy="100" r="3" fill="#FFFFFF" opacity="0.8" />
          <circle cx="860" cy="210" r="2" fill="#FFCA28" opacity="0.7" />
          <circle cx="980" cy="110" r="2.5" fill="#00F0FF" opacity="0.75" />
          <circle cx="1080" cy="220" r="3" fill="#FFFFFF" opacity="0.9" />
          <circle cx="1140" cy="380" r="2" fill="#FFD54F" opacity="0.6" />
          <circle cx="80" cy="460" r="2.5" fill="#00F0FF" opacity="0.5" />
          <circle cx="150" cy="540" r="2" fill="#FFFFFF" opacity="0.8" />
          <circle cx="210" cy="620" r="3" fill="#00F0FF" opacity="0.7" />
          <circle cx="90" cy="670" r="2.5" fill="#FFD54F" opacity="0.6" />

          {/* Decorative Sparkle Stars */}
          <use href="#star4" x="55" y="75" transform="scale(0.9)" />
          <use href="#star4" x="42" y="270" transform="scale(0.8)" />
          <use href="#star4" x="140" y="470" transform="scale(0.85)" />
          <use href="#star5" x="910" y="145" transform="scale(0.8)" />
          <use href="#star5" x="1140" y="260" transform="scale(0.9)" />
          <use href="#star5" x="1130" y="580" transform="scale(0.8)" />
          <use href="#star4" x="890" y="420" transform="scale(0.9)" />

          {/* ================= 2. TOP-LEFT SATURN RINGED PLANET ================= */}
          <g transform="translate(130, 140)">
            {/* Saturn Body */}
            <circle cx="0" cy="0" r="48" fill="#1D4ED8" stroke="#38BDF8" strokeWidth="2.5" />
            <ellipse cx="-12" cy="-14" rx="20" ry="12" fill="#3B82F6" opacity="0.6" />
            <ellipse cx="14" cy="16" rx="18" ry="10" fill="#1E3A8A" opacity="0.7" />
            {/* Ring Back */}
            <ellipse
              cx="0"
              cy="0"
              rx="76"
              ry="24"
              fill="none"
              stroke="#F59E0B"
              strokeWidth="10"
              transform="rotate(-22)"
              opacity="0.95"
            />
            <ellipse
              cx="0"
              cy="0"
              rx="84"
              ry="27"
              fill="none"
              stroke="#FDE047"
              strokeWidth="3"
              transform="rotate(-22)"
              opacity="0.8"
            />
            {/* Saturn Body Front Half to overlap ring */}
            <path
              d="M -48 0 A 48 48 0 0 0 48 0 Z"
              fill="#1E40AF"
              transform="rotate(-22)"
            />
          </g>

          {/* ================= 3. TOP-RIGHT SOARING ROCKET ================= */}
          <g transform="translate(1060, 150) rotate(-42)">
            {/* Flame Plume */}
            <path
              d="M -16 65 Q 0 120 0 145 Q 0 120 16 65 Z"
              fill="#FF3D00"
              filter="url(#glowGold)"
            />
            <path
              d="M -10 65 Q 0 105 0 125 Q 0 105 10 65 Z"
              fill="#FFEA00"
            />
            {/* Rocket Fins */}
            <path d="M -22 45 L -40 70 L -18 62 Z" fill="#EF4444" />
            <path d="M 22 45 L 40 70 L 18 62 Z" fill="#EF4444" />
            {/* Rocket Body */}
            <path
              d="M -22 25 Q -22 65 -16 65 L 16 65 Q 22 65 22 25 Q 22 -35 0 -65 Q -22 -35 -22 25 Z"
              fill="#F8FAFC"
              stroke="#0EA5E9"
              strokeWidth="3"
            />
            {/* Nose Cone */}
            <path
              d="M -18 -15 Q 0 -65 0 -65 Q 0 -65 18 -15 Z"
              fill="#EF4444"
            />
            {/* Porthole Window */}
            <circle cx="0" cy="12" r="14" fill="#0284C7" stroke="#38BDF8" strokeWidth="3" />
            <circle cx="-3" cy="9" r="4" fill="#FFFFFF" opacity="0.8" />
          </g>

          {/* ================= 4. MID-RIGHT MAGNIFYING GLASS & ATOM ================= */}
          <g transform="translate(1085, 420)">
            {/* Atom orbits */}
            <ellipse
              cx="-160"
              cy="20"
              rx="46"
              ry="16"
              fill="none"
              stroke="#00E5FF"
              strokeWidth="2"
              transform="rotate(30 -160 20)"
              filter="url(#glowCyan)"
            />
            <ellipse
              cx="-160"
              cy="20"
              rx="46"
              ry="16"
              fill="none"
              stroke="#00E5FF"
              strokeWidth="2"
              transform="rotate(-30 -160 20)"
              filter="url(#glowCyan)"
            />
            <circle cx="-160" cy="20" r="7" fill="#F59E0B" filter="url(#glowGold)" />

            {/* Magnifying Glass */}
            <circle
              cx="0"
              cy="0"
              r="46"
              fill="#0A2540"
              stroke="#FFB300"
              strokeWidth="8"
              filter="url(#glowGold)"
            />
            {/* Puzzle piece inside glass */}
            <use href="#puzzlePieceCyan" x="-13" y="-13" />
            {/* Glass handle */}
            <path
              d="M 32 32 L 68 68"
              stroke="#FFB300"
              strokeWidth="12"
              strokeLinecap="round"
            />
            <path
              d="M 32 32 L 68 68"
              stroke="#0284C7"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </g>

          {/* ================= 5. RESTORED CLEAN SEAMLESS BACKGROUND (No left character) ================= */}
          {/* Nebula Clouds stretching across */}
          <ellipse cx="600" cy="790" rx="600" ry="120" fill="url(#cloudGrad)" />
          <ellipse cx="160" cy="730" rx="260" ry="110" fill="#1e3a8a" opacity="0.45" />
          <ellipse cx="1060" cy="740" rx="220" ry="90" fill="#1e3a8a" opacity="0.4" />

          {/* Seamless Moon Surface */}
          <path
            d="M -50 820 Q 200 680 600 700 Q 1000 680 1250 820 Z"
            fill="url(#moonGrad)"
            stroke="#38BDF8"
            strokeWidth="3"
          />
          {/* Natural Craters on the Moon */}
          <ellipse cx="130" cy="755" rx="42" ry="18" fill="#0B1B38" stroke="#2563EB" strokeWidth="2" />
          <ellipse cx="230" cy="775" rx="26" ry="11" fill="#0B1B38" opacity="0.85" />
          <ellipse cx="320" cy="750" rx="34" ry="14" fill="#0B1B38" stroke="#2563EB" strokeWidth="1.5" opacity="0.75" />
          <ellipse cx="980" cy="770" rx="42" ry="18" fill="#0B1B38" stroke="#2563EB" strokeWidth="2" />
          <ellipse cx="1090" cy="785" rx="25" ry="10" fill="#0B1B38" opacity="0.8" />

          {/* Floating cyan puzzle pieces */}
          <use href="#puzzlePieceCyan" x="140" y="620" transform="rotate(-12 140 620) scale(1.15)" />
          <use href="#puzzlePieceCyan" x="240" y="520" transform="rotate(15 240 520) scale(0.9)" />
          <use href="#puzzlePieceCyan" x="1150" y="660" transform="rotate(20 1150 660) scale(0.8)" />

          {/* ================= 6. RIGHT CHARACTER: ROBOT MASCOT ================= */}
          <g transform="translate(1040, 680)">
            {/* Robot Body */}
            <ellipse cx="0" cy="-20" rx="46" ry="42" fill="#F1F5F9" stroke="#0284C7" strokeWidth="4" />

            {/* Robot Blue Visor Face */}
            <rect
              x="-38"
              y="-78"
              width="76"
              height="48"
              rx="18"
              fill="#0F172A"
              stroke="#00E5FF"
              strokeWidth="3.5"
              filter="url(#glowCyan)"
            />
            {/* Smiling Digital Eyes: ^ ^ */}
            <path
              d="M -24 -50 L -16 -60 L -8 -50"
              fill="none"
              stroke="#00E5FF"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M 8 -50 L 16 -60 L 24 -50"
              fill="none"
              stroke="#00E5FF"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Robot Ear Headphones */}
            <rect x="-48" y="-68" width="12" height="28" rx="5" fill="#0284C7" stroke="#38BDF8" strokeWidth="2" />
            <rect x="36" y="-68" width="12" height="28" rx="5" fill="#0284C7" stroke="#38BDF8" strokeWidth="2" />
            {/* Head Antenna */}
            <line x1="0" y1="-78" x2="0" y2="-94" stroke="#0284C7" strokeWidth="4" />
            <circle cx="0" cy="-96" r="6" fill="#00E5FF" filter="url(#glowCyan)" />

            {/* Chest FPT Logo Badge */}
            <rect x="-18" y="-12" width="36" height="18" rx="4" fill="#1E293B" stroke="#38BDF8" strokeWidth="1.5" />
            <g transform="translate(-14, -8) scale(0.45)">
              <rect x="0" y="0" width="16" height="18" rx="3" fill="#0066B3" />
              <rect x="18" y="0" width="16" height="18" rx="3" fill="#F37021" />
              <rect x="36" y="0" width="16" height="18" rx="3" fill="#009B49" />
              <text x="28" y="14" fill="#FFFFFF" fontSize="12" fontWeight="bold" textAnchor="middle">
                FPT
              </text>
            </g>

            {/* Arms holding golden puzzle piece */}
            <path
              d="M -32 -20 Q -60 -40 -35 -65"
              stroke="#0284C7"
              strokeWidth="10"
              strokeLinecap="round"
              fill="none"
            />
            {/* Golden Puzzle Piece */}
            <use href="#puzzlePieceGold" x="-75" y="-95" transform="scale(1.2)" />
          </g>

          {/* ================= 7. TOP CYBER NOTCHES & BORDER FRAME ================= */}
          {/* Main Cyber Border */}
          <rect
            x="24"
            y="24"
            width="1152"
            height="752"
            rx="24"
            fill="none"
            stroke="url(#cyberBorder)"
            strokeWidth="3.5"
          />
          {/* Inner Cyan Hairline */}
          <rect
            x="34"
            y="34"
            width="1132"
            height="732"
            rx="18"
            fill="none"
            stroke="#00E5FF"
            strokeWidth="1"
            opacity="0.5"
          />

          {/* Cyber Corner Brackets ⌜ ⌝ ⌞ ⌟ */}
          <path d="M 45 80 L 45 45 L 80 45" fill="none" stroke="#00F0FF" strokeWidth="4" strokeLinecap="round" />
          <path d="M 1120 45 L 1155 45 L 1155 80" fill="none" stroke="#00F0FF" strokeWidth="4" strokeLinecap="round" />
          <path d="M 45 720 L 45 755 L 80 755" fill="none" stroke="#00F0FF" strokeWidth="4" strokeLinecap="round" />
          <path d="M 1120 755 L 1155 755 L 1155 720" fill="none" stroke="#00F0FF" strokeWidth="4" strokeLinecap="round" />

          {/* Corner Golden Accent Notches */}
          <circle cx="45" cy="45" r="5" fill="#FFC107" />
          <circle cx="1155" cy="45" r="5" fill="#FFC107" />
          <circle cx="45" cy="755" r="5" fill="#FFC107" />
          <circle cx="1155" cy="755" r="5" fill="#FFC107" />

          {/* Top Center Cyber Tab (Symmetrical on X=600) */}
          <path
            d="M 460 24 L 485 46 L 715 46 L 740 24 Z"
            fill="#030C22"
            stroke="#00F0FF"
            strokeWidth="2"
          />

          {/* ================= 8. TOP FPT SCHOOLS OFFICIAL LOGO (Centered on X=600) ================= */}
          <g transform="translate(600, 83) scale(0.50)">
            <g transform="translate(0, -60)">
              {/* Blue F Block (Left, Center: -62) */}
              <g transform="skewX(-16)">
                <rect x="-86" y="8" width="48" height="70" rx="12" fill="#0066B3" />
                <text
                  x="-62"
                  y="60"
                  fontFamily="'Montserrat', 'Be Vietnam Pro', sans-serif"
                  fontWeight="900"
                  fontStyle="italic"
                  fontSize="50"
                  fill="#FFFFFF"
                  textAnchor="middle"
                >F</text>
              </g>

              {/* Orange P Block (Middle, Taller, Center: 0) */}
              <g transform="skewX(-16)">
                <rect x="-24" y="0" width="48" height="88" rx="12" fill="#F37021" />
                <text
                  x="0"
                  y="64"
                  fontFamily="'Montserrat', 'Be Vietnam Pro', sans-serif"
                  fontWeight="900"
                  fontStyle="italic"
                  fontSize="50"
                  fill="#FFFFFF"
                  textAnchor="middle"
                >P</text>
              </g>

              {/* Green T Block (Right, Center: 62) */}
              <g transform="skewX(-16)">
                <rect x="38" y="8" width="48" height="70" rx="12" fill="#009B49" />
                <text
                  x="62"
                  y="60"
                  fontFamily="'Montserrat', 'Be Vietnam Pro', sans-serif"
                  fontWeight="900"
                  fontStyle="italic"
                  fontSize="50"
                  fill="#FFFFFF"
                  textAnchor="middle"
                >T</text>
              </g>

              {/* Registered Trademark ® positioned to the right of green block */}
              <circle cx="90" cy="80" r="5" stroke="#0066B3" strokeWidth="1.4" fill="none" />
              <text
                x="90"
                y="82.5"
                fontFamily="'Montserrat', sans-serif"
                fontWeight="bold"
                fontSize="6.5"
                fill="#0066B3"
                textAnchor="middle"
              >R</text>

              {/* Wordmark: FPT SCHOOLS in authentic orange slab-serif, centered at X=0 with generous vertical gap */}
              <text
                x="0"
                y="122"
                fontFamily="'Roboto Slab', 'Rockwell', 'Clarendon', serif"
                fontWeight="900"
                fontSize="30"
                letterSpacing="2.5"
                fill="#F37021"
                textAnchor="middle"
              >
                FPT SCHOOLS
              </text>
            </g>
          </g>

          {/* ================= 9. ★ CHÚC MỪNG ★ BADGE (Centered on X=600, above ribbon) ================= */}
          <g transform="translate(600, 138)">
            <rect
              x="-125"
              y="-15"
              width="250"
              height="30"
              rx="15"
              fill="#0284C7"
              stroke="#00F0FF"
              strokeWidth="2"
              filter="url(#glowCyan)"
            />
            <text
              x="0"
              y="6"
              fontFamily="'Be Vietnam Pro', 'Montserrat', sans-serif"
              fontWeight="900"
              fontSize="16"
              fill="#FEE08B"
              letterSpacing="3"
              textAnchor="middle"
            >
              ★ CHÚC MỪNG ★
            </text>
          </g>

          {/* ================= 10. ARCHED CYAN RIBBON & 3D CURVED TITLE ================= */}
          {/* Arched Ribbon Outer Body (Symmetrical about X=600, constant 76px thickness) */}
          <g>
            <path
              d="M 115,220 Q 600,118 1085,220 L 1105,258 L 1085,296 Q 600,194 115,296 L 95,258 Z"
              fill="url(#ribbonGrad)"
              stroke="#00E5FF"
              strokeWidth="4"
              filter="url(#glowCyan)"
            />
            {/* Inner Cyan Hairline */}
            <path
              d="M 125,226 Q 600,126 1075,226"
              fill="none"
              stroke="#7DD3FC"
              strokeWidth="1.5"
              opacity="0.75"
            />
            <path
              d="M 1075,290 Q 600,190 125,290"
              fill="none"
              stroke="#7DD3FC"
              strokeWidth="1.5"
              opacity="0.75"
            />
          </g>

          {/* CURVED 3D TEXT “NHÀ THÁM HIỂM STEM” USING SVG textPath (Centered on X=600) */}
          {/* Shadow layer 2: Deep amber/brown 3D extrusion */}
          <text
            textAnchor="middle"
            fontFamily="'Be Vietnam Pro', 'Montserrat', sans-serif"
            fontWeight="900"
            fontSize="38"
            fill="#581c00"
            letterSpacing="2"
          >
            <textPath
              href="#stemTitleShadowPath2"
              xlinkHref="#stemTitleShadowPath2"
              startOffset="50%"
              textAnchor="middle"
            >
              NHÀ THÁM HIỂM STEM
            </textPath>
          </text>

          {/* Shadow layer 1: Intermediate warm amber 3D extrusion */}
          <text
            textAnchor="middle"
            fontFamily="'Be Vietnam Pro', 'Montserrat', sans-serif"
            fontWeight="900"
            fontSize="38"
            fill="#9a3412"
            letterSpacing="2"
          >
            <textPath
              href="#stemTitleShadowPath1"
              xlinkHref="#stemTitleShadowPath1"
              startOffset="50%"
              textAnchor="middle"
            >
              NHÀ THÁM HIỂM STEM
            </textPath>
          </text>

          {/* Front Golden 3D Text with Navy outline and Cyan Glow */}
          <text
            textAnchor="middle"
            fontFamily="'Be Vietnam Pro', 'Montserrat', sans-serif"
            fontWeight="900"
            fontSize="38"
            fill="url(#goldTextGrad)"
            stroke="#07264A"
            strokeWidth="4.5"
            paintOrder="stroke fill"
            letterSpacing="2"
            filter="drop-shadow(0 4px 10px rgba(0,240,255,0.45))"
          >
            <textPath
              href="#stemTitlePath"
              xlinkHref="#stemTitlePath"
              startOffset="50%"
              textAnchor="middle"
            >
              NHÀ THÁM HIỂM STEM
            </textPath>
          </text>

          {/* ================= 11. PLAYER NAME BADGE (★ LINH ★) ================= */}
          <g transform="translate(600, 335)">
            {/* Cyber Pill Container */}
            <rect
              x="-210"
              y="-32"
              width="420"
              height="64"
              rx="32"
              fill="url(#nameBadgeBg)"
              stroke="#00E5FF"
              strokeWidth="3.5"
              filter="url(#glowCyan)"
            />
            {/* Inner Border Accent */}
            <rect
              x="-202"
              y="-26"
              width="404"
              height="52"
              rx="26"
              fill="none"
              stroke="#38BDF8"
              strokeWidth="1.5"
              opacity="0.6"
            />

            {/* Golden Stars flanking the name */}
            <use href="#star4" x="-165" y="0" transform="scale(1.1)" />
            <use href="#star4" x="165" y="0" transform="scale(1.1)" />

            {/* Exactly centered Player Name with full Vietnamese font support */}
            <text
              x="0"
              y="11"
              fontFamily="'Be Vietnam Pro', 'Montserrat', sans-serif"
              fontWeight="900"
              fontSize="32"
              fill="url(#goldTextGrad)"
              stroke="#082F49"
              strokeWidth="3"
              paintOrder="stroke fill"
              textAnchor="middle"
              letterSpacing="2"
            >
              {displayName}
            </text>
          </g>

          {/* ================= 12. PLAYER SCHOOL BADGE (TRƯỜNG: ...) ================= */}
          <g transform="translate(600, 400)">
            {/* Cyber School Pill */}
            <rect
              x="-300"
              y="-19"
              width="600"
              height="38"
              rx="19"
              fill="url(#schoolBadgeBg)"
              stroke="#38BDF8"
              strokeWidth="2.5"
            />

            {/* Exactly centered School Text with full Vietnamese font support */}
            <text
              x="0"
              y="6"
              fontFamily="'Be Vietnam Pro', 'Montserrat', sans-serif"
              fontWeight="800"
              fontSize="15.5"
              fill="#E0F2FE"
              letterSpacing="1"
              textAnchor="middle"
            >
              <tspan fill="#38BDF8">🏫 TRƯỜNG: </tspan>
              <tspan fill="#FDE047" fontWeight="900">{displaySchool}</tspan>
            </text>
          </g>

          {/* ================= 13. SUBTITLE: ĐÃ HOÀN THÀNH XUẤT SẮC ================= */}
          <text
            x="600"
            y="462"
            fontFamily="'Be Vietnam Pro', 'Montserrat', sans-serif"
            fontWeight="900"
            fontSize="21"
            fill="#F8FAFC"
            letterSpacing="3"
            textAnchor="middle"
          >
            ĐÃ HOÀN THÀNH XUẤT SẮC
          </text>

          {/* ================= 14. HEXAGONAL CYBER BADGE: 2 LINES OF CHALLENGE ================= */}
          <g transform="translate(600, 545)">
            {/* Cyber Cut-Corner Container */}
            <polygon
              points="-290,-45 -270,-45 270,-45 290,-25 290,25 270,45 -270,45 -290,25"
              fill="#061A40"
              stroke="#FFB300"
              strokeWidth="3.5"
              filter="url(#glowGold)"
            />
            {/* Inner Cyan Border */}
            <polygon
              points="-282,-38 -264,-38 264,-38 282,-20 282,20 264,38 -264,38 -282,20"
              fill="none"
              stroke="#00E5FF"
              strokeWidth="1.5"
              opacity="0.8"
            />

            {/* Cyber Corner Ticks */}
            <path d="M -260 -36 L -240 -36" stroke="#00F0FF" strokeWidth="4" />
            <path d="M 240 -36 L 260 -36" stroke="#00F0FF" strokeWidth="4" />
            <path d="M -260 36 L -240 36" stroke="#00F0FF" strokeWidth="4" />
            <path d="M 240 36 L 260 36" stroke="#00F0FF" strokeWidth="4" />

            {/* Challenge Title Line 1: THỬ THÁCH KHUÔN MẶT */}
            <text
              x="0"
              y="-10"
              fontFamily="'Be Vietnam Pro', 'Montserrat', sans-serif"
              fontWeight="900"
              fontSize="23"
              fill="#FFE082"
              letterSpacing="2"
              textAnchor="middle"
            >
              THỬ THÁCH KHUÔN MẶT
            </text>

            {/* Challenge Title Line 2: GHÉP TRANH BÍ ẨN */}
            <text
              x="0"
              y="22"
              fontFamily="'Be Vietnam Pro', 'Montserrat', sans-serif"
              fontWeight="900"
              fontSize="23"
              fill="#FFCA28"
              letterSpacing="2"
              textAnchor="middle"
            >
              GHÉP TRANH BÍ ẨN
            </text>
          </g>

          {/* ================= 15. MOTTO / SLOGAN ================= */}
          <text
            x="600"
            y="628"
            fontFamily="'Be Vietnam Pro', 'Montserrat', sans-serif"
            fontWeight="800"
            fontSize="14.5"
            fill="#E0F2FE"
            letterSpacing="1.5"
            textAnchor="middle"
          >
            SẴN SÀNG KHÁM PHÁ, SÁNG TẠO VÀ CHINH PHỤC THẾ GIỚI STEM!
          </text>

          {/* ================= 16. BOTTOM DATE BADGE ================= */}
          <g transform="translate(600, 680)">
            <rect
              x="-175"
              y="-18"
              width="350"
              height="36"
              rx="18"
              fill="#082352"
              stroke="#00E5FF"
              strokeWidth="2.5"
            />
            {/* Calendar Emoji */}
            <text x="-142" y="6" fontSize="16" textAnchor="middle">
              📅
            </text>
            <text
              x="12"
              y="6"
              fontFamily="'Be Vietnam Pro', 'Montserrat', sans-serif"
              fontWeight="700"
              fontSize="14"
              fill="#BAE6FD"
              letterSpacing="0.8"
              textAnchor="middle"
            >
              Ngày hoàn thành: <tspan fill="#FDE047" fontWeight="900">{dateFormatted}</tspan>
            </text>
          </g>
        </svg>
      </div>

      {/* Action Download Bar */}
      <div className="mt-6 flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={handleDownload}
          disabled={isExporting}
          className="py-4 px-8 rounded-full font-black text-lg text-[#08152c] uppercase tracking-wider bg-gradient-to-b from-[#FFE57F] via-[#FFC107] to-[#FF8F00] hover:from-[#FFF176] hover:to-[#FFA000] active:scale-95 shadow-[0_6px_0_#C67100,0_12px_28px_rgba(255,179,0,0.75)] border-2 border-[#FFE082] flex items-center justify-center gap-3 cursor-pointer transition transform hover:-translate-y-0.5 disabled:opacity-50 select-none font-sans"
        >
          <Download className="w-6 h-6 text-[#08152c]" />
          <span>{isExporting ? 'ĐANG XUẤT ẢNH CHẤT LƯỢNG CAO...' : 'TẢI GIẤY CHỨNG NHẬN (PNG 4K)'}</span>
        </button>
      </div>
    </div>
  );
};
