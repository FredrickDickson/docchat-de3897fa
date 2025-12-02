/**
 * Vercel Serverless Function: Summarize Text
 * Handles AI summarization requests
 * 
 * Deploy to: /api/summarize
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

interface SummarizeRequest {
  text: string;
  summaryType: 'short' | 'medium' | 'detailed' | 'bullets';
  domainFocus?: 'legal' | 'finance' | 'academic' | 'general';
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { text, summaryType, domainFocus = 'general' }: SummarizeRequest = req.body;

    // Validate input
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'Text is required' });
    }

    // Get API key from environment (prefer DeepSeek, then Claude, then OpenAI)
    const deepseekKey = process.env.DEEPSEEK_API_KEY || process.env.VITE_DEEPSEEK_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
    const claudeKey = process.env.CLAUDE_API_KEY || process.env.VITE_CLAUDE_API_KEY;
    
    const useDeepSeek = !!deepseekKey;
    const useClaude = !useDeepSeek && !!claudeKey;
    const useOpenAI = !useDeepSeek && !useClaude && !!openaiKey;
    
    if (!useDeepSeek && !useClaude && !useOpenAI) {
      return res.status(500).json({ error: 'AI API key not configured' });
    }

    const startTime = Date.now();

    // Determine summary length based on type
    const lengthMap = {
      short: '100 words',
      medium: '150-200 words',
      detailed: '300-400 words',
      bullets: 'bullet points',
    };

    // Domain-specific prompts
    const domainPrompts = {
      legal: 'Focus on legal clauses, terms, obligations, and key legal points.',
      finance: 'Focus on financial metrics, numbers, trends, and key financial insights.',
      academic: 'Focus on research findings, methodology, conclusions, and academic insights.',
      general: 'Provide a comprehensive summary covering all key points.',
    };

    // Build prompt with domain-specific instructions
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

    // Build prompt
    const prompt = `Please create a ${lengthMap[summaryType]} summary of the following text.

${domainInstructions[domainFocus]}

${formatInstruction}

Text to summarize:
${text.substring(0, 50000)}${text.length > 50000 ? '\n\n[Text truncated...]' : ''}

Summary:`;

    // Determine API endpoint and request body
    let apiUrl: string;
    let requestBody: any;
    let headers: Record<string, string>;

    if (useDeepSeek) {
      apiUrl = 'https://api.deepseek.com/v1/chat/completions';
      requestBody = {
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
        max_tokens: summaryType === 'detailed' ? 1000 : summaryType === 'bullets' ? 500 : 300,
        temperature: 0.7,
      };
      headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${deepseekKey}`,
      };
    } else if (useClaude) {
      apiUrl = 'https://api.anthropic.com/v1/messages';
      requestBody = {
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: summaryType === 'detailed' ? 1000 : summaryType === 'bullets' ? 500 : 300,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      };
      headers = {
        'Content-Type': 'application/json',
        'x-api-key': claudeKey,
        'anthropic-version': '2023-06-01',
      };
    } else {
      apiUrl = 'https://api.openai.com/v1/chat/completions';
      requestBody = {
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
        max_tokens: summaryType === 'detailed' ? 1000 : summaryType === 'bullets' ? 500 : 300,
        temperature: 0.7,
      };
      headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiKey}`,
      };
    }

    const apiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
    });

    if (!apiResponse.ok) {
      const error = await apiResponse.text();
      console.error('AI API error:', error);
      return res.status(500).json({ error: 'Failed to generate summary' });
    }

    const data = await apiResponse.json();
    let summary: string;
    let tokensUsed: number;
    
    if (useDeepSeek) {
      summary = data.choices[0].message.content;
      tokensUsed = data.usage?.total_tokens || 0;
    } else if (useClaude) {
      summary = data.content[0].text;
      tokensUsed = (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0);
    } else {
      summary = data.choices[0].message.content;
      tokensUsed = data.usage?.total_tokens || 0;
    }

    // Calculate cost (approximate)
    // DeepSeek: $0.14 per 1M input, $0.28 per 1M output
    // Claude: $0.003 per 1K input, $0.015 per 1K output
    // OpenAI: $0.01 per 1K input, $0.03 per 1K output
    let cost: number;
    if (useDeepSeek) {
      const inputTokens = data.usage?.prompt_tokens || 0;
      const outputTokens = data.usage?.completion_tokens || 0;
      cost = (inputTokens * 0.00000014) + (outputTokens * 0.00000028);
    } else if (useClaude) {
      const inputTokens = data.usage?.input_tokens || 0;
      const outputTokens = data.usage?.output_tokens || 0;
      cost = (inputTokens * 0.000003) + (outputTokens * 0.000015);
    } else {
      const inputTokens = data.usage?.prompt_tokens || 0;
      const outputTokens = data.usage?.completion_tokens || 0;
      cost = (inputTokens * 0.00001) + (outputTokens * 0.00003);
    }

    const processingTime = Date.now() - startTime;

    return res.status(200).json({
      summary,
      tokensUsed,
      cost: parseFloat(cost.toFixed(4)),
      processingTime,
    });
  } catch (error: any) {
    console.error('Summarization error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to generate summary',
    });
  }
}

