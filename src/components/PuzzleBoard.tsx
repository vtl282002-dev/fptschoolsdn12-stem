import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, Settings, ArrowLeft, RotateCcw, Sparkles, User } from 'lucide-react';
import { PUZZLE_PIECES_CONFIG, generateJigsawPath } from '../services/PuzzleService';
import { audioManager } from '../services/AudioManager';
import { Background3D } from './Background3D';
import { GoldenButton3D } from './3d/GoldenButton3D';
import { Interactive3DCard } from './3d/Interactive3DCard';
import { FptSchoolsLogo } from './FptSchoolsLogo';
import { ResetConfirmModal } from './ResetConfirmModal';

import { PuzzlePiece, ActiveGamePiece } from '../types';

interface PuzzleBoardProps {
  imageUrl: string;
  imageNaturalWidth: number;
  imageNaturalHeight: number;
  placedPieceIds: number[];
  placementCredits: number;
  shuffledTrayOrder: number[];
  pieces?: ActiveGamePiece[];
  gameSessionId?: string;
  imageVersion?: string;
  onPlacePieceSuccess: (pieceId: number) => void;
  onReturnToChallenge: () => void;
  onResetGame: () => void;
  onOpenSettings: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  playerName?: string;
  playerSchool?: string;
  schoolLogoUrl?: string;
}

