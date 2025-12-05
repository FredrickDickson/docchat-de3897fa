import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useOCR = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ text: string; creditsUsed: number } | null>(null);

  const processImage = async (imageFile: File) => {
    setIsProcessing(true);
    setError(null);
    setResult(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Not authenticated');
      }

      // Convert image to base64
      const reader = new FileReader();
      const imageData = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(imageFile);
      });

      // Call OCR Edge Function
      const { data, error: ocrError } = await supabase.functions.invoke('ocr-image', {
        body: {
          imageData,
          userId: user.id,
          fileName: imageFile.name
        }
      });

      if (ocrError) {
        if (ocrError.message.includes('INSUFFICIENT_CREDITS')) {
          throw new Error('Insufficient credits. You need 2 credits for OCR processing.');
        }
        throw ocrError;
      }

      setResult(data);
      return data;

    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsProcessing(false);
    }
  };

  const clearResult = () => {
    setResult(null);
    setError(null);
  };

  return {
    isProcessing,
    error,
    result,
    processImage,
    clearResult
  };
};
