import { NormalizedLandmark } from './EyeAnalyzer';

function euclideanDistance(p1: NormalizedLandmark, p2: NormalizedLandmark): number {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export class ExpressionAnalyzer {
  /**
   * Evaluates Cheek Puff (Phồng má) (0-100)
   */
  public static evaluateCheekPuff(
    landmarks: NormalizedLandmark[],
    blendshapeCheekPuff?: number
  ): number {
    if (!landmarks || landmarks.length < 468) return 0;

    // Geometric measurement between outer cheek contours
    const p187 = landmarks[187];
    const p411 = landmarks[411];
    const p234 = landmarks[234];
    const p454 = landmarks[454];

    const innerCheekWidth = euclideanDistance(p187, p411);
    const outerFaceWidth = euclideanDistance(p234, p454);

    let geoScore = 0;
    if (outerFaceWidth > 0) {
      const ratio = innerCheekWidth / outerFaceWidth;
      // Normal ratio is around 0.58-0.64; puffed cheeks expand > 0.66
      if (ratio > 0.65) {
        geoScore = Math.min(1, (ratio - 0.64) / 0.11) * 100;
      }
    }

    if (blendshapeCheekPuff !== undefined) {
      const blendScore = Math.min(1, blendshapeCheekPuff / 0.35) * 100;
      return Math.round(Math.min(100, Math.max(geoScore, blendScore)));
    }

    return Math.round(Math.min(100, geoScore));
  }

  /**
   * Evaluates Eyebrow Raise (Nâng chân mày) (0-100)
   */
  public static evaluateBrowRaise(
    landmarks: NormalizedLandmark[],
    blendshapeBrowInnerUp?: number,
    blendshapeBrowOuterUpLeft?: number,
    blendshapeBrowOuterUpRight?: number
  ): number {
    if (!landmarks || landmarks.length < 468) return 0;

    // Distance between mid-eyebrows (105, 334) and upper eyelids (159, 386)
    const rightBrow = landmarks[105];
    const rightLid = landmarks[159];
    const leftBrow = landmarks[334];
    const leftLid = landmarks[386];

    const faceHeight = euclideanDistance(landmarks[10], landmarks[152]);
    if (faceHeight === 0) return 0;

    const rightDist = euclideanDistance(rightBrow, rightLid) / faceHeight;
    const leftDist = euclideanDistance(leftBrow, leftLid) / faceHeight;
    const avgDist = (rightDist + leftDist) / 2;

    let geoScore = 0;
    // Normal resting is ~0.08 - 0.10; raised is > 0.13
    if (avgDist > 0.11) {
      geoScore = Math.min(1, (avgDist - 0.10) / 0.05) * 100;
    }

    let blendScore = 0;
    if (blendshapeBrowInnerUp !== undefined) {
      const outerAvg = ((blendshapeBrowOuterUpLeft || 0) + (blendshapeBrowOuterUpRight || 0)) / 2;
      blendScore = Math.min(1, Math.max(blendshapeBrowInnerUp, outerAvg) / 0.45) * 100;
      return Math.round(Math.min(100, Math.max(geoScore, blendScore)));
    }

    return Math.round(Math.min(100, geoScore));
  }
}
