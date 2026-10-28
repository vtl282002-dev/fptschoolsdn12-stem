import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { GameSettings, QuestionSet, ChallengeType, ActiveGameConfig } from './types';
import { indexedDBService } from './services/IndexedDBService';
import { audioManager } from './services/AudioManager';
import { StartScreen } from './components/StartScreen';
import { ChallengeView } from './components/ChallengeView';
import { QuestionModal } from './components/QuestionModal';
import { PuzzleBoard } from './components/PuzzleBoard';
import { SuccessPopup } from './components/SuccessPopup';
import { VictoryScreen } from './components/VictoryScreen';
import { TeacherSettingsModal } from './components/TeacherSettingsModal';
import { ChallengeEvaluator } from './services/ChallengeEvaluator';
import { generatePuzzleSessionPieces, computeImageContentHash } from './services/PuzzleService';

export default function App() {
  // Settings & Question Sets
  const [settings, setSettings] = useState<GameSettings | null>(null);
  const [questionSets, setQuestionSets] = useState<QuestionSet[]>([]);
  const [activeQuestionSetId, setActiveQuestionSetId] = useState<string>('');

  // Single Source of Truth: Immutable snapshot for the active game session
  const [activeGameConfig, setActiveGameConfig] = useState<ActiveGameConfig | null>(null);
  const isInitializingSessionRef = useRef(false);

  // Audio State
  const [isMuted, setIsMuted] = useState(false);

  // Player & Game Flow State
  const [playerName, setPlayerName] = useState('');
  const [playerSchool, setPlayerSchool] = useState('');
  const [gamePhase, setGamePhase] = useState<'start' | 'challenge' | 'puzzle' | 'victory'>('start');

  // Modal overlays
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Challenge tracking
  const [currentChallengeType, setCurrentChallengeType] = useState<ChallengeType>('mouth_pucker');

  // Question tracking
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Puzzle pieces tracking
  const [placedPieceIds, setPlacedPieceIds] = useState<number[]>([]);
  const placedPieceIdsRef = useRef<number[]>([]);
  placedPieceIdsRef.current = placedPieceIds;
  const [placementCredits, setPlacementCredits] = useState(0);
  const [shuffledTrayOrder, setShuffledTrayOrder] = useState<number[]>([0, 1, 2, 3, 4, 5, 6, 7, 8]);
  const [challengeTurnNonce, setChallengeTurnNonce] = useState(0);
  const [gameSessionKey, setGameSessionKey] = useState(1);

  // Shuffle tray pieces helper
  const generateShuffledTray = useCallback(() => {
    const arr = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, []);

  // Centralized session creator: builds immutable snapshot, decodes image & slices 9 pieces fresh
  const startNewGameSession = useCallback(
    async (targetSettings: GameSettings, targetSets: QuestionSet[], targetSetId: string) => {
      if (isInitializingSessionRef.current) return;
      isInitializingSessionRef.current = true;

      try {
        const sessionId = `session_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const imageVersion = computeImageContentHash(targetSettings.puzzleImageUrl);

        console.log(`[GameSession] Bắt đầu khởi tạo ván mới: ${sessionId}, imageVersion: ${imageVersion}`);

        // 1. Tải, giải mã và cắt 9 mảnh ghép trực tiếp từ ảnh nguồn của ván này
        const pieces = await generatePuzzleSessionPieces(
          targetSettings.puzzleImageUrl,
          sessionId,
          imageVersion
        );

        // 2. Tìm bộ câu hỏi tương ứng
        const qSet = targetSets.find((s) => s.id === targetSetId) || targetSets[0];

        // 3. Tạo snapshot cấu hình bất biến cho ván chơi
        const snapshot: ActiveGameConfig = {
          gameSessionId: sessionId,
          imageVersion,
          puzzleSourceImage: targetSettings.puzzleImageUrl,
          puzzleImageNaturalWidth: targetSettings.puzzleImageNaturalWidth,
          puzzleImageNaturalHeight: targetSettings.puzzleImageNaturalHeight,
          puzzlePieces: pieces,
          questionSet: qSet,
          requiredScores: { ...targetSettings.requiredScores },
          enabledChallenges: { ...targetSettings.enabledChallenges },
          countdownDuration: targetSettings.countdownDuration,
          schoolName: targetSettings.schoolName,
          teacherName: targetSettings.teacherName,
          schoolLogoUrl: targetSettings.schoolLogoUrl,
          createdAt: Date.now()
        };

        // 4. Cập nhật state ván chơi thống nhất
        setActiveGameConfig(snapshot);
        setSettings(targetSettings);
        setQuestionSets(targetSets);
        setActiveQuestionSetId(targetSetId);

        // 5. Reset tiến trình ván chơi
        placedPieceIdsRef.current = [];
        setPlacedPieceIds([]);
        setPlacementCredits(0);
        setShuffledTrayOrder(generateShuffledTray());
        setCurrentQuestionIndex(0);
        usedChallengesRef.current = [];

        // Chọn thử thách đầu tiên từ pool bật trong cấu hình
        const enabledKeys = (Object.keys(snapshot.enabledChallenges) as ChallengeType[]).filter(
          (k) => snapshot.enabledChallenges[k]
        );
        if (enabledKeys.length > 0) {
          setCurrentChallengeType(enabledKeys[0]);
        }
        setChallengeTurnNonce((n) => n + 1);
        setGameSessionKey((k) => k + 1);

        // 6. Đóng toàn bộ modals
        setShowSettingsModal(false);
        setShowQuestionModal(false);
        setShowSuccessPopup(false);

        console.log(
          `[GameSession] Khởi tạo thành công ván: ${sessionId} với ${pieces.length} mảnh ghép và ${qSet?.questions?.length || 0} câu hỏi.`
        );
      } catch (err) {
        console.error('[GameSession] Lỗi khi tạo ván chơi mới:', err);
      } finally {
        isInitializingSessionRef.current = false;
      }
    },
    [generateShuffledTray]
  );

  // Load initial settings and question sets from IndexedDB
  useEffect(() => {
    async function loadData() {
      const s = await indexedDBService.getSettings();
      const qSets = await indexedDBService.getQuestionSets();
      setSettings(s);
      setQuestionSets(qSets);
      setActiveQuestionSetId(s.activeQuestionSetId);

      // Start initial game session with verified pieces
      await startNewGameSession(s, qSets, s.activeQuestionSetId);

      // Run Left/Right wink anatomical test verification
      const winkTest = ChallengeEvaluator.runWinkAnatomicalTest();
      console.log('MediaPipe Anatomical Wink Verification:', winkTest);
    }
    loadData();
  }, [startNewGameSession]);

  // Current active question from snapshot
  const currentQuestion = useMemo(() => {
    const targetSet = activeGameConfig?.questionSet || questionSets.find((s) => s.id === activeQuestionSetId) || questionSets[0];
    if (!targetSet || !targetSet.questions || targetSet.questions.length === 0) {
      return {
        id: 'fallback_q',
        content: 'Thiết bị nào sau đây dùng để ghi nhận hình ảnh và video từ người dùng?',
        options: ['Webcam / Máy ảnh', 'Loa âm thanh', 'Bàn phím', 'Màn hình'] as [string, string, string, string],
        correctAnswer: 'A' as const,
        isConfirmed: true
      };
    }
    return targetSet.questions[currentQuestionIndex % targetSet.questions.length];
  }, [activeGameConfig, questionSets, activeQuestionSetId, currentQuestionIndex]);

  // Keep history of challenges used in the current game to prevent repeats
  const usedChallengesRef = useRef<ChallengeType[]>([]);

  // Select next challenge without repeating
  const pickNextChallenge = useCallback((resetHistory = false) => {
    const activeChallenges = activeGameConfig?.enabledChallenges || settings?.enabledChallenges;
    if (!activeChallenges) return;
    const pool = (Object.keys(activeChallenges) as ChallengeType[]).filter(
      (k) => activeChallenges[k]
    );
    if (pool.length === 0) return;
    if (pool.length === 1) {
      setCurrentChallengeType(pool[0]);
      return;
    }

    if (resetHistory) {
      usedChallengesRef.current = [];
    }

    const unused = pool.filter((c) => !usedChallengesRef.current.includes(c));

    let candidatePool: ChallengeType[];
    if (unused.length > 0) {
      candidatePool = unused;
    } else {
      usedChallengesRef.current = [];
      const nonImmediate = pool.filter((c) => c !== currentChallengeType);
      candidatePool = nonImmediate.length > 0 ? nonImmediate : pool;
    }

    const next = candidatePool[Math.floor(Math.random() * candidatePool.length)];
    usedChallengesRef.current.push(next);
    setCurrentChallengeType(next);
  }, [activeGameConfig, settings, currentChallengeType]);

  // Audio Toggle
  const handleToggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    audioManager.setMuted(nextMute);
  };

  // Start Game from Home
  const handleStartGame = () => {
    audioManager.init();
    audioManager.startBGM();

    placedPieceIdsRef.current = [];
    setPlacedPieceIds([]);
    setPlacementCredits(0);
    setShuffledTrayOrder(generateShuffledTray());
    setCurrentQuestionIndex(0);
    pickNextChallenge(true);
    setChallengeTurnNonce((n) => n + 1);

    setGamePhase('challenge');
  };

  // Reset Game: reads latest saved config and creates fresh session
  const handleResetGame = async () => {
    try {
      const latestSettings = await indexedDBService.getSettings();
      const latestSets = await indexedDBService.getQuestionSets();
      await startNewGameSession(
        latestSettings,
        latestSets,
        latestSettings.activeQuestionSetId
      );
      setGamePhase('challenge');
    } catch (err) {
      console.error('Lỗi khi reset game:', err);
    }
  };

  // Start brand new game with new teacher settings & puzzle image & question set
  const handleStartNewGameWithSettings = async (
    newSettings: GameSettings,
    newSets: QuestionSet[],
    activeId: string
  ) => {
    // 1. Lưu cài đặt mới vào IndexedDB
    await indexedDBService.saveSettings(newSettings);
    await indexedDBService.saveQuestionSets(newSets);

    // 2. Khởi tạo ván mới với các mảnh ghép được cắt từ chính ảnh mới này
    await startNewGameSession(newSettings, newSets, activeId);
    setGamePhase('challenge');

    audioManager.init();
    audioManager.startBGM();
    audioManager.playScoreTargetReached();
  };

  // Challenge Success -> Trigger Question Modal
  const handleChallengeSuccess = () => {
    setShowQuestionModal(true);
  };

  // Question Answered Correctly -> Receive 1 credit & Go to Puzzle
  const handleQuestionCorrect = () => {
    setShowQuestionModal(false);
    setPlacementCredits((prev) => prev + 1);
    setCurrentQuestionIndex((prev) => prev + 1);
    setGamePhase('puzzle');
  };

  // Question Answered Wrong -> Return to Challenge
  const handleQuestionWrong = () => {
    setShowQuestionModal(false);
    setCurrentQuestionIndex((prev) => prev + 1);
    pickNextChallenge();
    setChallengeTurnNonce((n) => n + 1);
    setGamePhase('challenge');
  };

  // Piece Placed Successfully
  const handlePlacePieceSuccess = (pieceId: number) => {
    const updatedPlaced = [...placedPieceIds, pieceId];
    placedPieceIdsRef.current = updatedPlaced;
    setPlacedPieceIds(updatedPlaced);
    setPlacementCredits((prev) => Math.max(0, prev - 1));

    // Show 3-second celebratory countdown popup before transitioning to next challenge
    setShowSuccessPopup(true);
  };

  // Continue after placement popup (called automatically after 3s or when clicked)
  const handleContinueAfterPopup = () => {
    setShowSuccessPopup(false);
    const count = placedPieceIdsRef.current.length;
    if (count >= 9) {
      setGamePhase('victory');
    } else {
      pickNextChallenge();
      setChallengeTurnNonce((n) => n + 1);
      setGamePhase('challenge');
    }
  };

  // Return to challenge from puzzle board
  const handleReturnToChallenge = () => {
    pickNextChallenge();
    setChallengeTurnNonce((n) => n + 1);
    setGamePhase('challenge');
  };

  // Save Settings from Admin Modal
  const handleSaveSettings = async (newSettings: GameSettings) => {
    setSettings(newSettings);
    await indexedDBService.saveSettings(newSettings);
  };

  // Save Question Sets from Admin Modal
  const handleSaveQuestionSets = async (newSets: QuestionSet[], activeId: string) => {
    setQuestionSets(newSets);
    setActiveQuestionSetId(activeId);
    await indexedDBService.saveQuestionSets(newSets);
    if (settings) {
      const updated = { ...settings, activeQuestionSetId: activeId };
      setSettings(updated);
      await indexedDBService.saveSettings(updated);
    }
  };

  if (!settings) {
    return (
      <div className="w-full h-screen bg-slate-950 flex items-center justify-center text-cyan-400 font-bold">
        Đang khởi tạo trò chơi...
      </div>
    );
  }

  const activeScores = activeGameConfig?.requiredScores || settings.requiredScores;
  const requiredScore = activeScores[currentChallengeType] || 50;

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 font-sans select-none">
      {/* 1. Màn hình mở đầu (Start Screen) */}
      {gamePhase === 'start' && (
        <StartScreen
          playerName={playerName}
          onPlayerNameChange={setPlayerName}
          playerSchool={playerSchool}
          onPlayerSchoolChange={setPlayerSchool}
          onStartGame={handleStartGame}
          onOpenSettings={() => setShowSettingsModal(true)}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          schoolLogoUrl={activeGameConfig?.schoolLogoUrl || settings.schoolLogoUrl}
          teacherName={activeGameConfig?.teacherName || settings.teacherName}
          schoolName={activeGameConfig?.schoolName || settings.schoolName}
        />
      )}

      {/* 2. Màn hình thử thách khuôn mặt (Challenge View) */}
      {gamePhase === 'challenge' && (
        <ChallengeView
          key={`challenge-${currentQuestionIndex}-${challengeTurnNonce}`}
          challengeType={currentChallengeType}
          challengeTurnNonce={challengeTurnNonce}
          requiredScore={requiredScore}
          placedPiecesCount={placedPieceIds.length}
          totalPiecesCount={9}
          countdownDuration={activeGameConfig?.countdownDuration || settings.countdownDuration}
          onChallengeSuccess={handleChallengeSuccess}
          onOpenSettings={() => setShowSettingsModal(true)}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          playerName={playerName}
          playerSchool={playerSchool}
          schoolLogoUrl={activeGameConfig?.schoolLogoUrl || settings.schoolLogoUrl}
          onResetGame={handleResetGame}
        />
      )}

      {/* 3. Màn hình bàn ghép tranh (Puzzle Board) */}
      {gamePhase === 'puzzle' && (
        <PuzzleBoard
          key={`puzzle-board-${activeGameConfig?.gameSessionId || 'default'}-${gameSessionKey}`}
          imageUrl={activeGameConfig?.puzzleSourceImage || settings.puzzleImageUrl}
          imageNaturalWidth={activeGameConfig?.puzzleImageNaturalWidth || settings.puzzleImageNaturalWidth}
          imageNaturalHeight={activeGameConfig?.puzzleImageNaturalHeight || settings.puzzleImageNaturalHeight}
          pieces={activeGameConfig?.puzzlePieces}
          gameSessionId={activeGameConfig?.gameSessionId}
          imageVersion={activeGameConfig?.imageVersion}
          placedPieceIds={placedPieceIds}
          placementCredits={placementCredits}
          shuffledTrayOrder={shuffledTrayOrder}
          onPlacePieceSuccess={handlePlacePieceSuccess}
          onReturnToChallenge={handleReturnToChallenge}
          onResetGame={handleResetGame}
          onOpenSettings={() => setShowSettingsModal(true)}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          playerName={playerName}
          playerSchool={playerSchool}
          schoolLogoUrl={activeGameConfig?.schoolLogoUrl || settings.schoolLogoUrl}
        />
      )}

      {/* 4. Màn hình chiến thắng & Giấy chứng nhận (Victory Screen) */}
      {gamePhase === 'victory' && (
        <VictoryScreen
          playerName={playerName}
          playerSchool={playerSchool}
          imageUrl={activeGameConfig?.puzzleSourceImage || settings.puzzleImageUrl}
          schoolLogoUrl={activeGameConfig?.schoolLogoUrl || settings.schoolLogoUrl}
          onPlayAgain={handleResetGame}
          onGoHome={() => setGamePhase('start')}
        />
      )}

      {/* Question Modal Overlay */}
      {showQuestionModal && (
        <QuestionModal
          question={currentQuestion}
          onAnswerCorrect={handleQuestionCorrect}
          onAnswerWrong={handleQuestionWrong}
        />
      )}

      {/* Success Popup Overlay */}
      {showSuccessPopup && (
        <SuccessPopup
          currentPiecesCount={placedPieceIds.length}
          totalPiecesCount={9}
          onContinue={handleContinueAfterPopup}
        />
      )}

      {/* Teacher Settings & Question Management Modal */}
      {showSettingsModal && (
        <TeacherSettingsModal
          settings={settings}
          questionSets={questionSets}
          onSaveSettings={handleSaveSettings}
          onSaveQuestionSets={handleSaveQuestionSets}
          onClose={() => setShowSettingsModal(false)}
          onConfirmStartNewGame={handleStartNewGameWithSettings}
          onTeacherChange={(t) => {
            setSettings((prev) =>
              prev
                ? {
                    ...prev,
                    currentTeacherId: t.id,
                    teacherName: t.name,
                    schoolName: t.schoolName,
                    puzzleImageUrl: t.puzzleImageUrl,
                    puzzleImageNaturalWidth: t.puzzleImageNaturalWidth,
                    puzzleImageNaturalHeight: t.puzzleImageNaturalHeight,
                    requiredScores: t.requiredScores,
                    enabledChallenges: t.enabledChallenges,
                    countdownDuration: t.countdownDuration,
                    activeQuestionSetId: t.activeQuestionSetId,
                    schoolLogoUrl: t.schoolLogoUrl || prev.schoolLogoUrl
                  }
                : null
            );
            if (t.questionSets && t.questionSets.length > 0) {
              setQuestionSets(t.questionSets);
              setActiveQuestionSetId(t.activeQuestionSetId || t.questionSets[0].id);
            }
          }}
        />
      )}
    </div>
  );
}
