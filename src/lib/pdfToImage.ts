/**
 * PDF to Image Conversion Utility
 * Converts PDF pages to images for OCR processing
 */

import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';

// Set worker source for PDF.js
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;
}

export interface PDFPageImage {
  pageNumber: number;
  dataURL: string;
  width: number;
  height: number;
}

/**
 * Convert a PDF page to an image (canvas)
 * @param pdf - PDF document
 * @param pageNum - Page number (1-indexed)
 * @param scale - Scale factor for image quality (default: 2.0 for better OCR)
 * @returns Promise resolving to canvas element
 */
const pageToCanvas = async (
  pdf: pdfjsLib.PDFDocumentProxy,
  pageNum: number,
  scale: number = 2.0
): Promise<HTMLCanvasElement> => {
  const page = await pdf.getPage(pageNum);
  const viewport = page.getViewport({ scale });

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('Could not get canvas context');
  }

  canvas.height = viewport.height;
  canvas.width = viewport.width;

  const renderContext = {
    canvasContext: context,
    viewport: viewport,
    canvas: canvas,
  };

  await page.render(renderContext).promise;

  return canvas;
};

/**
 * Convert PDF pages to images (data URLs)
 * @param file - PDF File object
 * @param scale - Scale factor for image quality (default: 2.0)
 * @param onProgress - Optional progress callback (pageNumber, totalPages)
 * @returns Promise resolving to array of page images
 */
export const convertPDFToImages = async (
  file: File,
  scale: number = 2.0,
  onProgress?: (current: number, total: number) => void
): Promise<PDFPageImage[]> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const images: PDFPageImage[] = [];
  const totalPages = pdf.numPages;

  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    const canvas = await pageToCanvas(pdf, pageNum, scale);
    const dataURL = canvas.toDataURL('image/png');

    images.push({
      pageNumber: pageNum,
      dataURL,
      width: canvas.width,
      height: canvas.height,
    });

    if (onProgress) {
      onProgress(pageNum, totalPages);
    }
  }

  return images;
};

/**
 * Convert a single PDF page to image
 * @param file - PDF File object
 * @param pageNumber - Page number (1-indexed)
 * @param scale - Scale factor (default: 2.0)
 * @returns Promise resolving to image data URL
 */
export const convertPDFPageToImage = async (
  file: File,
  pageNumber: number,
  scale: number = 2.0
): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  if (pageNumber < 1 || pageNumber > pdf.numPages) {
    throw new Error(`Page number ${pageNumber} is out of range (1-${pdf.numPages})`);
  }

  const canvas = await pageToCanvas(pdf, pageNumber, scale);
  return canvas.toDataURL('image/png');
};
