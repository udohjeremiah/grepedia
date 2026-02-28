const formatter = new Intl.NumberFormat("en", {
  compactDisplay: "short",
  maximumFractionDigits: 1,
  notation: "compact",
});

export function formatCompactNumber(value: number) {
  return formatter.format(value);
}
