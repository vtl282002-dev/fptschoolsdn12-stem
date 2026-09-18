import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Volume2,
  VolumeX,
  Settings,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  Zap,
  User,
  Camera,
  ExternalLink,
  Sparkles,
  RotateCcw,
  ScanFace
} from 'lucide-react';
import { ChallengeType } from '../types';
import { CHALLENGE_DEFINITIONS } from '../data/challenges';
import { faceLandmarkerService } from '../services/FaceLandmarkerService';
import { ChallengeEvaluator } from '../services/ChallengeEvaluator';
import { audioManager } from '../services/AudioManager';
import { StemRobotMascot } from './StemRobotMascot';
import { HologramCountdown3D } from './3d/HologramCountdown3D';
import { Interactive3DCard } from './3d/Interactive3DCard';
import { FptSchoolsLogo } from './FptSchoolsLogo';
import { ResetConfirmModal } from './ResetConfirmModal';

interface ChallengeViewProps {
  challengeType: ChallengeType;
  challengeTurnNonce?: number;
  requiredScore: number;
  placedPiecesCount: number;
  totalPiecesCount: number;
  countdownDuration: number;
  onChallengeSuccess: () => void;
  onOpenSettings: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  playerName?: string;
  playerSchool?: string;
  schoolLogoUrl?: string;
  onResetGame?: () => void;
}

