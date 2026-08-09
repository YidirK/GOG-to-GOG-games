import { getSlugCandidates, cleanTitleForSearch } from './slug';

export interface GameCheckResponse {
  available: boolean;
  targetSlug?: string;
}

const availabilityCache = new Map<string, GameCheckResponse>();

async function checkDirectSlug(slug: string): Promise<boolean> {
  const apiUrl = `https://gog-games.to/api/web/query-game/${slug}`;
  try {
    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    return Boolean(data && data.game_info && (data.files ? data.files.length > 0 : true));
  } catch (err) {
    console.error(`[GOG-to-GOG-games] Error fetching query-game for slug "${slug}":`, err);
    return false;
  }
}

async function searchGameByTitle(cleanTitle: string): Promise<string | null> {
  if (!cleanTitle || cleanTitle.length < 2) return null;

  const searchUrl = `https://gog-games.to/api/web/search?query=${encodeURIComponent(cleanTitle)}`;
  try {
    const response = await fetch(searchUrl, {
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) return null;

    const data = await response.json();
    const items = Array.isArray(data) ? data : (data?.results || data?.items || []);

    if (items.length === 0) return null;

    // Normalization helper
    const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
    const normalizedTargetTitle = norm(cleanTitle);

    // Find best match in search items
    for (const item of items) {
      const itemTitle = item.title || item.name || '';
      const itemSlug = item.slug || (item.url ? item.url.split('/').pop() : '');

      if (!itemSlug) continue;

      if (norm(itemTitle) === normalizedTargetTitle || norm(itemSlug) === normalizedTargetTitle) {
        return itemSlug;
      }
    }

    // Fallback: return the first item's slug if available
    const firstSlug = items[0].slug || (items[0].url ? items[0].url.split('/').pop() : null);
    return firstSlug || null;
  } catch (err) {
    console.error(`[GOG-to-GOG-games] Search API request failed for title "${cleanTitle}":`, err);
    return null;
  }
}

/**
 * Multi-stage lookup to find game on gog-games.to:
 * 1. Direct candidate slugs (exact, underscore/hyphen swap, suffix stripping)
 * 2. Search API query using cleaned title
 */
export async function findGameAvailability(slug: string, rawTitle?: string): Promise<GameCheckResponse> {
  const cacheKey = `${slug}::${rawTitle || ''}`;
  if (availabilityCache.has(cacheKey)) {
    return availabilityCache.get(cacheKey)!;
  }

  // Tier 1 & 2 & 3: Try candidate slugs directly
  const candidates = getSlugCandidates(slug);
  for (const cand of candidates) {
    const isAvailable = await checkDirectSlug(cand);
    if (isAvailable) {
      const result: GameCheckResponse = { available: true, targetSlug: cand };
      availabilityCache.set(cacheKey, result);
      return result;
    }
  }

  // Tier 4: Search API by Title
  if (rawTitle) {
    const cleanedTitle = cleanTitleForSearch(rawTitle);
    const matchedSlug = await searchGameByTitle(cleanedTitle);
    if (matchedSlug) {
      const isAvailable = await checkDirectSlug(matchedSlug);
      if (isAvailable) {
        const result: GameCheckResponse = { available: true, targetSlug: matchedSlug };
        availabilityCache.set(cacheKey, result);
        return result;
      }
    }
  }

  const negativeResult: GameCheckResponse = { available: false };
  availabilityCache.set(cacheKey, negativeResult);
  return negativeResult;
}
