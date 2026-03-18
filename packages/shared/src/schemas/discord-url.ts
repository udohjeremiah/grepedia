import { z } from "zod";

export const discordUrlSchema = z
  .url()
  .refine(
    (value) =>
      /^https:\/\/(www\.)?(discord\.com|ptb\.discord\.com|canary\.discord\.com|discord\.gg)\//i.test(
        value,
      ),
    {
      error: "Must be a valid Discord URL",
    },
  );
