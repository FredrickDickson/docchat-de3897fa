/**
 * AI Client Wrapper
 * Handles OpenAI and Claude API calls with retry logic and error handling
 */

export type AIProvider = 'openai' | 'claude' | 'deepseek';
export type SummaryType = 'short' | 'medium' | 'detailed' | 'bullets';
export type DomainFocus = 'legal' | 'finance' | 'academic' | 'general';

export interface SummarizeOptions {
  text: string;
  summaryType: SummaryType;
  domainFocus?: DomainFocus;
  provider?: AIProvider;
}

export interface SummarizeResult {
  summary: string;
  tokensUsed: number;
  cost: number;
  provider: AIProvider;
}

/**
 * Estimate token count (rough approximation)
 * OpenAI: ~4 characters per token, Claude: similar
 */
export const estimateTokens = (text: string): number => {
  return Math.ceil(text.length / 4);
};

/**
 * Calculate cost based on provider and tokens
 */
export const calculateCost = (
  provider: AIProvider,
  inputTokens: number,
  outputTokens: number
): number => {
  // Pricing as of 2024 (adjust as needed)
  const pricing = {
    openai: {
      input: 0.00001, // $0.01 per 1K tokens for GPT-4 Turbo
      output: 0.00003, // $0.03 per 1K tokens
    },
    claude: {
      input: 0.000003, // $0.003 per 1K tokens for Claude 3.5 Sonnet
      output: 0.000015, // $0.015 per 1K tokens
    },
    deepseek: {
      input: 0.00000014, // $0.14 per 1M tokens (very cheap!)
      output: 0.00000028, // $0.28 per 1M tokens
    },
  };

  const rates = pricing[provider];
  return inputTokens * rates.input + outputTokens * rates.output;
};

/**
 * Call OpenAI API
 */
const callOpenAI = async (
  prompt: string,
  summaryType: SummaryType,
  maxTokens: number
): Promise<{ text: string; inputTokens: number; outputTokens: number }> => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OpenAI API key not configured');
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that creates concise, accurate summaries.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: maxTokens,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
    throw new Error(error.error?.message || 'OpenAI API error');
  }

  const data = await response.json();
  return {
    text: data.choices[0].message.content,
    inputTokens: data.usage.prompt_tokens,
    outputTokens: data.usage.completion_tokens,
  };
};

/**
 * Call Claude API
 */
const callClaude = async (
  prompt: string,
  summaryType: SummaryType,
  maxTokens: number
): Promise<{ text: string; inputTokens: number; outputTokens: number }> => {
  const apiKey = import.meta.env.VITE_CLAUDE_API_KEY;
  if (!apiKey) {
    throw new Error('Claude API key not configured');
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: maxTokens,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
    throw new Error(error.error?.message || 'Claude API error');
  }

  const data = await response.json();
  return {
    text: data.content[0].text,
    inputTokens: data.usage.input_tokens,
    outputTokens: data.usage.output_tokens,
  };
};

/**
 * Call DeepSeek API
 */
const callDeepSeek = async (
  prompt: string,
  summaryType: SummaryType,
  maxTokens: number
): Promise<{ text: string; inputTokens: number; outputTokens: number }> => {
  const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new Error('DeepSeek API key not configured');
  }

  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that creates concise, accurate summaries.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: maxTokens,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
    throw new Error(error.error?.message || 'DeepSeek API error');
  }

  const data = await response.json();
  return {
    text: data.choices[0].message.content,
    inputTokens: data.usage.prompt_tokens,
    outputTokens: data.usage.completion_tokens,
  };
};

/**
 * Retry function with exponential backoff
 */
const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> => {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry on client errors (4xx)
      if (error instanceof Error && error.message.includes('400')) {
        throw error;
      }

      if (attempt < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error('Max retries exceeded');
};

/**
 * Summarize text using AI
 * Supports both OpenAI and Claude with automatic fallback
 */
export const summarizeWithAI = async (
  options: SummarizeOptions
): Promise<SummarizeResult> => {
  const { text, summaryType, domainFocus = 'general', provider } = options;

  // Check if LangChain is enabled via environment variable
  const useLangChain = import.meta.env.VITE_USE_LANGCHAIN !== 'false'; // Default to true

  // If LangChain is enabled and DeepSeek key is available, use LangChain
  const deepseekKey = import.meta.env.VITE_DEEPSEEK_API_KEY;
  
  if (useLangChain && deepseekKey) {
    try {
      // Use LangChain service
      const { processDocumentWithLangChain } = await import('./langchain');
      
      const result = await processDocumentWithLangChain({
        text,
        summaryType,
        domainFocus,
      });

      return {
        summary: result.summary,
        tokensUsed: result.tokensUsed,
        cost: result.cost,
        provider: result.provider,
      };
    } catch (error) {
      console.error('LangChain processing failed, falling back to direct API:', error);
      // Fall through to direct API implementation below
    }
  }

  // Original direct API implementation (fallback)
  const openaiKey = import.meta.env.VITE_OPENAI_API_KEY;
  const claudeKey = import.meta.env.VITE_CLAUDE_API_KEY;
  
  let selectedProvider: AIProvider;
  if (provider) {
    selectedProvider = provider;
  } else if (deepseekKey) {
    selectedProvider = 'deepseek'; // Prefer DeepSeek (cheapest)
  } else if (claudeKey) {
    selectedProvider = 'claude';
  } else if (openaiKey) {
    selectedProvider = 'openai';
  } else {
    throw new Error('No AI API key configured. Please set VITE_DEEPSEEK_API_KEY, VITE_OPENAI_API_KEY, or VITE_CLAUDE_API_KEY');
  }

  // Build prompt using prompt engineering
  const prompt = buildSummaryPrompt(text, summaryType, domainFocus);

  // Determine max tokens based on summary type
  const maxTokensMap = {
    short: 150,
    medium: 300,
    detailed: 600,
    bullets: 500,
  };
  const maxTokens = maxTokensMap[summaryType];

  // Call API with retry logic
  const result = await retryWithBackoff(async () => {
    if (selectedProvider === 'openai') {
      return await callOpenAI(prompt, summaryType, maxTokens);
    } else if (selectedProvider === 'claude') {
      return await callClaude(prompt, summaryType, maxTokens);
    } else {
      return await callDeepSeek(prompt, summaryType, maxTokens);
    }
  });

  // Calculate cost
  const cost = calculateCost(selectedProvider, result.inputTokens, result.outputTokens);

  return {
    summary: result.text,
    tokensUsed: result.inputTokens + result.outputTokens,
    cost,
    provider: selectedProvider,
  };
};

/**
 * Build summary prompt with domain-specific instructions
 */
function buildSummaryPrompt(
  text: string,
  summaryType: SummaryType,
  domainFocus: DomainFocus
): string {
  // Truncate text if too long (keep first 50K characters)
  const truncatedText = text.length > 50000 
    ? text.substring(0, 50000) + '\n\n[Text truncated...]'
    : text;

  // Summary length instructions
  const lengthInstructions = {
    short: 'approximately 100 words',
    medium: '150-200 words',
    detailed: '300-400 words',
    bullets: 'as bullet points (5-10 key points)',
  };

  // Domain-specific instructions
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

  const prompt = `Please create a ${lengthInstructions[summaryType]} summary of the following text.

${domainInstructions[domainFocus]}

${summaryType === 'bullets' 
  ? 'Format the summary as clear, concise bullet points.' 
  : 'Write the summary in paragraph form with clear, readable prose.'}

Text to summarize:
${truncatedText}

Summary:`;

  return prompt;
}

