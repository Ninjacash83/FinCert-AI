/**
 * Utility to compress and downscale images in the browser before storing them in LocalStorage.
 * This prevents QuotaExceededError when storing custom template background images, logos, or signatures.
 */

/**
 * Compresses a base64 image data URL to a specified max width/height and quality.
 * @param base64Str The source base64 image data URL.
 * @param maxWidth The maximum width allowed.
 * @param maxHeight The maximum height allowed.
 * @param forceJpeg If true, forces conversion to image/jpeg to significantly save space (good for backgrounds).
 * @param quality Jpeg compression quality (0.0 to 1.0).
 */
export function compressImage(
  base64Str: string,
  maxWidth: number,
  maxHeight: number,
  forceJpeg: boolean = false,
  quality: number = 0.8
): Promise<string> {
  return new Promise((resolve) => {
    if (!base64Str || !base64Str.startsWith('data:image')) {
      resolve(base64Str);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = base64Str;
    img.onload = () => {
      let width = img.width;
      let height = img.height;

      // Keep aspect ratio
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }
      if (height > maxHeight) {
        width = Math.round((width * maxHeight) / height);
        height = maxHeight;
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(base64Str);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      // Determine output format. Signatures and logos should keep transparent PNG format if originally PNG.
      const isPng = base64Str.startsWith('data:image/png');
      const format = (forceJpeg || !isPng) ? 'image/jpeg' : 'image/png';
      
      const compressed = canvas.toDataURL(format, format === 'image/jpeg' ? quality : undefined);
      resolve(compressed);
    };
    img.onerror = () => {
      resolve(base64Str);
    };
  });
}

/**
 * Specifically downsizes high-resolution generated certificates before storing them in history.
 * Reduces an image from e.g. 3MB to ~100KB, perfect for offline viewing and saving LocalStorage space.
 */
export function compressCertificateHistoryImage(highResBase64: string): Promise<string> {
  // Max width of 700px retains perfect readability on-screen, converted to jpeg at 0.45 quality to save massive space (approx 15KB per image)
  return compressImage(highResBase64, 700, 495, true, 0.45);
}
