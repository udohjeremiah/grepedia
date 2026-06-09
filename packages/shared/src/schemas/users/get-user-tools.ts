import { z } from "zod";

import { defaultResponse } from "@/schemas/default-response.js";
import { objectIdSchema } from "@/schemas/object-id.js";
import { slugSchema } from "@/schemas/slug.js";

export const getUserToolsParamsSchema = z.object({
  userId: objectIdSchema,
});

export type GetUserToolsParams = z.infer<typeof getUserToolsParamsSchema>;

export const getUserToolsResponseSchemas = {
  200: z.object({
    data: z.object({
      stats: z.object({
        added: z.int(),
        commented: z.int(),
        downvoted: z.int(),
        updated: z.int(),
        upvoted: z.int(),
      }),
      tools: z.array(
        z.object({
          _id: objectIdSchema,
          addedAt: z.iso.datetime(),
          categories: z.array(z.string()),
          name: z.string(),
          officialUrl: z.url(),
          relations: z.object({
            added: z.boolean(),
            commented: z.boolean(),
            downvoted: z.boolean(),
            updated: z.boolean(),
            upvoted: z.boolean(),
          }),
          shortDescription: z.string(),
          slug: slugSchema,
          stats: z.object({
            comments: z.int(),
            downvotes: z.int(),
            upvotes: z.int(),
          }),
          updatedAt: z.iso.datetime().optional(),
        }),
      ),
    }),
    message: z.string(),
    success: z.boolean(),
  }),
  default: defaultResponse,
};
