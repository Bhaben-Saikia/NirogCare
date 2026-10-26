/**
 * NirogCare Client - Image Compressor for Clinical OCR
 * Ensures camera photos (which are often 4MB-15MB) are automatically resized
 * and compressed on an offscreen canvas to under 1MB before sending to the serverless
 * OCR endpoint, preventing Vercel HTTP 413 (Payload Too Large) errors.
 */

export async function compressImageForOcr(file: File): Promise<string> {
  // If it's a PDF, verify size and return as data URL
  if (file.type === 'application/pdf') {
    if (file.size > 4 * 1024 * 1024) {
      throw new Error('PDF document exceeds the 4MB limit. Please upload a smaller document or take a photo.');
    }
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Load image into an Image element for canvas downscaling
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const rawUrl = e.target?.result as string;
      const img = new Image();
      img.onerror = () => reject(new Error('Could not read image file. Please try another image.'));
      img.onload = () => {
        // 1400px is the optimal high-speed sweet spot for medical OCR:
        // Preserves full clarity of doctor handwriting and fine print,
        // while reducing vision token patches by ~50% for 2x faster extraction.
        const maxDimension = 1400;
        let { width, height } = img;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return resolve(rawUrl);
        }

        // Fill with white background in case of transparent PNG/WEBP
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to high-quality JPEG at 82% quality (~150KB - 250KB)
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.82);
        resolve(compressedBase64);
      };
      img.src = rawUrl;
    };
    reader.readAsDataURL(file);
  });
}
