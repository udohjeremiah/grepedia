type ExternalUrl = {
  platform: string;
  url: string;
};

type ToolInput = {
  categories: string[];
  externalUrls?: ExternalUrl[];
  tags: string[];
};

const sortStrings = (values: string[]) => {
  return values
    .map((value) => value.trim())
    .toSorted((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
};

const sortExternalUrls = (values: ExternalUrl[]) => {
  const normalized = values.map((value) => ({
    ...value,
    platform: value.platform.trim(),
    url: value.url.trim(),
  }));

  return normalized.toSorted((a, b) => {
    const platform = a.platform.localeCompare(b.platform, undefined, {
      sensitivity: "base",
    });
    if (platform !== 0) return platform;
    return a.url.localeCompare(b.url, undefined, { sensitivity: "base" });
  });
};

/**
 * Normalizes tool input for consistent storage and comparisons.
 * Trims and sorts categories and tags, and trims + sorts external URLs by
 * platform then URL (case-insensitive).
 */
export const normalizeToolInput = <T extends ToolInput>(input: T): T => {
  return {
    ...input,
    categories: sortStrings(input.categories),
    externalUrls: input.externalUrls
      ? sortExternalUrls(input.externalUrls)
      : input.externalUrls,
    tags: sortStrings(input.tags),
  };
};
