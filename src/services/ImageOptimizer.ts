/**
 * ImageOptimizer.ts
 * Helper utility to resize, optimize, and compress custom puzzle images client-side.
 * Ensures fast rendering across 9 jigsaw tiles and prevents LocalStorage/IndexedDB quota overflow.
 */

export interface OptimizedImageResult {
  dataUrl: string;
  width: number;
  height: number;
}

export class ImageOptimizer {
  /**
   * Resizes and compresses an image File or Data URL to optimized JPEG format
   * @param source File or Base64 string
   * @param maxDimension Maximum allowed width or height (default 1280px)
   * @param quality JPEG compression quality (0.0 to 1.0, default 0.88)
   */
  static async optimize(
    source: File | string,
    maxDimension: number = 1280,
    quality: number = 0.88
  ): Promise<OptimizedImageResult> {
    return new Promise((resolve, reject) => {
      const img = new Image();

      const processImage = () => {
        const naturalWidth = img.naturalWidth || 1200;
        const naturalHeight = img.naturalHeight || 800;

        // Calculate scaling ratio
        let targetWidth = naturalWidth;
        let targetHeight = naturalHeight;

        if (naturalWidth > maxDimension || naturalHeight > maxDimension) {
          const ratio = Math.min(maxDimension / naturalWidth, maxDimension / naturalHeight);
          targetWidth = Math.max(300, Math.round(naturalWidth * ratio));
          targetHeight = Math.max(200, Math.round(naturalHeight * ratio));
        }

        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          // Fallback if canvas context fails
          const rawUrl = typeof source === 'string' ? source : URL.createObjectURL(source);
          resolve({
            dataUrl: rawUrl,
            width: naturalWidth,
            height: naturalHeight
          });
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Draw image onto canvas
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

        // Convert to high-quality compressed JPEG
        try {
          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve({
            dataUrl: compressedDataUrl,
            width: naturalWidth,
            height: naturalHeight
          });
        } catch {
          // If JPEG export fails, fallback to standard canvas data URL
          const fallbackDataUrl = canvas.toDataURL('image/png');
          resolve({
            dataUrl: fallbackDataUrl,
            width: naturalWidth,
            height: naturalHeight
          });
        }
      };

      img.onload = () => {
        processImage();
      };

      img.onerror = (e) => {
        reject(new Error('Không thể tải hoặc xử lý hình ảnh: ' + (e instanceof Event ? 'Lỗi định dạng' : String(e))));
      };

      if (typeof source === 'string') {
        img.src = source;
      } else {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            img.src = event.target.result as string;
          } else {
            reject(new Error('Không đọc được file ảnh'));
          }
        };
        reader.onerror = () => reject(new Error('Lỗi khi đọc file ảnh'));
        reader.readAsDataURL(source);
      }
    });
  }
}
