import React from 'react';
import { RotateCcw, AlertTriangle, X } from 'lucide-react';
import { audioManager } from '../services/AudioManager';

interface ResetConfirmModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
  description?: string;
}

export const ResetConfirmModal: React.FC<ResetConfirmModalProps> = ({
  isOpen,
  onConfirm,
  onCancel,
  title = 'LÀM LẠI VÁN MỚI?',
  description = 'Bạn có chắc chắn muốn làm lại ván mới? Toàn bộ tiến trình ghép tranh và điểm số hiện tại sẽ được khởi động lại từ đầu!'
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150 select-none">
      <div className="relative w-full max-w-md bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-amber-500/80 rounded-3xl p-6 sm:p-7 shadow-[0_20px_60px_rgba(0,0,0,0.85),0_0_35px_rgba(245,158,11,0.3)] text-center">
        {/* Close Button */}
        <button
          onClick={() => {
            audioManager.playClick();
            onCancel();
          }}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-800/80 border border-slate-700 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Warning Icon */}
        <div className="w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-400/60 flex items-center justify-center mx-auto mb-4 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.4)]">
          <RotateCcw className="w-8 h-8 animate-spin-slow" />
        </div>

        {/* Title */}
        <h3 className="text-xl sm:text-2xl font-black text-amber-300 uppercase tracking-wide mb-2 flex items-center justify-center gap-2">
          <AlertTriangle className="w-6 h-6 text-amber-400" />
          <span>{title}</span>
        </h3>

        {/* Description */}
        <p className="text-sm text-slate-300 leading-relaxed mb-6">
          {description}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => {
              audioManager.playClick();
              onCancel();
            }}
            className="w-full sm:w-1/2 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 font-bold text-sm cursor-pointer transition"
          >
            HỦY BỎ
          </button>
          <button
            onClick={() => {
              audioManager.playClick();
              onConfirm();
            }}
            className="w-full sm:w-1/2 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-sm uppercase flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.5)] cursor-pointer transition"
          >
            <RotateCcw className="w-4 h-4" />
            <span>XÁC NHẬN</span>
          </button>
        </div>
      </div>
    </div>
  );
};
