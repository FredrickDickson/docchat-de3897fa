/**
 * PDF Parser Utility
 * Client-side PDF text extraction using PDF.js
 */

import * as pdfjsLib from 'pdfjs-dist';

// Set worker source for PDF.js
if (typeof window !== 'undefined') {
  // Use CDN for worker, or you can copy pdf.worker.min.js to public folder
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

export interface PDFMetadata {
  title?: string;
  author?: string;
  subject?: string;
  creator?: string;
  producer?: string;
  creationDate?: string;
  modificationDate?: string;
  numPages: number;
}

export interface PDFPageText {
  pageNumber: number;
  text: string;
  hasText: boolean;
}

/**
 * Extract text from a PDF file
 * @param file - PDF File object
 * @returns Promise resolving to array of page texts
 */
export const extractTextFromPDF = async (
  file: File
): Promise<PDFPageText[]> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  
  const pages: PDFPageText[] = [];
  
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    
    // Combine all text items
    const text = textContent.items
      .map((item: any) => item.str)
      .join(' ')
      .trim();
    
    pages.push({
      pageNumber: pageNum,
      text,
      hasText: text.length > 0,
    });
  }
  
  return pages;
};

interface PDFInfo {
  Title?: string;
  Author?: string;
  Subject?: string;
  Creator?: string;
  Producer?: string;
  CreationDate?: string;
  ModDate?: string;
}

/**
 * Get PDF metadata
 * @param file - PDF File object
 * @returns Promise resolving to PDF metadata
 */
export const getPDFMetadata = async (
  file: File
): Promise<PDFMetadata> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const metadata = await pdf.getMetadata();
  const info = metadata.info as PDFInfo | undefined;
  
  return {
    title: info?.Title,
    author: info?.Author,
    subject: info?.Subject,
    creator: info?.Creator,
    producer: info?.Producer,
    creationDate: info?.CreationDate,
    modificationDate: info?.ModDate,
    numPages: pdf.numPages,
  };
};

/**
 * Check if PDF is scanned (has minimal or no extractable text)
 * @param file - PDF File object
 * @param threshold - Minimum text length per page to consider it text-based (default: 50)
 * @returns Promise resolving to boolean (true if scanned)
 */
export const isScannedPDF = async (
  file: File,
  threshold: number = 50
): Promise<boolean> => {
  const pages = await extractTextFromPDF(file);
  
  // Check if most pages have minimal text
  const pagesWithText = pages.filter(page => page.text.length >= threshold).length;
  const textRatio = pagesWithText / pages.length;
  
  // If less than 30% of pages have meaningful text, consider it scanned
  return textRatio < 0.3;
};

/**
 * Extract text from all pages and combine
 * @param file - PDF File object
 * @returns Promise resolving to combined text
 */
export const extractAllText = async (file: File): Promise<string> => {
  const pages = await extractTextFromPDF(file);
  return pages.map(page => page.text).join('\n\n');
};

