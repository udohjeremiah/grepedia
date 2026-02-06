export function getInitials(name: string) {
  if (!name) return "";

  const parts = name.trim().split(/\s+/).filter(Boolean);

  const first = parts.at(0);
  const last = parts.at(-1);

  if (!first) return "";

  if (!last || parts.length === 1) {
    return first.slice(0, 2).toUpperCase();
  }

  return (first[0]! + last[0]).toUpperCase();
}
