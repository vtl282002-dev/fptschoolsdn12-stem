import React from 'react';
import { audioManager } from '../services/AudioManager';
import { GoldenButton3D } from './3d/GoldenButton3D';
import { Sparkles } from 'lucide-react';

interface SuccessPopupProps {
  currentPiecesCount: number;
  totalPiecesCount: number;
  onContinue: () => void;
}

export const SuccessPopup: React.FC<SuccessPopupProps> = ({
  currentPiecesCount,
  totalPiecesCount,
  onContinue
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm select-none animate-in fade-in duration-200">
      <div className="w-full max-w-sm rounded-3xl bg-slate-900/98 border-2 border-amber-400/80 p-6 sm:p-8 text-center shadow-[0_25px_60px_rgba(0,0,0,0.85),0_0_35px_rgba(245,158,11,0.3)] transform animate-in zoom-in-95 duration-200 relative z-10">
        {/* Emoji */}
        <div className="text-5xl sm:text-6xl mb-3 animate-bounce">🎉</div>

        {/* Title */}
        <h3 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 tracking-wide mb-1 drop-shadow-[0_2px_12px_rgba(245,158,11,0.5)]">
          ĐÃ GHÉP THÀNH CÔNG
        </h3>
        <p className="text-sm sm:text-base font-bold text-cyan-300 mb-5 tracking-wide">
          VÀO KHUNG TRANH BÍ ẨN
        </p>

        {/* Dynamic Progress: 2/9 MẢNH */}
        <div className="inline-block px-6 py-2.5 rounded-2xl bg-slate-800/80 border border-cyan-500/40 text-amber-400 font-black text-2xl sm:text-3xl tracking-wider mb-6 shadow-inner">
          {currentPiecesCount} / {totalPiecesCount} MẢNH
        </div>

        {/* 3D Golden CTA Button */}
        <div className="flex justify-center">
          <GoldenButton3D
            onClick={() => {
              audioManager.playClick();
              onContinue();
            }}
            size="lg"
            icon={<Sparkles className="w-5 h-5 text-slate-950" />}
            className="w-full"
          >
            TIẾP TỤC THỬ THÁCH
          </GoldenButton3D>
        </div>
      </div>
    </div>
  );
};
