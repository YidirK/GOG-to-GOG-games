/**
 * Utility functions for extracting and manipulating GOG game slugs and titles.
 */

export function extractSlugFromUrl(urlStr: string): string | null {
  try {
    const url = new URL(urlStr);
    const match = url.pathname.match(/\/game\/([^/?#]+)/i);
    if (match && match[1]) {
      // Decode URI component and trim trailing/leading spaces or slashes
      return decodeURIComponent(match[1]).trim().toLowerCase();
    }
  } catch {
    // If URL parsing fails, fallback to regex
    const match = urlStr.match(/\/game\/([^/?#]+)/i);
    if (match && match[1]) {
      return decodeURIComponent(match[1]).trim().toLowerCase();
    }
  }
  return null;
}

const EDITION_SUFFIX_PATTERNS = [
  /[-_]complete[-_]edition$/i,
  /[-_]goty[-_]edition$/i,
  /[-_]goty$/i,
  /[-_]game[-_]of[-_]the[-_]year[-_]edition$/i,
  /[-_]deluxe[-_]edition$/i,
  /[-_]ultimate[-_]edition$/i,
  /[-_]gold[-_]edition$/i,
  /[-_]remastered$/i,
  /[-_]definitive[-_]edition$/i,
  /[-_]enhanced[-_]edition$/i,
  /[-_]special[-_]edition$/i,
  /[-_]anniversary[-_]edition$/i,
  /[-_]standard[-_]edition$/i,
  /[-_]director[-_]?s[-_]?cut$/i,
];

/**
 * Returns candidate slug variations to try if direct slug lookup fails.
 */
export function getSlugCandidates(rawSlug: string): string[] {
  const candidates = new Set<string>();

  const base = rawSlug.trim().toLowerCase();
  candidates.add(base);

  // Variant 1: Swap underscores and hyphens
  if (base.includes('_')) {
    candidates.add(base.replace(/_/g, '-'));
  }
  if (base.includes('-')) {
    candidates.add(base.replace(/-/g, '_'));
  }

  // Variant 2: Strip common edition suffixes
  for (const slug of Array.from(candidates)) {
    for (const pattern of EDITION_SUFFIX_PATTERNS) {
      if (pattern.test(slug)) {
        const stripped = slug.replace(pattern, '');
        if (stripped.length > 2) {
          candidates.add(stripped);
          if (stripped.includes('_')) candidates.add(stripped.replace(/_/g, '-'));
          if (stripped.includes('-')) candidates.add(stripped.replace(/-/g, '_'));
        }
      }
    }
  }

  return Array.from(candidates);
}

/**
 * Clean page title or DOM game title for text search queries.
 */
export function cleanTitleForSearch(rawTitle: string): string {
  return rawTitle
    .replace(/Buy\s+/i, '')
    .replace(/\s*on\s+GOG\.com/i, '')
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
