import { z } from "zod";

import { defaultResponse } from "../default-response.js";
import { imageSchema } from "../image.js";
import { objectIdSchema } from "../object-id.js";

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
    .array(
      z.object({
        platform: z
          .string()
          .min(1, "URL platform cannot be empty")
          .max(50, "URL platform too long"),
        url: z.url(),
      }),
    )
    .max(4, "You can add up to 4 external URLs")
    .optional(),
  image: imageSchema.optional(),
  longDescription: z
    .string()
    .min(20, "Please provide at least 20 characters")
    .max(5000, "Please provide no more than 5000 characters"),
  name: z
    .string()
    .min(2, "Please provide at least 2 characters")
    .max(100, "Please provide no more than 100 characters"),
  officialUrl: z.url(),
  releasedAt: z.iso.datetime().optional(),
  shortDescription: z
    .string()
    .min(8, "Please provide at least 8 characters")
    .max(160, "Please provide no more than 160 characters"),
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
      toolSlug: z.string(),
    }),
    message: z.string(),
    success: z.boolean(),
  }),
  default: defaultResponse,
};
