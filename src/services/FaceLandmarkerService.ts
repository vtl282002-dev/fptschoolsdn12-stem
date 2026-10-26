import { FilesetResolver, FaceLandmarker } from '@mediapipe/tasks-vision';
import { FaceValidationResult } from '../types';
import { NormalizedLandmark } from './analyzers/EyeAnalyzer';

export interface FaceDetectionData {
  landmarks: NormalizedLandmark[];
  blendshapes: Record<string, number>;
  validation: FaceValidationResult;
  faceBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

class FaceLandmarkerService {
  private landmarker: FaceLandmarker | null = null;
  private isInitializing = false;
  private initPromise: Promise<FaceLandmarker | null> | null = null;
  private offscreenCanvas: HTMLCanvasElement | null = null;
  private offscreenCtx: CanvasRenderingContext2D | null = null;
  private cachedBrightness = 100;
  private lastBrightnessCheck = 0;

  public async initialize(): Promise<FaceLandmarker | null> {
    if (this.landmarker) return this.landmarker;
    if (this.initPromise) return this.initPromise;

    const isMobile =
      typeof window !== 'undefined' &&
      (/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) || window.innerWidth < 768);

    this.isInitializing = true;
    this.initPromise = (async () => {
      try {
        const filesetResolver = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/wasm'
        );

        this.landmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
            delegate: 'GPU'
          },
          outputFaceBlendshapes: true,
          runningMode: 'VIDEO',
          numFaces: isMobile ? 1 : 2 // 1 face on mobile for maximum fps & minimal thermal load
        });

