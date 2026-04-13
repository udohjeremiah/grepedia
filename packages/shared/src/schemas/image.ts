import { z } from "zod";

export const imageSchema = z
  .string()
  .trim()
  .refine(
    (value) =>
      value.startsWith("<svg") ||
      value.startsWith("data:image/svg+xml") ||
      z.url().safeParse(value).success,
    {
      error:
        "Image must be a valid URL, SVG markup (<svg...>), or an SVG data URI.",
    },
  );
