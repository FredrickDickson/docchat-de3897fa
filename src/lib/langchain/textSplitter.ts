/**
 * LangChain Text Splitters
 * Utilities for chunking documents with LangChain
 */

import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import type { Document } from '@langchain/core/documents';
import type { SummaryType, DomainFocus } from './langchainService';

export interface TextSplitterOptions {
  chunkSize?: number;
  chunkOverlap?: number;
  separators?: string[];
}

/**
 * Create text splitter optimized for summary type
 */
export const createTextSplitter = (
  summaryType: SummaryType,
  customOptions?: TextSplitterOptions
): RecursiveCharacterTextSplitter => {
  // Default chunk sizes based on summary type
  const defaultChunkSizes = {
    short: 4000,
    medium: 6000,
    detailed: 8000,
    bullets: 5000,
  };

  const chunkSize = customOptions?.chunkSize || defaultChunkSizes[summaryType];
  const chunkOverlap = customOptions?.chunkOverlap || 200;
  const separators = customOptions?.separators || ['\n\n', '\n', '. ', ' ', ''];

  return new RecursiveCharacterTextSplitter({
    chunkSize,
    chunkOverlap,
    separators,
  });
};

/**
 * Create text splitter optimized for domain
 */
export const createDomainTextSplitter = (
  domainFocus: DomainFocus,
  customOptions?: TextSplitterOptions
): RecursiveCharacterTextSplitter => {
  // Domain-specific configurations
  const domainConfigs = {
    legal: {
      chunkSize: 6000, // Legal documents need larger context
      chunkOverlap: 300,
      separators: ['\n\n', '\n', '. ', '; ', ', ', ' ', ''],
    },
    finance: {
      chunkSize: 5000,
      chunkOverlap: 250,
      separators: ['\n\n', '\n', '. ', ' ', ''],
    },
    academic: {
      chunkSize: 7000, // Academic papers need larger chunks
      chunkOverlap: 400,
      separators: ['\n\n', '\n', '. ', ' ', ''],
    },
    general: {
      chunkSize: 5000,
      chunkOverlap: 200,
      separators: ['\n\n', '\n', '. ', ' ', ''],
    },
  };

  const config = domainConfigs[domainFocus];

  return new RecursiveCharacterTextSplitter({
    chunkSize: customOptions?.chunkSize || config.chunkSize,
    chunkOverlap: customOptions?.chunkOverlap || config.chunkOverlap,
    separators: customOptions?.separators || config.separators,
  });
};

/**
 * Split a document into chunks
 */
export const splitDocument = async (
  document: Document,
  summaryType: SummaryType,
  domainFocus: DomainFocus = 'general'
): Promise<Document[]> => {
  const splitter = createDomainTextSplitter(domainFocus);
  const chunks = await splitter.splitDocuments([document]);
  return chunks;
};

/**
 * Split text into chunks
 */
export const splitText = async (
  text: string,
  summaryType: SummaryType,
  domainFocus: DomainFocus = 'general'
): Promise<string[]> => {
  const splitter = createDomainTextSplitter(domainFocus);
  const chunks = await splitter.splitText(text);
  return chunks;
};

/**
 * Get optimal chunk size for a given text length
 */
export const getOptimalChunkSize = (textLength: number): number => {
  if (textLength < 5000) return textLength;
  if (textLength < 20000) return 4000;
  if (textLength < 50000) return 6000;
  return 8000;
};