        return this.landmarker;
      } catch (err) {
        console.info('FaceLandmarker attempting CPU delegate fallback:', err);
        try {
          const filesetResolver = await FilesetResolver.forVisionTasks(
            'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/wasm'
          );
          this.landmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
            baseOptions: {
              modelAssetPath:
                'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
              delegate: 'CPU'
            },
            outputFaceBlendshapes: true,
            runningMode: 'VIDEO',
            numFaces: isMobile ? 1 : 2
          });
          return this.landmarker;
        } catch (cpuErr) {
          console.warn('Failed to initialize FaceLandmarker on CPU:', cpuErr);
          return null;
        }
      } finally {
        this.isInitializing = false;
      }
    })();

    return this.initPromise;
  }

  public detectFace(video: HTMLVideoElement, timestampMs: number): FaceDetectionData | null {
    if (!this.landmarker || !video || video.readyState < 2 || video.videoWidth === 0) {
      return null;
    }

    try {
      const results = this.landmarker.detectForVideo(video, timestampMs);

      // Validate face count
      const faceCount = results.faceLandmarks.length;

      if (faceCount === 0) {
        return {
          landmarks: [],
          blendshapes: {},
          validation: {
            isValid: false,
            message: 'Đưa khuôn mặt vào khung',
            faceCount: 0,
            brightness: 100,
            boxSizeRatio: 0,
            isCentered: false
          }
        };
      }

      if (faceCount > 1) {
        return {
          landmarks: [],
          blendshapes: {},
          validation: {
            isValid: false,
            message: 'Chỉ một người chơi trước camera',
            faceCount,
            brightness: 100,
            boxSizeRatio: 0,
            isCentered: false
          }
        };
      }

      const rawLandmarks = results.faceLandmarks[0];
      const landmarks: NormalizedLandmark[] = rawLandmarks.map((lm) => ({
        x: lm.x,
        y: lm.y,
        z: lm.z
      }));

      // Calculate Bounding Box of the face
      let minX = 1, maxX = 0, minY = 1, maxY = 0;
      for (const pt of landmarks) {
        if (pt.x < minX) minX = pt.x;
        if (pt.x > maxX) maxX = pt.x;
        if (pt.y < minY) minY = pt.y;
        if (pt.y > maxY) maxY = pt.y;
      }

      const faceWidth = maxX - minX;
      const faceHeight = maxY - minY;
      const faceCenterX = (minX + maxX) / 2;
      const faceCenterY = (minY + maxY) / 2;
      const boxSizeRatio = Math.max(faceWidth, faceHeight);

      // Center check (within 25% of center frame: 0.25 to 0.75)
      const isCentered = faceCenterX >= 0.22 && faceCenterX <= 0.78 && faceCenterY >= 0.20 && faceCenterY <= 0.80;

      // Brightness check (throttled to avoid GPU pipeline readback stalls)
      const brightness = this.estimateBrightness(video, minX, minY, faceWidth, faceHeight, timestampMs);

      // Check validations
      let isValid = true;
      let message = 'Khuôn mặt hợp lệ';

      if (!isCentered) {
        isValid = false;
        message = 'Đưa khuôn mặt vào khung';
      } else if (boxSizeRatio < 0.20) {
        isValid = false;
        message = 'Tiến gần camera hơn';
      } else if (boxSizeRatio > 0.88) {
        isValid = false;
        message = 'Lùi xa camera một chút';
      } else if (brightness < 28) {
        isValid = false;
        message = 'Di chuyển đến nơi đủ sáng';
      }

      // Blendshapes mapping
      const blendshapes: Record<string, number> = {};
      if (results.faceBlendshapes && results.faceBlendshapes.length > 0) {
        for (const cat of results.faceBlendshapes[0].categories) {
          blendshapes[cat.categoryName] = cat.score;
        }
      }

      return {
        landmarks,
        blendshapes,
        validation: {
          isValid,
          message,
          faceCount: 1,
          brightness,
          boxSizeRatio,
          isCentered
        },
        faceBox: {
          x: minX,
          y: minY,
          width: faceWidth,
          height: faceHeight
        }
      };
    } catch {
      return null;
    }
  }

  private estimateBrightness(
    video: HTMLVideoElement,
    faceX: number,
    faceY: number,
    faceW: number,
    faceH: number,
    timestampMs: number
  ): number {
    // Only sample brightness once every 800ms to eliminate GPU texture readback stalls
    if (timestampMs - this.lastBrightnessCheck < 800) {
      return this.cachedBrightness;
    }
    this.lastBrightnessCheck = timestampMs;

    try {
      if (!this.offscreenCanvas) {
        this.offscreenCanvas = document.createElement('canvas');
        this.offscreenCanvas.width = 16;
        this.offscreenCanvas.height = 16;
        this.offscreenCtx = this.offscreenCanvas.getContext('2d', { willReadFrequently: true });
      }

      if (!this.offscreenCtx) return this.cachedBrightness;

      const sx = Math.max(0, Math.floor(faceX * video.videoWidth));
      const sy = Math.max(0, Math.floor(faceY * video.videoHeight));
      const sw = Math.min(video.videoWidth - sx, Math.floor(faceW * video.videoWidth));
      const sh = Math.min(video.videoHeight - sy, Math.floor(faceH * video.videoHeight));

      if (sw <= 0 || sh <= 0) return this.cachedBrightness;

      this.offscreenCtx.drawImage(video, sx, sy, sw, sh, 0, 0, 16, 16);
      const imgData = this.offscreenCtx.getImageData(0, 0, 16, 16);
      const data = imgData.data;

      let sumLuma = 0;
      for (let i = 0; i < data.length; i += 4) {
        // Standard Rec. 709 luma coefficients
        sumLuma += 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
      }

      this.cachedBrightness = sumLuma / (data.length / 4);
      return this.cachedBrightness;
    } catch {
      return this.cachedBrightness;
    }
  }

  public destroy() {
    if (this.landmarker) {
      try {
        this.landmarker.close();
      } catch {
        // ignore
      }
      this.landmarker = null;
    }
    this.initPromise = null;
    this.isInitializing = false;
  }
}

export const faceLandmarkerService = new FaceLandmarkerService();
