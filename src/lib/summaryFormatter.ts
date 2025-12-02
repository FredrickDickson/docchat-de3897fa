/**
 * Summary Formatter
 * Formats summaries based on type (especially bullet points)
 */

export type SummaryType = 'short' | 'medium' | 'detailed' | 'bullets';

/**
 * Format summary based on type
 */
export function formatSummary(summary: string, type: SummaryType): string {
  if (type === 'bullets') {
    return formatAsBullets(summary);
  }
  return summary.trim();
}

/**
 * Format text as bullet points
 * Handles various formats from AI (numbered lists, dashes, etc.)
 */
function formatAsBullets(text: string): string {
  // Split by common bullet point indicators
  const lines = text
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

  const bullets: string[] = [];

  for (const line of lines) {
    // Remove common prefixes
    let bullet = line
      .replace(/^[-•*]\s+/, '') // Remove dash, bullet, asterisk
      .replace(/^\d+[.)]\s+/, '') // Remove numbered list
      .replace(/^[a-z][.)]\s+/, '') // Remove lettered list
      .trim();

    // Only add if it looks like a bullet point
    if (bullet.length > 10) {
      bullets.push(`• ${bullet}`);
    }
  }

  // If no bullets found, try to split by sentences
  if (bullets.length === 0) {
    const sentences = text
      .split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 20 && s.length < 200);

    return sentences
      .slice(0, 10) // Max 10 bullet points
      .map(s => `• ${s}`)
      .join('\n');
  }

  return bullets.join('\n');
}

/**
 * Validate summary quality
 */
export function validateSummary(summary: string, minLength: number = 50): boolean {
  return summary.trim().length >= minLength;
}

/**
 * Estimate word count
 */
export function estimateWordCount(text: string): number {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

