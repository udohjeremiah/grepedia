const trimTrailingSlash = (value: string) => {
  let end = value.length;
  while (end > 0 && value.codePointAt(end - 1) === 47) end--;
  return value.slice(0, end);
};

/**
 * Normalizes a URL for duplicate comparisons.
 * - Lowercases hostname
 * - Strips "www."
 * - Drops query + hash
 * - Removes trailing slashes
 * - Forces https protocol for comparisons
 */
export const normalizeUrl = (value: string) => {
  try {
    const url = new URL(value.trim());
    const hostname = url.hostname.replace(/^www\./i, "").toLowerCase();
    const trimmedPathname = trimTrailingSlash(url.pathname);
    const normalizedPath = trimmedPathname === "/" ? "" : trimmedPathname;
    return `https://${hostname}${normalizedPath}`;
  } catch {
    return;
  }
};
