import React, { useRef, useEffect } from 'react';
import { RotateCcw, Home, Award } from 'lucide-react';
import { audioManager } from '../services/AudioManager';
import { StemRobotMascot } from './StemRobotMascot';
import { StemCertificate } from './StemCertificate';

interface VictoryScreenProps {
  playerName: string;
  playerSchool?: string;
  imageUrl: string;
  schoolLogoUrl: string;
  onPlayAgain: () => void;
  onGoHome: () => void;
}

export const VictoryScreen: React.FC<VictoryScreenProps> = ({
  playerName,
  playerSchool,
  imageUrl,
  onPlayAgain,
  onGoHome
}) => {
  const canvasConfettiRef = useRef<HTMLCanvasElement>(null);

  // Trigger celebration fanfare and confetti
  useEffect(() => {
    audioManager.playVictoryFanfare();

    const canvas = canvasConfettiRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const confettiPieces: {
      x: number;
      y: number;
      size: number;
      color: string;
      speedX: number;
      speedY: number;
      rotation: number;
      rotSpeed: number;
    }[] = [];

    const colors = ['#f59e0b', '#06b6d4', '#10b981', '#ec4899', '#8b5cf6', '#eab308'];

    for (let i = 0; i < 150; i++) {
      confettiPieces.push({
        x: Math.random() * canvas.width,
        y: Math.random() * -canvas.height,
        size: Math.random() * 8 + 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        speedX: (Math.random() - 0.5) * 3,
        speedY: Math.random() * 3 + 2,
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 6
      });
    }

    let animId: number;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      confettiPieces.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;
        p.rotation += p.rotSpeed;

        if (p.y > canvas.height) {
          p.y = -20;
          p.x = Math.random() * canvas.width;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.7);
        ctx.restore();
      });
      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div className="relative w-full min-h-screen flex flex-col items-center justify-between p-4 sm:p-8 bg-slate-950 select-none overflow-y-auto">
      {/* Falling Confetti Canvas */}
      <canvas
        ref={canvasConfettiRef}
        className="fixed inset-0 pointer-events-none z-10"
      />

      {/* Background radial glow */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,_rgba(245,158,11,0.15)_0%,_rgba(15,23,42,0.95)_70%,_#020617_100%)] pointer-events-none" />

      {/* Main Content */}
      <div className="relative z-20 max-w-5xl w-full flex flex-col items-center my-auto py-6">
        {/* Celebration Title */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-5 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-300 font-bold text-sm uppercase tracking-wider mb-2 animate-bounce">
            <Award className="w-5 h-5" /> CHIẾN THẮNG TUYỆT ĐỐI!
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 drop-shadow-[0_4px_20px_rgba(245,158,11,0.6)]">
            Chúc mừng {playerName || 'Nhà thám hiểm STEM'}!
          </h1>
          <p className="text-cyan-300 text-sm sm:text-base mt-1 font-semibold">
            Bạn đã xuất sắc mở khóa và ghép trọn vẹn 9/9 mảnh tranh bí ẩn!
          </p>
        </div>

        {/* Revealed Full Image Preview & Cheering Robot */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-8 w-full max-w-2xl">
          <div className="w-full max-w-md aspect-[4/3] rounded-2xl overflow-hidden border-2 border-amber-400/80 shadow-[0_0_35px_rgba(245,158,11,0.4)] bg-slate-900">
            <img
              src={imageUrl}
              alt="Bức tranh bí ẩn hoàn thiện"
              className="w-full h-full object-contain"
            />
          </div>

          <div className="shrink-0">
            <StemRobotMascot
              size="sm"
              mood="cheering"
              speechText="Bạn thật phi thường!"
            />
          </div>
        </div>

        {/* Official STEM Explorer Certificate (Identical artwork layout with school name included) */}
        <StemCertificate
          playerName={playerName}
          playerSchool={playerSchool}
          className="mb-8"
        />

        {/* Navigation Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 w-full mt-2">
          <button
            type="button"
            onClick={() => {
              audioManager.playClick();
              onPlayAgain();
            }}
            className="py-3.5 px-7 rounded-2xl font-bold text-base text-cyan-300 bg-slate-900/90 border-2 border-cyan-500/60 hover:bg-cyan-500/20 active:scale-95 transition flex items-center gap-2.5 cursor-pointer shadow-lg"
          >
            <RotateCcw className="w-5 h-5 text-cyan-400" />
            <span>CHƠI LẠI</span>
          </button>

          <button
            type="button"
            onClick={() => {
              audioManager.playClick();
              onGoHome();
            }}
            className="py-3.5 px-7 rounded-2xl font-bold text-base text-slate-300 bg-slate-900/90 border-2 border-slate-700 hover:bg-slate-800 active:scale-95 transition flex items-center gap-2.5 cursor-pointer shadow-lg"
          >
            <Home className="w-5 h-5 text-slate-400" />
            <span>VỀ TRANG CHỦ</span>
          </button>
        </div>
      </div>
    </div>
  );
};
