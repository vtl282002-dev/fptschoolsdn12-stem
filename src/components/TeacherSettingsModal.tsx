import React, { useState, useEffect } from 'react';
import {
  X,
  Lock,
  Save,
  RotateCcw,
  Upload,
  FileText,
  CheckCircle,
  Plus,
  Trash2,
  Image as ImageIcon,
  Sliders,
  Download,
  FolderOpen,
  User,
  GraduationCap,
  LogOut,
  UserPlus,
  Grid3X3,
  Sparkles
} from 'lucide-react';
import { GameSettings, QuestionSet, Question, ChallengeType, TeacherAccount } from '../types';
import { CHALLENGE_DEFINITIONS } from '../data/challenges';
import { QuestionImporter } from '../services/QuestionImporter';
import { audioManager } from '../services/AudioManager';
import { indexedDBService, DEFAULT_REQUIRED_SCORES } from '../services/IndexedDBService';
import { ImageOptimizer } from '../services/ImageOptimizer';

interface TeacherSettingsModalProps {
  settings: GameSettings;
  questionSets: QuestionSet[];
  onSaveSettings: (settings: GameSettings) => void;
  onSaveQuestionSets: (sets: QuestionSet[], activeSetId: string) => void;
  onClose: () => void;
  onTeacherChange?: (teacher: TeacherAccount) => void;
  onConfirmStartNewGame?: (newSettings: GameSettings, newSets: QuestionSet[], activeSetId: string) => void;
}

