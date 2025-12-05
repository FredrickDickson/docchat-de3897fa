/**
 * LangChain Chains
 * Advanced chain implementations for document summarization
 */

import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import type { Document } from '@langchain/core/documents';
import type { SummaryType, DomainFocus } from './langchainService';

/**
 * Create a basic summarization prompt
 */
export const createSummaryPrompt = (
  summaryType: SummaryType,
  domainFocus: DomainFocus = 'general'
): PromptTemplate => {
  const lengthMap = {
    short: 'approximately 100 words',
    medium: '150-200 words',
    detailed: '300-400 words',
    bullets: 'as bullet points (5-10 key points)',
  };

  const template = `Summarize the following text in {length}:

{text}

Summary:`;

  const prompt = new PromptTemplate({
    template,
    inputVariables: ['text'],
    partialVariables: {
      length: lengthMap[summaryType],
    },
  });

  return prompt;
};

/**
 * Summarize documents using direct LLM invocation
 * This is the v0.3 compatible approach
 */
export const summarizeDocuments = async (
  documents: Document[],
  llm: ChatOpenAI,
  summaryType: SummaryType = 'medium'
): Promise<string> => {
  // Combine all document content
  const combinedText = documents.map(doc => doc.pageContent).join('\n\n');

  // Create prompt
  const prompt = createSummaryPrompt(summaryType);
  
  // Format prompt with text
  const formattedPrompt = await prompt.format({ text: combinedText });

  // Invoke LLM
  const result = await llm.invoke(formattedPrompt);

  return typeof result.content === 'string' ? result.content : String(result.content);
};

/**
 * Summarize with map-reduce pattern for very long documents
 * Split into chunks, summarize each, then combine summaries
 */
export const summarizeWithMapReduce = async (
  documents: Document[],
  llm: ChatOpenAI,
  summaryType: SummaryType = 'medium'
): Promise<string> => {
  // Map phase: Summarize each document
  const summaries = await Promise.all(
    documents.map(async (doc) => {
      const prompt = createSummaryPrompt('short');
      const formattedPrompt = await prompt.format({ text: doc.pageContent });
      const result = await llm.invoke(formattedPrompt);
      return typeof result.content === 'string' ? result.content : String(result.content);
    })
  );

  // Reduce phase: Combine all summaries
  const combinedSummaries = summaries.join('\n\n');
  const finalPrompt = createSummaryPrompt(summaryType);
  const formattedFinalPrompt = await finalPrompt.format({ text: combinedSummaries });
  const finalResult = await llm.invoke(formattedFinalPrompt);

  return typeof finalResult.content === 'string' ? finalResult.content : String(finalResult.content);
};
