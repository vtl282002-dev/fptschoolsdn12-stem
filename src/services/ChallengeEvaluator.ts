import { ChallengeType } from '../types';
import { EyeAnalyzer, NormalizedLandmark } from './analyzers/EyeAnalyzer';
import { MouthAnalyzer } from './analyzers/MouthAnalyzer';
import { HeadPoseAnalyzer } from './analyzers/HeadPoseAnalyzer';
import { ExpressionAnalyzer } from './analyzers/ExpressionAnalyzer';

export interface EvaluationResult {
  score: number;
  isSuccess: boolean;
  requiredScore: number;
}

export class ChallengeEvaluator {
  private static scoreHistory: Record<string, number> = {};
  private static readonly SMOOTHING_ALPHA = 0.45; // Balance stability and snappy responsiveness

  public static reset() {
    this.scoreHistory = {};
    HeadPoseAnalyzer.resetHistory();
  }

  public static evaluate(
    type: ChallengeType,
    landmarks: NormalizedLandmark[],
    requiredScore: number,
    blendshapes?: Record<string, number>
  ): EvaluationResult {
    if (!landmarks || landmarks.length < 468) {
      return { score: 0, isSuccess: false, requiredScore };
    }

    let rawScore = 0;

    switch (type) {
      case 'mouth_pucker':
        rawScore = MouthAnalyzer.evaluateMouthPucker(
          landmarks,
          blendshapes?.['mouthPucker']
        );
        break;

      case 'smile':
        rawScore = MouthAnalyzer.evaluateSmile(
          landmarks,
          blendshapes?.['mouthSmileLeft'],
          blendshapes?.['mouthSmileRight']
        );
        break;

      case 'grin':
        rawScore = MouthAnalyzer.evaluateGrin(
          landmarks,
          blendshapes?.['mouthSmileLeft'],
          blendshapes?.['mouthSmileRight'],
          blendshapes?.['jawOpen']
        );
        break;

      case 'wink_left':
        // Left eye of user (anatomical left)
        rawScore = EyeAnalyzer.evaluateWinkLeft(
          landmarks,
          blendshapes?.['eyeBlinkLeft'],
          blendshapes?.['eyeBlinkRight']
        );
        break;

      case 'wink_right':
        // Right eye of user (anatomical right)
        rawScore = EyeAnalyzer.evaluateWinkRight(
          landmarks,
          blendshapes?.['eyeBlinkLeft'],
          blendshapes?.['eyeBlinkRight']
        );
        break;

      case 'eyes_closed':
        rawScore = EyeAnalyzer.evaluateEyesClosed(
          landmarks,
          blendshapes?.['eyeBlinkLeft'],
          blendshapes?.['eyeBlinkRight']
        );
        break;

      case 'mouth_open':
        rawScore = MouthAnalyzer.evaluateMouthOpen(
          landmarks,
          blendshapes?.['jawOpen']
        );
        break;

      case 'mouth_stretch':
        rawScore = MouthAnalyzer.evaluateMouthStretch(
          landmarks,
          blendshapes?.['jawOpen']
        );
        break;

      case 'head_shake':
        rawScore = HeadPoseAnalyzer.evaluateHeadShake(landmarks);
        break;

      case 'head_nod':
        rawScore = HeadPoseAnalyzer.evaluateHeadNod(landmarks);
        break;

      case 'cheek_puff':
        rawScore = ExpressionAnalyzer.evaluateCheekPuff(
          landmarks,
          blendshapes?.['cheekPuff']
        );
        break;

      case 'brow_raise':
        rawScore = ExpressionAnalyzer.evaluateBrowRaise(
          landmarks,
          blendshapes?.['browInnerUp'],
          blendshapes?.['browOuterUpLeft'],
          blendshapes?.['browOuterUpRight']
        );
        break;

      default:
        rawScore = 0;
    }

    // Apply EMA smoothing to prevent jitter
    const prev = this.scoreHistory[type] ?? rawScore;
    const smoothed = Math.round(this.SMOOTHING_ALPHA * rawScore + (1 - this.SMOOTHING_ALPHA) * prev);
    this.scoreHistory[type] = smoothed;

    const finalScore = Math.min(100, Math.max(0, smoothed));
    const isSuccess = finalScore >= requiredScore;

    return {
      score: finalScore,
      isSuccess,
      requiredScore
    };
  }

  /**
   * Dedicated verification test for Left and Right wink separation.
   * Ensures anatomical left and right do not leak or invert.
   */
  public static runWinkAnatomicalTest(): { passed: boolean; message: string } {
    // Construct mock 468 landmarks
    const mockLandmarks: NormalizedLandmark[] = Array.from({ length: 478 }, () => ({ x: 0.5, y: 0.5 }));

    // Case 1: Left eye closed (EAR ~ 0.10), Right eye open (EAR ~ 0.32)
    // Left eye outer: 33, inner: 133, lids: 160, 144, 158, 153
    mockLandmarks[33] = { x: 0.30, y: 0.40 };
    mockLandmarks[133] = { x: 0.40, y: 0.40 }; // horizontal = 0.10
    mockLandmarks[160] = { x: 0.35, y: 0.395 };
    mockLandmarks[144] = { x: 0.35, y: 0.405 }; // vertical1 = 0.010
    mockLandmarks[158] = { x: 0.37, y: 0.395 };
    mockLandmarks[153] = { x: 0.37, y: 0.405 }; // vertical2 = 0.010 => EAR_left = 0.02 / 0.20 = 0.10

    // Right eye inner: 362, outer: 263, lids: 385, 373, 387, 380
    mockLandmarks[362] = { x: 0.60, y: 0.40 };
    mockLandmarks[263] = { x: 0.70, y: 0.40 }; // horizontal = 0.10
    mockLandmarks[385] = { x: 0.65, y: 0.385 };
    mockLandmarks[373] = { x: 0.65, y: 0.417 }; // vertical1 = 0.032
    mockLandmarks[387] = { x: 0.67, y: 0.385 };
    mockLandmarks[380] = { x: 0.67, y: 0.417 }; // vertical2 = 0.032 => EAR_right = 0.064 / 0.20 = 0.32

    const winkLeftScore = EyeAnalyzer.evaluateWinkLeft(mockLandmarks);
    const winkRightScore = EyeAnalyzer.evaluateWinkRight(mockLandmarks);

    if (winkLeftScore > 60 && winkRightScore < 15) {
      return { passed: true, message: `Left wink passed: Left score=${winkLeftScore}, Right score=${winkRightScore}` };
    }
    return { passed: false, message: `Left wink failed: Left=${winkLeftScore}, Right=${winkRightScore}` };
  }
}
