/**
 * LangChain OCR Utility
 * OCR functionality using Supabase Edge Function with LangChain/Google Vision API
 */

import { supabase } from '@/integrations/supabase/client';
import { getAnonId } from '@/utils/anon';

// Extend Window interface for Puter.js
declare global {
  interface Window {
    puter?: {
      ai?: {
        chat: (prompt: string, options?: { stream?: boolean }) => Promise<string | AsyncIterable<{ text?: string }>>;
      };
    };
  }
}

/**
 * Extract text from an image using LangChain OCR via edge function
 * @param imageDataURL - Base64 data URL of the image
 * @param fileName - Optional file name for tracking
 * @returns Extracted text or empty string if failed
 */
export const extractTextFromImage = async (
  imageDataURL: string,
  fileName?: string
): Promise<string> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    const body: any = {
      imageData: imageDataURL,
      fileName: fileName || 'image'
    };

    if (user) {
      body.userId = user.id;
    } else {
      body.anonId = getAnonId();
    }

    const { data, error } = await supabase.functions.invoke('ocr-image', {
      body
    });

    if (error) {
      if (error.message.includes('INSUFFICIENT_CREDITS')) {
        throw new Error('Insufficient credits. OCR requires 2 credits per image.');
      }
      throw new Error(error.message || 'OCR failed');
    }

    if (!data || !data.text) {
      throw new Error('No text extracted from image');
    }

    return data.text;
  } catch (error) {
    console.error('OCR error:', error);
    throw new Error(`OCR failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Check if OCR is available (always true for edge function)
 */
export const isPuterLoaded = (): boolean => {
  return true; // Always available via edge function
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
