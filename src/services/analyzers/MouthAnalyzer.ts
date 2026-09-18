import { NormalizedLandmark } from './EyeAnalyzer';

function euclideanDistance(p1: NormalizedLandmark, p2: NormalizedLandmark): number {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export class MouthAnalyzer {
  /**
   * Mouth Aspect Ratio (MAR)
   * Outer corners: 61 (right), 291 (left)
   * Inner lip top: 13, inner lip bottom: 14
   */
  public static calculateMAR(landmarks: NormalizedLandmark[]): number {
    if (!landmarks || landmarks.length < 468) return 0;

    const p13 = landmarks[13];
    const p14 = landmarks[14];
    const p61 = landmarks[61];
    const p291 = landmarks[291];

    const vertical = euclideanDistance(p13, p14);
    const horizontal = euclideanDistance(p61, p291);

    if (horizontal === 0) return 0;
    return vertical / horizontal;
  }

  /**
   * Evaluates Mouth Pucker (Chu môi) (0-100)
   * Mouth width shrinks significantly relative to face width (distance between cheeks 234 and 454)
   */
  public static evaluateMouthPucker(
    landmarks: NormalizedLandmark[],
    blendshapePucker?: number
  ): number {
    if (!landmarks || landmarks.length < 468) return 0;

    const p61 = landmarks[61];
    const p291 = landmarks[291];
    const p234 = landmarks[234];
    const p454 = landmarks[454];

    const mouthWidth = euclideanDistance(p61, p291);
    const faceWidth = euclideanDistance(p234, p454);

    if (faceWidth === 0) return 0;

    const widthRatio = mouthWidth / faceWidth; // Normal resting is ~0.35 - 0.45. When puckering: drops < 0.26
    let geoScore = 0;
    if (widthRatio < 0.32) {
      geoScore = Math.min(1, Math.max(0, (0.33 - widthRatio) / 0.12)) * 100;
    }

    if (blendshapePucker !== undefined) {
      const blendScore = Math.min(1, blendshapePucker / 0.45) * 100;
      return Math.round(Math.min(100, Math.max(geoScore, blendScore)));
    }

    return Math.round(Math.min(100, geoScore));
  }

  /**
   * Evaluates Smile (Cười mỉm) (0-100)
   * Mouth corners lifted up, mouth wider, lips mostly closed
   */
  public static evaluateSmile(
    landmarks: NormalizedLandmark[],
    blendshapeSmileLeft?: number,
    blendshapeSmileRight?: number
  ): number {
    if (!landmarks || landmarks.length < 468) return 0;

    const p61 = landmarks[61];
    const p291 = landmarks[291];
    const p0 = landmarks[0]; // Top lip center
    const p17 = landmarks[17]; // Bottom lip center
    const p234 = landmarks[234];
    const p454 = landmarks[454];

    const mouthCenterY = (p0.y + p17.y) / 2;
    const cornerLift = mouthCenterY - (p61.y + p291.y) / 2;

    const mouthWidth = euclideanDistance(p61, p291);
    const faceWidth = euclideanDistance(p234, p454);
    const widthRatio = faceWidth > 0 ? mouthWidth / faceWidth : 0;

    let geoScore = 0;
    if (cornerLift > 0.005 || widthRatio > 0.42) {
      const liftScore = Math.min(1, Math.max(0, (cornerLift - 0.003) / 0.025));
      const widthScore = Math.min(1, Math.max(0, (widthRatio - 0.38) / 0.10));
      geoScore = ((liftScore * 0.6) + (widthScore * 0.4)) * 100;
    }

    if (blendshapeSmileLeft !== undefined && blendshapeSmileRight !== undefined) {
      const avgSmile = (blendshapeSmileLeft + blendshapeSmileRight) / 2;
      const blendScore = Math.min(1, avgSmile / 0.45) * 100;
      return Math.round(Math.min(100, Math.max(geoScore, blendScore)));
    }

    return Math.round(Math.min(100, geoScore));
  }

  /**
   * Evaluates Grin (Cười lộ răng) (0-100)
   * Broad smile + vertical mouth opening showing teeth
   */
  public static evaluateGrin(
    landmarks: NormalizedLandmark[],
    blendshapeSmileLeft?: number,
    blendshapeSmileRight?: number,
    blendshapeJawOpen?: number
  ): number {
    const smileScore = this.evaluateSmile(landmarks, blendshapeSmileLeft, blendshapeSmileRight);
    const mar = this.calculateMAR(landmarks);

    let openingFactor = 0;
    if (mar > 0.15) {
      openingFactor = Math.min(1, (mar - 0.12) / 0.25);
    }
    if (blendshapeJawOpen !== undefined) {
      openingFactor = Math.max(openingFactor, Math.min(1, blendshapeJawOpen / 0.35));
    }

    const grinScore = smileScore * 0.6 + openingFactor * 40;
    return Math.round(Math.min(100, grinScore));
  }

  /**
   * Evaluates Mouth Open (Mở miệng vừa phải) (0-100)
   */
  public static evaluateMouthOpen(
    landmarks: NormalizedLandmark[],
    blendshapeJawOpen?: number
  ): number {
    const mar = this.calculateMAR(landmarks);
    let geoScore = 0;
    if (mar > 0.22) {
      geoScore = Math.min(1, (mar - 0.20) / 0.30) * 100;
    }

    if (blendshapeJawOpen !== undefined) {
      const blendScore = Math.min(1, blendshapeJawOpen / 0.50) * 100;
      return Math.round(Math.min(100, Math.max(geoScore, blendScore)));
    }

    return Math.round(Math.min(100, geoScore));
  }

  /**
   * Evaluates Mouth Stretch (Há miệng thật to) (0-100)
   */
  public static evaluateMouthStretch(
    landmarks: NormalizedLandmark[],
    blendshapeJawOpen?: number
  ): number {
    const mar = this.calculateMAR(landmarks);
    let geoScore = 0;
    if (mar > 0.40) {
      geoScore = Math.min(1, (mar - 0.38) / 0.35) * 100;
    }

    if (blendshapeJawOpen !== undefined) {
      const blendScore = Math.min(1, Math.max(0, (blendshapeJawOpen - 0.30) / 0.50)) * 100;
      return Math.round(Math.min(100, Math.max(geoScore, blendScore)));
    }

    return Math.round(Math.min(100, geoScore));
  }
}
