import multiavatar from "@multiavatar/multiavatar";

export function getAvatar(seed: string) {
  const svgString = multiavatar(seed);
  const encoded = encodeURIComponent(svgString);
  return `data:image/svg+xml,${encoded}`;
}
