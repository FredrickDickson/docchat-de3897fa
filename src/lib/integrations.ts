/**
 * Integration Exports
 * Handles exporting summaries to external services (Slack, Notion, Google Docs)
 */

export interface IntegrationConfig {
  slack?: {
    webhookUrl: string;
  };
  notion?: {
    apiKey: string;
    databaseId: string;
  };
  googleDocs?: {
    accessToken: string;
  };
}

export interface SummaryExport {
  summary: string;
  filename: string;
  type: string;
  domain: string;
  created_at: string;
}

/**
 * Export to Slack via webhook
 */
export async function exportToSlack(
  summary: SummaryExport,
  webhookUrl: string
): Promise<void> {
  const message = {
    text: `PDF Summary: ${summary.filename}`,
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `📄 ${summary.filename}`,
        },
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Type:* ${summary.type}`,
          },
          {
            type: 'mrkdwn',
            text: `*Domain:* ${summary.domain}`,
          },
          {
            type: 'mrkdwn',
            text: `*Created:* ${new Date(summary.created_at).toLocaleString()}`,
          },
        ],
      },
      {
        type: 'divider',
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Summary:*\n${summary.summary.substring(0, 2000)}${summary.summary.length > 2000 ? '...' : ''}`,
        },
      },
    ],
  };

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  });

  if (!response.ok) {
    throw new Error('Failed to send to Slack');
  }
}

/**
 * Export to Notion
 */
export async function exportToNotion(
  summary: SummaryExport,
  apiKey: string,
  databaseId: string
): Promise<void> {
  const response = await fetch('https://api.notion.com/v1/pages', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28',
    },
    body: JSON.stringify({
      parent: {
        database_id: databaseId,
      },
      properties: {
        'Title': {
          title: [
            {
              text: {
                content: summary.filename,
              },
            },
          ],
        },
        'Type': {
          select: {
            name: summary.type,
          },
        },
        'Domain': {
          select: {
            name: summary.domain,
          },
        },
        'Created': {
          date: {
            start: summary.created_at,
          },
        },
      },
      children: [
        {
          object: 'block',
          type: 'paragraph',
          paragraph: {
            rich_text: [
              {
                type: 'text',
                text: {
                  content: summary.summary,
                },
              },
            ],
          },
        },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.message || 'Failed to export to Notion');
  }
}

/**
 * Export to Google Docs
 */
export async function exportToGoogleDocs(
  summary: SummaryExport,
  accessToken: string
): Promise<void> {
  // Create a new document
  const docResponse = await fetch('https://docs.googleapis.com/v1/documents', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: `PDF Summary: ${summary.filename}`,
    }),
  });

  if (!docResponse.ok) {
    throw new Error('Failed to create Google Doc');
  }

  const doc = await docResponse.json();
  const documentId = doc.documentId;

  // Insert content
  const content = `PDF Summary: ${summary.filename}\n\nType: ${summary.type}\nDomain: ${summary.domain}\nCreated: ${new Date(summary.created_at).toLocaleString()}\n\n${summary.summary}`;

  await fetch(`https://docs.googleapis.com/v1/documents/${documentId}:batchUpdate`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      requests: [
        {
          insertText: {
            location: {
              index: 1,
            },
            text: content,
          },
        },
      ],
    }),
  });
}