export const ChallengeView: React.FC<ChallengeViewProps> = ({
  challengeType,
  challengeTurnNonce,
  requiredScore,
  placedPiecesCount,
  totalPiecesCount,
  countdownDuration,
  onChallengeSuccess,
  onOpenSettings,
  isMuted,
  onToggleMute,
  playerName = 'linh',
  playerSchool,
  schoolLogoUrl = '/assets/fpt_schools_logo.svg',
  onResetGame
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const simCanvasRef = useRef<HTMLCanvasElement>(null);

  // States
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [cameraState, setCameraState] = useState<'requesting' | 'ready' | 'error'>('requesting');
  const [isSimulatedCamera, setIsSimulatedCamera] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [validationText, setValidationText] = useState('Đang kết nối camera...');

  const [phase, setPhase] = useState<'idle' | 'countdown' | 'active' | 'success'>('idle');
  const [countdownNum, setCountdownNum] = useState<number | null>(null);
  const [currentScore, setCurrentScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  // Stream & Animation frame refs
  const streamRef = useRef<MediaStream | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const simRafIdRef = useRef<number | null>(null);
  const countdownIntervalRef = useRef<number | null>(null);
  const lastInferenceTimeRef = useRef<number>(0);
  const isComponentMounted = useRef<boolean>(true);
  const hasTriggeredSuccess = useRef<boolean>(false);

  const challengeInfo = CHALLENGE_DEFINITIONS[challengeType] || {
    id: challengeType,
    name: 'CƯỜI HÉ RĂNG',
    instruction: 'Hãy cười hé răng!',
    defaultScore: 100,
    icon: '😄'
  };

  // Stop camera tracks cleanly
  const stopTracks = useCallback(() => {
    if (streamRef.current) {
      try {
        streamRef.current.getTracks().forEach((track) => track.stop());
      } catch {
        // ignore
      }
      streamRef.current = null;
    }
  }, []);

  // 1. Initialize Real Camera (Immediate getUserMedia, no blocking)
  const startCamera = useCallback(async () => {
    setIsSimulatedCamera(false);
    setCameraState('requesting');
    setErrorMessage('');
    setValidationText('Đang yêu cầu quyền camera...');

    stopTracks();

    // Check if mediaDevices API is supported
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraState('error');
      setErrorMessage(
        'Trình duyệt hoặc môi trường iframe không hỗ trợ truy cập camera trực tiếp. Bạn có thể mở tab mới hoặc dùng chế độ mô phỏng.'
      );
      return;
    }

    try {
      // Parallelize MediaPipe model load with camera stream acquisition
      faceLandmarkerService.initialize().catch((err) => {
        console.warn('FaceLandmarker load fallback:', err);
      });

      let stream: MediaStream;
      try {
        // Preferred high quality user camera
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 640 },
            height: { ideal: 480 }
          },
          audio: false
        });
      } catch {
        try {
          // Fallback with just facingMode
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'user' },
            audio: false
          });
        } catch {
          // Broadest fallback: any video
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false
          });
        }
      }

      if (!isComponentMounted.current) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.setAttribute('webkit-playsinline', 'true');
        videoRef.current.muted = true;

        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current && isComponentMounted.current) {
            videoRef.current
              .play()
              .then(() => {
                setCameraState('ready');
                setValidationText('CAMERA ĐÃ SẴN SÀNG');
              })
              .catch(() => {
                setCameraState('ready');
                setValidationText('CAMERA ĐÃ SẴN SÀNG');
              });
          }
        };
      }
    } catch (err: any) {
      console.error('Camera acquisition error:', err);
      if (!isComponentMounted.current) return;

      setCameraState('error');
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setErrorMessage('Quyền camera đã bị từ chối trong trình duyệt hoặc iframe.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setErrorMessage('Không tìm thấy thiết bị webcam nào trên máy tính.');
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        setErrorMessage('Camera đang được sử dụng bởi ứng dụng khác (Zoom, Teams, v.v.).');
      } else {
        setErrorMessage('Không thể mở camera: ' + (err.message || 'Lỗi không xác định'));
      }
    }
  }, [stopTracks]);

  // Enable simulated virtual camera
  const enableSimulationMode = useCallback(() => {
    stopTracks();
    setIsSimulatedCamera(true);
    setCameraState('ready');
    setErrorMessage('');
    setValidationText('CHẾ ĐỘ CAMERA MÔ PHỎNG SẴN SÀNG');
  }, [stopTracks]);

  useEffect(() => {
    isComponentMounted.current = true;
    hasTriggeredSuccess.current = false;
    startCamera();

    return () => {
      isComponentMounted.current = false;
      stopTracks();
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      if (simRafIdRef.current) cancelAnimationFrame(simRafIdRef.current);
    };
  }, [startCamera, stopTracks]);

  // Reset challenge state on new challengeType or turn nonce (Guarantees fresh state & Ready button!)
  useEffect(() => {
    ChallengeEvaluator.reset();
    setCurrentScore(0);
    setHighScore(0);
    setPhase('idle');
    setCountdownNum(null);
    hasTriggeredSuccess.current = false;
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
  }, [challengeType, challengeTurnNonce]);

  // 2. Countdown handler with auto-fallback & reliability
  const handleReadyClick = () => {
    audioManager.playClick();
    ChallengeEvaluator.reset();
    setCurrentScore(0);
    hasTriggeredSuccess.current = false;

    // Clear any active countdown timer
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }

    // If hardware camera is not yet ready or has error, switch to simulation mode immediately so game flows smoothly
    if (cameraState !== 'ready' && !isSimulatedCamera) {
      enableSimulationMode();
    }

    const duration = Math.max(1, typeof countdownDuration === 'number' && !isNaN(countdownDuration) ? countdownDuration : 3);
    setPhase('countdown');
    setCountdownNum(duration);
    audioManager.playCountdownBeep(false);

    let count = duration;
    countdownIntervalRef.current = window.setInterval(() => {
      if (!isComponentMounted.current) {
        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
        return;
      }

      count -= 1;
      if (count > 0) {
        setCountdownNum(count);
        audioManager.playCountdownBeep(false);
      } else if (count === 0) {
        setCountdownNum(0); // "BẮT ĐẦU!"
        audioManager.playCountdownBeep(true);
      } else {
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
        }
        setCountdownNum(null);
        setPhase('active');
      }
    }, 1000);
  };

  // Quick pass / Skip challenge shortcut
  const handleQuickPass = () => {
    if (hasTriggeredSuccess.current) return;
    audioManager.playClick();
    hasTriggeredSuccess.current = true;
    setCurrentScore(requiredScore);
    setHighScore((prev) => Math.max(prev, requiredScore));
    setPhase('success');
    audioManager.playScoreTargetReached();

    setTimeout(() => {
      if (isComponentMounted.current) {
        onChallengeSuccess();
      }
    }, 600);
  };

  // Reset challenge
  const handleResetChallenge = () => {
    audioManager.playClick();
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    ChallengeEvaluator.reset();
    setCurrentScore(0);
    setPhase('idle');
    setCountdownNum(null);
    hasTriggeredSuccess.current = false;
  };

  // 3. Real Camera Face Detection Loop
  useEffect(() => {
    if (cameraState !== 'ready' || isSimulatedCamera) return;

    const processFrame = (time: number) => {
      if (!isComponentMounted.current) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (video && canvas && video.readyState >= 2 && time - lastInferenceTimeRef.current >= 40) {
        lastInferenceTimeRef.current = time;

        const data = faceLandmarkerService.detectFace(video, time);
        const ctx = canvas.getContext('2d');

        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          if (data && data.landmarks && data.landmarks.length > 0) {
            setValidationText(data.validation.message || 'Khuôn mặt hợp lệ');

            // Draw bounding box with corner L-brackets
            let minX = 1, minY = 1, maxX = 0, maxY = 0;
            for (let i = 0; i < data.landmarks.length; i++) {
              const pt = data.landmarks[i];
              if (pt.x < minX) minX = pt.x;
              if (pt.x > maxX) maxX = pt.x;
              if (pt.y < minY) minY = pt.y;
              if (pt.y > maxY) maxY = pt.y;
            }

            const marginX = (maxX - minX) * 0.12;
            const marginY = (maxY - minY) * 0.12;
            const xMin = Math.max(0, minX - marginX);
            const xMax = Math.min(1, maxX + marginX);
            const yMin = Math.max(0, minY - marginY);
            const yMax = Math.min(1, maxY + marginY);

            const w = canvas.width;
            const h = canvas.height;

            // Mirroring compensation
            const mirroredLeft = (1 - xMax) * w;
            const boxW = (xMax - xMin) * w;
            const boxH = (yMax - yMin) * h;
            const boxTop = yMin * h;

            const cornerSize = Math.min(28, boxW * 0.22);

            ctx.strokeStyle = '#00F0FF';
            ctx.lineWidth = 3;
            ctx.shadowColor = '#00F0FF';
            ctx.shadowBlur = 10;

            // Top Left Corner
            ctx.beginPath();
            ctx.moveTo(mirroredLeft, boxTop + cornerSize);
            ctx.lineTo(mirroredLeft, boxTop);
            ctx.lineTo(mirroredLeft + cornerSize, boxTop);
            ctx.stroke();

            // Top Right Corner
            ctx.beginPath();
            ctx.moveTo(mirroredLeft + boxW - cornerSize, boxTop);
            ctx.lineTo(mirroredLeft + boxW, boxTop);
            ctx.lineTo(mirroredLeft + boxW, boxTop + cornerSize);
            ctx.stroke();

            // Bottom Left Corner
            ctx.beginPath();
            ctx.moveTo(mirroredLeft, boxTop + boxH - cornerSize);
            ctx.lineTo(mirroredLeft, boxTop + boxH);
            ctx.lineTo(mirroredLeft + cornerSize, boxTop + boxH);
            ctx.stroke();

            // Bottom Right Corner
            ctx.beginPath();
            ctx.moveTo(mirroredLeft + boxW - cornerSize, boxTop + boxH);
            ctx.lineTo(mirroredLeft + boxW, boxTop + boxH);
            ctx.lineTo(mirroredLeft + boxW, boxTop + boxH - cornerSize);
            ctx.stroke();

            // Draw Landmark Grid Mesh Dots
            ctx.fillStyle = 'rgba(0, 240, 255, 0.75)';
            ctx.shadowBlur = 6;
            const keyIndices = [
              1, 33, 263, 61, 291, 13, 14, 17, 37, 267, 10, 152, 234, 454,
              107, 336, 168, 197, 5, 4, 19, 94, 2
            ];
            keyIndices.forEach((idx) => {
              const pt = data.landmarks[idx];
              if (pt) {
                const lx = (1 - pt.x) * w;
                const ly = pt.y * h;
                ctx.beginPath();
                ctx.arc(lx, ly, 2.5, 0, 2 * Math.PI);
                ctx.fill();
              }
            });

            // Score Evaluation in Active Phase
            if (phase === 'active' && !hasTriggeredSuccess.current) {
              const evalResult = ChallengeEvaluator.evaluate(
                challengeType,
                data.landmarks,
                requiredScore,
                data.blendshapes
              );
              const score = Math.min(100, Math.round(evalResult.score));

              setCurrentScore(score);
              setHighScore((prev) => Math.max(prev, score));

              // Check if passed requiredScore
              if (score >= requiredScore && !hasTriggeredSuccess.current) {
                hasTriggeredSuccess.current = true;
                setPhase('success');
                audioManager.playScoreTargetReached();

                setTimeout(() => {
                  if (isComponentMounted.current) {
                    onChallengeSuccess();
                  }
                }, 750);
              }
            }
          } else {
            setValidationText('Hãy đưa khuôn mặt vào giữa khung camera');
            if (phase === 'active') {
              setCurrentScore((prev) => Math.max(0, prev - 1));
            }
          }
        }
      }

      rafIdRef.current = requestAnimationFrame(processFrame);
    };

    rafIdRef.current = requestAnimationFrame(processFrame);

    return () => {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, [cameraState, isSimulatedCamera, phase, challengeType, requiredScore, onChallengeSuccess]);

  // 4. Simulated Camera Loop (Generates realistic student face feed & interactive expressions)
  useEffect(() => {
    if (!isSimulatedCamera) return;

    let simProgress = 0;
    const simCanvas = simCanvasRef.current;
    if (!simCanvas) return;
    const ctx = simCanvas.getContext('2d');
    if (!ctx) return;

    const renderSimulatedFrame = (time: number) => {
      if (!isComponentMounted.current) return;

      const w = simCanvas.width;
      const h = simCanvas.height;

      // Background Classroom/Room
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, '#0f172a');
      grad.addColorStop(1, '#020617');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Room elements (bookshelf & lamp glow)
      ctx.fillStyle = 'rgba(30, 41, 59, 0.7)';
      ctx.fillRect(40, 60, 140, 240);
      ctx.fillStyle = 'rgba(6, 182, 212, 0.15)';
      ctx.beginPath();
      ctx.arc(520, 120, 80, 0, Math.PI * 2);
      ctx.fill();

      // Student Head & Body
      const headX = w / 2;
      const headY = h / 2 - 10 + Math.sin(time * 0.003) * 3;

      // Shoulders
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.ellipse(headX, h + 30, 160, 90, 0, 0, Math.PI * 2);
      ctx.fill();

      // Shirt collar
      ctx.fillStyle = '#cbd5e1';
      ctx.beginPath();
      ctx.moveTo(headX - 45, headY + 110);
      ctx.lineTo(headX, headY + 135);
      ctx.lineTo(headX + 45, headY + 110);
      ctx.fill();

      // Face
      ctx.fillStyle = '#fed7aa';
      ctx.beginPath();
      ctx.ellipse(headX, headY + 15, 80, 95, 0, 0, Math.PI * 2);
      ctx.fill();

      // Hair
      ctx.fillStyle = '#1e1b4b';
      ctx.beginPath();
      ctx.arc(headX, headY - 15, 88, Math.PI, 0, false);
      ctx.fill();

      // Bangs
      ctx.beginPath();
      ctx.moveTo(headX - 80, headY - 10);
      ctx.quadraticCurveTo(headX - 30, headY + 15, headX - 10, headY - 10);
      ctx.quadraticCurveTo(headX + 30, headY + 15, headX + 80, headY - 10);
      ctx.fill();

      // Blinking Eyes
      const blink = Math.sin(time * 0.004) > 0.95;
      const isWinkLeft = phase === 'active' && challengeType === 'wink_left';
      const isWinkRight = phase === 'active' && challengeType === 'wink_right';
      const isEyesClosed = phase === 'active' && challengeType === 'eyes_closed';

      // Left Eye
      ctx.fillStyle = '#0f172a';
      if (blink || isWinkLeft || isEyesClosed) {
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(headX - 30, headY + 10, 12, 0, Math.PI, false);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.arc(headX - 30, headY + 10, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(headX - 33, headY + 7, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // Right Eye
      ctx.fillStyle = '#0f172a';
      if (blink || isWinkRight || isEyesClosed) {
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(headX + 30, headY + 10, 12, 0, Math.PI, false);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.arc(headX + 30, headY + 10, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(headX + 27, headY + 7, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // Eyebrows
      ctx.strokeStyle = '#1e1b4b';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(headX - 30, headY - 8, 16, Math.PI * 1.1, Math.PI * 1.9);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(headX + 30, headY - 8, 16, Math.PI * 1.1, Math.PI * 1.9);
      ctx.stroke();

      // Nose
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.arc(headX, headY + 30, 4, 0, Math.PI * 2);
      ctx.fill();

      // Mouth animation based on phase and challenge
      const isGrinOrSmile = challengeType === 'grin' || challengeType === 'smile' || challengeType === 'mouth_pucker';
      const isMouthOpen = challengeType === 'mouth_open' || challengeType === 'mouth_stretch';

      if (phase === 'active' || phase === 'success') {
        if (isGrinOrSmile) {
          // Wide smiling mouth with teeth
          ctx.fillStyle = '#dc2626';
          ctx.beginPath();
          ctx.arc(headX, headY + 55, 28, 0, Math.PI, false);
          ctx.fill();
          // White teeth
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(headX - 20, headY + 55, 40, 10);
        } else if (isMouthOpen) {
          ctx.fillStyle = '#7f1d1d';
          ctx.beginPath();
          ctx.ellipse(headX, headY + 60, 20, 26, 0, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.lineWidth = 4;
          ctx.strokeStyle = '#dc2626';
          ctx.beginPath();
          ctx.arc(headX, headY + 50, 22, 0, Math.PI, false);
          ctx.stroke();
        }
      } else {
        // Normal gentle smile
        ctx.lineWidth = 3.5;
        ctx.strokeStyle = '#b91c1c';
        ctx.beginPath();
        ctx.arc(headX, headY + 52, 16, 0.1 * Math.PI, 0.9 * Math.PI, false);
        ctx.stroke();
      }

      // Cyber Corner Reticle
      const boxLeft = headX - 110;
      const boxTop = headY - 90;
      const boxW = 220;
      const boxH = 240;
      const cornerSize = 28;

      ctx.strokeStyle = '#00F0FF';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#00F0FF';
      ctx.shadowBlur = 10;

      // Top Left
      ctx.beginPath();
      ctx.moveTo(boxLeft, boxTop + cornerSize);
      ctx.lineTo(boxLeft, boxTop);
      ctx.lineTo(boxLeft + cornerSize, boxTop);
      ctx.stroke();

      // Top Right
      ctx.beginPath();
      ctx.moveTo(boxLeft + boxW - cornerSize, boxTop);
      ctx.lineTo(boxLeft + boxW, boxTop);
      ctx.lineTo(boxLeft + boxW, boxTop + cornerSize);
      ctx.stroke();

      // Bottom Left
      ctx.beginPath();
      ctx.moveTo(boxLeft, boxTop + boxH - cornerSize);
      ctx.lineTo(boxLeft, boxTop + boxH);
      ctx.lineTo(boxLeft + cornerSize, boxTop + boxH);
      ctx.stroke();

      // Bottom Right
      ctx.beginPath();
      ctx.moveTo(boxLeft + boxW - cornerSize, boxTop + boxH);
      ctx.lineTo(boxLeft + boxW, boxTop + boxH);
      ctx.lineTo(boxLeft + boxW, boxTop + boxH - cornerSize);
      ctx.stroke();

      // Landmark grid dots on face
      ctx.fillStyle = 'rgba(0, 240, 255, 0.75)';
      ctx.shadowBlur = 5;
      const simDots = [
        [headX - 30, headY + 10],
        [headX + 30, headY + 10],
        [headX, headY + 30],
        [headX - 20, headY + 55],
        [headX + 20, headY + 55],
        [headX, headY + 70],
        [headX - 45, headY - 8],
        [headX + 45, headY - 8],
        [headX - 60, headY + 20],
        [headX + 60, headY + 20],
        [headX - 50, headY + 60],
        [headX + 50, headY + 60],
        [headX, headY - 30]
      ];
      simDots.forEach(([dx, dy]) => {
        ctx.beginPath();
        ctx.arc(dx, dy, 2.5, 0, Math.PI * 2);
        ctx.fill();
      });

      // Active phase score progression
      if (phase === 'active' && !hasTriggeredSuccess.current) {
        simProgress = Math.min(100, simProgress + 1.2);
        const score = Math.round(simProgress);
        setCurrentScore(score);
        setHighScore((prev) => Math.max(prev, score));

        if (score >= requiredScore && !hasTriggeredSuccess.current) {
          hasTriggeredSuccess.current = true;
          setPhase('success');
          audioManager.playScoreTargetReached();

          setTimeout(() => {
            if (isComponentMounted.current) {
              onChallengeSuccess();
            }
          }, 750);
        }
      }

      simRafIdRef.current = requestAnimationFrame(renderSimulatedFrame);
    };

    simRafIdRef.current = requestAnimationFrame(renderSimulatedFrame);

    return () => {
      if (simRafIdRef.current) cancelAnimationFrame(simRafIdRef.current);
    };
  }, [isSimulatedCamera, phase, challengeType, requiredScore, onChallengeSuccess]);

  return (
    <div className="relative w-full min-h-screen flex flex-col justify-between bg-gradient-to-b from-[#061a3d] via-[#092558] to-[#04122c] select-none overflow-x-hidden text-slate-100 font-sans">
      {/* Background Deep Cosmic Stars & Glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_40%,rgba(14,48,107,0.7),#030e24)]" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-400/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* TOP HEADER BAR (Exact layout of Image 1) */}
      <header className="relative z-20 flex items-center justify-between px-3 sm:px-6 py-2 max-w-7xl mx-auto w-full">
        {/* Left: Authentic FPT Schools Logo + App Title */}
        <div className="flex items-center gap-3">
          <FptSchoolsLogo size="sm" />

          <h1 className="text-sm sm:text-base md:text-lg font-black text-amber-300 drop-shadow-[0_2px_10px_rgba(245,158,11,0.6)] tracking-tight whitespace-nowrap">
            Thử thách khuôn mặt - Ghép tranh bí ẩn
          </h1>
        </div>

        {/* Center: Glowing Progress Capsule: "TIẾN ĐỘ BỨC TRANH [🧩 9 icons] 0 / 9 mảnh" */}
        <div className="hidden md:flex items-center gap-2.5 bg-slate-900/90 border-2 border-cyan-400/60 px-4 py-1.5 rounded-full shadow-[0_0_20px_rgba(6,182,212,0.35)]">
          <span className="text-amber-400 text-base">🧩</span>
          <span className="text-xs font-black uppercase tracking-wider text-cyan-300">
            TIẾN ĐỘ BỨC TRANH
          </span>

          {/* 9 Jigsaw Puzzle Pieces Icons */}
          <div className="flex items-center gap-1">
            {Array.from({ length: 9 }).map((_, i) => (
              <svg
                key={i}
                viewBox="0 0 24 24"
                className={`w-4 h-4 transition-all duration-300 ${
                  i < placedPiecesCount
                    ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_#f59e0b]'
                    : 'text-cyan-500/40 stroke-cyan-400 stroke-2 fill-none'
                }`}
              >
                <path d="M6 3h4a2 2 0 0 1 2 2 2 2 0 0 0 4 0 2 2 0 0 1 2-2h4v4a2 2 0 0 1-2 2 2 2 0 0 0 0 4 2 2 0 0 1 2 2v4h-4a2 2 0 0 1-2-2 2 2 0 0 0-4 0 2 2 0 0 1-2 2H6v-4a2 2 0 0 1 2-2 2 2 0 0 0 0-4 2 2 0 0 1-2-2V3z" />
              </svg>
            ))}
          </div>

          <span className="text-xs sm:text-sm font-black text-slate-100 font-mono ml-1">
            {placedPiecesCount} / 9 mảnh
          </span>
        </div>

        {/* Right: Player Badge & Circular Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* User Name Pill */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-950/90 border border-cyan-400/60 text-cyan-200 text-xs sm:text-sm font-bold shadow-[0_0_12px_rgba(6,182,212,0.3)]">
            <User className="w-3.5 h-3.5 text-cyan-400" />
            <span className="max-w-[90px] truncate">{playerName}</span>
            {playerSchool && playerSchool.trim() && (
              <span className="text-[10px] text-cyan-400/70 max-w-[80px] truncate hidden md:inline">
                ({playerSchool.trim()})
              </span>
            )}
          </div>

          {/* Sound Toggle */}
          <button
            onClick={() => {
              audioManager.playClick();
              onToggleMute();
            }}
            className="w-9 h-9 rounded-full bg-blue-900/80 border border-cyan-400/60 text-cyan-300 hover:bg-cyan-500/20 active:scale-95 flex items-center justify-center transition shadow-[0_0_12px_rgba(6,182,212,0.3)] cursor-pointer"
            title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Làm lại ván mới (Full Match Restart) */}
          {onResetGame && (
            <button
              onClick={() => {
                audioManager.playClick();
                setShowResetConfirm(true);
              }}
              className="px-3 py-1.5 rounded-full bg-red-950/70 border border-red-500/60 text-red-300 hover:bg-red-900/80 active:scale-95 flex items-center gap-1.5 transition shadow-[0_0_12px_rgba(239,68,68,0.3)] text-xs font-bold cursor-pointer"
              title="Làm lại ván mới từ đầu"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">VÁN MỚI</span>
            </button>
          )}

          {/* Settings Button */}
          <button
            onClick={() => {
              audioManager.playClick();
              onOpenSettings();
            }}
            className="w-9 h-9 rounded-full bg-blue-900/80 border border-cyan-400/60 text-cyan-300 hover:bg-cyan-500/20 active:scale-95 flex items-center justify-center transition shadow-[0_0_12px_rgba(6,182,212,0.3)] cursor-pointer"
            title="Cài đặt hệ thống"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* MAIN TWO-COLUMN STAGE (Desktop 58% Camera / 42% Challenge Panel) */}
      <main className="relative z-10 flex-1 flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-6 2xl:gap-8 px-3 sm:px-6 py-2 max-w-7xl mx-auto w-full overflow-hidden">
        {/* Left Side Background Typography: "STEM FOR A BRIGHTER TOMORROW" (Image 1) */}
        <div className="absolute left-4 top-1/3 hidden 2xl:flex flex-col gap-1 text-cyan-400/40 text-xs font-black tracking-widest pointer-events-none uppercase">
          <span>STEM</span>
          <span>FOR A</span>
          <span>BRIGHTER</span>
          <span>TOMORROW</span>
          <span className="text-amber-400 text-lg mt-1 animate-pulse">✦</span>
        </div>

        {/* Right Side Background Typography: "HỌC HỎI KHÁM PHÁ SÁNG TẠO VƯƠN XA" (Image 1) */}
        <div className="absolute right-4 top-1/3 hidden 2xl:flex flex-col items-end gap-1 text-cyan-400/40 text-xs font-black tracking-widest pointer-events-none uppercase">
          <span>HỌC HỎI</span>
          <span>KHÁM PHÁ</span>
          <span>SÁNG TẠO</span>
          <span>VƯƠN XA</span>
          <span className="text-cyan-400 text-base mt-1">🚀</span>
        </div>

        {/* ================= LEFT MAIN CONTAINER: CAMERA SCANNER (58% desktop width) ================= */}
        <div className="w-full lg:w-[58%] max-w-[620px] flex flex-col items-center shrink-0">
          {/* Cyber Neon Rounded Camera Card matching Image 1 */}
          <div className="relative w-full max-w-[580px] aspect-[4/3] max-h-[calc(100vh-175px)] sm:max-h-[440px] 2xl:max-h-[500px] rounded-3xl p-2 bg-gradient-to-b from-cyan-500/30 via-blue-600/15 to-cyan-500/25 border-2 border-cyan-400 shadow-[0_0_35px_rgba(6,182,212,0.4)]">
            <div className="relative w-full h-full rounded-[20px] overflow-hidden bg-slate-950 flex items-center justify-center">
              {/* Corner Cyber Accents */}
              <div className="absolute top-2 left-2 w-5 h-5 border-t-3 border-l-3 border-cyan-400/90 z-20 pointer-events-none rounded-tl-sm" />
              <div className="absolute top-2 right-2 w-5 h-5 border-t-3 border-r-3 border-cyan-400/90 z-20 pointer-events-none rounded-tr-sm" />
              <div className="absolute bottom-2 left-2 w-5 h-5 border-b-3 border-l-3 border-cyan-400/90 z-20 pointer-events-none rounded-bl-sm" />
              <div className="absolute bottom-2 right-2 w-5 h-5 border-b-3 border-r-3 border-cyan-400/90 z-20 pointer-events-none rounded-br-sm" />

              {/* 1. Real Webcam Video Element */}
              {!isSimulatedCamera && (
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  webkit-playsinline="true"
                  className="absolute inset-0 w-full h-full object-cover -scale-x-100"
                />
              )}

              {/* 2. Real Landmark Canvas Overlay */}
              {!isSimulatedCamera && (
                <canvas
                  ref={canvasRef}
                  width={640}
                  height={480}
                  className="absolute inset-0 w-full h-full pointer-events-none z-10"
                />
              )}

              {/* 3. Simulated Canvas Mode */}
              {isSimulatedCamera && (
                <canvas
                  ref={simCanvasRef}
                  width={640}
                  height={480}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              )}

              {/* Top-Left Status Badge: "● CAMERA ĐÃ SẴN SÀNG" (Image 1) */}
              <div className="absolute top-3 left-3 z-20 flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-950/85 backdrop-blur-md border border-cyan-400/70 shadow-[0_0_12px_rgba(6,182,212,0.4)]">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    cameraState === 'ready' || isSimulatedCamera
                      ? 'bg-emerald-400 shadow-[0_0_8px_#10B981] animate-pulse'
                      : 'bg-amber-400'
                  }`}
                />
                <span className="text-[11px] sm:text-xs font-black text-cyan-200 tracking-wider font-mono uppercase">
                  {cameraState === 'ready' || isSimulatedCamera
                    ? 'CAMERA ĐÃ SẴN SÀNG'
                    : 'ĐANG KẾT NỐI CAMERA...'}
                </span>
              </div>

              {/* Top-Right Signal Bars (Image 1) */}
              <div className="absolute top-3 right-3 z-20 flex items-end gap-1 px-2.5 py-1.5 rounded-full bg-slate-950/85 border border-cyan-400/50">
                <div className="w-1 h-2 bg-cyan-400 rounded-xs" />
                <div className="w-1 h-3 bg-cyan-400 rounded-xs" />
                <div className="w-1 h-4 bg-cyan-400 rounded-xs" />
              </div>

              {/* Bottom Badge Over Camera: "📷 Hãy nhìn vào camera và sẵn sàng nhé!" (Image 1) */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-950/90 backdrop-blur-md border border-cyan-400/70 text-cyan-200 text-xs sm:text-sm font-bold shadow-[0_0_15px_rgba(6,182,212,0.5)] whitespace-nowrap">
                <Camera className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Hãy nhìn vào camera và sẵn sàng nhé!</span>
              </div>

              {/* Holographic Countdown Overlay Inside Camera (3, 2, 1, BẮT ĐẦU) */}
              {phase === 'countdown' && <HologramCountdown3D count={countdownNum} />}

              {/* Success Overlay Inside Camera */}
              {phase === 'success' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-emerald-950/80 backdrop-blur-xs z-30 animate-in fade-in zoom-in duration-300">
                  <CheckCircle2 className="w-16 h-16 sm:w-20 sm:h-20 text-emerald-400 drop-shadow-[0_0_25px_#10B981] mb-2 animate-bounce" />
                  <span className="text-2xl sm:text-3xl font-black text-emerald-300 drop-shadow-md">
                    THỬ THÁCH HOÀN THÀNH!
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-emerald-200 mt-1">
                    Đang mở khóa câu hỏi STEM...
                  </span>
                </div>
              )}

              {/* Loading State */}
              {cameraState === 'requesting' && !isSimulatedCamera && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90 text-cyan-300 p-6 text-center z-25">
                  <RefreshCw className="w-10 h-10 animate-spin mb-3 text-cyan-400" />
                  <p className="font-bold text-base sm:text-lg">Đang kết nối camera &amp; AI Vision...</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Vui lòng bấm Cho phép (Allow) khi trình duyệt hỏi quyền
                  </p>
                </div>
              )}

              {/* Error State with Immediate Fixes & Simulated Camera Switch */}
              {cameraState === 'error' && !isSimulatedCamera && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/95 text-red-300 p-5 text-center z-30">
                  <AlertTriangle className="w-12 h-12 text-amber-400 mb-2 animate-bounce" />
                  <p className="font-black text-lg text-amber-300">Không thể mở camera</p>
                  <p className="text-xs sm:text-sm text-slate-300 max-w-md my-2 leading-relaxed">
                    {errorMessage || 'Trình duyệt đang chặn camera hoặc thiết bị không có webcam.'}
                  </p>

                  <div className="flex flex-wrap items-center justify-center gap-2.5 mt-3">
                    <button
                      onClick={startCamera}
                      className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(6,182,212,0.4)] cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Thử lại
                    </button>
                    <button
                      onClick={() => window.open(window.location.href, '_blank')}
                      className="px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-600 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Mở trong tab mới
                    </button>
                    <button
                      onClick={enableSimulationMode}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-[0_0_20px_#f59e0b] cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" /> Bật Camera Mô Phỏng
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Podium with Cute STEM Robot & Tech Plaque (Exact Image 1) */}
          <div className="mt-3 flex flex-col items-center">
            <div className="relative flex flex-col items-center">
              {/* STEM Robot Mascot */}
              <StemRobotMascot
                size="sm"
                mood={phase === 'active' ? 'scanner' : phase === 'success' ? 'cheering' : 'happy'}
              />

              {/* Cyber Plaque: "CÔNG NGHỆ KIẾN TẠO TƯƠNG LAI" (Image 1) */}
              <div className="mt-1 px-4 py-1.5 rounded-lg bg-slate-950 border border-cyan-400/80 shadow-[0_0_15px_rgba(6,182,212,0.5)]">
                <span className="text-[10px] sm:text-[11px] font-black tracking-widest text-cyan-300 uppercase font-mono">
                  CÔNG NGHỆ KIẾN TẠO TƯƠNG LAI
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ================= RIGHT MAIN CONTAINER: FACE CHALLENGE CARD (42% desktop width) ================= */}
        <div className="w-full lg:w-[42%] max-w-[480px] flex flex-col items-center shrink-0">
          {/* Cyber Rounded Challenge Card */}
          <div className="relative w-full rounded-3xl p-4 sm:p-5 2xl:p-6 bg-gradient-to-b from-[#0a1e4a]/95 via-[#07173b]/95 to-[#040f28]/98 border-2 border-cyan-400 shadow-[0_0_35px_rgba(6,182,212,0.45)] flex flex-col items-center text-center justify-between z-20">
            {/* Cyber Corner Decors */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-300 m-2.5 rounded-tl-sm pointer-events-none" />
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-300 m-2.5 rounded-tr-sm pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-300 m-2.5 rounded-bl-sm pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-300 m-2.5 rounded-br-sm pointer-events-none" />

            {/* Header Badge: "[☻] THỬ THÁCH KHUÔN MẶT" (Image 1) */}
            <div className="flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-cyan-950/90 border border-cyan-400/70 shadow-[0_0_12px_rgba(6,182,212,0.3)] text-cyan-300 text-[11px] sm:text-xs font-black uppercase tracking-wider mb-1.5">
              <ScanFace className="w-3.5 h-3.5 text-cyan-400" />
              <span>THỬ THÁCH KHUÔN MẶT</span>
            </div>

            {/* Big 3D Emoji with Golden Radiant Glow (Image 1) */}
            <div className="relative my-0.5">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-amber-500/30 via-yellow-400/40 to-amber-300/20 blur-lg absolute inset-0 -z-10 animate-pulse" />
              <span className="text-5xl sm:text-6xl drop-shadow-[0_4px_20px_rgba(245,158,11,0.7)] select-none">
                {challengeInfo.icon || '😄'}
              </span>
            </div>

            {/* Challenge Title: "CƯỜI HÉ RĂNG" in giant bold gold (Image 1) */}
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-amber-300 drop-shadow-[0_4px_16px_rgba(245,158,11,0.75)] tracking-wide uppercase mt-0.5">
              {challengeInfo.name}
            </h2>

            {/* Subtitle Pill: "Hãy cười hé răng!" (Image 1) */}
            <div className="mt-1 mb-2.5 px-4 py-1 rounded-full bg-slate-950/90 border border-cyan-400/60 text-cyan-200 text-xs sm:text-sm font-bold shadow-inner">
              {challengeInfo.instruction}
            </div>

            {/* Score Section: Circular Progress Meter + Stats (Image 1) */}
            <div className="w-full flex items-center justify-center gap-4 sm:gap-6 my-1">
              {/* Large Glowing Circular Ring Meter */}
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                  {/* Background track */}
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="none"
                    stroke="rgba(6, 182, 212, 0.2)"
                    strokeWidth="10"
                  />
                  {/* Glowing Progress stroke */}
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="none"
                    stroke="#00F0FF"
                    strokeWidth="10"
                    strokeDasharray={2 * Math.PI * 50}
                    strokeDashoffset={2 * Math.PI * 50 * (1 - Math.min(requiredScore, currentScore) / requiredScore)}
                    strokeLinecap="round"
                    className="transition-all duration-150 drop-shadow-[0_0_12px_#00F0FF]"
                  />
                </svg>

                {/* Score numbers inside ring */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl sm:text-3xl font-black text-cyan-300 font-mono drop-shadow-[0_0_12px_#00F0FF]">
                    {currentScore}
                  </span>
                  <span className="text-[11px] sm:text-xs font-bold text-cyan-200/80 font-mono">
                    / {requiredScore}
                  </span>
                </div>
              </div>

              {/* Right Stat Cards: "🎯 MỤC TIÊU [requiredScore]" and "🏆 Cao nhất" */}
              <div className="flex flex-col gap-2 text-left">
                {/* Target Box */}
                <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-950/85 border border-cyan-400/50 shadow-md">
                  <div className="w-7 h-7 rounded-full bg-red-500/20 border border-red-400/40 flex items-center justify-center text-red-400 text-sm">
                    🎯
                  </div>
                  <div>
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                      MỤC TIÊU
                    </div>
                    <div className="text-base sm:text-lg font-black text-amber-300 font-mono leading-none mt-0.5">
                      {requiredScore} <span className="text-[10px] font-bold text-slate-300">điểm</span>
                    </div>
                  </div>
                </div>

                {/* High Score Box */}
                <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-950/85 border border-cyan-400/50 shadow-md">
                  <div className="w-7 h-7 rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 text-sm">
                    🏆
                  </div>
                  <div>
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                      Cao nhất
                    </div>
                    <div className="text-base sm:text-lg font-black text-white font-mono leading-none mt-0.5">
                      {highScore}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom CTA Golden Button: "⚡ SẴN SÀNG" (Image 1) */}
            <div className="w-full mt-2.5">
              {phase === 'idle' && (
                <button
                  type="button"
                  id="challenge-ready-btn"
                  onClick={handleReadyClick}
                  className="w-full py-3 sm:py-3.5 px-6 rounded-full font-black text-lg sm:text-xl text-[#0b172a] uppercase tracking-wider bg-gradient-to-b from-[#FFE57F] via-[#FFC107] to-[#FF8F00] hover:from-[#FFF176] hover:to-[#FFA000] active:scale-95 active:translate-y-1 shadow-[0_5px_0_#C67100,0_10px_22px_rgba(255,179,0,0.7)] border-2 border-[#FFE082] flex items-center justify-center gap-2.5 cursor-pointer transition transform select-none relative z-30"
                >
                  <Zap className="w-5 h-5 fill-[#0b172a] text-[#0b172a] animate-pulse" />
                  <span className="font-black tracking-wide">SẴN SÀNG</span>
                </button>
              )}

              {phase === 'countdown' && (
                <div className="w-full py-3.5 px-8 rounded-2xl font-black text-xl text-amber-300 bg-slate-900/90 border border-amber-500/60 shadow-[0_0_20px_rgba(245,158,11,0.4)] animate-pulse">
                  Chuẩn bị trong {countdownNum}...
                </div>
              )}

              {phase === 'active' && (
                <div className="w-full flex flex-col items-center gap-2">
                  <div className="w-full py-3 px-6 rounded-2xl font-black text-sm sm:text-base text-cyan-200 bg-cyan-950/85 border border-cyan-400/70 shadow-[0_0_25px_rgba(6,182,212,0.5)] animate-pulse flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-3 text-center">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-cyan-400 animate-ping shrink-0" />
                      <span>🎯 Mục tiêu: <strong className="text-amber-300 font-mono text-base sm:text-lg">{requiredScore}</strong> điểm</span>
                    </div>
                    <span className="hidden sm:inline text-cyan-500">|</span>
                    <div className="flex items-center gap-1">
                      <span>Điểm hiện tại: <strong className="text-cyan-300 font-mono text-lg">{currentScore}</strong> / {requiredScore}</span>
                    </div>
                  </div>
                </div>
              )}

              {phase === 'success' && (
                <div className="w-full py-3.5 px-8 rounded-2xl font-black text-lg sm:text-xl text-emerald-300 bg-emerald-950/90 border border-emerald-400/70 shadow-[0_0_25px_rgba(16,185,129,0.5)] flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>✓ Đạt {currentScore} / {requiredScore} điểm! Đang mở câu hỏi...</span>
                </div>
              )}
            </div>
          </div>

          {/* Bottom-Right Props: Stack of Books & Glowing Light Bulb (Image 1) */}
          <div className="mt-3 flex items-center gap-3">
            {/* Stack of 4 Books */}
            <div className="flex flex-col items-center gap-1 text-[9px] font-black tracking-wider">
              <div className="px-3.5 py-0.5 rounded-sm bg-orange-600 text-white shadow-sm border-b border-orange-800">
                SCIENCE
              </div>
              <div className="px-4 py-0.5 rounded-sm bg-emerald-600 text-white shadow-sm border-b border-emerald-800">
                TECHNOLOGY
              </div>
              <div className="px-3.5 py-0.5 rounded-sm bg-blue-600 text-white shadow-sm border-b border-blue-800">
                ENGINEERING
              </div>
              <div className="px-4 py-0.5 rounded-sm bg-amber-500 text-slate-950 shadow-sm border-b border-amber-700">
                MATHEMATICS
              </div>
            </div>

            {/* Glowing Lightbulb */}
            <div className="w-9 h-9 rounded-full bg-amber-500/20 border border-amber-400/60 flex items-center justify-center text-amber-300 text-lg shadow-[0_0_15px_rgba(245,158,11,0.5)] animate-pulse">
              💡
            </div>
          </div>
        </div>
      </main>

      {/* BOTTOM FOOTER BAR (Exact layout of Image 1) */}
      <footer className="relative z-20 py-2.5 flex items-center justify-center gap-2 sm:gap-4 text-[10px] sm:text-xs font-mono font-bold text-cyan-300/80 tracking-widest border-t border-cyan-500/25 bg-slate-950/90">
        <div className="h-px w-6 sm:w-16 bg-gradient-to-r from-transparent to-cyan-400" />
        <span>STEM</span>
        <span className="text-cyan-400">✦</span>
        <span>SCIENCE</span>
        <span className="text-cyan-400">✦</span>
        <span>TECHNOLOGY</span>
        <span className="text-cyan-400">✦</span>
        <span>ENGINEERING</span>
        <span className="text-cyan-400">✦</span>
        <span>MATHEMATICS</span>
        <div className="h-px w-6 sm:w-16 bg-gradient-to-l from-transparent to-cyan-400" />
      </footer>
      {/* Reset Confirmation Modal */}
      <ResetConfirmModal
        isOpen={showResetConfirm}
        onConfirm={() => {
          setShowResetConfirm(false);
          if (onResetGame) onResetGame();
        }}
        onCancel={() => setShowResetConfirm(false)}
        title="LÀM LẠI VÁN MỚI?"
        description="Bạn có chắc chắn muốn bắt đầu lại ván mới từ đầu? Số mảnh ghép đã nhận và tiến trình hiện tại sẽ được đặt lại."
      />
    </div>
  );
};
