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
          image: imageSchema.optional(),
          joinedAt: z.iso.datetime(),
          name: z.string(),
          rank: z.int(),
          role: z.enum(["member", "contributor", "moderator"]),
          toolsAdded: z.int(),
          toolsOwned: z.int(),
          toolsUpdated: z.int(),
          userId: objectIdSchema,
          username: z.string(),
        }),
      ),
      nextCursor: z.string().optional(),
      totals: z.object({
        totalAdded: z.int(),
        totalOwned: z.int(),
        totalUpdated: z.int(),
      }),
    }),
    message: z.string(),
    success: z.boolean(),
  }),
  default: defaultResponse,
};
