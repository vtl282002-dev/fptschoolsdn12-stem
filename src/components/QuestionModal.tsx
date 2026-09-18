import React, { useState } from 'react';
import {
  Check,
  X,
  Lightbulb,
  Trophy,
  Send,
  Sparkles,
  Cpu,
  Zap,
  Globe,
  Compass,
  HelpCircle,
  Clock
} from 'lucide-react';
import { Question } from '../types';
import { audioManager } from '../services/AudioManager';
import { StemRobotMascot } from './StemRobotMascot';
import { GoldenButton3D } from './3d/GoldenButton3D';
import { OptionCard3D } from './3d/OptionCard3D';
import { HoloGeometricShapes3D } from './3d/HoloGeometricShapes3D';
import { HoloSoundVisualizer } from './3d/HoloSoundVisualizer';

interface QuestionModalProps {
  question: Question;
  onAnswerCorrect: () => void;
  onAnswerWrong: () => void;
}

export const QuestionModal: React.FC<QuestionModalProps> = ({
  question,
  onAnswerCorrect,
  onAnswerWrong
}) => {
  const [selectedOpt, setSelectedOpt] = useState<'A' | 'B' | 'C' | 'D' | null>(null);
  const [resultState, setResultState] = useState<'answering' | 'correct' | 'wrong'>('answering');
  const [isSpringShaking, setIsSpringShaking] = useState(false);
  const [showRewardPiece, setShowRewardPiece] = useState(false);

  const handleSelectOption = (optKey: 'A' | 'B' | 'C' | 'D') => {
    if (resultState !== 'answering') return;
    audioManager.playClick();
    setSelectedOpt(optKey);
  };

  const handleConfirmAnswer = () => {
    if (!selectedOpt || resultState !== 'answering') return;

    audioManager.playClick();
    const isCorrect = selectedOpt === question.correctAnswer;

    if (isCorrect) {
      setResultState('correct');
      setShowRewardPiece(true);
      audioManager.playCorrectAnswer();
      setTimeout(() => {
        onAnswerCorrect();
      }, 1800);
    } else {
      setResultState('wrong');
      setIsSpringShaking(true);
      audioManager.playWrongAnswer();
      setTimeout(() => {
        setIsSpringShaking(false);
      }, 650);
      // Tự động chuyển tiếp thử thách khuôn mặt mới sau khi thông báo kết quả (600-1000ms)
      setTimeout(() => {
        onAnswerWrong();
      }, 800);
    }
  };

  const optionKeys: ('A' | 'B' | 'C' | 'D')[] = ['A', 'B', 'C', 'D'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-xl select-none overflow-y-auto">
      {/* Background Cyber Ambient Rings */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] h-[70vw] rounded-full border border-cyan-500/10 animate-spin-very-slow pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[55vw] h-[55vw] rounded-full border border-dashed border-sky-400/15 animate-spin-slow pointer-events-none" />
      </div>

      {/* Floating +1 Puzzle Piece Reward Animation with 3D energy explosion */}
      {showRewardPiece && (
        <div className="fixed inset-0 z-60 pointer-events-none flex items-center justify-center bg-slate-950/40 backdrop-blur-sm animate-fade-in">
          <div className="flex flex-col items-center animate-[bounce_1.2s_ease-in-out_infinite] scale-125">
            {/* Spinning Golden Energy Halo */}
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-amber-400/30 blur-2xl animate-ping" />
              <div className="w-32 h-32 drop-shadow-[0_0_45px_#F59E0B]" style={{ animation: 'spin 5s linear infinite' }}>
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <path
                    d="M 20 20 L 45 20 C 45 10, 55 10, 55 20 L 80 20 L 80 45 C 90 45, 90 55, 80 55 L 80 80 L 55 80 C 55 90, 45 90, 45 80 L 20 80 L 20 45 C 30 45, 30 55, 20 55 Z"
                    fill="url(#goldPieceGrad)"
                    stroke="#FEF08A"
                    strokeWidth="3.5"
                  />
                  <defs>
                    <linearGradient id="goldPieceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#fef08a" />
                      <stop offset="50%" stopColor="#f59e0b" />
                      <stop offset="100%" stopColor="#b45309" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>

            <div className="mt-4 px-6 py-2.5 rounded-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 font-black text-2xl shadow-[0_0_35px_#F59E0B] tracking-wider flex items-center gap-2 animate-pulse border-2 border-yellow-200">
              <Sparkles className="w-6 h-6 text-slate-950 animate-spin-slow" />
              <span>+1 MẢNH GHÉP STEM!</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Holographic Terminal Card - Compacted 5-10% to fit 1366x768 without scrolling */}
      <div
        className={`relative w-full max-w-[min(880px,calc(100vw-80px))] max-h-[calc(100vh-110px)] bg-gradient-to-b from-[#081530]/98 via-[#061126]/98 to-[#030917]/99 border-2 p-5 sm:p-6 lg:p-7 rounded-[28px] shadow-[0_20px_80px_rgba(0,0,0,0.95)] transition-all duration-200 z-20 flex flex-col justify-between overflow-y-auto ${
          isSpringShaking
            ? 'animate-spring-shake border-red-500 shadow-[0_0_60px_rgba(239,68,68,0.7)]'
            : resultState === 'correct'
            ? 'border-emerald-400 shadow-[0_0_60px_rgba(16,185,129,0.7)]'
            : 'border-cyan-400 shadow-[0_0_50px_rgba(6,182,212,0.45)]'
        }`}
      >
        {/* Floating 3D Geometric Holograms in corners */}
        <div className="absolute top-4 left-5 opacity-30 pointer-events-none hidden md:block">
          <HoloGeometricShapes3D type="atom" size={40} color="#00F0FF" />
        </div>
        <div className="absolute top-4 right-5 opacity-30 pointer-events-none hidden md:block">
          <HoloGeometricShapes3D type="gyro" size={38} color="#38bdf8" />
        </div>

        {/* Top Header: Badge + Sound Wave + Horizontal STEM Pillars + Reward Indicator */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 mb-3.5 sm:mb-4 pb-2.5 border-b border-cyan-500/30 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-cyan-950/90 border border-cyan-400/60 text-cyan-300 font-black text-xs sm:text-sm shadow-[0_0_15px_rgba(6,182,212,0.35)]">
              <Lightbulb className="w-4 h-4 text-amber-400 animate-pulse" />
              <span className="tracking-wider uppercase">CÂU HỎI THỬ THÁCH STEM</span>
            </div>

            {/* Holographic sound visualizer */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950/70 border border-cyan-500/20">
              <span className="text-[9px] font-bold text-cyan-400 tracking-wider">HUD</span>
              <HoloSoundVisualizer isPlaying={resultState === 'answering'} barsCount={10} />
            </div>
          </div>

          {/* Right reward pill */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-950/90 to-yellow-950/90 border border-amber-400/60 text-amber-300 font-black text-xs sm:text-sm shadow-[0_0_15px_rgba(245,158,11,0.35)]">
            <Trophy className="w-4 h-4 text-amber-400 animate-bounce" />
            <span className="font-extrabold tracking-wide">+1 MẢNH GHÉP TRANH</span>
          </div>
        </div>

        {/* Main Content: Question & Options */}
        <div className="flex flex-col w-full">
          {/* Question Text Banner */}
          <div className="relative mb-3 sm:mb-4 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-slate-950 via-[#0a1b38] to-slate-950 border border-cyan-400/70 shadow-[0_0_20px_rgba(6,182,212,0.15)] overflow-hidden shrink-0">
            {/* Circuit lines in banner background */}
            <div className="absolute right-0 top-0 bottom-0 w-28 opacity-15 pointer-events-none">
              <svg viewBox="0 0 100 100" className="w-full h-full stroke-cyan-400" fill="none">
                <path d="M 10 20 L 40 20 L 60 50 L 90 50" strokeWidth="2" />
                <circle cx="90" cy="50" r="4" fill="#06b6d4" />
              </svg>
            </div>

            {/* Glowing Corner Accents */}
            <div className="absolute top-1 left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-cyan-400" />
            <div className="absolute bottom-1 right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-cyan-400" />

            <div className="flex items-start gap-3 sm:gap-3.5 z-10 relative">
              <span className="p-2 sm:p-2.5 rounded-xl bg-gradient-to-br from-amber-500/30 to-amber-600/15 border border-amber-400 text-amber-300 shrink-0 mt-0.5 shadow-[0_0_15px_rgba(245,158,11,0.5)]">
                <Lightbulb className="w-6 h-6 sm:w-7 sm:h-7 animate-pulse" />
              </span>
              <div className="flex-1 min-w-0">
                <h3 className="text-base sm:text-lg lg:text-xl font-black text-white leading-snug tracking-tight drop-shadow-md">
                  {question.content}
                </h3>
              </div>
            </div>
          </div>

          {/* 4 Option Cards in 2x2 Grid with tight 10-12px gap */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3 mb-3.5 sm:mb-4 w-full">
            {question.options.map((optText, idx) => {
              const key = optionKeys[idx];
              const isSelected = selectedOpt === key;
              const isCorrect = key === question.correctAnswer;

              return (
                <OptionCard3D
                  key={key}
                  optKey={key}
                  optText={optText}
                  isSelected={isSelected}
                  isCorrect={isCorrect}
                  isDisabled={resultState !== 'answering'}
                  onSelect={handleSelectOption}
                  onConfirm={handleConfirmAnswer}
                  resultState={resultState}
                />
              );
            })}
          </div>

          {/* Bottom Action Area: 3D Golden CTA Button with balanced height */}
          {resultState === 'answering' && (
            <div className="flex flex-col items-center gap-1.5 shrink-0">
              <GoldenButton3D
                onClick={handleConfirmAnswer}
                disabled={!selectedOpt}
                size="md"
                icon={<Send className="w-5 h-5 text-slate-950" />}
                className={`w-full sm:w-auto min-w-[280px] sm:min-w-[380px] py-3 sm:py-3.5 text-lg sm:text-xl font-black tracking-wide transition-all ${
                  selectedOpt
                    ? 'shadow-[0_0_30px_rgba(245,158,11,0.6)] scale-[1.02]'
                    : 'opacity-70'
                }`}
              >
                {selectedOpt ? `XÁC NHẬN ĐÁP ÁN [${selectedOpt}]` : 'HÃY CHỌN 1 ĐÁP ÁN'}
              </GoldenButton3D>

              <p className="text-[11px] sm:text-xs text-cyan-300/80 font-medium tracking-wide">
                💡 Bấm vào đáp án A, B, C, D để chọn • Nhấn nút xác nhận để nộp bài
              </p>
            </div>
          )}

            {/* Correct Feedback Banner with Sci-Fi Hologram Glow */}
            {resultState === 'correct' && (
              <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-emerald-950/95 via-teal-950/95 to-emerald-950/95 border-2 border-emerald-400 text-emerald-300 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-[0_0_40px_rgba(16,185,129,0.5)] animate-fade-in">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center shrink-0 shadow-[0_0_15px_#10b981]">
                    <Check className="w-7 h-7 text-emerald-300 stroke-[3.5]" />
                  </div>
                  <div>
                    <p className="font-black text-lg sm:text-xl text-white">
                      CHÍNH XÁC! Bạn nhận được +1 lượt ghép tranh.
                    </p>
                    {question.explanation && (
                      <p className="text-sm sm:text-base text-emerald-200/90 mt-1 leading-relaxed">
                        {question.explanation}
                      </p>
                    )}
                  </div>
                </div>
                <span className="text-xs sm:text-sm font-black px-4 py-2.5 rounded-2xl bg-emerald-900/90 text-emerald-200 animate-pulse shrink-0 border border-emerald-400/60 shadow-md">
                  Đang mở bàn ghép tranh...
                </span>
              </div>
            )}

            {/* Wrong Feedback Banner with countdown timer */}
            {resultState === 'wrong' && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-red-950/95 via-rose-950/95 to-red-950/95 border-2 border-red-500 text-red-200 shadow-[0_0_40px_rgba(239,68,68,0.5)] animate-fade-in">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-red-500/20 border-2 border-red-500 flex items-center justify-center shrink-0 shadow-[0_0_15px_#ef4444]">
                    <X className="w-7 h-7 text-red-300 stroke-[3.5]" />
                  </div>
                  <div>
                    <p className="font-black text-lg sm:text-xl text-white">
                      Chưa chính xác! Bạn chưa nhận được mảnh ghép lần này.
                    </p>
                    {question.explanation && (
                      <p className="text-sm sm:text-base text-red-200/90 mt-1 leading-relaxed">
                        {question.explanation}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs font-bold text-red-300 animate-pulse hidden sm:inline-flex items-center gap-1.5">
                    <Clock className="w-4 h-4 animate-spin-slow" />
                    <span>Đang đổi thử thách mới...</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      audioManager.playClick();
                      onAnswerWrong();
                    }}
                    className="w-full sm:w-auto px-5 py-3 rounded-2xl btn-3d-cyan text-slate-950 font-black text-sm uppercase flex items-center justify-center gap-2 cursor-pointer shrink-0 shadow-lg"
                  >
                    <span>Vào thử thách ngay</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
  );
};
