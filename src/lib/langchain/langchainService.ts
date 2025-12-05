/**
 * LangChain Service - Core LangChain Integration
 * Provides DeepSeek LLM wrapper and summarization chains
 */

import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import type { Document } from '@langchain/core/documents';

export type SummaryType = 'short' | 'medium' | 'detailed' | 'bullets';
export type DomainFocus = 'legal' | 'finance' | 'academic' | 'general';

export interface LangChainSummarizeOptions {
  text: string;
  summaryType: SummaryType;
  domainFocus?: DomainFocus;
}

export interface LangChainSummarizeResult {
  summary: string;
  tokensUsed: number;
  cost: number;
  chunkCount: number;
  provider: 'deepseek';
  metadata: {
    model: string;
    inputTokens: number;
    outputTokens: number;
    processingMethod: 'langchain';
  };
}

/**
 * Create DeepSeek LLM instance using LangChain's ChatOpenAI wrapper
 * DeepSeek API is OpenAI-compatible, so we can use the OpenAI client
 */
export const createDeepSeekLLM = (temperature: number = 0.7): ChatOpenAI => {
  const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY;
  
  if (!apiKey) {
    throw new Error('VITE_DEEPSEEK_API_KEY not configured');
  }

  return new ChatOpenAI({
    modelName: 'deepseek-chat',
    temperature,
    openAIApiKey: apiKey,
    configuration: {
      baseURL: 'https://api.deepseek.com/v1',
    },
    // Enable streaming for future use
    streaming: false,
    // Callbacks for token counting
    callbacks: [],
  });
};

/**
 * Build domain-specific prompt template
 */
const buildPromptTemplate = (
  summaryType: SummaryType,
  domainFocus: DomainFocus
): PromptTemplate => {
  const lengthInstructions = {
    short: 'approximately 100 words',
    medium: '150-200 words',
    detailed: '300-400 words',
    bullets: 'as bullet points (5-10 key points)',
  };

  const domainInstructions = {
    legal: `Focus on:
- Legal clauses, terms, and conditions
- Obligations and responsibilities of parties
- Rights and remedies
- Important legal definitions
- Compliance requirements
- Risk factors and liabilities`,
    finance: `Focus on:
- Financial metrics, numbers, and statistics
- Revenue, profit, and loss figures
- Market trends and analysis
- Investment opportunities and risks
- Key financial ratios and indicators
- Budget and forecast information`,
    academic: `Focus on:
- Research findings and conclusions
- Methodology and approach
- Key hypotheses and results
- Academic insights and contributions
- Data analysis and interpretation
- Limitations and future research directions`,
    general: `Provide a comprehensive summary covering:
- Main topics and themes
- Key points and arguments
- Important facts and figures
- Conclusions and recommendations`,
  };

  const formatInstruction = summaryType === 'bullets'
    ? 'Format the summary as clear, concise bullet points.'
    : 'Write the summary in paragraph form with clear, readable prose.';

  const template = `You are a helpful assistant that creates concise, accurate summaries.

Please create a {length} summary of the following text.

{domain_instructions}

{format_instruction}

Text to summarize:
{text}

Summary:`;

  return new PromptTemplate({
    template,
    inputVariables: ['text'],
    partialVariables: {
      length: lengthInstructions[summaryType],
      domain_instructions: domainInstructions[domainFocus],
      format_instruction: formatInstruction,
    },
  });
};

/**
 * Create text splitter for chunking large documents
 */
export const createTextSplitter = (summaryType: SummaryType): RecursiveCharacterTextSplitter => {
  // Adjust chunk size based on summary type
  const chunkSizeMap = {
    short: 4000,
    medium: 6000,
    detailed: 8000,
    bullets: 5000,
  };

  return new RecursiveCharacterTextSplitter({
    chunkSize: chunkSizeMap[summaryType],
    chunkOverlap: 200,
    separators: ['\n\n', '\n', '. ', ' ', ''],
  });
};

/**
 * Calculate cost based on DeepSeek pricing
 * Input: $0.14 per 1M tokens
 * Output: $0.28 per 1M tokens
 */
export const calculateDeepSeekCost = (inputTokens: number, outputTokens: number): number => {
  const inputCost = (inputTokens / 1_000_000) * 0.14;
  const outputCost = (outputTokens / 1_000_000) * 0.28;
  return inputCost + outputCost;
};

/**
 * Estimate token count (rough approximation)
 * ~4 characters per token
 */
export const estimateTokens = (text: string): number => {
  return Math.ceil(text.length / 4);
};

/**
 * Process document with LangChain
 * Main entry point for summarization using LangChain
 */
export const processDocumentWithLangChain = async (
  options: LangChainSummarizeOptions
): Promise<LangChainSummarizeResult> => {
  const { text, summaryType, domainFocus = 'general' } = options;

  // Create LLM instance
  const llm = createDeepSeekLLM();

  // Build prompt template
  const promptTemplate = buildPromptTemplate(summaryType, domainFocus);

  // For very long texts, split into chunks
  let processedText = text;
  let chunkCount = 1;

  if (text.length > 50000) {
    const textSplitter = createTextSplitter(summaryType);
    const chunks = await textSplitter.splitText(text);
    chunkCount = chunks.length;

    // For now, take first chunk or combine chunks intelligently
    // In future, implement map-reduce for multi-chunk summarization
    if (chunks.length > 1) {
      // Take first 50k characters from combined chunks
      processedText = chunks.slice(0, 3).join('\n\n').substring(0, 50000);
    } else {
      processedText = chunks[0];
    }
  }

  // Estimate input tokens
  const inputTokens = estimateTokens(processedText);

  // Format the prompt
  const formattedPrompt = await promptTemplate.format({
    text: processedText,
  });

  // Run the LLM directly
  const result = await llm.invoke(formattedPrompt);

  const summary = typeof result.content === 'string' ? result.content : String(result.content);

  // Estimate output tokens
  const outputTokens = estimateTokens(summary);

  // Calculate cost
  const cost = calculateDeepSeekCost(inputTokens, outputTokens);

  return {
    summary,
    tokensUsed: inputTokens + outputTokens,
    cost,
    chunkCount,
    provider: 'deepseek',
    metadata: {
      model: 'deepseek-chat',
      inputTokens,
      outputTokens,
      processingMethod: 'langchain',
    },
  };
};

/**
 * Process multiple documents with map-reduce pattern
 * For future enhancement
 */
export const processMultipleDocuments = async (
  documents: Document[],
  summaryType: SummaryType,
  domainFocus: DomainFocus = 'general'
): Promise<LangChainSummarizeResult> => {
  // TODO: Implement map-reduce chain for multiple documents
  // This will be useful for very long PDFs split into multiple chunks
  throw new Error('Multi-document processing not yet implemented');
};
