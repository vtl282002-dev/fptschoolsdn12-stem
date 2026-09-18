import { NormalizedLandmark } from './EyeAnalyzer';

export class HeadPoseAnalyzer {
  private static yawHistory: number[] = [];
  private static pitchHistory: number[] = [];
  private static readonly MAX_HISTORY = 16;

  public static resetHistory() {
    this.yawHistory = [];
    this.pitchHistory = [];
  }

  /**
   * Calculates current Yaw (Horizontal turn - left/right).
   * Range approximately -1 (turned right) to +1 (turned left).
   */
  public static calculateYaw(landmarks: NormalizedLandmark[]): number {
    if (!landmarks || landmarks.length < 468) return 0;
    const nose = landmarks[1];
    const leftCheek = landmarks[454];
    const rightCheek = landmarks[234];

    const distLeft = leftCheek.x - nose.x;
    const distRight = nose.x - rightCheek.x;
    const total = distLeft + distRight;

    if (total === 0) return 0;
    return (distLeft - distRight) / total;
  }

  /**
   * Calculates current Pitch (Vertical tilt - up/down).
   * Range approximately -1 (looking up) to +1 (looking down).
   */
  public static calculatePitch(landmarks: NormalizedLandmark[]): number {
    if (!landmarks || landmarks.length < 468) return 0;
    const nose = landmarks[1];
    const forehead = landmarks[10];
    const chin = landmarks[152];

    const distUp = nose.y - forehead.y;
    const distDown = chin.y - nose.y;
    const total = distUp + distDown;

    if (total === 0) return 0;
    return (distDown - distUp) / total;
  }

  /**
   * Evaluates Head Shake (Lắc đầu trái/phải) (0-100)
   * Detects movement between left and right over recent frames or significant yaw turn.
   */
  public static evaluateHeadShake(landmarks: NormalizedLandmark[]): number {
    const yaw = this.calculateYaw(landmarks);
    this.yawHistory.push(yaw);
    if (this.yawHistory.length > this.MAX_HISTORY) {
      this.yawHistory.shift();
    }

    // Direct yaw magnitude
    const currentMagnitude = Math.abs(yaw);
    let directScore = 0;
    if (currentMagnitude > 0.15) {
      directScore = Math.min(1, (currentMagnitude - 0.12) / 0.25) * 85;
    }

    // Oscillation range over history (min to max difference)
    if (this.yawHistory.length >= 6) {
      const min = Math.min(...this.yawHistory);
      const max = Math.max(...this.yawHistory);
      const range = max - min;
      if (range > 0.22) {
        const motionScore = Math.min(1, (range - 0.20) / 0.28) * 100;
        return Math.round(Math.min(100, Math.max(directScore, motionScore)));
      }
    }

    return Math.round(Math.min(100, directScore));
  }

  /**
   * Evaluates Head Nod (Gật đầu lên xuống) (0-100)
   */
  public static evaluateHeadNod(landmarks: NormalizedLandmark[]): number {
    const pitch = this.calculatePitch(landmarks);
    this.pitchHistory.push(pitch);
    if (this.pitchHistory.length > this.MAX_HISTORY) {
      this.pitchHistory.shift();
    }

    const currentMagnitude = Math.abs(pitch);
    let directScore = 0;
    if (currentMagnitude > 0.14) {
      directScore = Math.min(1, (currentMagnitude - 0.12) / 0.22) * 85;
    }

    if (this.pitchHistory.length >= 6) {
      const min = Math.min(...this.pitchHistory);
      const max = Math.max(...this.pitchHistory);
      const range = max - min;
      if (range > 0.20) {
        const motionScore = Math.min(1, (range - 0.18) / 0.25) * 100;
        return Math.round(Math.min(100, Math.max(directScore, motionScore)));
      }
    }

    return Math.round(Math.min(100, directScore));
  }
}
