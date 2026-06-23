import { z } from "zod";

import { defaultResponse } from "@/schemas/default-response.js";
import { objectIdSchema } from "@/schemas/object-id.js";

import { imageSchema } from "../image.js";

export const getUsersLeaderboardQueryStringSchema = z.object({
  cursor: z.string().optional(),
  limit: z.preprocess((value) => {
    const limit = typeof value === "string" ? Number(value) : value;
    if (typeof limit !== "number" || Number.isNaN(limit)) return;
    return Math.min(Math.max(Math.round(limit), 1), 100);
  }, z.number().optional()),
});

export type GetUsersLeaderboardQueryString = z.infer<
  typeof getUsersLeaderboardQueryStringSchema
>;

export const getUsersLeaderboardResponseSchemas = {
  200: z.object({
    data: z.object({
      leaderboard: z.array(
        z.object({
          country: z.string().optional(),
          gender: z
            .enum(["male", "female", "nonBinary", "other", "preferNotToSay"])
            .optional(),
          image: imageSchema.optional(),
          joinedAt: z.iso.datetime(),
          name: z.string(),
          rank: z.int(),
          toolsAdded: z.int(),
          userId: objectIdSchema,
          username: z.string(),
        }),
      ),
      nextCursor: z.string().optional(),
    }),
    message: z.string(),
    success: z.boolean(),
  }),
  default: defaultResponse,
};
