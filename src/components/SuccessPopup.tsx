import React, { useState, useEffect, useRef } from 'react';
import { audioManager } from '../services/AudioManager';
import { GoldenButton3D } from './3d/GoldenButton3D';
import { Sparkles, Timer } from 'lucide-react';

interface SuccessPopupProps {
  currentPiecesCount: number;
  totalPiecesCount: number;
  onContinue: () => void;
  autoCloseSeconds?: number;
}

export const SuccessPopup: React.FC<SuccessPopupProps> = ({
  currentPiecesCount,
  totalPiecesCount,
  onContinue,
  autoCloseSeconds = 3
}) => {
  const [secondsLeft, setSecondsLeft] = useState<number>(autoCloseSeconds);
  const onContinueRef = useRef(onContinue);
  onContinueRef.current = onContinue;
  const hasTriggeredRef = useRef(false);

  const isCompleted = currentPiecesCount >= totalPiecesCount;

  useEffect(() => {
    setSecondsLeft(autoCloseSeconds);
    hasTriggeredRef.current = false;

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          if (!hasTriggeredRef.current) {
            hasTriggeredRef.current = true;
            onContinueRef.current();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [autoCloseSeconds]);

  const handleManualContinue = () => {
    if (hasTriggeredRef.current) return;
    hasTriggeredRef.current = true;
    audioManager.playClick();
    onContinueRef.current();
  };

  const percentRemaining = (secondsLeft / autoCloseSeconds) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm select-none animate-in fade-in duration-200">
      <div className="w-full max-w-sm rounded-3xl bg-slate-900/95 border-2 border-amber-400/80 p-6 sm:p-7 text-center shadow-[0_25px_60px_rgba(0,0,0,0.85),0_0_35px_rgba(245,158,11,0.3)] transform animate-in zoom-in-95 duration-200 relative z-10">
        {/* Celebration Emoji */}
        <div className="text-5xl sm:text-6xl mb-2 animate-bounce">
          {isCompleted ? '🏆' : '🎉'}
        </div>

        {/* Title */}
        <h3 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 tracking-wide mb-1 drop-shadow-[0_2px_12px_rgba(245,158,11,0.5)]">
          {isCompleted ? 'HOÀN THÀNH BỨC TRANH!' : 'ĐÃ GHÉP THÀNH CÔNG'}
        </h3>
        <p className="text-xs sm:text-sm font-bold text-cyan-300 mb-4 tracking-wide">
          {isCompleted ? 'BẠN ĐÃ MỞ KHÓA TOÀN BỘ BÍ ẨN' : 'VÀO KHUNG TRANH BÍ ẨN'}
        </p>

        {/* Dynamic Progress: x/9 MẢNH */}
        <div className="inline-block px-6 py-2 rounded-2xl bg-slate-800/80 border border-cyan-500/40 text-amber-400 font-black text-2xl sm:text-3xl tracking-wider mb-4 shadow-inner">
          {currentPiecesCount} / {totalPiecesCount} MẢNH
        </div>

        {/* 3-Second Countdown Progress Bar */}
        <div className="w-full bg-slate-800/90 rounded-full h-2 overflow-hidden border border-cyan-500/30 mb-2">
          <div
            className="h-full bg-gradient-to-r from-amber-400 via-yellow-300 to-emerald-400 transition-all ease-linear"
            style={{
              width: `${Math.max(0, percentRemaining)}%`,
              transitionDuration: '950ms'
            }}
          />
        </div>

        {/* 3-Second Text Notification */}
        <div className="flex items-center justify-center gap-1.5 text-xs sm:text-sm font-semibold text-cyan-200 mb-5">
          <Timer className="w-4 h-4 text-amber-400 animate-pulse shrink-0" />
          <span>
            {isCompleted
              ? 'Tự động mở lễ vinh danh sau '
              : 'Tự động chuyển thử thách mới sau '}
            <strong className="text-amber-300 font-mono text-base">{secondsLeft}s</strong>
          </span>
        </div>

        {/* 3D Golden CTA Button */}
        <div className="flex justify-center">
          <GoldenButton3D
            onClick={handleManualContinue}
            size="lg"
            icon={<Sparkles className="w-5 h-5 text-slate-950" />}
            className="w-full"
          >
            {isCompleted
              ? `XEM KẾT QUẢ NGAY (${secondsLeft}s)`
              : `TIẾP TỤC NGAY (${secondsLeft}s)`}
          </GoldenButton3D>
        </div>
      </div>
    </div>
  );
};
