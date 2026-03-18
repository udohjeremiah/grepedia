export function parseExternalUrl(url: string) {
  try {
    const parsedUrl = new URL(url.trim());
    return {
      platform: parsedUrl.hostname.replace(/^www\./, ""),
      url: parsedUrl.toString(),
    };
  } catch {
    return;
  }
}
