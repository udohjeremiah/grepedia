import { z } from "zod";

import { defaultResponse } from "@/schemas/default-response.js";
import { objectIdSchema } from "@/schemas/object-id.js";
import { slugSchema } from "@/schemas/slug.js";
import { officialUrlSchema, publicUrlSchema } from "@/schemas/url-policy.js";

export const addToolBodySchema = z.object({
  categories: z
    .array(
      z
        .string()
        .min(1, "Category cannot be empty")
        .max(50, "Category too long"),
    )
    .min(1, "Please provide at least 1 category")
    .max(4, "You can add up to 4 categories"),
  externalUrls: z
    .array(publicUrlSchema)
    .max(4, "You can add up to 4 external URLs")
    .optional(),
  longDescription: z
    .string()
    .min(1200, "Please provide at least 1200 characters")
    .max(10_000, "Please provide no more than 10000 characters"),
  name: z
    .string()
    .min(2, "Please provide at least 2 characters")
    .max(100, "Please provide no more than 100 characters"),
  officialUrl: officialUrlSchema,
  releasedAt: z.iso.datetime().optional(),
  shortDescription: z
    .string()
    .min(48, "Please provide at least 48 characters")
    .max(240, "Please provide no more than 240 characters"),
  tags: z
    .array(z.string().min(1, "Tag cannot be empty").max(30, "Tag too long"))
    .min(1, "Please provide at least 1 tag")
    .max(8, "You can add up to 8 tags"),
});

export type AddToolBody = z.infer<typeof addToolBodySchema>;

export const addToolResponseSchemas = {
  201: z.object({
    data: z.object({
      addedAt: z.iso.datetime(),
      toolId: objectIdSchema,
      toolSlug: slugSchema,
    }),
    message: z.string(),
    success: z.boolean(),
  }),
  default: defaultResponse,
};
