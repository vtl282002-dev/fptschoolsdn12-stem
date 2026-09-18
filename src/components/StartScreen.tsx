import React, { useState } from 'react';
import { Volume2, VolumeX, Settings, User, School } from 'lucide-react';
import { audioManager } from '../services/AudioManager';
import { Background3D } from './Background3D';
import { FptSchoolsLogo } from './FptSchoolsLogo';
import { Interactive3DCard } from './3d/Interactive3DCard';
import { HeroTitle3D } from './3d/HeroTitle3D';
import { HoloGeometricShapes3D } from './3d/HoloGeometricShapes3D';
import { HoloCyberConsole3D } from './3d/HoloCyberConsole3D';
import { StemRobotBookStack } from './3d/StemRobotBookStack';

interface StartScreenProps {
  playerName: string;
  onPlayerNameChange: (name: string) => void;
  playerSchool: string;
  onPlayerSchoolChange: (school: string) => void;
  onStartGame: () => void;
  onOpenSettings: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  schoolLogoUrl?: string;
}

export const StartScreen: React.FC<StartScreenProps> = ({
  playerName,
  onPlayerNameChange,
  playerSchool,
  onPlayerSchoolChange,
  onStartGame,
  onOpenSettings,
  isMuted,
  onToggleMute
}) => {
  const [errorMsg, setErrorMsg] = useState('');

  const handleStart = (e?: React.MouseEvent | React.TouchEvent) => {
    if (e) {
      e.stopPropagation();
    }
    try {
      audioManager.playClick();
    } catch {}

    const trimmed = playerName.trim();
    if (!trimmed) {
      onPlayerNameChange('Thí sinh STEM');
    }
    setErrorMsg('');
    onStartGame();
  };

  return (
    <div className="relative w-full h-screen max-h-screen flex flex-col justify-between overflow-hidden select-none text-slate-100 font-sans">
      {/* 3D Parallax Vibrant Royal Blue Sci-Fi Observatory Background */}
      <Background3D />

      {/* ================= TOP HEADER BAR ================= */}
      <header className="relative z-30 flex items-center justify-between px-6 sm:px-10 py-3 max-w-7xl mx-auto w-full shrink-0">
        {/* Left: The Official FPT SCHOOLS Logo */}
        <div className="flex items-center">
          <FptSchoolsLogo size="md" />
        </div>

        {/* Right: Round Translucent Blue Sound Toggle & Settings Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              audioManager.playClick();
              onToggleMute();
            }}
            className="w-10 h-10 rounded-full bg-blue-950/70 border-2 border-cyan-400/80 text-cyan-200 hover:bg-cyan-500/20 active:scale-95 flex items-center justify-center transition shadow-[0_0_12px_rgba(0,240,255,0.4)] cursor-pointer"
            title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
          <button
            onClick={() => {
              audioManager.playClick();
              onOpenSettings();
            }}
            className="w-10 h-10 rounded-full bg-blue-950/70 border-2 border-cyan-400/80 text-cyan-200 hover:bg-cyan-500/20 active:scale-95 flex items-center justify-center transition shadow-[0_0_12px_rgba(0,240,255,0.4)] cursor-pointer"
            title="Cài đặt hệ thống"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* ================= MAIN STAGE: EXACT HORIZONTAL & VERTICAL CENTER ================= */}
      <main className="relative z-20 flex-1 flex flex-col items-center justify-center px-4 w-full overflow-hidden">
        {/* Ambient Side Wing (Left): STEM Robot on large displays without affecting center flow */}
        <div className="absolute left-6 xl:left-12 2xl:left-20 bottom-8 hidden 2xl:flex flex-col items-center pointer-events-none opacity-85 scale-90 origin-bottom-left">
          <StemRobotBookStack />
        </div>

        {/* Ambient Side Wing (Right): Cyber Hologram Console on large displays */}
        <div className="absolute right-6 xl:right-12 2xl:right-20 bottom-8 hidden 2xl:flex flex-col items-center pointer-events-none opacity-85 scale-90 origin-bottom-right">
          <HoloCyberConsole3D />
        </div>

        {/* Central Cluster: 3D Title -> Form Card (Centered Horizontally & Vertically) */}
        <div className="flex flex-col items-center justify-center w-full z-30 my-auto">
          {/* 1. Game Title with Real 3D Extrusion, Float, Light Sweep & Puzzle Pieces */}
          <HeroTitle3D />

          {/* 2. FORM CARD: Exact width min(460px, calc(100vw - 80px)) */}
          <div className="w-full max-w-[min(460px,calc(100vw-80px))]">
            <Interactive3DCard
              maxTilt={5}
              perspective={1000}
              elevationZ={10}
              preserve3d={false}
              borderGlow={false}
              glowColor="rgba(0, 240, 255, 0.45)"
              className="w-full p-5 sm:p-7 rounded-3xl bg-[#08204d]/90 backdrop-blur-xl border-2 border-cyan-400 shadow-[0_0_40px_rgba(0,240,255,0.4)] relative"
            >
            {/* Floating STEM Atom Decor */}
            <div className="absolute -top-3 -right-3 opacity-60 pointer-events-none">
              <HoloGeometricShapes3D type="atom" size={32} color="#00F0FF" />
            </div>

            {/* Corner Brackets ⌜ ⌝ ⌞ ⌟ */}
            <div className="absolute top-2 left-2 w-3.5 h-3.5 border-t-2 border-l-2 border-cyan-300 pointer-events-none" />
            <div className="absolute top-2 right-2 w-3.5 h-3.5 border-t-2 border-r-2 border-cyan-300 pointer-events-none" />
            <div className="absolute bottom-2 left-2 w-3.5 h-3.5 border-b-2 border-l-2 border-cyan-300 pointer-events-none" />
            <div className="absolute bottom-2 right-2 w-3.5 h-3.5 border-b-2 border-r-2 border-cyan-300 pointer-events-none" />

            {/* Inputs: Họ và tên & Trường học (height 54px) */}
            <div className="space-y-3.5 mb-5">
              {/* Field 1: Họ và tên người chơi */}
              <div>
                <label className="block text-xs font-bold text-cyan-200 uppercase tracking-wider mb-1 text-left">
                  Họ và tên người chơi <span className="text-amber-400">*</span>
                </label>
                <div className="relative flex items-center bg-white rounded-2xl shadow-inner border border-slate-200 px-3.5 h-[54px]">
                  <User className="w-5 h-5 text-slate-400 shrink-0 mr-2.5" />
                  <input
                    type="text"
                    value={playerName}
                    onChange={(e) => {
                      onPlayerNameChange(e.target.value);
                      if (errorMsg) setErrorMsg('');
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleStart();
                    }}
                    placeholder="Ví dụ: Nguyễn Văn An"
                    maxLength={40}
                    className="w-full text-base font-bold text-slate-900 placeholder:text-slate-400 outline-none bg-transparent"
                    autoFocus
                  />
                </div>
              </div>

              {/* Field 2: Trường của người chơi */}
              <div>
                <label className="block text-xs font-bold text-cyan-200 uppercase tracking-wider mb-1 text-left">
                  Trường học / Lớp
                </label>
                <div className="relative flex items-center bg-white rounded-2xl shadow-inner border border-slate-200 px-3.5 h-[54px]">
                  <School className="w-5 h-5 text-slate-400 shrink-0 mr-2.5" />
                  <input
                    type="text"
                    value={playerSchool}
                    onChange={(e) => onPlayerSchoolChange(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleStart();
                    }}
                    placeholder="Ví dụ: Tiểu học FPT Schools - Lớp 4A1"
                    maxLength={60}
                    className="w-full text-base font-bold text-slate-900 placeholder:text-slate-400 outline-none bg-transparent"
                  />
                </div>
              </div>

              {errorMsg && (
                <p className="text-amber-300 text-xs text-center font-bold drop-shadow-[0_0_8px_#F59E0B] animate-pulse">
                  {errorMsg}
                </p>
              )}
            </div>

            {/* Glowing 3D Golden-Amber Start Button (height 54px) */}
            <div className="relative flex items-center justify-center">
              <button
                type="button"
                id="start-game-button"
                onClick={handleStart}
                onTouchEnd={handleStart}
                className="w-full h-[54px] px-8 rounded-full font-black text-xl text-[#0b172a] uppercase tracking-wider bg-gradient-to-b from-[#FFE57F] via-[#FFC107] to-[#FF8F00] hover:from-[#FFF176] hover:to-[#FFA000] active:scale-95 shadow-[0_5px_0_#C67100,0_10px_25px_rgba(255,179,0,0.7)] border-2 border-[#FFE082] flex items-center justify-center gap-2.5 cursor-pointer transition transform hover:-translate-y-0.5 relative z-50 pointer-events-auto"
              >
                <span className="text-xl text-[#0b172a] drop-shadow-sm pointer-events-none">▶</span>
                <span className="font-extrabold tracking-wider pointer-events-none">BẮT ĐẦU</span>
              </button>
            </div>
          </Interactive3DCard>
          </div>
        </div>
      </main>

      {/* Footer info */}
      <footer className="relative z-20 text-center py-2 text-[11px] text-cyan-300/70 font-medium bg-[#020b1c]/80 border-t border-cyan-500/20 shrink-0">
        Hệ thống nhận diện biểu cảm khuôn mặt AI STEM • FPT Schools
      </footer>
    </div>
  );
};