export const PuzzleBoard: React.FC<PuzzleBoardProps> = ({
  imageUrl,
  imageNaturalWidth,
  imageNaturalHeight,
  placedPieceIds,
  placementCredits,
  shuffledTrayOrder,
  pieces,
  gameSessionId,
  imageVersion,
  onPlacePieceSuccess,
  onReturnToChallenge,
  onResetGame,
  onOpenSettings,
  isMuted,
  onToggleMute,
  playerName = 'Người chơi',
  playerSchool,
  schoolLogoUrl = '/assets/fpt_schools_logo.svg'
}) => {
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [selectedPieceId, setSelectedPieceId] = useState<number | null>(null);
  const [wrongSlotId, setWrongSlotId] = useState<number | null>(null);
  const [shakingPieceId, setShakingPieceId] = useState<number | null>(null);
  const [lastPlacedPieceId, setLastPlacedPieceId] = useState<number | null>(null);

  const boardContainerRef = useRef<HTMLDivElement>(null);
  const [boardDimensions, setBoardDimensions] = useState<{ width: number; height: number }>({
    width: 600,
    height: 400
  });

  const [detectedAspect, setDetectedAspect] = useState<number>(
    (imageNaturalWidth || 1200) / (imageNaturalHeight || 800)
  );

  // Cache-busting token derived from imageVersion or imageUrl so SVG clipPaths and image tags never show stale graphics
  const imageToken = React.useMemo(() => {
    if (imageVersion) return imageVersion;
    if (!imageUrl) return 'def';
    let hash = 0;
    const len = imageUrl.length;
    const sample = len > 200 ? imageUrl.slice(0, 100) + imageUrl.slice(-100) : imageUrl;
    for (let i = 0; i < sample.length; i++) {
      hash = ((hash << 5) - hash) + sample.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash).toString(36) + '_' + len;
  }, [imageVersion, imageUrl]);

  // Automatically detect actual image aspect ratio when imageUrl changes
  useEffect(() => {
    if (!imageUrl) return;
    const img = new Image();
    img.onload = () => {
      if (img.naturalWidth && img.naturalHeight) {
        setDetectedAspect(img.naturalWidth / img.naturalHeight);
      }
    };
    img.src = imageUrl;
  }, [imageUrl]);

  const aspectRatio = detectedAspect || (imageNaturalWidth || 1200) / (imageNaturalHeight || 800);

  useEffect(() => {
    const updateSize = () => {
      if (!boardContainerRef.current) return;
      const { clientWidth, clientHeight } = boardContainerRef.current;

      const padX = 44;
      const padY = 44;
      const availW = Math.max(200, clientWidth - padX);
      const availH = Math.max(150, clientHeight - padY);

      let w = availW;
      let h = w / aspectRatio;

      if (h > availH) {
        h = availH;
        w = h * aspectRatio;
      }

      setBoardDimensions({
        width: Math.max(240, Math.floor(w)),
        height: Math.max(160, Math.floor(h))
      });
    };

    updateSize();
    const ro = new ResizeObserver(updateSize);
    if (boardContainerRef.current) {
      ro.observe(boardContainerRef.current);
    }
    window.addEventListener('resize', updateSize);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', updateSize);
    };
  }, [aspectRatio]);

  const pieceW = boardDimensions.width / 3;
  const pieceH = boardDimensions.height / 3;

  // Attempt to place a piece into target slot
  const handleAttemptPlacement = (targetSlotId: number, incomingPieceId?: number) => {
    const pieceIdToTry = incomingPieceId !== undefined ? incomingPieceId : selectedPieceId;

    if (pieceIdToTry === null || pieceIdToTry === undefined) {
      return;
    }

    if (placedPieceIds.includes(targetSlotId)) {
      return; // Slot already placed
    }

    if (placementCredits <= 0) {
      return;
    }

    if (pieceIdToTry === targetSlotId) {
      // Correct!
      audioManager.playPieceSnap();
      setSelectedPieceId(null);
      setLastPlacedPieceId(pieceIdToTry);
      onPlacePieceSuccess(pieceIdToTry);

      setTimeout(() => {
        setLastPlacedPieceId(null);
      }, 1000);
    } else {
      // Wrong slot -> Spring animation on target slot and tray piece
      audioManager.playPieceWrong();
      setWrongSlotId(targetSlotId);
      setShakingPieceId(pieceIdToTry);

      setTimeout(() => {
        setWrongSlotId(null);
        setShakingPieceId(null);
      }, 600);
    }
  };

  const unplacedPieces = shuffledTrayOrder.filter((id) => !placedPieceIds.includes(id));
  const isCompleted = placedPieceIds.length === 9;

  return (
    <div className="relative w-full h-screen max-h-screen flex flex-col bg-slate-950 select-none overflow-hidden">
      {/* 3D Parallax Background */}
      <Background3D />

      {/* Top Header Bar matching other views */}
      <header className="relative z-20 flex items-center justify-between px-4 sm:px-8 py-2.5 max-w-7xl mx-auto w-full border-b border-cyan-500/20 bg-slate-900/60 backdrop-blur-md shrink-0">
        {/* Navigation & Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              audioManager.playClick();
              onReturnToChallenge();
            }}
            className="px-3.5 py-2 rounded-xl bg-slate-800/90 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/20 active:scale-95 flex items-center gap-2 text-xs sm:text-sm font-bold transition cursor-pointer"
            title="Quay lại thử thách khuôn mặt"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Về thử thách</span>
          </button>

          <FptSchoolsLogo size="sm" />

          <div className="hidden md:block">
            <h1 className="text-sm sm:text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400">
              Thử thách ghép tranh bí ẩn
            </h1>
          </div>
        </div>

        {/* Center Progress & Credits Status */}
        <div className="flex items-center gap-3">
          {/* Progress: x/9 */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-slate-900/80 border border-cyan-500/40 text-xs sm:text-sm font-bold text-cyan-300 shadow-inner">
            <span>TIẾN ĐỘ:</span>
            <span className="text-amber-300 font-mono font-black">{placedPieceIds.length} / 9 mảnh</span>
          </div>

          {/* Placement Credits */}
          <div className="px-3.5 py-1.5 rounded-2xl bg-amber-500/20 border border-amber-500/50 text-xs sm:text-sm font-black text-amber-300 flex items-center gap-1.5">
            <span>LƯỢT GHÉP:</span>
            <span className="text-base font-black px-2.5 py-0.5 rounded-lg bg-amber-400 text-slate-950 shadow-md font-mono">
              {placementCredits}
            </span>
          </div>
        </div>

        {/* Right Player & Utility Buttons */}
        <div className="flex items-center gap-2">
          {/* Player Badge */}
          {playerName && (
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-cyan-500/30 text-cyan-200 text-xs font-bold mr-1">
              <User className="w-3.5 h-3.5 text-cyan-400" />
              <span className="max-w-[90px] truncate">{playerName}</span>
              {playerSchool && playerSchool.trim() && (
                <span className="text-[10px] text-cyan-400/70 max-w-[80px] truncate">
                  ({playerSchool.trim()})
                </span>
              )}
            </div>
          )}

          {/* Reset Game Button */}
          <button
            onClick={() => {
              audioManager.playClick();
              setShowResetConfirm(true);
            }}
            className="px-3 py-2 rounded-xl bg-red-950/70 border border-red-500/50 text-red-300 hover:bg-red-900/80 active:scale-95 flex items-center gap-1.5 transition text-xs font-bold cursor-pointer shadow-sm"
            title="Làm lại ván mới từ đầu"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">VÁN MỚI</span>
          </button>

          {/* Audio Toggle */}
          <button
            onClick={() => {
              audioManager.playClick();
              onToggleMute();
            }}
            className="w-10 h-10 rounded-xl bg-slate-800/80 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 flex items-center justify-center transition cursor-pointer"
            title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Settings */}
          <button
            onClick={() => {
              audioManager.playClick();
              onOpenSettings();
            }}
            className="w-10 h-10 rounded-xl bg-slate-800/80 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 flex items-center justify-center transition cursor-pointer"
            title="Cài đặt"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Game Stage: Left Tray + Right Wooden Board */}
      <main className="relative z-20 flex-1 flex flex-col md:flex-row items-stretch justify-center p-3 sm:p-6 max-w-7xl mx-auto w-full gap-4 sm:gap-6 overflow-hidden">
        {/* Left Column: Shuffled Tray */}
        <div
          className="w-full md:w-[32%] flex flex-col bg-slate-900/90 backdrop-blur-xl rounded-3xl border-2 border-cyan-500/50 p-4 shadow-[0_15px_40px_rgba(0,0,0,0.6),0_0_20px_rgba(6,182,212,0.25)]"
        >
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-cyan-500/20">
            <span className="text-xs sm:text-sm font-bold text-cyan-300 uppercase tracking-wider">
              Khay mảnh ghép ({unplacedPieces.length})
            </span>
            {placementCredits > 0 ? (
              <span className="text-xs text-amber-300 font-semibold animate-pulse">
                Chọn mảnh để ghép
              </span>
            ) : (
              <span className="text-xs text-slate-400 font-medium">
                Cần thêm lượt ghép
              </span>
            )}
          </div>

          {/* Pieces Grid in Tray with 3D physical depth & spring shake on wrong drop */}
          <div className="flex-1 overflow-y-auto grid grid-cols-3 md:grid-cols-2 lg:grid-cols-3 gap-2.5 p-1 content-start">
            {unplacedPieces.map((pieceId) => {
              const pieceConfig = PUZZLE_PIECES_CONFIG[pieceId];
              const pieceObj = pieces?.find((p) => p.id === pieceId);
              const isSelected = selectedPieceId === pieceId;
              const isShaking = shakingPieceId === pieceId;

              const miniW = 84;
              const miniH = miniW / (pieceW / pieceH);
              const pathData = generateJigsawPath(miniW, miniH, pieceConfig);
              const trayClipId = `tray-clip-${pieceId}-${imageToken}`;

              return (
                <div
                  key={`tray-piece-${pieceId}-${imageToken}`}
                  draggable={placementCredits > 0}
                  onDragStart={(e) => {
                    e.dataTransfer.setData('text/plain', pieceId.toString());
                    setSelectedPieceId(pieceId);
                    audioManager.playClick();
                  }}
                  onClick={() => {
                    if (placementCredits > 0) {
                      audioManager.playClick();
                      setSelectedPieceId(isSelected ? null : pieceId);
                    }
                  }}
                  className={`relative cursor-pointer rounded-2xl p-1 flex items-center justify-center transition-all duration-200 transform hover:scale-105 hover:-translate-y-1.5 ${
                    isShaking
                      ? 'animate-spring-shake ring-4 ring-red-500 bg-red-950/40 shadow-[0_0_20px_rgba(239,68,68,0.6)]'
                      : isSelected
                      ? 'ring-4 ring-amber-400 bg-amber-400/25 shadow-[0_0_20px_#f59e0b] scale-105'
                      : 'bg-slate-800/80 hover:bg-slate-800 border-2 border-cyan-500/30 hover:border-cyan-400/60 shadow-lg'
                  } ${placementCredits <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {pieceObj?.dataUrl ? (
                    <div className="relative flex items-center justify-center p-1 pointer-events-none">
                      <img
                        key={`tray-slice-${pieceId}-${imageToken}`}
                        src={pieceObj.dataUrl}
                        alt={`Mảnh ${pieceId + 1}`}
                        className="w-20 h-20 object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]"
                      />
                    </div>
                  ) : (
                    <svg
                      width={miniW}
                      height={miniH}
                      viewBox={`-${miniW * 0.25} -${miniH * 0.25} ${miniW * 1.5} ${miniH * 1.5}`}
                      className="overflow-visible drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]"
                    >
                      <defs>
                        <clipPath id={trayClipId}>
                          <path d={pathData} />
                        </clipPath>
                      </defs>

                      {/* Jigsaw base with border */}
                      <path
                        d={pathData}
                        fill="#1E293B"
                        stroke={isSelected ? '#F59E0B' : '#38BDF8'}
                        strokeWidth={isSelected ? '3' : '1.8'}
                      />

                      {/* Image mapped slice */}
                      <g clipPath={`url(#${trayClipId})`}>
                        <image
                          key={`tray-img-${pieceId}-${imageToken}`}
                          href={imageUrl}
                          xlinkHref={imageUrl}
                          x={-pieceConfig.col * miniW}
                          y={-pieceConfig.row * miniH}
                          width={miniW * 3}
                          height={miniH * 3}
                          preserveAspectRatio="none"
                        />
                      </g>
                    </svg>
                  )}
                </div>
              );
            })}

            {unplacedPieces.length === 0 && (
              <div className="col-span-3 py-10 text-center text-slate-400 text-sm font-semibold">
                Đã ghép hoàn tất các mảnh ghép!
              </div>
            )}
          </div>

          {/* Need Credits Notice & 3D CTA Button */}
          {placementCredits <= 0 && unplacedPieces.length > 0 && (
            <div className="mt-3 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/40 text-center">
              <p className="text-xs text-amber-200 font-semibold mb-2.5">
                Hết lượt ghép! Hoàn thành thử thách để nhận thêm lượt.
              </p>
              <div className="flex justify-center">
                <GoldenButton3D
                  onClick={() => {
                    audioManager.playClick();
                    onReturnToChallenge();
                  }}
                  size="sm"
                  icon={<Sparkles className="w-4 h-4 text-slate-950" />}
                  className="w-full"
                >
                  TIẾP TỤC THỬ THÁCH
                </GoldenButton3D>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Holographic Board Holding 3x3 Slots */}
        <div
          ref={boardContainerRef}
          className="w-full md:w-[68%] flex items-center justify-center bg-slate-900/70 rounded-3xl border border-cyan-500/30 p-2 sm:p-4 overflow-hidden"
        >
          {/* Cyber Wood Frame Container with 3D Tilt */}
          <Interactive3DCard
            maxTilt={6}
            perspective={1000}
            elevationZ={14}
            glowColor="rgba(245, 158, 11, 0.35)"
            className="wood-panel rounded-2xl p-3 sm:p-4 flex items-center justify-center transition-all duration-300 relative"
            style={{
              width: boardDimensions.width + 36,
              height: boardDimensions.height + 36
            }}
          >
            {/* 3x3 Jigsaw Canvas */}
            <div
              className="relative rounded-lg overflow-hidden bg-slate-950/80 shadow-inner border border-cyan-500/30"
              style={{
                width: boardDimensions.width,
                height: boardDimensions.height
              }}
            >
              {/* If completed 9/9, reveal original image */}
              {isCompleted ? (
                <img
                  key={`completed-${imageToken}`}
                  src={imageUrl}
                  alt="Hoàn thành tranh bí ẩn"
                  className="w-full h-full object-contain animate-in fade-in duration-500 shadow-2xl"
                />
              ) : (
                <svg
                  width={boardDimensions.width}
                  height={boardDimensions.height}
                  viewBox={`0 0 ${boardDimensions.width} ${boardDimensions.height}`}
                  className="absolute inset-0 w-full h-full"
                >
                  <defs>
                    {PUZZLE_PIECES_CONFIG.map((piece) => {
                      const path = generateJigsawPath(pieceW, pieceH, piece);
                      return (
                        <clipPath key={`clip-${piece.id}-${imageToken}`} id={`piece-clip-${piece.id}-${imageToken}`}>
                          <path d={path} />
                        </clipPath>
                      );
                    })}
                  </defs>

                  {/* 3x3 Board Slots */}
                  {PUZZLE_PIECES_CONFIG.map((piece) => {
                    const pieceObj = pieces?.find((p) => p.id === piece.id);
                    const isPlaced = placedPieceIds.includes(piece.id);
                    const isWrong = wrongSlotId === piece.id;
                    const isJustPlaced = lastPlacedPieceId === piece.id;
                    const pathData = generateJigsawPath(pieceW, pieceH, piece);
                    const slotX = piece.col * pieceW;
                    const slotY = piece.row * pieceH;
                    const pieceClipId = `piece-clip-${piece.id}-${imageToken}`;

                    return (
                      <g
                        key={`slot-${piece.id}-${imageToken}`}
                        transform={`translate(${slotX}, ${slotY})`}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          const rawId = e.dataTransfer.getData('text/plain');
                          const droppedPieceId = parseInt(rawId, 10);
                          if (!isNaN(droppedPieceId)) {
                            handleAttemptPlacement(piece.id, droppedPieceId);
                          }
                        }}
                        onClick={() => handleAttemptPlacement(piece.id)}
                        className={`cursor-pointer ${isWrong ? 'animate-spring-shake' : ''}`}
                      >
                        {/* Slot outline / socket with spring feedback on wrong placement */}
                        <path
                          d={pathData}
                          fill={
                            isWrong
                              ? 'rgba(239, 68, 68, 0.45)'
                              : isPlaced
                              ? 'transparent'
                              : 'rgba(15, 23, 42, 0.6)'
                          }
                          stroke={
                            isWrong
                              ? '#EF4444'
                              : isJustPlaced
                              ? '#10B981'
                              : isPlaced
                              ? 'none'
                              : 'rgba(56, 189, 248, 0.35)'
                          }
                          strokeWidth={isWrong ? 3.5 : isJustPlaced ? 3 : 1.2}
                          strokeDasharray={isPlaced ? 'none' : '4,3'}
                          className="transition-colors duration-200"
                        />

                        {/* Placed image piece with subtle bevel shadow */}
                        {isPlaced && (
                          pieceObj?.dataUrl ? (
                            <image
                              key={`placed-slice-${piece.id}-${imageToken}`}
                              href={pieceObj.dataUrl}
                              xlinkHref={pieceObj.dataUrl}
                              x={-pieceW * 0.25}
                              y={-pieceH * 0.25}
                              width={pieceW * 1.5}
                              height={pieceH * 1.5}
                              preserveAspectRatio="none"
                            />
                          ) : (
                            <g clipPath={`url(#${pieceClipId})`}>
                              <image
                                key={`placed-img-${piece.id}-${imageToken}`}
                                href={imageUrl}
                                xlinkHref={imageUrl}
                                x={-piece.col * pieceW}
                                y={-piece.row * pieceH}
                                width={boardDimensions.width}
                                height={boardDimensions.height}
                                preserveAspectRatio="none"
                              />
                            </g>
                          )
                        )}
                      </g>
                    );
                  })}
                </svg>
              )}
            </div>
          </Interactive3DCard>
        </div>
      </main>

      {/* Reset Match Confirmation Modal */}
      <ResetConfirmModal
        isOpen={showResetConfirm}
        onConfirm={() => {
          setShowResetConfirm(false);
          onResetGame();
        }}
        onCancel={() => setShowResetConfirm(false)}
        title="LÀM LẠI VÁN MỚI?"
        description="Bạn có chắc chắn muốn làm lại ván mới? Các mảnh ghép đã lắp vào bàn cờ và lượt ghép còn lại sẽ được đặt lại từ đầu."
      />
    </div>
  );
};
