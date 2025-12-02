/**
 * Export Utilities
 * Handles exporting summaries in various formats
 */

export interface SummaryData {
  summary: string;
  filename: string;
  type: string;
  domain: string;
  cost: number;
  created_at: string;
  tokensUsed?: number;
}

/**
 * Export summary as TXT
 */
export function exportAsTXT(data: SummaryData): void {
  const content = `PDF Summary: ${data.filename}
Generated: ${new Date(data.created_at).toLocaleString()}
Type: ${data.type}
Domain: ${data.domain}
Cost: $${data.cost.toFixed(4)}

${data.summary}`;

  downloadFile(content, `${data.filename.replace('.pdf', '')}_summary.txt`, 'text/plain');
}

/**
 * Export summary as JSON
 */
export function exportAsJSON(data: SummaryData): void {
  const json = JSON.stringify({
    filename: data.filename,
    summary: data.summary,
    type: data.type,
    domain: data.domain,
    cost: data.cost,
    tokensUsed: data.tokensUsed,
    created_at: data.created_at,
  }, null, 2);

  downloadFile(json, `${data.filename.replace('.pdf', '')}_summary.json`, 'application/json');
}

/**
 * Export summary as CSV
 */
export function exportAsCSV(data: SummaryData): void {
  // CSV format: filename, type, domain, cost, created_at, summary
  const csv = [
    ['Filename', 'Type', 'Domain', 'Cost', 'Created At', 'Summary'],
    [
      data.filename,
      data.type,
      data.domain,
      data.cost.toFixed(4),
      new Date(data.created_at).toISOString(),
      data.summary.replace(/"/g, '""'), // Escape quotes
    ],
  ]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');

  downloadFile(csv, `${data.filename.replace('.pdf', '')}_summary.csv`, 'text/csv');
}

/**
 * Download file helper
 */
function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Copy summary to clipboard
 */
export async function copyToClipboard(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
  } catch (err) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
  }
}

