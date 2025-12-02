/**
 * Summary Cache
 * Caches summaries to avoid duplicate API calls
 */

interface CachedSummary {
  summary: string;
  tokensUsed: number;
  cost: number;
  timestamp: number;
  summaryType: string;
  domainFocus: string;
}

// In-memory cache (for client-side)
// In production, consider using IndexedDB or a backend cache
const cache = new Map<string, CachedSummary>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Generate cache key from text and options
 */
function generateCacheKey(
  text: string,
  summaryType: string,
  domainFocus: string
): string {
  // Use first 1000 chars + hash of full text for key
  const textHash = simpleHash(text);
  return `${summaryType}:${domainFocus}:${textHash}`;
}

/**
 * Simple hash function for text
 */
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Get cached summary if available
 */
export function getCachedSummary(
  text: string,
  summaryType: string,
  domainFocus: string
): CachedSummary | null {
  const key = generateCacheKey(text, summaryType, domainFocus);
  const cached = cache.get(key);

  if (!cached) {
    return null;
  }

  // Check if cache is still valid
  const age = Date.now() - cached.timestamp;
  if (age > CACHE_TTL) {
    cache.delete(key);
    return null;
  }

  return cached;
}

/**
 * Store summary in cache
 */
export function setCachedSummary(
  text: string,
  summaryType: string,
  domainFocus: string,
  summary: string,
  tokensUsed: number,
  cost: number
): void {
  const key = generateCacheKey(text, summaryType, domainFocus);
  cache.set(key, {
    summary,
    tokensUsed,
    cost,
    timestamp: Date.now(),
    summaryType,
    domainFocus,
  });
}

/**
 * Clear expired cache entries
 */
export function clearExpiredCache(): void {
  const now = Date.now();
  for (const [key, value] of cache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      cache.delete(key);
    }
  }
}

/**
 * Clear all cache
 */
export function clearCache(): void {
  cache.clear();
}

/**
 * Get cache statistics
 */
export function getCacheStats(): { size: number; entries: number } {
  return {
    size: cache.size,
    entries: Array.from(cache.values()).length,
  };
}

