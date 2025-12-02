/**
 * API Utilities for PDF Summarizer
 * Handles communication with backend API endpoints
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export interface SummarizeRequest {
  text: string;
  summaryType: 'short' | 'medium' | 'detailed' | 'bullets';
  domainFocus?: 'legal' | 'finance' | 'academic' | 'general';
}

export interface SummarizeResponse {
  summary: string;
  tokensUsed: number;
  cost: number;
  processingTime: number;
}

/**
 * Summarize text using AI
 * Uses client-side AI client if API keys are available, otherwise falls back to serverless function
 * @param request - Summarization request
 * @returns Promise resolving to summary response
 */
export const summarizeText = async (
  request: SummarizeRequest
): Promise<SummarizeResponse> => {
  // Check if we have API keys for client-side processing
  const hasOpenAIKey = !!import.meta.env.VITE_OPENAI_API_KEY;
  const hasClaudeKey = !!import.meta.env.VITE_CLAUDE_API_KEY;

  if (hasOpenAIKey || hasClaudeKey) {
    // Use client-side AI client
    const { summarizeWithAI } = await import('./aiClient');
    const { formatSummary } = await import('./summaryFormatter');
    const { getCachedSummary, setCachedSummary } = await import('./summaryCache');

    // Check cache first
    const cached = getCachedSummary(
      request.text,
      request.summaryType,
      request.domainFocus || 'general'
    );

    if (cached) {
      return {
        summary: formatSummary(cached.summary, request.summaryType),
        tokensUsed: cached.tokensUsed,
        cost: cached.cost,
        processingTime: 0, // Cached, so instant
      };
    }

    // Generate summary
    const startTime = Date.now();
    const result = await summarizeWithAI({
      text: request.text,
      summaryType: request.summaryType,
      domainFocus: request.domainFocus,
    });

    const formattedSummary = formatSummary(result.summary, request.summaryType);
    const processingTime = Date.now() - startTime;

    // Cache the result
    setCachedSummary(
      request.text,
      request.summaryType,
      request.domainFocus || 'general',
      formattedSummary,
      result.tokensUsed,
      result.cost
    );

    return {
      summary: formattedSummary,
      tokensUsed: result.tokensUsed,
      cost: result.cost,
      processingTime,
    };
  } else {
    // Fall back to serverless function
    const response = await fetch(`${API_BASE_URL}/summarize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to summarize' }));
      throw new Error(error.message || 'Failed to summarize text');
    }

    return response.json();
  }
};

/**
 * Upload PDF file
 * @param file - PDF File object
 * @param onProgress - Optional progress callback
 * @returns Promise resolving to file ID
 */
export const uploadPDF = async (
  file: File,
  onProgress?: (progress: number) => void
): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);

  const xhr = new XMLHttpRequest();

  return new Promise((resolve, reject) => {
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        const progress = (e.loaded / e.total) * 100;
        onProgress(progress);
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        const response = JSON.parse(xhr.responseText);
        resolve(response.fileId);
      } else {
        reject(new Error('Upload failed'));
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('Upload failed'));
    });

    xhr.open('POST', `${API_BASE_URL}/upload`);
    xhr.send(formData);
  });
};

