import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { GameSettings, QuestionSet, ChallengeType } from './types';
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

export default function App() {
  // Settings & Question Sets
  const [settings, setSettings] = useState<GameSettings | null>(null);
  const [questionSets, setQuestionSets] = useState<QuestionSet[]>([]);
  const [activeQuestionSetId, setActiveQuestionSetId] = useState<string>('');

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
  const [placementCredits, setPlacementCredits] = useState(0);
  const [shuffledTrayOrder, setShuffledTrayOrder] = useState<number[]>([0, 1, 2, 3, 4, 5, 6, 7, 8]);
  const [challengeTurnNonce, setChallengeTurnNonce] = useState(0);

  // Load initial settings and question sets from IndexedDB
  useEffect(() => {
    async function loadData() {
      const s = await indexedDBService.getSettings();
      const qSets = await indexedDBService.getQuestionSets();
      setSettings(s);
      setQuestionSets(qSets);
      setActiveQuestionSetId(s.activeQuestionSetId);

      // Pick first enabled challenge
      const enabledKeys = (Object.keys(s.enabledChallenges) as ChallengeType[]).filter(
        (k) => s.enabledChallenges[k]
      );
      if (enabledKeys.length > 0) {
        setCurrentChallengeType(enabledKeys[0]);
      }

      // Run Left/Right wink anatomical test verification
      const winkTest = ChallengeEvaluator.runWinkAnatomicalTest();
      console.log('MediaPipe Anatomical Wink Verification:', winkTest);
    }
    loadData();
  }, []);

  // Shuffle tray pieces helper
  const generateShuffledTray = useCallback(() => {
    const arr = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, []);

  // Get active question set
  const activeSet = useMemo(() => {
    return questionSets.find((s) => s.id === activeQuestionSetId) || questionSets[0];
  }, [questionSets, activeQuestionSetId]);

  // Current active question
  const currentQuestion = useMemo(() => {
    if (!activeSet || !activeSet.questions || activeSet.questions.length === 0) {
      return {
        id: 'fallback_q',
        content: 'Thiết bị nào sau đây dùng để ghi nhận hình ảnh và video từ người dùng?',
        options: ['Webcam / Máy ảnh', 'Loa âm thanh', 'Bàn phím', 'Màn hình'] as [string, string, string, string],
        correctAnswer: 'A' as const,
        isConfirmed: true
      };
    }
    return activeSet.questions[currentQuestionIndex % activeSet.questions.length];
  }, [activeSet, currentQuestionIndex]);

  // Keep history of challenges used in the current game to prevent repeats
  const usedChallengesRef = useRef<ChallengeType[]>([]);

  // Select next challenge without repeating:
  // Strictly prioritizes challenges that have NOT yet been played in the current game!
  const pickNextChallenge = useCallback((resetHistory = false) => {
    if (!settings) return;
    const pool = (Object.keys(settings.enabledChallenges) as ChallengeType[]).filter(
      (k) => settings.enabledChallenges[k]
    );
    if (pool.length === 0) return;
    if (pool.length === 1) {
      setCurrentChallengeType(pool[0]);
      return;
    }

    if (resetHistory) {
      usedChallengesRef.current = [];
    }

    // Unused challenges from enabled pool in this session
    const unused = pool.filter((c) => !usedChallengesRef.current.includes(c));

    let candidatePool: ChallengeType[];
    if (unused.length > 0) {
      candidatePool = unused;
    } else {
      // If all enabled challenges have been used in this session, recycle pool
      // but strictly exclude the immediate last challenge to avoid consecutive repeats
      usedChallengesRef.current = [];
      const nonImmediate = pool.filter((c) => c !== currentChallengeType);
      candidatePool = nonImmediate.length > 0 ? nonImmediate : pool;
    }

    // Pick a random challenge from candidates
    const next = candidatePool[Math.floor(Math.random() * candidatePool.length)];
    usedChallengesRef.current.push(next);
    setCurrentChallengeType(next);
  }, [settings, currentChallengeType]);

  // Audio Toggle
  const handleToggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    audioManager.setMuted(nextMute);
  };

  // Start Game
  const handleStartGame = () => {
    audioManager.init();
    audioManager.startBGM();

    // Reset game state
    setPlacedPieceIds([]);
    setPlacementCredits(0);
    setShuffledTrayOrder(generateShuffledTray());
    setCurrentQuestionIndex(0);
    pickNextChallenge(true);
    setChallengeTurnNonce((n) => n + 1);

    setGamePhase('challenge');
  };

  // Reset Game
  const handleResetGame = () => {
    setPlacedPieceIds([]);
    setPlacementCredits(0);
    setShuffledTrayOrder(generateShuffledTray());
    setCurrentQuestionIndex(0);
    pickNextChallenge(true);
    setChallengeTurnNonce((n) => n + 1);
    setGamePhase('challenge');
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
    setPlacedPieceIds(updatedPlaced);
    setPlacementCredits((prev) => Math.max(0, prev - 1));

    if (updatedPlaced.length === 9) {
      // 9/9 Completed! Level 4 Celebration
      setGamePhase('victory');
    } else {
      // Show intermediate success popup
      setShowSuccessPopup(true);
    }
  };

  // Continue after placement popup
  const handleContinueAfterPopup = () => {
    setShowSuccessPopup(false);
    pickNextChallenge();
    setChallengeTurnNonce((n) => n + 1);
    setGamePhase('challenge');
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

  const requiredScore = settings.requiredScores[currentChallengeType] || 60;

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
          schoolLogoUrl={settings.schoolLogoUrl}
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
          countdownDuration={settings.countdownDuration}
          onChallengeSuccess={handleChallengeSuccess}
          onOpenSettings={() => setShowSettingsModal(true)}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          playerName={playerName}
          playerSchool={playerSchool}
          schoolLogoUrl={settings.schoolLogoUrl}
          onResetGame={handleResetGame}
        />
      )}

      {/* 3. Màn hình bàn ghép tranh (Puzzle Board) */}
      {gamePhase === 'puzzle' && (
        <PuzzleBoard
          imageUrl={settings.puzzleImageUrl}
          imageNaturalWidth={settings.puzzleImageNaturalWidth}
          imageNaturalHeight={settings.puzzleImageNaturalHeight}
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
          schoolLogoUrl={settings.schoolLogoUrl}
        />
      )}

      {/* 4. Màn hình chiến thắng & Giấy chứng nhận (Victory Screen) */}
      {gamePhase === 'victory' && (
        <VictoryScreen
          playerName={playerName}
          playerSchool={playerSchool}
          imageUrl={settings.puzzleImageUrl}
          schoolLogoUrl={settings.schoolLogoUrl}
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
        />
      )}
    </div>
  );
}
