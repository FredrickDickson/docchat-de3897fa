/**
 * Puter.js AI Chat Utility
 * Client-side AI chat functionality using Puter.js (free, no API key required)
 */

// Import to get the Window interface with puter declaration
import '@/lib/ocr';

interface StreamChunk {
  text?: string;
}

/**
 * Check if Puter.js AI is loaded
 */
export const isPuterAILoaded = (): boolean => {
  return typeof window !== 'undefined' && 
         typeof window.puter !== 'undefined' && 
         typeof window.puter.ai !== 'undefined' &&
         typeof window.puter.ai.chat === 'function';
};

/**
 * Stream chat with document using Puter.js AI
 * @param question - User's question
 * @param documentText - The document text for context
 * @param onChunk - Callback for each streamed chunk
 * @param domain - Optional domain focus
 */
export const streamChatWithDocument = async (
  question: string,
  documentText: string,
  onChunk: (text: string) => void,
  domain?: string
): Promise<void> => {
  if (!isPuterAILoaded()) {
    throw new Error('Puter.js AI is not loaded. Please ensure the script is included in your HTML.');
  }

  // Truncate document text if too long
  const maxChars = 15000;
  const truncatedText = documentText.length > maxChars 
    ? documentText.substring(0, maxChars) + '...[truncated]'
    : documentText;

  const domainContext = domain && domain !== 'general' 
    ? `You are an expert in ${domain}. ` 
    : '';
  
  const prompt = `${domainContext}You are a helpful AI assistant that answers questions about documents. Be concise and accurate.

Document Content:
"""
${truncatedText}
"""

User Question: ${question}

Please provide a helpful, accurate answer based on the document content above. If the answer is not in the document, say so clearly.`;

  try {
    const response = await window.puter!.ai!.chat(prompt, { stream: true });
    
    // Handle streaming response (async iterable)
    if (typeof response === 'object' && response !== null && Symbol.asyncIterator in (response as object)) {
      for await (const part of response as AsyncIterable<StreamChunk>) {
        const text = part?.text;
        if (text) {
          onChunk(text);
        }
      }
    } else if (typeof response === 'string') {
      // Fallback for non-streaming response
      onChunk(response);
    }
  } catch (error) {
    console.error('Puter.js AI stream error:', error);
    throw new Error(`AI stream failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Chat with document using Puter.js AI (non-streaming)
 * @param question - User's question
 * @param documentText - The document text for context
 * @param domain - Optional domain focus (e.g., 'legal', 'medical')
 * @returns AI response
 */
export const chatWithDocument = async (
  question: string,
  documentText: string,
  domain?: string
): Promise<string> => {
  if (!isPuterAILoaded()) {
    throw new Error('Puter.js AI is not loaded. Please ensure the script is included in your HTML.');
  }

  // Truncate document text if too long (Puter.js has limits)
  const maxChars = 15000;
  const truncatedText = documentText.length > maxChars 
    ? documentText.substring(0, maxChars) + '...[truncated]'
    : documentText;

  // Build the prompt with document context
  const domainContext = domain && domain !== 'general' 
    ? `You are an expert in ${domain}. ` 
    : '';
  
  const prompt = `${domainContext}You are a helpful AI assistant that answers questions about documents. Be concise and accurate.

Document Content:
"""
${truncatedText}
"""

User Question: ${question}

Please provide a helpful, accurate answer based on the document content above. If the answer is not in the document, say so clearly.`;

  try {
    const response = await window.puter!.ai!.chat(prompt);
    return (typeof response === 'string' ? response : '') || 'No response received from AI.';
  } catch (error) {
    console.error('Puter.js AI chat error:', error);
    throw new Error(`AI chat failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Simple chat without document context
 * @param message - User's message
 * @returns AI response
 */
export const simpleChat = async (message: string): Promise<string> => {
  if (!isPuterAILoaded()) {
    throw new Error('Puter.js AI is not loaded.');
  }

  try {
    const response = await window.puter!.ai!.chat(message);
    return (typeof response === 'string' ? response : '') || 'No response received.';
  } catch (error) {
    console.error('Puter.js chat error:', error);
    throw new Error(`Chat failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
