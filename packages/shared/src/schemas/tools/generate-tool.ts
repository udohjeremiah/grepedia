import { z } from "zod";

import { defaultResponse } from "../default-response.js";
import { officialUrlSchema } from "../url-policy.js";

export const generateToolBodySchema = z.object({
  url: officialUrlSchema,
});

export type GenerateToolBody = z.infer<typeof generateToolBodySchema>;

export const generatedToolEntrySchema = z
  .object({
    categories: z.array(z.string()),
    externalUrls: z.array(z.url()),
    longDescription: z.string(),
    name: z.string(),
    officialUrl: z.url(),
    releasedAt: z.iso.datetime(),
    shortDescription: z.string(),
    tags: z.array(z.string()),
  })
  .partial();

export type GenerateToolEntry = z.infer<typeof generatedToolEntrySchema>;

export const generateToolResponseSchemas = {
  200: z.object({
    data: generatedToolEntrySchema,
    message: z.string(),
    success: z.boolean(),
  }),
  default: defaultResponse,
};
