const COMMENT_PREFIX = '#';

export function sanitizeList(text) {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith(COMMENT_PREFIX));
}

export function scoreDomain(domain) {
  const length = domain.length;
  const hyphenCount = (domain.match(/-/g) || []).length;
  const digitCount = (domain.match(/\d/g) || []).length;
  const vowelCount = (domain.match(/[aeiouáéíóúàâêîôûãõ]/gi) || []).length;
  const consonantCount = (domain.match(/[bcdfghjklmnpqrstvwxyz]/gi) || []).length;
  const readableRatio = consonantCount === 0 ? 0 : vowelCount / consonantCount;

  const score =
    100 - length * 1.5 - hyphenCount * 5 - digitCount * 3 + readableRatio * 12 + vowelCount * 0.8;

  return {
    length,
    hyphenCount,
    digitCount,
    vowelCount,
    consonantCount,
    readableRatio,
    score: Math.max(score, 0)
  };
}

export function filterDomains(domains, filters) {
  const {
    query,
    mode,
    regex,
    minLength,
    maxLength,
    maxHyphens,
    allowNumbers,
    minReadable,
    startsWith,
    endsWith,
    sortBy,
    onlyNoHyphen,
    onlyLetters
  } = filters;

  const normalizedQuery = query.trim().toLowerCase();
  const startsWithQuery = startsWith.trim().toLowerCase();
  const endsWithQuery = endsWith.trim().toLowerCase();
  const compiledRegex = regex ? safeCompile(regex) : null;

  const filtered = [];

  for (const domain of domains) {
    const normalized = domain.toLowerCase();
    const metrics = scoreDomain(normalized);

    if (minLength && metrics.length < Number(minLength)) continue;
    if (maxLength && metrics.length > Number(maxLength)) continue;
    if (maxHyphens !== '' && metrics.hyphenCount > Number(maxHyphens)) continue;
    if (onlyNoHyphen && metrics.hyphenCount > 0) continue;
    if (onlyLetters && /[^a-z]/i.test(normalized)) continue;
    if (!allowNumbers && metrics.digitCount > 0) continue;
    if (minReadable && metrics.readableRatio < Number(minReadable)) continue;

    if (startsWithQuery && !normalized.startsWith(startsWithQuery)) continue;
    if (endsWithQuery && !normalized.endsWith(endsWithQuery)) continue;

    if (normalizedQuery) {
      if (mode === 'starts') {
        if (!normalized.startsWith(normalizedQuery)) continue;
      } else if (mode === 'ends') {
        if (!normalized.endsWith(normalizedQuery)) continue;
      } else if (mode === 'regex') {
        if (!compiledRegex?.test(domain)) continue;
      } else if (!normalized.includes(normalizedQuery)) {
        continue;
      }
    }

    if (compiledRegex && mode !== 'regex' && !compiledRegex.test(domain)) continue;

    filtered.push({ domain, ...metrics });
  }

  const sorted = sortResults(filtered, sortBy);

  return sorted;
}

function safeCompile(pattern) {
  try {
    return new RegExp(pattern, 'i');
  } catch (err) {
    return null;
  }
}

function sortResults(results, sortBy) {
  const copy = [...results];

  switch (sortBy) {
    case 'length-asc':
      copy.sort((a, b) => a.length - b.length);
      break;
    case 'length-desc':
      copy.sort((a, b) => b.length - a.length);
      break;
    case 'hyphen':
      copy.sort((a, b) => a.hyphenCount - b.hyphenCount || a.length - b.length);
      break;
    case 'readable':
      copy.sort((a, b) => b.readableRatio - a.readableRatio || a.length - b.length);
      break;
    case 'score':
    default:
      copy.sort((a, b) => b.score - a.score || a.length - b.length);
      break;
  }

  return copy;
}
