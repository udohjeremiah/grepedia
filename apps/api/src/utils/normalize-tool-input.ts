type ToolInput = {
  categories: string[];
  externalUrls?: string[];
  tags: string[];
};

const normalizeArray = (array: string[]) =>
  array
    .map((v) => v.trim())
    .filter(Boolean)
    .toSorted((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));

const toTitleCase = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

/**
 * Normalizes tool input for consistent storage and comparisons.
 *
 * Rules:
 * - categories: Title Case each word
 * - tags: lowercase all values
 * - externalUrls: trimmed and sorted (case-insensitive)
 * - all arrays are sorted case-insensitively where applicable
 */
export const normalizeToolInput = <T extends ToolInput>(input: T): T => {
  return {
    ...input,
    categories: normalizeArray(input.categories).map((category) =>
      toTitleCase(category),
    ),
    externalUrls: input.externalUrls
      ? normalizeArray(input.externalUrls)
      : undefined,
    tags: normalizeArray(input.tags).map((tag) => tag.toLowerCase()),
  };
};
