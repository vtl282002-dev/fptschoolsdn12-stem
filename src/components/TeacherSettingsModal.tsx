import React, { useState } from 'react';
import {
  X,
  Lock,
  Save,
  RotateCcw,
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  Plus,
  Trash2,
  Image as ImageIcon,
  Sliders,
  Download,
  FolderOpen
} from 'lucide-react';
import { GameSettings, QuestionSet, Question, ChallengeType } from '../types';
import { CHALLENGE_DEFINITIONS } from '../data/challenges';
import { QuestionImporter } from '../services/QuestionImporter';
import { audioManager } from '../services/AudioManager';

interface TeacherSettingsModalProps {
  settings: GameSettings;
  questionSets: QuestionSet[];
  onSaveSettings: (settings: GameSettings) => void;
  onSaveQuestionSets: (sets: QuestionSet[], activeSetId: string) => void;
  onClose: () => void;
}

export const TeacherSettingsModal: React.FC<TeacherSettingsModalProps> = ({
  settings,
  questionSets,
  onSaveSettings,
  onSaveQuestionSets,
  onClose
}) => {
  // Password state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [enteredPassword, setEnteredPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Active tab
  const [activeTab, setActiveTab] = useState<'challenge_scores' | 'challenges' | 'questions' | 'puzzle_image' | 'logo'>('challenge_scores');

  // Local draft copies
  const [localSettings, setLocalSettings] = useState<GameSettings>({ ...settings });
  const [localQuestionSets, setLocalQuestionSets] = useState<QuestionSet[]>([...questionSets]);
  const [activeSetId, setActiveSetId] = useState<string>(settings.activeQuestionSetId);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string>('');

  // Question editing state
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [importedText, setImportedText] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);

  // Password verification
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (enteredPassword === (settings.teacherPassword || '123456')) {
      setIsAuthenticated(true);
      setAuthError('');
      audioManager.playClick();
    } else {
      setAuthError('Mật khẩu không chính xác! (Mặc định: 123456)');
      audioManager.playPieceWrong();
    }
  };

  // Find active question set
  const currentSet = localQuestionSets.find((s) => s.id === activeSetId) || localQuestionSets[0];

  // Save all changes
  const handleSaveAll = () => {
    audioManager.playClick();
    onSaveSettings(localSettings);
    onSaveQuestionSets(localQuestionSets, activeSetId);
    try {
      localStorage.setItem('fpt_stem_challenge_scores', JSON.stringify(localSettings.requiredScores));
    } catch {}
    onClose();
  };

  // Save scores specifically with immediate feedback
  const handleSaveScoresOnly = () => {
    audioManager.playScoreTargetReached();
    onSaveSettings(localSettings);
    try {
      localStorage.setItem('fpt_stem_challenge_scores', JSON.stringify(localSettings.requiredScores));
    } catch {}
    setSaveSuccessMessage('✓ Đã lưu cài đặt điểm thành công! Cấu hình này sẽ được sử dụng cho mọi lượt chơi và không bị mất khi tải lại trang.');
    setTimeout(() => {
      setSaveSuccessMessage('');
    }, 4000);
  };

  // Quick Preset Handlers
  const handleApplyPresetStandard = () => {
    setLocalSettings((prev) => ({
      ...prev,
      requiredScores: {
        ...prev.requiredScores,
        mouth_pucker: 100,
        smile: 50,
        grin: 40,
        wink_left: 20,
        wink_right: 20,
        eyes_closed: 70,
        mouth_open: 60,
        mouth_stretch: 75,
        head_shake: 65,
        head_nod: 65,
        cheek_puff: 70,
        brow_raise: 65
      }
    }));
    audioManager.playClick();
  };

  const handleAdjustAllScores = (delta: number) => {
    setLocalSettings((prev) => {
      const nextScores: Record<ChallengeType, number> = { ...prev.requiredScores };
      Object.keys(nextScores).forEach((k) => {
        const key = k as ChallengeType;
        const current = nextScores[key] ?? 65;
        nextScores[key] = Math.min(100, Math.max(10, current + delta));
      });
      return {
        ...prev,
        requiredScores: nextScores
      };
    });
    audioManager.playClick();
  };

  // Toggle challenge enabled
  const toggleChallenge = (type: ChallengeType) => {
    setLocalSettings((prev) => {
      const isCurrentlyEnabled = !!prev.enabledChallenges[type];
      const activeCount = Object.values(prev.enabledChallenges).filter(Boolean).length;
      // Keep at least 1 challenge enabled
      if (isCurrentlyEnabled && activeCount <= 1) {
        return prev;
      }
      return {
        ...prev,
        enabledChallenges: {
          ...prev.enabledChallenges,
          [type]: !isCurrentlyEnabled
        }
      };
    });
  };

  // Change challenge required score
  const updateChallengeScore = (type: ChallengeType, score: number) => {
    setLocalSettings((prev) => ({
      ...prev,
      requiredScores: {
        ...prev.requiredScores,
        [type]: Math.min(100, Math.max(10, score))
      }
    }));
  };

  // Handle puzzle image file upload
  const handlePuzzleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const url = event.target?.result as string;
      // Extract natural dimensions
      const img = new Image();
      img.onload = () => {
        setLocalSettings((prev) => ({
          ...prev,
          puzzleImageUrl: url,
          puzzleImageNaturalWidth: img.naturalWidth,
          puzzleImageNaturalHeight: img.naturalHeight
        }));
      };
      img.src = url;
    };
    reader.readAsDataURL(file);
  };

  // Handle school logo upload
  const handleSchoolLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const url = event.target?.result as string;
      setLocalSettings((prev) => ({
        ...prev,
        schoolLogoUrl: url
      }));
    };
    reader.readAsDataURL(file);
  };

  // Import questions from text
  const handleExecuteImport = () => {
    if (!importedText.trim()) return;
    const parsed = QuestionImporter.parseText(importedText);
    if (parsed.length > 0 && currentSet) {
      setLocalQuestionSets((prev) =>
        prev.map((set) =>
          set.id === currentSet.id
            ? { ...set, questions: [...set.questions, ...parsed] }
            : set
        )
      );
      setImportedText('');
      setShowImportModal(false);
      audioManager.playScoreTargetReached();
    }
  };

  // Download template
  const handleDownloadTemplate = () => {
    const text = QuestionImporter.getSampleTemplate();
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'mau_cau_hoi_stem.txt';
    link.click();
  };

  // If not authenticated, render password lock screen
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md select-none">
        <div className="w-full max-w-md bg-slate-900 border-2 border-cyan-500/50 rounded-3xl p-6 sm:p-8 shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2 text-cyan-300 font-bold">
              <Lock className="w-5 h-5" />
              <span>CÀI ĐẶT DÀNH CHO GIÁO VIÊN</span>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleLogin}>
            <p className="text-sm text-slate-300 mb-4 font-medium">
              Vui lòng nhập mật khẩu quản trị để vào bảng cấu hình thử thách và ngân hàng câu hỏi.
            </p>
            <input
              type="password"
              value={enteredPassword}
              onChange={(e) => setEnteredPassword(e.target.value)}
              placeholder="Nhập mật khẩu..."
              className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white font-semibold outline-none focus:border-cyan-400 mb-2"
              autoFocus
            />
            {authError && <p className="text-xs text-red-400 mb-4">{authError}</p>}

            <button
              type="submit"
              className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-sm uppercase shadow-md transition"
            >
              XÁC NHẬN
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md select-none overflow-y-auto">
      <div className="w-full max-w-5xl bg-slate-900 border-2 border-cyan-500/40 rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <Sliders className="w-6 h-6 text-amber-400" />
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-100">
                BẢNG ĐIỀU HÀNH VÀ CÀI ĐẶT
              </h2>
              <p className="text-xs text-cyan-400">Tùy biến thử thách biểu cảm, ngân hàng câu hỏi và tranh ghép</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap items-center gap-2 px-6 py-2.5 border-b border-slate-800 bg-slate-950/60">
          <button
            onClick={() => setActiveTab('challenge_scores')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'challenge_scores'
                ? 'bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-300 border border-amber-500/50 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-4 h-4 text-amber-400" /> CÀI ĐẶT ĐIỂM THỬ THÁCH KHUÔN MẶT
          </button>

          <button
            onClick={() => setActiveTab('challenges')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'challenges'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <RotateCcw className="w-4 h-4" /> Bật/Tắt Biểu Cảm & Đếm Ngược
          </button>

          <button
            onClick={() => setActiveTab('questions')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'questions'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FolderOpen className="w-4 h-4" /> Bộ câu hỏi ({currentSet?.questions.length || 0})
          </button>

          <button
            onClick={() => setActiveTab('puzzle_image')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'puzzle_image'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ImageIcon className="w-4 h-4" /> Tranh bí ẩn
          </button>

          <button
            onClick={() => setActiveTab('logo')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'logo'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" /> Logo trường học
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* ================= 1. CÀI ĐẶT ĐIỂM THỬ THÁCH KHUÔN MẶT ================= */}
          {activeTab === 'challenge_scores' && (
            <div className="space-y-6">
              {/* Header Box */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-800/80 to-slate-900 border border-amber-500/40 shadow-lg">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-amber-300 font-black text-base sm:text-lg uppercase">
                      <Sliders className="w-5 h-5 text-amber-400" />
                      <span>CÀI ĐẶT ĐIỂM THỬ THÁCH KHUÔN MẶT</span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                      Mỗi biểu cảm/khuôn mặt có mức độ nhận diện dễ hoặc khó khác nhau. Bạn có thể tự thiết lập <strong>Điểm yêu cầu riêng cho TỪNG thử thách</strong> (Ví dụ: Chu môi: 100, Cười mỉm: 50, Cười lộ răng: 40, Nháy mắt: 80...). Khi người chơi đạt đủ điểm này, hệ thống sẽ xác nhận hoàn thành ngay.
                    </p>
                  </div>
                  <button
                    onClick={handleSaveScoresOnly}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs sm:text-sm uppercase flex items-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.4)] cursor-pointer shrink-0 transition"
                  >
                    <Save className="w-4 h-4" /> LƯU CÀI ĐẶT
                  </button>
                </div>

                {/* Quick Preset Buttons */}
                <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-slate-700/80">
                  <span className="text-xs text-slate-400 font-semibold">Cấu hình nhanh:</span>
                  <button
                    onClick={handleApplyPresetStandard}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-amber-500/30 text-amber-300 text-xs font-bold transition cursor-pointer"
                  >
                    ⭐ Chuẩn đề xuất (Chu môi 100, Mỉm 50, Răng 40, Nháy mắt 80)
                  </button>
                  <button
                    onClick={() => handleAdjustAllScores(-10)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 text-xs font-bold transition cursor-pointer"
                  >
                    -10 điểm (Dễ hơn)
                  </button>
                  <button
                    onClick={() => handleAdjustAllScores(+10)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 text-xs font-bold transition cursor-pointer"
                  >
                    +10 điểm (Thử thách hơn)
                  </button>
                </div>
              </div>

              {/* Save Success Alert */}
              {saveSuccessMessage && (
                <div className="p-4 rounded-2xl bg-emerald-950/80 border-2 border-emerald-400 text-emerald-300 flex items-center gap-3 animate-in fade-in zoom-in duration-200">
                  <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                  <p className="text-xs sm:text-sm font-bold">{saveSuccessMessage}</p>
                </div>
              )}

              {/* Challenge Score Table / List matching: [Tên thử thách] | [Điểm yêu cầu] */}
              <div className="rounded-2xl border border-slate-700 bg-slate-900/80 overflow-hidden shadow-md">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-3 px-5 py-3.5 bg-slate-950 border-b border-slate-800 text-xs font-black uppercase text-cyan-400 tracking-wider">
                  <div className="col-span-6 sm:col-span-5">Tên thử thách khuôn mặt</div>
                  <div className="hidden sm:block sm:col-span-3">Hướng dẫn nhận diện</div>
                  <div className="col-span-6 sm:col-span-4 text-right sm:text-center">Điểm yêu cầu (10 - 100)</div>
                </div>

                {/* Rows for 12 Challenges */}
                <div className="divide-y divide-slate-800">
                  {Object.values(CHALLENGE_DEFINITIONS).map((ch) => {
                    const currentScore = localSettings.requiredScores[ch.id] ?? ch.defaultScore;

                    return (
                      <div
                        key={ch.id}
                        className="grid grid-cols-12 gap-3 px-5 py-3.5 items-center hover:bg-slate-800/40 transition"
                      >
                        {/* [Tên thử thách] */}
                        <div className="col-span-6 sm:col-span-5 flex items-center gap-3">
                          <span className="text-2xl select-none">{ch.icon}</span>
                          <div>
                            <div className="font-bold text-sm sm:text-base text-slate-100">
                              {ch.name}
                            </div>
                            <div className="sm:hidden text-[11px] text-slate-400 line-clamp-1">
                              {ch.instruction}
                            </div>
                          </div>
                        </div>

                        {/* Instruction Column */}
                        <div className="hidden sm:block sm:col-span-3 text-xs text-slate-400">
                          {ch.instruction}
                        </div>

                        {/* [Điểm yêu cầu] Input Field */}
                        <div className="col-span-6 sm:col-span-4 flex items-center justify-end sm:justify-center gap-2">
                          <button
                            onClick={() => updateChallengeScore(ch.id, currentScore - 5)}
                            className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-black text-sm flex items-center justify-center cursor-pointer"
                            title="Giảm 5 điểm"
                          >
                            -
                          </button>

                          {/* Direct Input Field [ 100 ] */}
                          <div className="relative">
                            <input
                              type="number"
                              min={10}
                              max={100}
                              step={5}
                              value={currentScore}
                              onChange={(e) => {
                                const val = parseInt(e.target.value, 10);
                                if (!isNaN(val)) {
                                  updateChallengeScore(ch.id, val);
                                }
                              }}
                              className="w-20 sm:w-24 px-3 py-1.5 rounded-xl bg-slate-950 border-2 border-amber-500/60 text-amber-300 font-mono font-black text-sm sm:text-base text-center shadow-inner focus:border-amber-400 focus:outline-none"
                            />
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-amber-500/70 font-bold pointer-events-none hidden sm:inline">
                              đ
                            </span>
                          </div>

                          <button
                            onClick={() => updateChallengeScore(ch.id, currentScore + 5)}
                            className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-black text-sm flex items-center justify-center cursor-pointer"
                            title="Tăng 5 điểm"
                          >
                            +
                          </button>

                          {/* Difficulty badge */}
                          <span
                            className={`hidden md:inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              currentScore >= 90
                                ? 'bg-red-950 text-red-300 border border-red-500/40'
                                : currentScore >= 70
                                ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                                : 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                            }`}
                          >
                            {currentScore >= 90 ? 'Khó' : currentScore >= 70 ? 'Vừa' : 'Dễ'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Action Footer */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-800/40 border border-slate-700">
                <p className="text-xs text-slate-400">
                  💡 <strong>Ghi chú:</strong> Sau khi nhấn <strong>LƯU CÀI ĐẶT</strong>, hệ thống sẽ lưu và áp dụng ngay cho tất cả thử thách khi học sinh bắt đầu chơi. Cấu hình được ghi nhớ vĩnh viễn trên trình duyệt.
                </p>
                <button
                  onClick={handleSaveScoresOnly}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-sm uppercase flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.5)] cursor-pointer transition shrink-0"
                >
                  <Save className="w-4 h-4" /> LƯU CÀI ĐẶT
                </button>
              </div>
            </div>
          )}

          {/* ================= 2. BẬT/TẮT BIỂU CẢM & ĐẾM NGƯỢC ================= */}
          {activeTab === 'challenges' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-800/50 border border-slate-700">
                <div>
                  <h4 className="font-bold text-slate-100 text-sm sm:text-base">Thời gian đếm ngược chuẩn bị</h4>
                  <p className="text-xs text-slate-400">Khoảng thời gian đếm 3-2-1 sau khi bấm SẴN SÀNG</p>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={1}
                    max={5}
                    value={localSettings.countdownDuration}
                    onChange={(e) =>
                      setLocalSettings({ ...localSettings, countdownDuration: parseInt(e.target.value) })
                    }
                    className="w-32 accent-cyan-400"
                  />
                  <span className="font-bold text-cyan-300 text-sm w-12 text-right">
                    {localSettings.countdownDuration}s
                  </span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-100 text-sm sm:text-base mb-3">
                  Danh sách 12 biểu cảm hỗ trợ (Bật/Tắt và chỉnh điểm chuẩn)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.values(CHALLENGE_DEFINITIONS).map((ch) => {
                    const isEnabled = !!localSettings.enabledChallenges[ch.id];
                    const currentScore = localSettings.requiredScores[ch.id] ?? ch.defaultScore;

                    return (
                      <div
                        key={ch.id}
                        className={`p-3.5 rounded-2xl border transition flex items-center justify-between gap-3 ${
                          isEnabled
                            ? 'bg-slate-800/80 border-cyan-500/40'
                            : 'bg-slate-900/40 border-slate-800 opacity-60'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={isEnabled}
                            onChange={() => toggleChallenge(ch.id)}
                            className="w-5 h-5 accent-cyan-400 cursor-pointer rounded"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xl">{ch.icon}</span>
                              <span className="font-bold text-sm text-slate-200">{ch.name}</span>
                            </div>
                            <span className="text-xs text-slate-400">{ch.instruction}</span>
                          </div>
                        </div>

                        {/* Required score adjustment */}
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs text-slate-400 font-semibold">Điểm:</span>
                          <input
                            type="number"
                            min={20}
                            max={100}
                            value={currentScore}
                            onChange={(e) => updateChallengeScore(ch.id, parseInt(e.target.value) || 60)}
                            className="w-16 px-2 py-1 rounded-lg bg-slate-900 border border-slate-700 text-amber-300 text-center font-bold text-xs"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* 2. QUESTIONS TAB */}
          {activeTab === 'questions' && (
            <div className="space-y-6">
              {/* Question Sets Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-300">Bộ câu hỏi:</span>
                  <select
                    value={activeSetId}
                    onChange={(e) => setActiveSetId(e.target.value)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-cyan-300 font-bold text-xs sm:text-sm outline-none"
                  >
                    {localQuestionSets.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.questions.length} câu)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDownloadTemplate}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 text-cyan-300 text-xs font-bold flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" /> Tải tệp mẫu TXT
                  </button>

                  <button
                    onClick={() => setShowImportModal(true)}
                    className="px-3 py-1.5 rounded-xl bg-cyan-600/30 border border-cyan-500 hover:bg-cyan-500/40 text-cyan-200 text-xs font-bold flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" /> Nhập thêm câu hỏi
                  </button>
                </div>
              </div>

              {/* Questions List */}
              <div className="space-y-3">
                {currentSet?.questions.map((q, idx) => (
                  <div
                    key={q.id}
                    className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700 flex flex-col gap-2"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="font-bold text-sm text-slate-200">
                        Câu {idx + 1}: {q.content}
                      </span>
                      <div className="flex items-center gap-2 shrink-0">
                        {q.isConfirmed ? (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-300 text-[10px] font-bold border border-emerald-800 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> Đã xác nhận
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-amber-950 text-amber-300 text-[10px] font-bold border border-amber-800 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> Cần giáo viên xác nhận
                          </span>
                        )}
                        <button
                          onClick={() => {
                            if (currentSet.questions.length <= 1) return;
                            setLocalQuestionSets((prev) =>
                              prev.map((s) =>
                                s.id === currentSet.id
                                  ? { ...s, questions: s.questions.filter((item) => item.id !== q.id) }
                                  : s
                              )
                            );
                          }}
                          className="text-slate-400 hover:text-red-400 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
                      {q.options.map((opt, oIdx) => {
                        const optKey = (['A', 'B', 'C', 'D'] as const)[oIdx];
                        const isCorrect = optKey === q.correctAnswer;
                        return (
                          <div
                            key={optKey}
                            className={`p-2 rounded-lg border ${
                              isCorrect
                                ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200 font-bold'
                                : 'bg-slate-900 border-slate-800'
                            }`}
                          >
                            {optKey}. {opt}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. PUZZLE IMAGE TAB */}
          {activeTab === 'puzzle_image' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700">
                <h4 className="font-bold text-slate-100 text-sm sm:text-base mb-1">
                  Bức tranh bí ẩn hiện tại
                </h4>
                <p className="text-xs text-slate-400 mb-4">
                  Ảnh được giữ nguyên tỉ lệ gốc tự nhiên, chia thành 9 mảnh ghép không biến dạng.
                </p>

                <div className="w-full max-w-md aspect-[4/3] rounded-2xl overflow-hidden border border-cyan-500/40 bg-slate-950 mb-4">
                  <img
                    src={localSettings.puzzleImageUrl}
                    alt="Tranh bí ẩn"
                    className="w-full h-full object-contain"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <label className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs uppercase cursor-pointer flex items-center gap-2 shadow-md">
                    <Upload className="w-4 h-4" /> Tải ảnh mới từ máy tính
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePuzzleImageUpload}
                      className="hidden"
                    />
                  </label>

                  <button
                    onClick={() => {
                      setLocalSettings({
                        ...localSettings,
                        puzzleImageUrl: '/assets/default_puzzle.svg',
                        puzzleImageNaturalWidth: 1200,
                        puzzleImageNaturalHeight: 800
                      });
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center gap-2"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Dùng tranh STEM mặc định
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 4. LOGO TAB */}
          {activeTab === 'logo' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700">
                <h4 className="font-bold text-slate-100 text-sm sm:text-base mb-1">
                  Logo nhà trường
                </h4>
                <p className="text-xs text-slate-400 mb-4">
                  Logo hiển thị trên góc trái màn hình và giấy chứng nhận hoàn thành.
                </p>

                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 inline-block mb-4">
                  <img
                    src={localSettings.schoolLogoUrl}
                    alt="Logo trường"
                    className="h-12 w-auto object-contain"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <label className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs uppercase cursor-pointer flex items-center gap-2 shadow-md">
                    <Upload className="w-4 h-4" /> Tải logo trường mới
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleSchoolLogoUpload}
                      className="hidden"
                    />
                  </label>

                  <button
                    onClick={() => {
                      setLocalSettings({
                        ...localSettings,
                        schoolLogoUrl: '/assets/fpt_schools_logo.svg'
                      });
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center gap-2"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Dùng logo FPT Schools mặc định
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-bold text-xs sm:text-sm"
          >
            Hủy bỏ
          </button>
          <button
            onClick={handleSaveAll}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs sm:text-sm uppercase flex items-center gap-2 shadow-md cursor-pointer"
          >
            <Save className="w-4 h-4" /> LƯU THIẾT LẬP
          </button>
        </div>
      </div>

      {/* Text Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/90 select-none">
          <div className="w-full max-w-2xl bg-slate-900 border-2 border-cyan-500/60 rounded-3xl p-6 shadow-2xl flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-cyan-300 text-base">Nhập danh sách câu hỏi</h3>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-400 mb-2">
              Dán nội dung câu hỏi theo định dạng: Câu 1:... A. B. C. D. Đáp án đúng: A.
            </p>
            <textarea
              value={importedText}
              onChange={(e) => setImportedText(e.target.value)}
              placeholder={`Câu 1: ...\nA. ...\nB. ...\nC. ...\nD. ...\nĐáp án đúng: A\nGiải thích: ...`}
              rows={10}
              className="w-full p-4 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono text-xs outline-none focus:border-cyan-400 mb-4"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
              >
                Hủy
              </button>
              <button
                onClick={handleExecuteImport}
                className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-black uppercase"
              >
                Xác nhận thêm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
