import { z } from "zod";

import { defaultResponse } from "../default-response.js";
import { objectIdSchema } from "../object-id-schema.js";

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
          image: z.url().optional(),
          joinedAt: z.iso.datetime(),
          name: z.string(),
          rank: z.int().min(1),
          role: z.enum(["member", "contributor", "moderator"]),
          toolsAdded: z.int().min(0),
          toolsOwned: z.int().min(0),
          toolsUpdated: z.int().min(0),
          userId: objectIdSchema,
          username: z.string(),
        }),
      ),
      nextCursor: z.string().optional(),
      totals: z.object({
        totalAdded: z.int().min(0),
        totalOwned: z.int().min(0),
        totalUpdated: z.int().min(0),
      }),
    }),
    message: z.string(),
    success: z.boolean(),
  }),
  default: defaultResponse,
};
