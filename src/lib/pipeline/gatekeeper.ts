import { ImageQualityReport } from './types';

/**
 * Image Quality Gatekeeper
 * Simulates checking lighting, sheet alignment, blur, and orientation
 */
export async function assessImageQuality(imageDataUrl: string): Promise<ImageQualityReport> {
  // In web environment, perform basic dimension check and return realistic assessment
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      return resolve({
        isValid: true,
        blurScore: 0.9,
        brightnessScore: 0.85,
        orientation: 'portrait',
        warnings: [],
      });
    }

    const img = new Image();
    img.onload = () => {
      const isPortrait = img.naturalHeight >= img.naturalWidth;
      const isHighRes = img.naturalWidth >= 640 && img.naturalHeight >= 480;

      const warnings: string[] = [];
      if (!isHighRes) {
        warnings.push('Độ phân giải ảnh thấp, khuyến khích chụp lại rõ nét hơn');
      }

      resolve({
        isValid: true,
        blurScore: 0.88,
        brightnessScore: 0.9,
        orientation: isPortrait ? 'portrait' : 'landscape',
        warnings,
      });
    };

    img.onerror = () => {
      resolve({
        isValid: false,
        blurScore: 0,
        brightnessScore: 0,
        orientation: 'unknown',
        warnings: ['Không thể đọc định dạng hình ảnh'],
      });
    };

    img.src = imageDataUrl;
  });
}
