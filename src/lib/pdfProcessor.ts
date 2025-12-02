/**
 * PDF Processor - Main pipeline for PDF processing
 * Handles both text-based and scanned PDFs
 */

import { extractTextFromPDF, isScannedPDF, extractAllText, PDFPageText } from './pdfParser';
import { convertPDFToImages, PDFPageImage } from './pdfToImage';
import { extractTextFromImage, batchOCR } from './ocr';

export interface ProcessedPDF {
  text: string;
  isScanned: boolean;
  numPages: number;
  processingTime: number;
  ocrPages?: number; // Number of pages processed with OCR
}

export interface ProcessingProgress {
  stage: 'parsing' | 'detecting' | 'ocr' | 'complete';
  current: number;
  total: number;
  message: string;
}

/**
 * Process a PDF file (text extraction + OCR if needed)
 * @param file - PDF File object
 * @param onProgress - Optional progress callback
 * @returns Promise resolving to processed PDF text
 */
export const processPDF = async (
  file: File,
  onProgress?: (progress: ProcessingProgress) => void
): Promise<ProcessedPDF> => {
  const startTime = Date.now();
  
  // Stage 1: Parse PDF to check for text
  if (onProgress) {
    onProgress({
      stage: 'parsing',
      current: 0,
      total: 100,
      message: 'Parsing PDF...',
    });
  }
  
  const pages = await extractTextFromPDF(file);
  const numPages = pages.length;
  
  // Stage 2: Detect if scanned
  if (onProgress) {
    onProgress({
      stage: 'detecting',
      current: 30,
      total: 100,
      message: 'Analyzing PDF...',
    });
  }
  
  const scanned = await isScannedPDF(file);
  
  let finalText = '';
  let ocrPages = 0;
  
  if (scanned) {
    // Stage 3: OCR processing for scanned PDF
    if (onProgress) {
      onProgress({
        stage: 'ocr',
        current: 40,
        total: 100,
        message: 'Processing scanned pages with OCR...',
      });
    }
    
    // Convert PDF pages to images
    const images = await convertPDFToImages(
      file,
      2.0, // Scale for better OCR quality
      (current, total) => {
        if (onProgress) {
          const progress = 40 + Math.floor((current / total) * 50);
          onProgress({
            stage: 'ocr',
            current: progress,
            total: 100,
            message: `OCR processing page ${current} of ${total}...`,
          });
        }
      }
    );
    
    // Process images with OCR
    const imageDataURLs = images.map(img => img.dataURL);
    const ocrResults = await batchOCR(imageDataURLs);
    
    // Combine OCR results
    finalText = ocrResults
      .map((text, index) => `--- Page ${index + 1} ---\n${text}`)
      .join('\n\n');
    
    ocrPages = images.length;
  } else {
    // Stage 3: Extract text directly
    if (onProgress) {
      onProgress({
        stage: 'parsing',
        current: 60,
        total: 100,
        message: 'Extracting text...',
      });
    }
    
    finalText = await extractAllText(file);
  }
  
  // Stage 4: Complete
  if (onProgress) {
    onProgress({
      stage: 'complete',
      current: 100,
      total: 100,
      message: 'Processing complete!',
    });
  }
  
  const processingTime = Date.now() - startTime;
  
  return {
    text: finalText,
    isScanned: scanned,
    numPages,
    processingTime,
    ocrPages: scanned ? ocrPages : undefined,
  };
};

/**
 * Process PDF with mixed content (some pages text, some scanned)
 * @param file - PDF File object
 * @param onProgress - Optional progress callback
 * @returns Promise resolving to processed PDF text
 */
export const processMixedPDF = async (
  file: File,
  onProgress?: (progress: ProcessingProgress) => void
): Promise<ProcessedPDF> => {
  const startTime = Date.now();
  
  // Parse all pages
  if (onProgress) {
    onProgress({
      stage: 'parsing',
      current: 0,
      total: 100,
      message: 'Analyzing PDF pages...',
    });
  }
  
  const pages = await extractTextFromPDF(file);
  const numPages = pages.length;
  
  // Identify pages that need OCR (minimal text)
  const pagesNeedingOCR: number[] = [];
  const textPages: PDFPageText[] = [];
  
  pages.forEach((page, index) => {
    if (page.text.length < 50) {
      // Page has minimal text, likely scanned
      pagesNeedingOCR.push(index + 1);
    } else {
      textPages.push(page);
    }
  });
  
  let finalText = '';
  let ocrPages = 0;
  
  // Process text pages
  const textContent = textPages.map(page => page.text).join('\n\n');
  
  // Process scanned pages with OCR
  if (pagesNeedingOCR.length > 0) {
    if (onProgress) {
      onProgress({
        stage: 'ocr',
        current: 50,
        total: 100,
        message: `Processing ${pagesNeedingOCR.length} scanned pages...`,
      });
    }
    
    // Convert scanned pages to images
    const { convertPDFPageToImage } = await import('./pdfToImage');
    const ocrPromises = pagesNeedingOCR.map(async (pageNum) => {
      const imageDataURL = await convertPDFPageToImage(file, pageNum);
      const ocrText = await extractTextFromImage(imageDataURL);
      return { pageNum, text: ocrText };
    });
    
    const ocrResults = await Promise.all(ocrPromises);
    ocrPages = ocrResults.length;
    
    // Combine text and OCR results in page order
    const allPages: Array<{ pageNum: number; text: string; source: 'text' | 'ocr' }> = [];
    
    pages.forEach((page, index) => {
      const pageNum = index + 1;
      if (pagesNeedingOCR.includes(pageNum)) {
        const ocrResult = ocrResults.find(r => r.pageNum === pageNum);
        allPages.push({
          pageNum,
          text: ocrResult?.text || '',
          source: 'ocr',
        });
      } else {
        allPages.push({
          pageNum,
          text: page.text,
          source: 'text',
        });
      }
    });
    
    finalText = allPages
      .map(p => `--- Page ${p.pageNum} (${p.source}) ---\n${p.text}`)
      .join('\n\n');
  } else {
    finalText = textContent;
  }
  
  if (onProgress) {
    onProgress({
      stage: 'complete',
      current: 100,
      total: 100,
      message: 'Processing complete!',
    });
  }
  
  const processingTime = Date.now() - startTime;
  
  return {
    text: finalText,
    isScanned: pagesNeedingOCR.length === numPages,
    numPages,
    processingTime,
    ocrPages: pagesNeedingOCR.length > 0 ? ocrPages : undefined,
  };
};

