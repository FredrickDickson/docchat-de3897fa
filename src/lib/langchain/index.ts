/**
 * LangChain Integration - Main Export
 * Central export point for all LangChain functionality
 */

export {
  createDeepSeekLLM,
  createTextSplitter,
  calculateDeepSeekCost,
  estimateTokens,
  processDocumentWithLangChain,
  processMultipleDocuments,
} from './langchainService';

export type {
  SummaryType,
  DomainFocus,
  LangChainSummarizeOptions,
  LangChainSummarizeResult,
} from './langchainService';

export {
  loadPDFDocument,
  loadPDFByPages,
  createDocumentFromText,
} from './documentLoader';

export type {
  PDFDocumentMetadata,
} from './documentLoader';

export {
  createTextSplitter as createCustomTextSplitter,
  createDomainTextSplitter,
  splitDocument,
  splitText,
  getOptimalChunkSize,
} from './textSplitter';

export type {
  TextSplitterOptions,
} from './textSplitter';

export {
  createSummaryPrompt,
  summarizeDocuments,
  summarizeWithMapReduce,
} from './chains';
