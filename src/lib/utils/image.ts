/**
 * Image processing utilities for ChamAI
 */

/**
 * Compress and resize an image from DataURL or File to max dimensions and JPEG quality
 */
export async function compressImageDataUrl(
  dataUrl: string,
  maxWidth = 1600,
  maxHeight = 1600,
  quality = 0.85
): Promise<string> {
  if (typeof window === 'undefined') return dataUrl;

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;

      if (width > maxWidth || height > maxHeight) {
        if (width / height > maxWidth / maxHeight) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve(dataUrl);

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      resolve(canvas.toDataURL('image/jpeg', quality));
    };

    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

/**
 * Reads a File object as a base64 DataURL
 */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Generates an SVG or Canvas simulated bubble crop for visual review
 * This creates a realistic student bubble snippet showing question number, A/B/C/D bubbles,
 * with pencil marks, faint smudges, or double marks matching the verdict!
 */
export function generateSimulatedCropDataUrl(
  questionNumber: number,
  verdict: 'VALID' | 'BLANK' | 'MULTI' | 'UNCERTAIN',
  selectedAnswer?: string
): string {
  if (typeof window === 'undefined') return '';

  const canvas = document.createElement('canvas');
  canvas.width = 400;
  canvas.height = 80;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Background - realistic paper texture
  ctx.fillStyle = '#faf9f5';
  ctx.fillRect(0, 0, 400, 80);

  // Subtle paper noise / lines
  ctx.strokeStyle = '#e2e0d8';
  ctx.lineWidth = 1;
  ctx.strokeRect(4, 4, 392, 72);

  // Question number label
  ctx.fillStyle = '#1e293b';
  ctx.font = 'bold 18px sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(`Câu ${questionNumber}:`, 16, 40);

  const options = ['A', 'B', 'C', 'D'];
  const startX = 120;
  const gap = 65;

  options.forEach((opt, idx) => {
    const cx = startX + idx * gap;
    const cy = 40;
    const radius = 16;

    // Draw outer circle
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.8;
    ctx.stroke();

    // Check if this option is marked
    const isPrimary = selectedAnswer?.includes(opt);

    if (verdict === 'MULTI' && isPrimary) {
      // Shaded dark pencil in multiple bubbles
      ctx.beginPath();
      ctx.arc(cx, cy, radius - 2, 0, Math.PI * 2);
      ctx.fillStyle = '#262626';
      ctx.fill();
    } else if (verdict === 'UNCERTAIN' && isPrimary) {
      // Faint / incomplete shade
      ctx.beginPath();
      ctx.arc(cx, cy, radius - 4, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(70, 70, 70, 0.45)';
      ctx.fill();
    } else if (verdict === 'VALID' && isPrimary) {
      // Fully filled dark pencil
      ctx.beginPath();
      ctx.arc(cx, cy, radius - 2, 0, Math.PI * 2);
      ctx.fillStyle = '#1c1917';
      ctx.fill();
    }

    // Option letter inside
    ctx.fillStyle = isPrimary && verdict !== 'UNCERTAIN' ? '#f8fafc' : '#334155';
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(opt, cx, cy);
  });

  return canvas.toDataURL('image/png');
}