export const TeacherSettingsModal: React.FC<TeacherSettingsModalProps> = ({
  settings,
  questionSets,
  onSaveSettings,
  onSaveQuestionSets,
  onClose,
  onTeacherChange,
  onConfirmStartNewGame
}) => {
  // Teacher Accounts state
  const [teachers, setTeachers] = useState<TeacherAccount[]>([]);
  const [currentTeacher, setCurrentTeacher] = useState<TeacherAccount | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginMode, setLoginMode] = useState<'select' | 'register'>('select');

  // Confirmation modal to start new game with new settings & image & question set
  const [showNewGameConfirmModal, setShowNewGameConfirmModal] = useState(false);
  const [savedSnapshot, setSavedSnapshot] = useState<{
    mergedSettings: GameSettings;
    targetSets: QuestionSet[];
    targetSetId: string;
  } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Login form state
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');
  const [enteredPassword, setEnteredPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Register new teacher form state
  const [newTeacherName, setNewTeacherName] = useState('');
  const [newTeacherSchool, setNewTeacherSchool] = useState('FPT Schools');
  const [newTeacherTitle, setNewTeacherTitle] = useState('Giáo viên STEM');
  const [newTeacherUsername, setNewTeacherUsername] = useState('');
  const [newTeacherPassword, setNewTeacherPassword] = useState('123');

  // Active tab inside teacher dashboard
  const [activeTab, setActiveTab] = useState<'challenge_scores' | 'questions' | 'puzzle_image' | 'profile' | 'challenges'>('challenge_scores');

  // Local draft copies for active teacher
  const [localSettings, setLocalSettings] = useState<GameSettings>({ ...settings });
  const [localQuestionSets, setLocalQuestionSets] = useState<QuestionSet[]>([...questionSets]);
  const [activeSetId, setActiveSetId] = useState<string>(settings.activeQuestionSetId);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string>('');

  // New question form state
  const [showAddQuestionModal, setShowAddQuestionModal] = useState(false);
  const [newQContent, setNewQContent] = useState('');
  const [newQOptA, setNewQOptA] = useState('');
  const [newQOptB, setNewQOptB] = useState('');
  const [newQOptC, setNewQOptC] = useState('');
  const [newQOptD, setNewQOptD] = useState('');
  const [newQCorrect, setNewQCorrect] = useState<'A' | 'B' | 'C' | 'D'>('A');
  const [newQExplain, setNewQExplain] = useState('');

  // Question Import Modal
  const [showImportModal, setShowImportModal] = useState(false);
  const [importedText, setImportedText] = useState('');

  // New Question Set Modal
  const [showNewSetModal, setShowNewSetModal] = useState(false);
  const [newSetName, setNewSetName] = useState('');
  const [newSetSubject, setNewSetSubject] = useState('STEM');
  const [newSetGrade, setNewSetGrade] = useState('Khối Tiểu học');

  // Load teachers on mount
  useEffect(() => {
    async function initTeachers() {
      const list = await indexedDBService.getTeachers();
      setTeachers(list);
      const activeId = indexedDBService.getActiveTeacherId();
      const active = list.find((t) => t.id === activeId) || list[0];
      if (active) {
        setSelectedTeacherId(active.id);
        setCurrentTeacher(active);
        // Pre-fill local draft with teacher's personalized settings
        applyTeacherToState(active);
      }
    }
    initTeachers();
  }, []);

  const applyTeacherToState = (teacher: TeacherAccount) => {
    setCurrentTeacher(teacher);
    setLocalSettings((prev) => ({
      ...prev,
      currentTeacherId: teacher.id,
      teacherName: teacher.name,
      schoolName: teacher.schoolName,
      schoolLogoUrl: teacher.schoolLogoUrl || prev.schoolLogoUrl,
      puzzleImageUrl: teacher.puzzleImageUrl || prev.puzzleImageUrl,
      puzzleImageNaturalWidth: teacher.puzzleImageNaturalWidth || prev.puzzleImageNaturalWidth,
      puzzleImageNaturalHeight: teacher.puzzleImageNaturalHeight || prev.puzzleImageNaturalHeight,
      requiredScores: {
        ...DEFAULT_REQUIRED_SCORES,
        ...(teacher.requiredScores || {})
      },
      enabledChallenges: teacher.enabledChallenges || prev.enabledChallenges,
      countdownDuration: teacher.countdownDuration || prev.countdownDuration,
      activeQuestionSetId: teacher.activeQuestionSetId || prev.activeQuestionSetId,
      teacherPassword: teacher.password || '123'
    }));

    if (teacher.questionSets && teacher.questionSets.length > 0) {
      setLocalQuestionSets(teacher.questionSets);
      setActiveSetId(teacher.activeQuestionSetId || teacher.questionSets[0].id);
    }
  };

  // Login handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const teacher = teachers.find((t) => t.id === selectedTeacherId);
    if (!teacher) {
      setAuthError('Vui lòng chọn tài khoản giáo viên!');
      return;
    }

    const expectedPwd = teacher.password || '123';
    if (enteredPassword.trim() === expectedPwd || enteredPassword.trim() === '123456') {
      setIsAuthenticated(true);
      setAuthError('');
      indexedDBService.setActiveTeacherId(teacher.id);
      applyTeacherToState(teacher);
      audioManager.playScoreTargetReached();
    } else {
      setAuthError(`Mật khẩu không chính xác! (Mật khẩu mặc định: ${expectedPwd})`);
      audioManager.playPieceWrong();
    }
  };

  // Register new teacher
  const handleRegisterNewTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeacherName.trim()) {
      setAuthError('Vui lòng nhập họ và tên giáo viên');
      return;
    }

    const newId = 'teacher_' + Date.now();
    const newUsername = (newTeacherUsername.trim() || 'gv_' + Date.now().toString().slice(-4)).toLowerCase();

    const newTeacher: TeacherAccount = {
      id: newId,
      username: newUsername,
      name: newTeacherName.trim(),
      title: newTeacherTitle.trim() || 'Giáo viên STEM',
      schoolName: newTeacherSchool.trim() || 'FPT Schools',
      password: newTeacherPassword.trim() || '123',
      avatarColor: ['#059669', '#0284c7', '#7c3aed', '#d97706', '#dc2626'][Math.floor(Math.random() * 5)],
      puzzleImageUrl: '/assets/default_puzzle.svg',
      puzzleImageNaturalWidth: 1200,
      puzzleImageNaturalHeight: 800,
      requiredScores: { ...DEFAULT_REQUIRED_SCORES },
      enabledChallenges: { ...localSettings.enabledChallenges },
      countdownDuration: 3,
      activeQuestionSetId: localQuestionSets[0]?.id || 'set_stem_primary',
      questionSets: [...localQuestionSets],
      schoolLogoUrl: localSettings.schoolLogoUrl,
      updatedAt: Date.now()
    };

    await indexedDBService.saveTeacher(newTeacher);
    const updatedList = await indexedDBService.getTeachers();
    setTeachers(updatedList);
    setSelectedTeacherId(newTeacher.id);
    indexedDBService.setActiveTeacherId(newTeacher.id);
    applyTeacherToState(newTeacher);
    setIsAuthenticated(true);
    setAuthError('');
    setLoginMode('select');
    audioManager.playScoreTargetReached();
  };

  // Handle Logout / Switch teacher
  const handleSwitchTeacher = () => {
    setIsAuthenticated(false);
    setEnteredPassword('');
    setAuthError('');
  };

  // Current active question set
  const currentSet = localQuestionSets.find((s) => s.id === activeSetId) || localQuestionSets[0];

  // Save changes specifically to the current teacher account
  const saveCurrentTeacherProfile = async (
    customSettings?: Partial<GameSettings>,
    customQuestionSets?: QuestionSet[],
    customActiveSetId?: string
  ) => {
    if (!currentTeacher) return null;

    const mergedSettings: GameSettings = {
      ...localSettings,
      ...(customSettings || {})
    };

    const targetSets = customQuestionSets || localQuestionSets;
    const targetSetId = customActiveSetId || activeSetId;

    const updatedTeacher: TeacherAccount = {
      ...currentTeacher,
      name: mergedSettings.teacherName,
      schoolName: mergedSettings.schoolName,
      password: mergedSettings.teacherPassword || currentTeacher.password || '123',
      puzzleImageUrl: mergedSettings.puzzleImageUrl,
      puzzleImageNaturalWidth: mergedSettings.puzzleImageNaturalWidth,
      puzzleImageNaturalHeight: mergedSettings.puzzleImageNaturalHeight,
      requiredScores: mergedSettings.requiredScores,
      enabledChallenges: mergedSettings.enabledChallenges,
      countdownDuration: mergedSettings.countdownDuration,
      activeQuestionSetId: targetSetId,
      questionSets: targetSets,
      schoolLogoUrl: mergedSettings.schoolLogoUrl,
      updatedAt: Date.now()
    };

    setCurrentTeacher(updatedTeacher);
    await indexedDBService.saveTeacher(updatedTeacher);
    indexedDBService.setActiveTeacherId(updatedTeacher.id);

    // Refresh teachers list
    const refreshed = await indexedDBService.getTeachers();
    setTeachers(refreshed);

    onSaveSettings(mergedSettings);
    onSaveQuestionSets(targetSets, targetSetId);
    if (onTeacherChange) {
      onTeacherChange(updatedTeacher);
    }

    return { mergedSettings, targetSets, targetSetId, updatedTeacher };
  };

  // Step 1: User clicks save -> save asynchronously first, then show confirmation dialog
  const handleSaveAll = async () => {
    if (isSaving) return;
    audioManager.playClick();
    setIsSaving(true);
    setSaveSuccessMessage('Đang lưu cấu hình...');

    try {
      const result = await saveCurrentTeacherProfile();
      if (result) {
        setSavedSnapshot({
          mergedSettings: result.mergedSettings,
          targetSets: result.targetSets,
          targetSetId: result.targetSetId
        });
        try {
          localStorage.setItem('fpt_stem_challenge_scores', JSON.stringify(localSettings.requiredScores));
        } catch {}
        setSaveSuccessMessage('✓ Cài đặt đã được lưu thành công!');
        setShowNewGameConfirmModal(true);
      }
    } catch (err) {
      console.error('Lỗi khi lưu cài đặt:', err);
      setSaveSuccessMessage('⚠️ Không thể lưu cài đặt. Vui lòng thử lại.');
    } finally {
      setIsSaving(false);
    }
  };

  // Step 3: User confirmed "OK – Bắt đầu ván mới"
  const handleConfirmStartNewGame = () => {
    audioManager.playScoreTargetReached();
    const target = savedSnapshot || {
      mergedSettings: localSettings,
      targetSets: localQuestionSets,
      targetSetId: activeSetId
    };

    if (onConfirmStartNewGame) {
      onConfirmStartNewGame(target.mergedSettings, target.targetSets, target.targetSetId);
    }
    setShowNewGameConfirmModal(false);
    onClose();
  };

  // Step 2 choice: User clicked "Để sau" -> do NOT start new game, keep current game
  const handleSaveWithoutRestart = () => {
    audioManager.playClick();
    setShowNewGameConfirmModal(false);
    onClose();
  };

  // Save scores specifically with immediate feedback
  const handleSaveScoresOnly = async () => {
    audioManager.playScoreTargetReached();
    await saveCurrentTeacherProfile();
    try {
      localStorage.setItem('fpt_stem_challenge_scores', JSON.stringify(localSettings.requiredScores));
    } catch {}
    setSaveSuccessMessage(`✓ Đã lưu cài đặt điểm cho tài khoản "${currentTeacher?.name || 'Giáo viên'}" thành công!`);
    setTimeout(() => {
      setSaveSuccessMessage('');
    }, 4000);
  };

  // Preset scores handlers
  const handleApplyPresetStandard = () => {
    setLocalSettings((prev) => ({
      ...prev,
      requiredScores: {
        mouth_pucker: 50,
        cheek_puff: 50,
        wink_left: 20,
        wink_right: 20,
        smile: 50,
        grin: 40,
        eyes_closed: 70,
        mouth_open: 60,
        mouth_stretch: 75,
        head_shake: 65,
        head_nod: 65,
        brow_raise: 65
      }
    }));
    audioManager.playClick();
  };

  const handleAdjustAllScores = (delta: number) => {
    setLocalSettings((prev) => {
      const nextScores: Record<ChallengeType, number> = { ...prev.requiredScores };
      (Object.keys(nextScores) as ChallengeType[]).forEach((key) => {
        const current = nextScores[key] ?? 50;
        nextScores[key] = Math.min(100, Math.max(10, current + delta));
      });
      return {
        ...prev,
        requiredScores: nextScores
      };
    });
    audioManager.playClick();
  };

  const updateChallengeScore = (type: ChallengeType, score: number) => {
    setLocalSettings((prev) => ({
      ...prev,
      requiredScores: {
        ...prev.requiredScores,
        [type]: Math.min(100, Math.max(10, score))
      }
    }));
  };

  const toggleChallenge = (type: ChallengeType) => {
    setLocalSettings((prev) => {
      const isCurrentlyEnabled = !!prev.enabledChallenges[type];
      const activeCount = Object.values(prev.enabledChallenges).filter(Boolean).length;
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

  // Handle puzzle image file upload with client-side optimization & instant persistence
  const handlePuzzleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setSaveSuccessMessage('Đang tối ưu hóa hình ảnh tranh ghép...');
      const optimized = await ImageOptimizer.optimize(file, 1280, 0.88);

      setLocalSettings((prev) => ({
        ...prev,
        puzzleImageUrl: optimized.dataUrl,
        puzzleImageNaturalWidth: optimized.width,
        puzzleImageNaturalHeight: optimized.height
      }));

      // Immediately save image to dedicated puzzle store
      const teacherId = currentTeacher?.id || 'teacher_thao';
      await indexedDBService.savePuzzleImage(
        teacherId,
        optimized.dataUrl,
        optimized.width,
        optimized.height
      );

      // Save teacher profile with optimized image
      await saveCurrentTeacherProfile({
        puzzleImageUrl: optimized.dataUrl,
        puzzleImageNaturalWidth: optimized.width,
        puzzleImageNaturalHeight: optimized.height
      });

      audioManager.playScoreTargetReached();
      setSaveSuccessMessage('✓ Đã cập nhật và lưu hình ảnh tranh bí ẩn mới thành công!');
      setTimeout(() => setSaveSuccessMessage(''), 4500);
    } catch (err) {
      console.error('Lỗi khi tải ảnh tranh ghép:', err);
      setSaveSuccessMessage('⚠️ Không thể tải ảnh. Vui lòng thử một ảnh khác.');
      setTimeout(() => setSaveSuccessMessage(''), 4000);
    } finally {
      // Clear input so same file can be re-selected if desired
      e.target.value = '';
    }
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
    if (!importedText.trim() || !currentSet) return;
    const parsed = QuestionImporter.parseText(importedText);
    if (parsed.length > 0) {
      const updatedSets = localQuestionSets.map((set) =>
        set.id === currentSet.id
          ? { ...set, questions: [...set.questions, ...parsed] }
          : set
      );
      setLocalQuestionSets(updatedSets);
      saveCurrentTeacherProfile(undefined, updatedSets, activeSetId);
      setImportedText('');
      setShowImportModal(false);
      audioManager.playScoreTargetReached();
      setSaveSuccessMessage(`✓ Đã nhập thành công ${parsed.length} câu hỏi mới vào bộ "${currentSet.name}"!`);
      setTimeout(() => setSaveSuccessMessage(''), 4000);
    }
  };

  // Add a single custom question
  const handleAddSingleQuestion = () => {
    if (!newQContent.trim() || !newQOptA.trim() || !newQOptB.trim()) return;

    const newQ: Question = {
      id: 'q_' + Date.now(),
      content: newQContent.trim(),
      options: [
        newQOptA.trim(),
        newQOptB.trim(),
        newQOptC.trim() || 'Đáp án C',
        newQOptD.trim() || 'Đáp án D'
      ],
      correctAnswer: newQCorrect,
      explanation: newQExplain.trim() || undefined,
      isConfirmed: true
    };

    const updatedSets = localQuestionSets.map((s) =>
      s.id === currentSet.id
        ? { ...s, questions: [...s.questions, newQ] }
        : s
    );

    setLocalQuestionSets(updatedSets);
    saveCurrentTeacherProfile(undefined, updatedSets, activeSetId);

    // Reset form
    setNewQContent('');
    setNewQOptA('');
    setNewQOptB('');
    setNewQOptC('');
    setNewQOptD('');
    setNewQExplain('');
    setShowAddQuestionModal(false);
    audioManager.playScoreTargetReached();
  };

  // Create new question set
  const handleCreateNewQuestionSet = () => {
    if (!newSetName.trim()) return;

    const newSet: QuestionSet = {
      id: 'set_' + Date.now(),
      name: newSetName.trim(),
      subject: newSetSubject.trim() || 'STEM',
      grade: newSetGrade.trim() || 'Tiểu học',
      status: 'saved',
      updatedAt: Date.now(),
      questions: [
        {
          id: 'q_init_1',
          content: `Câu hỏi 1 thuộc bộ môn ${newSetSubject}: STEM mang lại lợi ích gì cho học sinh?`,
          options: [
            'Phát triển tư duy giải quyết vấn đề và năng lực sáng tạo.',
            'Chỉ giúp học sinh học thuộc các công thức toán học.',
            'Thay thế hoàn toàn sách giáo khoa truyền thống.',
            'Chỉ dành cho các học sinh giỏi công nghệ.'
          ],
          correctAnswer: 'A',
          explanation: 'STEM tích hợp kiến thức giúp giải quyết vấn đề thực tế.',
          isConfirmed: true
        }
      ]
    };

    const updatedSets = [...localQuestionSets, newSet];
    setLocalQuestionSets(updatedSets);
    setActiveSetId(newSet.id);
    saveCurrentTeacherProfile(undefined, updatedSets, newSet.id);
    setShowNewSetModal(false);
    setNewSetName('');
    audioManager.playScoreTargetReached();
  };

  // Download template
  const handleDownloadTemplate = () => {
    const text = QuestionImporter.getSampleTemplate();
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'mau_cau_hoi_stem_fpt.txt';
    link.click();
  };

  // ================= 1. TEACHER AUTHENTICATION / LOGIN VIEW =================
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md select-none overflow-y-auto">
        <div className="w-full max-w-lg bg-slate-900 border-2 border-cyan-500/50 rounded-3xl p-6 sm:p-8 shadow-2xl">
          {/* Header */}
          <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-slate-950 font-black shadow-md">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-100 uppercase">
                  CÀI ĐẶT CÁ NHÂN HÓA GIÁO VIÊN
                </h3>
                <p className="text-xs text-cyan-400">Đăng nhập tài khoản giáo viên để tùy biến nội dung</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Mode Switcher */}
          <div className="flex rounded-xl bg-slate-950 p-1 mb-5 border border-slate-800">
            <button
              type="button"
              onClick={() => {
                setLoginMode('select');
                setAuthError('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                loginMode === 'select'
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Đăng nhập tài khoản có sẵn
            </button>
            <button
              type="button"
              onClick={() => {
                setLoginMode('register');
                setAuthError('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
                loginMode === 'register'
                  ? 'bg-amber-400 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" /> Tạo giáo viên mới
            </button>
          </div>

          {loginMode === 'select' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">
                  Chọn tài khoản giáo viên:
                </label>
                <div className="space-y-2">
                  {teachers.map((t) => (
                    <label
                      key={t.id}
                      className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition ${
                        selectedTeacherId === t.id
                          ? 'bg-cyan-950/60 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                          : 'bg-slate-800/60 border-slate-700 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow"
                          style={{ backgroundColor: t.avatarColor || '#059669' }}
                        >
                          {t.name.split(' ').pop()?.[0] || 'G'}
                        </div>
                        <div>
                          <div className="font-bold text-sm text-slate-100">{t.name}</div>
                          <div className="text-xs text-slate-400">
                            {t.title || 'Giáo viên'} • {t.schoolName}
                          </div>
                        </div>
                      </div>
                      <input
                        type="radio"
                        name="teacher"
                        value={t.id}
                        checked={selectedTeacherId === t.id}
                        onChange={() => setSelectedTeacherId(t.id)}
                        className="w-4 h-4 accent-cyan-400"
                      />
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Mật khẩu tài khoản (Mặc định: 123 hoặc 123456):
                </label>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                  <input
                    type="password"
                    value={enteredPassword}
                    onChange={(e) => setEnteredPassword(e.target.value)}
                    placeholder="Nhập mật khẩu..."
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white font-semibold outline-none focus:border-cyan-400 text-sm"
                    autoFocus
                  />
                </div>
                {authError && <p className="text-xs text-red-400 mt-2 font-medium">{authError}</p>}
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-sm uppercase shadow-lg transition cursor-pointer"
              >
                VÀO BẢNG CÀI ĐẶT CÁ NHÂN
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterNewTeacher} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Họ và tên giáo viên <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  value={newTeacherName}
                  onChange={(e) => setNewTeacherName(e.target.value)}
                  placeholder="Ví dụ: Cô Lê Thị Mai"
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-medium text-sm outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Bộ môn / Vai trò</label>
                  <input
                    type="text"
                    value={newTeacherTitle}
                    onChange={(e) => setNewTeacherTitle(e.target.value)}
                    placeholder="Ví dụ: STEM Robotics"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Trường học</label>
                  <input
                    type="text"
                    value={newTeacherSchool}
                    onChange={(e) => setNewTeacherSchool(e.target.value)}
                    placeholder="Ví dụ: Tiểu học FPT"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Tên đăng nhập</label>
                  <input
                    type="text"
                    value={newTeacherUsername}
                    onChange={(e) => setNewTeacherUsername(e.target.value)}
                    placeholder="Ví dụ: gv_mai"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Mật khẩu PIN</label>
                  <input
                    type="text"
                    value={newTeacherPassword}
                    onChange={(e) => setNewTeacherPassword(e.target.value)}
                    placeholder="Mặc định: 123"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {authError && <p className="text-xs text-red-400 font-medium">{authError}</p>}

              <button
                type="submit"
                className="w-full mt-2 py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-black text-sm uppercase shadow-lg transition cursor-pointer"
              >
                TẠO TÀI KHOẢN VÀ VÀO CÀI ĐẶT
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  // ================= 2. AUTHENTICATED TEACHER DASHBOARD =================
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md select-none overflow-y-auto">
      <div className="w-full max-w-5xl bg-slate-900 border-2 border-cyan-500/40 rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header Bar with Current Teacher Profile */}
        <div className="flex flex-wrap items-center justify-between px-6 py-3.5 border-b border-slate-800 bg-slate-900/90 gap-3">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-white text-base shadow-md"
              style={{ backgroundColor: currentTeacher?.avatarColor || '#059669' }}
            >
              {currentTeacher?.name.split(' ').pop()?.[0] || 'G'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-slate-100">
                  {currentTeacher?.name || 'Giáo viên'}
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/50 text-cyan-300 text-[10px] font-bold">
                  Tài khoản cá nhân
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {currentTeacher?.schoolName} • {currentTeacher?.title || 'Phụ trách môn học'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSwitchTeacher}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition"
              title="Đổi giáo viên"
            >
              <LogOut className="w-3.5 h-3.5" /> Đổi tài khoản
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Tab Navigation: 5 core tabs */}
        <div className="flex flex-wrap items-center gap-1.5 px-6 py-2 border-b border-slate-800 bg-slate-950/70">
          <button
            onClick={() => setActiveTab('challenge_scores')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'challenge_scores'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/60 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-4 h-4 text-amber-400" />
            <span>1. Tự set điểm đạt</span>
          </button>

          <button
            onClick={() => setActiveTab('questions')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'questions'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/60 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FolderOpen className="w-4 h-4 text-cyan-400" />
            <span>2. Tự đẩy câu hỏi ({currentSet?.questions.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('puzzle_image')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'puzzle_image'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/60 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ImageIcon className="w-4 h-4 text-cyan-400" />
            <span>3. Tự đẩy hình ảnh tranh ghép</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/60'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Hồ sơ giáo viên</span>
          </button>

          <button
            onClick={() => setActiveTab('challenges')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'challenges'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/60'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            <span>Bật/Tắt Biểu Cảm</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Success Banner */}
          {saveSuccessMessage && (
            <div className="p-3.5 rounded-2xl bg-emerald-950/80 border-2 border-emerald-400 text-emerald-300 flex items-center gap-3 animate-in fade-in">
              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
              <p className="text-xs sm:text-sm font-bold">{saveSuccessMessage}</p>
            </div>
          )}

          {/* ================= TAB 1: TỰ SET SỐ ĐIỂM CẦN ĐẠT ĐƯỢC ================= */}
          {activeTab === 'challenge_scores' && (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-800/80 to-slate-900 border border-amber-500/40 shadow-lg">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-amber-300 font-black text-base sm:text-lg uppercase">
                      <Sliders className="w-5 h-5 text-amber-400" />
                      <span>CÀI ĐẶT ĐIỂM CẦN ĐẠT CỦA {currentTeacher?.name.toUpperCase()}</span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                      Thiết lập <strong>số điểm mục tiêu riêng cho từng biểu cảm</strong> theo độ tuổi học sinh lớp của bạn (Chu môi: 50, Phồng má: 50, Nháy mắt: 20...). Sau khi học sinh đạt đủ mức điểm này, AI sẽ lập tức ghi nhận vượt qua thử thách.
                    </p>
                  </div>
                  <button
                    onClick={handleSaveScoresOnly}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs sm:text-sm uppercase flex items-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.4)] cursor-pointer shrink-0 transition"
                  >
                    <Save className="w-4 h-4" /> LƯU CHO TÀI KHOẢN NÀY
                  </button>
                </div>

                {/* Quick Presets */}
                <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-slate-700/80">
                  <span className="text-xs text-slate-400 font-semibold">Cấu hình nhanh:</span>
                  <button
                    onClick={handleApplyPresetStandard}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-amber-500/40 text-amber-300 text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> Chuẩn tối ưu (Chu môi 50, Phồng má 50, Nháy mắt 20)
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

              {/* Table of 12 Challenges */}
              <div className="rounded-2xl border border-slate-700 bg-slate-900/80 overflow-hidden shadow-md">
                <div className="grid grid-cols-12 gap-3 px-5 py-3.5 bg-slate-950 border-b border-slate-800 text-xs font-black uppercase text-cyan-400 tracking-wider">
                  <div className="col-span-6 sm:col-span-5">Thử thách biểu cảm</div>
                  <div className="hidden sm:block sm:col-span-3">Mô tả nhận diện</div>
                  <div className="col-span-6 sm:col-span-4 text-right sm:text-center">Số điểm cần đạt (10 - 100)</div>
                </div>

                <div className="divide-y divide-slate-800">
                  {Object.values(CHALLENGE_DEFINITIONS).map((ch) => {
                    const currentScore = localSettings.requiredScores[ch.id] ?? ch.defaultScore;

                    return (
                      <div
                        key={ch.id}
                        className="grid grid-cols-12 gap-3 px-5 py-3 items-center hover:bg-slate-800/40 transition"
                      >
                        <div className="col-span-6 sm:col-span-5 flex items-center gap-3">
                          <span className="text-2xl select-none">{ch.icon}</span>
                          <div>
                            <div className="font-bold text-sm sm:text-base text-slate-100">{ch.name}</div>
                            <div className="sm:hidden text-[11px] text-slate-400 line-clamp-1">{ch.instruction}</div>
                          </div>
                        </div>

                        <div className="hidden sm:block sm:col-span-3 text-xs text-slate-400">
                          {ch.instruction}
                        </div>

                        <div className="col-span-6 sm:col-span-4 flex items-center justify-end sm:justify-center gap-2">
                          <button
                            onClick={() => updateChallengeScore(ch.id, currentScore - 5)}
                            className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-black text-sm flex items-center justify-center cursor-pointer"
                            title="Giảm 5 điểm"
                          >
                            -
                          </button>

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

                          <span
                            className={`hidden md:inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              currentScore >= 80
                                ? 'bg-red-950 text-red-300 border border-red-500/40'
                                : currentScore >= 50
                                ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                                : 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                            }`}
                          >
                            {currentScore >= 80 ? 'Khó' : currentScore >= 50 ? 'Chuẩn' : 'Dễ'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSaveScoresOnly}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-sm uppercase flex items-center gap-2 shadow-md cursor-pointer transition"
                >
                  <Save className="w-4 h-4" /> LƯU ĐIỂM CHO TÀI KHOẢN NÀY
                </button>
              </div>
            </div>
          )}

          {/* ================= TAB 2: TỰ ĐẨY CÂU HỎI ================= */}
          {activeTab === 'questions' && (
            <div className="space-y-6">
              {/* Top Controls: Choose question set + Add question buttons */}
              <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs sm:text-sm font-bold text-slate-300">Bộ câu hỏi của bạn:</span>
                  <select
                    value={activeSetId}
                    onChange={(e) => {
                      const newId = e.target.value;
                      setActiveSetId(newId);
                      saveCurrentTeacherProfile(undefined, undefined, newId);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-slate-900 border border-cyan-500/50 text-cyan-300 font-bold text-xs sm:text-sm outline-none"
                  >
                    {localQuestionSets.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.questions.length} câu)
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => setShowNewSetModal(true)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold border border-cyan-500/40 flex items-center gap-1.5"
                    title="Tạo bộ câu hỏi mới"
                  >
                    <Plus className="w-3.5 h-3.5" /> Tạo bộ mới
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleDownloadTemplate}
                    className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 text-cyan-300 text-xs font-bold flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" /> Tải tệp mẫu TXT
                  </button>

                  <button
                    onClick={() => setShowImportModal(true)}
                    className="px-3 py-2 rounded-xl bg-cyan-600/30 border border-cyan-500 hover:bg-cyan-500/40 text-cyan-200 text-xs font-bold flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" /> Tự đẩy câu hỏi (TXT)
                  </button>

                  <button
                    onClick={() => setShowAddQuestionModal(true)}
                    className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 text-xs font-black uppercase flex items-center gap-1.5 shadow"
                  >
                    <Plus className="w-4 h-4" /> Thêm 1 câu hỏi
                  </button>
                </div>
              </div>

              {/* Questions List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                  <span>Danh sách ({currentSet?.questions.length || 0} câu)</span>
                  <span>Đang áp dụng cho bài học của giáo viên {currentTeacher?.name}</span>
                </div>

                {currentSet?.questions.map((q, idx) => (
                  <div
                    key={q.id}
                    className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700 flex flex-col gap-2.5 hover:border-slate-600 transition"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="font-bold text-sm text-slate-100">
                        Câu {idx + 1}: {q.content}
                      </span>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-300 text-[10px] font-bold border border-emerald-800 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Đáp án: {q.correctAnswer}
                        </span>
                        <button
                          onClick={() => {
                            if (currentSet.questions.length <= 1) return;
                            const updatedQuestions = currentSet.questions.filter((item) => item.id !== q.id);
                            const updatedSets = localQuestionSets.map((s) =>
                              s.id === currentSet.id ? { ...s, questions: updatedQuestions } : s
                            );
                            setLocalQuestionSets(updatedSets);
                            saveCurrentTeacherProfile(undefined, updatedSets, activeSetId);
                          }}
                          className="text-slate-400 hover:text-red-400 p-1 transition"
                          title="Xóa câu hỏi này"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {q.options.map((opt, oIdx) => {
                        const optKey = (['A', 'B', 'C', 'D'] as const)[oIdx];
                        const isCorrect = optKey === q.correctAnswer;
                        return (
                          <div
                            key={optKey}
                            className={`p-2.5 rounded-xl border ${
                              isCorrect
                                ? 'bg-emerald-950/70 border-emerald-500 text-emerald-200 font-bold shadow-sm'
                                : 'bg-slate-900 border-slate-800 text-slate-300'
                            }`}
                          >
                            <span className="font-bold mr-1.5">{optKey}.</span> {opt}
                          </div>
                        );
                      })}
                    </div>

                    {q.explanation && (
                      <div className="text-[11px] text-slate-400 italic bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                        💡 Giải thích: {q.explanation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= TAB 3: TỰ ĐẨY HÌNH ẢNH TRANH GHÉP ================= */}
          {activeTab === 'puzzle_image' && (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-slate-800/50 border border-slate-700">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                  <div>
                    <h4 className="font-bold text-slate-100 text-base">
                      Bức tranh bí ẩn riêng của {currentTeacher?.name}
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Bạn có thể tự đẩy bất kỳ bức ảnh nào (ảnh lớp học, bài học STEM, robot, sản phẩm sáng tạo) để học sinh mở khóa và ghép thành bức tranh hoàn chỉnh!
                    </p>
                  </div>

                  <label className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs uppercase cursor-pointer flex items-center gap-2 shadow-lg transition shrink-0">
                    <Upload className="w-4 h-4" /> Tự đẩy hình ảnh mới
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePuzzleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Picture Preview with 3x3 Grid Overlay */}
                <div className="relative w-full max-w-xl mx-auto aspect-[4/3] rounded-2xl overflow-hidden border-2 border-cyan-500/50 bg-slate-950 shadow-2xl mb-4 group">
                  <img
                    src={localSettings.puzzleImageUrl}
                    alt="Tranh bí ẩn"
                    className="w-full h-full object-contain"
                  />

                  {/* 3x3 Visual Grid Overlay to show cutting preview */}
                  <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 border border-cyan-400/30">
                    {[...Array(9)].map((_, i) => (
                      <div
                        key={i}
                        className="border border-cyan-400/20 flex items-center justify-center"
                      >
                        <span className="text-[11px] font-mono text-cyan-300/40 bg-slate-950/40 px-1.5 py-0.5 rounded">
                          Mảnh {i + 1}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="absolute bottom-2 right-2 px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur border border-slate-700 text-[11px] text-cyan-300 font-mono">
                    <Grid3X3 className="w-3.5 h-3.5 inline mr-1" />
                    Chia tự động 9 mảnh chuẩn
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-700">
                  <div className="text-xs text-slate-400">
                    Kích thước gốc: {localSettings.puzzleImageNaturalWidth} × {localSettings.puzzleImageNaturalHeight} px
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    <button
                      onClick={async () => {
                        const defaultImg = '/assets/default_puzzle.svg';
                        setLocalSettings({
                          ...localSettings,
                          puzzleImageUrl: defaultImg,
                          puzzleImageNaturalWidth: 1200,
                          puzzleImageNaturalHeight: 800
                        });
                        if (currentTeacher?.id) {
                          await indexedDBService.deletePuzzleImage(currentTeacher.id);
                        }
                        await saveCurrentTeacherProfile({
                          puzzleImageUrl: defaultImg,
                          puzzleImageNaturalWidth: 1200,
                          puzzleImageNaturalHeight: 800
                        });
                        setSaveSuccessMessage('✓ Đã chuyển về tranh STEM FPT Schools mặc định');
                        setTimeout(() => setSaveSuccessMessage(''), 3000);
                      }}
                      className="px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center gap-2 transition cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Dùng tranh STEM FPT mặc định
                    </button>

                    <button
                      onClick={handleSaveAll}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs uppercase flex items-center gap-1.5 shadow-md cursor-pointer transition"
                    >
                      <Save className="w-4 h-4" /> Lưu & Bắt đầu ván mới với ảnh này
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 4: HỒ SƠ GIÁO VIÊN & TRƯỜNG ================= */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-slate-800/50 border border-slate-700 space-y-4">
                <h4 className="font-bold text-slate-100 text-base">Thông tin cá nhân & Trường học</h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Họ tên giáo viên</label>
                    <input
                      type="text"
                      value={localSettings.teacherName}
                      onChange={(e) => {
                        setLocalSettings({ ...localSettings, teacherName: e.target.value });
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Tên trường học</label>
                    <input
                      type="text"
                      value={localSettings.schoolName}
                      onChange={(e) => {
                        setLocalSettings({ ...localSettings, schoolName: e.target.value });
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Mật khẩu PIN giáo viên</label>
                    <input
                      type="text"
                      value={localSettings.teacherPassword || '123'}
                      onChange={(e) => {
                        setLocalSettings({ ...localSettings, teacherPassword: e.target.value });
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Logo trường học</label>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 h-10 flex items-center justify-center">
                        <img
                          src={localSettings.schoolLogoUrl}
                          alt="Logo"
                          className="h-7 w-auto object-contain"
                        />
                      </div>
                      <label className="px-3 py-2 rounded-xl bg-cyan-600/30 border border-cyan-500 hover:bg-cyan-500/40 text-cyan-200 text-xs font-bold cursor-pointer flex items-center gap-1.5">
                        <Upload className="w-3.5 h-3.5" /> Tải logo mới
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleSchoolLogoUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-3 border-t border-slate-700">
                  <button
                    onClick={() => {
                      saveCurrentTeacherProfile();
                      setSaveSuccessMessage('✓ Đã cập nhật thông tin hồ sơ giáo viên thành công!');
                      setTimeout(() => setSaveSuccessMessage(''), 3000);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase flex items-center gap-2 cursor-pointer shadow"
                  >
                    <Save className="w-4 h-4" /> LƯU THÔNG TIN HỒ SƠ
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 5: BẬT/TẮT BIỂU CẢM & ĐẾM NGƯỢC ================= */}
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
                    className="w-32 accent-cyan-400 cursor-pointer"
                  />
                  <span className="font-bold text-cyan-300 text-sm w-12 text-right">
                    {localSettings.countdownDuration}s
                  </span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-100 text-sm sm:text-base mb-3">
                  Bật/Tắt các biểu cảm trong lượt chơi của lớp bạn:
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.values(CHALLENGE_DEFINITIONS).map((ch) => {
                    const isEnabled = !!localSettings.enabledChallenges[ch.id];
                    return (
                      <div
                        key={ch.id}
                        onClick={() => toggleChallenge(ch.id)}
                        className={`p-3.5 rounded-2xl border transition flex items-center justify-between gap-3 cursor-pointer ${
                          isEnabled
                            ? 'bg-slate-800/80 border-cyan-500/40'
                            : 'bg-slate-900/40 border-slate-800 opacity-60'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={isEnabled}
                            onChange={() => {}}
                            className="w-5 h-5 accent-cyan-400 cursor-pointer rounded pointer-events-none"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xl">{ch.icon}</span>
                              <span className="font-bold text-sm text-slate-200">{ch.name}</span>
                            </div>
                            <span className="text-xs text-slate-400">{ch.instruction}</span>
                          </div>
                        </div>

                        <span className="text-xs font-mono text-amber-300 bg-slate-950 px-2 py-1 rounded-md border border-slate-700">
                          {localSettings.requiredScores[ch.id] ?? ch.defaultScore}đ
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900 flex items-center justify-between gap-3">
          <span className="text-xs text-slate-400 hidden sm:inline">
            Đang áp dụng cho tài khoản: <strong className="text-slate-200">{currentTeacher?.name}</strong>
          </span>

          <div className="flex items-center gap-3 ml-auto">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-bold text-xs sm:text-sm cursor-pointer"
            >
              Đóng
            </button>
            <button
              onClick={handleSaveAll}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs sm:text-sm uppercase flex items-center gap-2 shadow-md cursor-pointer transition"
            >
              <Save className="w-4 h-4" /> LƯU & ÁP DỤNG NGAY
            </button>
          </div>
        </div>
      </div>

      {/* MODAL: Nhập danh sách câu hỏi bằng tệp / Text */}
      {showImportModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/90 select-none">
          <div className="w-full max-w-2xl bg-slate-900 border-2 border-cyan-500/60 rounded-3xl p-6 shadow-2xl flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-cyan-300 text-base">Tự đẩy danh sách câu hỏi (TXT)</h3>
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
              placeholder={`Câu 1: Câu hỏi về STEM...\nA. Đáp án A\nB. Đáp án B\nC. Đáp án C\nD. Đáp án D\nĐáp án đúng: A\nGiải thích: ...`}
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
                className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-black uppercase shadow cursor-pointer"
              >
                Xác nhận thêm vào bộ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Thêm 1 câu hỏi thủ công */}
      {showAddQuestionModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/90 select-none">
          <div className="w-full max-w-xl bg-slate-900 border-2 border-amber-500/60 rounded-3xl p-6 shadow-2xl flex flex-col space-y-3.5">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="font-bold text-amber-300 text-base">Thêm câu hỏi mới</h3>
              <button
                onClick={() => setShowAddQuestionModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Nội dung câu hỏi</label>
              <textarea
                value={newQContent}
                onChange={(e) => setNewQContent(e.target.value)}
                placeholder="Nhập nội dung câu hỏi..."
                rows={2}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs outline-none focus:border-amber-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-0.5">Đáp án A</label>
                <input
                  type="text"
                  value={newQOptA}
                  onChange={(e) => setNewQOptA(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-0.5">Đáp án B</label>
                <input
                  type="text"
                  value={newQOptB}
                  onChange={(e) => setNewQOptB(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-0.5">Đáp án C</label>
                <input
                  type="text"
                  value={newQOptC}
                  onChange={(e) => setNewQOptC(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-0.5">Đáp án D</label>
                <input
                  type="text"
                  value={newQOptD}
                  onChange={(e) => setNewQOptD(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Đáp án đúng</label>
                <select
                  value={newQCorrect}
                  onChange={(e) => setNewQCorrect(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-amber-300 font-bold text-xs outline-none"
                >
                  <option value="A">Đáp án A</option>
                  <option value="B">Đáp án B</option>
                  <option value="C">Đáp án C</option>
                  <option value="D">Đáp án D</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Giải thích (tùy chọn)</label>
                <input
                  type="text"
                  value={newQExplain}
                  onChange={(e) => setNewQExplain(e.target.value)}
                  placeholder="Lý do vì sao đáp án đúng..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowAddQuestionModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
              >
                Hủy
              </button>
              <button
                onClick={handleAddSingleQuestion}
                className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black uppercase shadow"
              >
                Lưu câu hỏi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Tạo bộ câu hỏi mới */}
      {showNewSetModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/90 select-none">
          <div className="w-full max-w-md bg-slate-900 border-2 border-cyan-500/60 rounded-3xl p-6 shadow-2xl flex flex-col space-y-3.5">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="font-bold text-cyan-300 text-base">Tạo bộ câu hỏi mới</h3>
              <button
                onClick={() => setShowNewSetModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Tên bộ câu hỏi</label>
              <input
                type="text"
                value={newSetName}
                onChange={(e) => setNewSetName(e.target.value)}
                placeholder="Ví dụ: STEM Năng lượng tái tạo - Lớp 4"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs outline-none focus:border-cyan-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Môn học</label>
                <input
                  type="text"
                  value={newSetSubject}
                  onChange={(e) => setNewSetSubject(e.target.value)}
                  placeholder="STEM / Tin học"
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Khối lớp</label>
                <input
                  type="text"
                  value={newSetGrade}
                  onChange={(e) => setNewSetGrade(e.target.value)}
                  placeholder="Khối 4 - Khối 5"
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowNewSetModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
              >
                Hủy
              </button>
              <button
                onClick={handleCreateNewQuestionSet}
                className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-black uppercase shadow"
              >
                Tạo bộ câu hỏi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL XÁC NHẬN BẮT ĐẦU VÁN MỚI VỚI BỘ CÂU HỎI VÀ HÌNH ẢNH MỚI */}
      {showNewGameConfirmModal && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md select-none animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-slate-900 border-2 border-amber-400/90 rounded-3xl p-6 sm:p-7 shadow-[0_0_50px_rgba(245,158,11,0.3)] flex flex-col space-y-4">
            <div className="flex items-center gap-3.5 pb-1 border-b border-slate-800">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-emerald-400 shrink-0">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-emerald-400 text-base sm:text-lg uppercase tracking-wide">
                  Cài đặt đã được lưu
                </h3>
                <p className="text-xs text-slate-400 font-medium">
                  Tài khoản giáo viên: <span className="text-slate-200 font-bold">{currentTeacher?.name}</span>
                </p>
              </div>
            </div>

            {/* Khung câu hỏi xác nhận chính xác theo yêu cầu */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/15 via-slate-950/90 to-cyan-500/15 border-2 border-amber-400/40 text-center">
              <p className="text-base sm:text-lg font-black text-white leading-relaxed tracking-wide">
                Bạn muốn bắt đầu ván mới bằng bộ câu hỏi và hình ảnh lắp ghép này chứ?
              </p>
              <p className="text-xs text-amber-200/80 mt-1.5 font-medium">
                Nếu chọn &quot;Để sau&quot;, ván chơi hiện tại được giữ nguyên và cài đặt mới sẽ áp dụng cho ván tiếp theo.
              </p>
            </div>

            {/* Chi tiết nội dung sẽ áp dụng */}
            <div className="p-3.5 rounded-2xl bg-slate-800/70 border border-slate-700/80 flex items-center gap-3.5">
              <div className="w-20 h-16 rounded-xl overflow-hidden bg-slate-950 border border-cyan-500/40 shrink-0 relative shadow-inner">
                <img
                  src={localSettings.puzzleImageUrl}
                  alt="Tranh ghép"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 border border-cyan-400/20 pointer-events-none">
                  {[...Array(9)].map((_, i) => (
                    <div key={i} className="border border-cyan-400/15" />
                  ))}
                </div>
              </div>

              <div className="flex-1 min-w-0 text-xs space-y-1">
                <div className="font-bold text-slate-100 truncate flex items-center gap-1.5">
                  <span className="text-amber-400 font-mono">▶</span>
                  {currentSet?.name || 'Bộ câu hỏi STEM'}
                </div>
                <div className="text-slate-400 text-[11px] flex items-center gap-2">
                  <span className="text-cyan-300 font-semibold">{currentSet?.questions?.length || 0} câu hỏi</span>
                  <span>•</span>
                  <span className="text-amber-300 font-semibold">9 mảnh ghép 3×3</span>
                </div>
                <div className="text-[11px] text-slate-400 truncate">
                  Chu môi: <span className="text-amber-300 font-bold">{localSettings.requiredScores.mouth_pucker || 50}đ</span> • 
                  Phồng má: <span className="text-amber-300 font-bold">{localSettings.requiredScores.cheek_puff || 50}đ</span> • 
                  Cười: <span className="text-amber-300 font-bold">{localSettings.requiredScores.smile || 50}đ</span>
                </div>
              </div>
            </div>

            {/* Các nút bấm hành động chuẩn theo Part C */}
            <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
              <button
                onClick={handleSaveWithoutRestart}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 font-bold text-xs sm:text-sm cursor-pointer transition order-2 sm:order-1"
                title="Lưu thiết lập nhưng giữ nguyên ván chơi hiện tại"
              >
                Để sau
              </button>

              <button
                onClick={handleConfirmStartNewGame}
                className="w-full sm:flex-1 py-3 px-5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.5)] cursor-pointer transition active:scale-98 order-1 sm:order-2"
              >
                <Sparkles className="w-4 h-4" /> OK – Bắt đầu ván mới
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
