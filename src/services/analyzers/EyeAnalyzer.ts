export interface NormalizedLandmark {
  x: number;
  y: number;
  z?: number;
}

function euclideanDistance(p1: NormalizedLandmark, p2: NormalizedLandmark): number {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export class EyeAnalyzer {
  /**
   * Anatomical Left Eye (Player's left side).
   * MediaPipe landmark indices:
   * Outer corner: 33, Inner corner: 133
   * Top lid: 160, 158
   * Bottom lid: 144, 153
   */
  public static calculateLeftEAR(landmarks: NormalizedLandmark[]): number {
    if (!landmarks || landmarks.length < 468) return 0.3;

    const p33 = landmarks[33];
    const p133 = landmarks[133];
    const p160 = landmarks[160];
    const p144 = landmarks[144];
    const p158 = landmarks[158];
    const p153 = landmarks[153];

    const vertical1 = euclideanDistance(p160, p144);
    const vertical2 = euclideanDistance(p158, p153);
    const horizontal = euclideanDistance(p33, p133);

    if (horizontal === 0) return 0.3;
    return (vertical1 + vertical2) / (2.0 * horizontal);
  }

  /**
   * Anatomical Right Eye (Player's right side).
   * MediaPipe landmark indices:
   * Inner corner: 362, Outer corner: 263
   * Top lid: 385, 387
   * Bottom lid: 373, 380
   */
  public static calculateRightEAR(landmarks: NormalizedLandmark[]): number {
    if (!landmarks || landmarks.length < 468) return 0.3;

    const p362 = landmarks[362];
    const p263 = landmarks[263];
    const p385 = landmarks[385];
    const p373 = landmarks[373];
    const p387 = landmarks[387];
    const p380 = landmarks[380];

    const vertical1 = euclideanDistance(p385, p373);
    const vertical2 = euclideanDistance(p387, p380);
    const horizontal = euclideanDistance(p362, p263);

    if (horizontal === 0) return 0.3;
    return (vertical1 + vertical2) / (2.0 * horizontal);
  }

  /**
   * Left Eye Wink Score (0-100)
   * Left eye must be closed (low EAR) while right eye remains open (high EAR).
   * blendshapeLeft: eyeBlinkLeft (if present)
   * blendshapeRight: eyeBlinkRight (if present)
   */
  public static evaluateWinkLeft(
    landmarks: NormalizedLandmark[],
    blendshapeLeft?: number,
    blendshapeRight?: number
  ): number {
    const earLeft = this.calculateLeftEAR(landmarks);
    const earRight = this.calculateRightEAR(landmarks);

    // Geometric score
    let geoScore = 0;
    // Closed left: earLeft < 0.17 is good wink
    // Open right: earRight > 0.22
    if (earLeft < 0.22 && earRight > 0.19) {
      const leftClosedScore = Math.min(1, Math.max(0, (0.24 - earLeft) / 0.12));
      const rightOpenScore = Math.min(1, Math.max(0, (earRight - 0.18) / 0.12));
      geoScore = leftClosedScore * rightOpenScore * 100;
    }

    if (blendshapeLeft !== undefined && blendshapeRight !== undefined) {
      // blendshapeLeft should be high (> 0.5), blendshapeRight low (< 0.3)
      const blendScore = Math.max(0, blendshapeLeft - (blendshapeRight * 0.7)) * 100;
      return Math.round(Math.min(100, Math.max(geoScore, blendScore * 1.1)));
    }

    return Math.round(Math.min(100, geoScore));
  }

  /**
   * Right Eye Wink Score (0-100)
   * Right eye must be closed (low EAR) while left eye remains open (high EAR).
   */
  public static evaluateWinkRight(
    landmarks: NormalizedLandmark[],
    blendshapeLeft?: number,
    blendshapeRight?: number
  ): number {
    const earLeft = this.calculateLeftEAR(landmarks);
    const earRight = this.calculateRightEAR(landmarks);

    let geoScore = 0;
    if (earRight < 0.22 && earLeft > 0.19) {
      const rightClosedScore = Math.min(1, Math.max(0, (0.24 - earRight) / 0.12));
      const leftOpenScore = Math.min(1, Math.max(0, (earLeft - 0.18) / 0.12));
      geoScore = rightClosedScore * leftOpenScore * 100;
    }

    if (blendshapeLeft !== undefined && blendshapeRight !== undefined) {
      const blendScore = Math.max(0, blendshapeRight - (blendshapeLeft * 0.7)) * 100;
      return Math.round(Math.min(100, Math.max(geoScore, blendScore * 1.1)));
    }

    return Math.round(Math.min(100, geoScore));
  }

  /**
   * Both Eyes Closed Score (0-100)
   */
  public static evaluateEyesClosed(
    landmarks: NormalizedLandmark[],
    blendshapeLeft?: number,
    blendshapeRight?: number
  ): number {
    const earLeft = this.calculateLeftEAR(landmarks);
    const earRight = this.calculateRightEAR(landmarks);

    let geoScore = 0;
    if (earLeft < 0.20 && earRight < 0.20) {
      const leftScore = Math.min(1, Math.max(0, (0.21 - earLeft) / 0.10));
      const rightScore = Math.min(1, Math.max(0, (0.21 - earRight) / 0.10));
      geoScore = ((leftScore + rightScore) / 2) * 100;
    }

    if (blendshapeLeft !== undefined && blendshapeRight !== undefined) {
      const blendScore = Math.min(blendshapeLeft, blendshapeRight) * 100;
      return Math.round(Math.min(100, Math.max(geoScore, blendScore * 1.1)));
    }

    return Math.round(Math.min(100, geoScore));
  }
}
