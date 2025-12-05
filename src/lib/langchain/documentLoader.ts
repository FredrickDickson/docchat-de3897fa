/**
 * LangChain Document Loader
 * Custom loader for PDF documents in browser environment
 */

import type { Document } from '@langchain/core/documents';
import { extractAllText } from '../pdfParser';

export interface PDFDocumentMetadata {
  source: string;
  fileName: string;
  fileSize: number;
  numPages?: number;
  uploadedAt: string;
}

/**
 * Load PDF document and convert to LangChain Document format
 * @param file - PDF File object
 * @returns Promise resolving to LangChain Document
 */
export const loadPDFDocument = async (file: File): Promise<Document> => {
  // Extract text using existing PDF parser
  const text = await extractAllText(file);

  // Create metadata
  const metadata: PDFDocumentMetadata = {
    source: 'pdf-upload',
    fileName: file.name,
    fileSize: file.size,
    uploadedAt: new Date().toISOString(),
  };

  // Create LangChain Document
  const document: Document = {
    pageContent: text,
    metadata,
  };

  return document;
};

/**
 * Load PDF and split into page-based documents
 * Each page becomes a separate Document
 * @param file - PDF File object
 * @returns Promise resolving to array of LangChain Documents
 */
export const loadPDFByPages = async (file: File): Promise<Document[]> => {
  const { extractTextFromPDF } = await import('../pdfParser');
  
  // Extract text by pages
  const pages = await extractTextFromPDF(file);

  // Convert each page to a Document
  const documents: Document[] = pages.map((page, index) => ({
    pageContent: page.text,
    metadata: {
      source: 'pdf-upload',
      fileName: file.name,
      fileSize: file.size,
      pageNumber: page.pageNumber,
      totalPages: pages.length,
      uploadedAt: new Date().toISOString(),
    },
  }));

  return documents;
};

/**
 * Create a Document from plain text
 * Useful for testing or when text is already extracted
 */
export const createDocumentFromText = (
  text: string,
  metadata: Partial<PDFDocumentMetadata> = {}
): Document => {
  return {
    pageContent: text,
    metadata: {
      source: metadata.source || 'text-input',
      fileName: metadata.fileName || 'document.txt',
      fileSize: metadata.fileSize || text.length,
      uploadedAt: metadata.uploadedAt || new Date().toISOString(),
    },
  };
};
