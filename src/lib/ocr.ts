/**
 * Puter.js OCR Utility
 * Client-side OCR functionality using Puter.js (free, no API key required)
 */

declare global {
  interface Window {
    puter?: {
      ai?: {
        img2txt: (imageUrlOrDataURL: string) => Promise<string>;
        chat: (prompt: string, options?: { stream?: boolean }) => Promise<string>;
      };
    };
  }
}

/**
 * Check if Puter.js is loaded
 */
export const isPuterLoaded = (): boolean => {
  return typeof window !== 'undefined' && 
         typeof window.puter !== 'undefined' && 
         typeof window.puter.ai !== 'undefined' &&
         typeof window.puter.ai.img2txt === 'function';
};

/**
 * Extract text from an image using Puter.js OCR
 * @param imageUrlOrDataURL - Image URL or base64 data URL
 * @returns Extracted text or empty string if failed
 */
export const extractTextFromImage = async (
  imageUrlOrDataURL: string
): Promise<string> => {
  if (!isPuterLoaded()) {
    throw new Error('Puter.js is not loaded. Please ensure the script is included in your HTML.');
  }

  try {
    const text = await window.puter!.ai!.img2txt(imageUrlOrDataURL);
    return text || '';
  } catch (error) {
    console.error('OCR error:', error);
    throw new Error(`OCR failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Convert a File to a data URL
 * @param file - File object (image)
 * @returns Promise resolving to data URL string
 */
export const fileToDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Process multiple images in batch
 * @param images - Array of image URLs or data URLs
 * @returns Promise resolving to array of extracted text
 */
export const batchOCR = async (
  images: string[]
): Promise<string[]> => {
  const results: string[] = [];
  
  for (const image of images) {
    try {
      const text = await extractTextFromImage(image);
      results.push(text);
    } catch (error) {
      console.error(`Failed to process image:`, error);
      results.push(''); // Add empty string for failed images
    }
  }
  
  return results;
};

