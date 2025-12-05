# LangChain Integration

## Overview

This application now uses **LangChain** for PDF summarization, providing a more robust and scalable approach to document processing.

## Features

✅ **DeepSeek LLM Integration** - Cost-effective AI summarization ($0.14 per 1M tokens)
✅ **Smart Text Chunking** - Domain-specific text splitting for optimal context
✅ **Advanced Chains** - Map-reduce and refine strategies for long documents
✅ **Metadata Tracking** - Full visibility into processing details
✅ **Automatic Fallback** - Graceful degradation to direct API if LangChain fails

## Architecture

```
PDF Upload → Document Loader → Text Splitter → LangChain Chain → Summary
                                                       ↓
                                              DeepSeek LLM
```

## Configuration

### Environment Variables

Add to your `.env` file:

```bash
# Required: DeepSeek API Key
VITE_DEEPSEEK_API_KEY=your_deepseek_api_key_here

# Optional: Feature flag (default: true)
VITE_USE_LANGCHAIN=true
```

### Feature Flag

- `VITE_USE_LANGCHAIN=true` - Use LangChain (default)
- `VITE_USE_LANGCHAIN=false` - Use direct API calls

## Usage

### Basic Summarization

```typescript
import { processDocumentWithLangChain } from '@/lib/langchain';

const result = await processDocumentWithLangChain({
  text: pdfText,
  summaryType: 'medium',
  domainFocus: 'general',
});

console.log(result.summary);
console.log(`Tokens used: ${result.tokensUsed}`);
console.log(`Cost: $${result.cost.toFixed(4)}`);
console.log(`Chunks processed: ${result.chunkCount}`);
```

### Document Loading

```typescript
import { loadPDFDocument } from '@/lib/langchain';

const document = await loadPDFDocument(pdfFile);
console.log(document.pageContent);
console.log(document.metadata);
```

### Custom Text Splitting

```typescript
import { createDomainTextSplitter, splitText } from '@/lib/langchain';

const splitter = createDomainTextSplitter('legal');
const chunks = await splitText(longText, 'detailed', 'legal');
```

## Database Schema

### New Fields in `summaries` Table

| Field | Type | Description |
|-------|------|-------------|
| `chunk_count` | INT | Number of text chunks processed |
| `langchain_metadata` | JSONB | LangChain processing metadata |
| `processing_method` | TEXT | `'langchain'` or `'direct'` |

### Migration

Run the migration script:

```bash
# Apply to Supabase
psql -h your-db-host -U postgres -d postgres -f database/08_langchain_integration.sql
```

Or use Supabase Dashboard:
1. Go to SQL Editor
2. Paste contents of `database/08_langchain_integration.sql`
3. Run

## Summary Types

| Type | Length | Use Case |
|------|--------|----------|
| `short` | ~100 words | Quick overview |
| `medium` | 150-200 words | Standard summary |
| `detailed` | 300-400 words | Comprehensive analysis |
| `bullets` | 5-10 points | Key takeaways |

## Domain Focus

| Domain | Optimized For |
|--------|---------------|
| `general` | All-purpose documents |
| `legal` | Contracts, terms, legal documents |
| `finance` | Financial reports, statements |
| `academic` | Research papers, studies |

## Cost Tracking

DeepSeek pricing (as of 2024):
- **Input**: $0.14 per 1M tokens
- **Output**: $0.28 per 1M tokens

Example costs:
- 10-page PDF (~5,000 tokens): ~$0.0007
- 50-page PDF (~25,000 tokens): ~$0.0035
- 100-page PDF (~50,000 tokens): ~$0.007

## Advanced Features

### Map-Reduce for Long Documents

For documents > 50,000 characters:

```typescript
import { createDeepSeekLLM, summarizeDocuments } from '@/lib/langchain';
import { loadPDFByPages } from '@/lib/langchain';

const llm = createDeepSeekLLM();
const documents = await loadPDFByPages(pdfFile);
const summary = await summarizeDocuments(documents, llm, 'detailed');
```

### Streaming (Coming Soon)

```typescript
// Future feature
const stream = await processDocumentWithLangChainStream({
  text,
  summaryType: 'medium',
  onChunk: (chunk) => console.log(chunk),
});
```

## Troubleshooting

### LangChain Not Working

1. Check API key is set: `echo $VITE_DEEPSEEK_API_KEY`
2. Verify feature flag: `VITE_USE_LANGCHAIN=true`
3. Check browser console for errors
4. Fallback to direct API should happen automatically

### Database Errors

If you see errors about missing columns:

```sql
-- Check if migration was applied
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'summaries' 
AND column_name IN ('chunk_count', 'langchain_metadata', 'processing_method');
```

### Import Errors

If you see module not found errors:

```bash
# Reinstall dependencies
npm install --legacy-peer-deps
```

## Performance

### Benchmarks

| Document Size | Processing Time | Cost |
|---------------|-----------------|------|
| 5 pages | ~3-5 seconds | $0.0005 |
| 20 pages | ~8-12 seconds | $0.002 |
| 50 pages | ~15-25 seconds | $0.005 |
| 100 pages | ~30-45 seconds | $0.01 |

### Optimization Tips

1. **Use appropriate summary type** - Don't use `detailed` for short documents
2. **Domain-specific splitting** - Improves context preservation
3. **Batch processing** - Process multiple PDFs in parallel
4. **Cache results** - Reuse summaries when possible

## Development

### Running Tests

```bash
# Unit tests
npm test -- langchainService.test.ts

# Integration tests
npm test -- langchain-integration.test.ts
```

### Debugging

Enable verbose logging:

```typescript
import { createDeepSeekLLM } from '@/lib/langchain';

const llm = createDeepSeekLLM();
llm.verbose = true; // Enable LangChain logging
```

## Future Enhancements

- [ ] Vector store integration (Pinecone/Chroma)
- [ ] RAG (Retrieval-Augmented Generation)
- [ ] Streaming responses
- [ ] Multi-document summarization
- [ ] Custom prompt templates
- [ ] Embeddings for semantic search

## Support

For issues or questions:
1. Check the [LangChain.js documentation](https://js.langchain.com/)
2. Review the implementation plan in `docs/langchain.md`
3. Check browser console for detailed error messages

## License

Same as parent project.
