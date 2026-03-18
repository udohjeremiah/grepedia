import { z } from "zod";

const svgSchema = z
  .string()
  .trim()
  .refine(
    (value) =>
      value.startsWith("<svg") || value.startsWith("data:image/svg+xml"),
    { error: "Image must be a URL or an SVG string" },
  );

export const imageSchema = z.union([z.url(), svgSchema]);
