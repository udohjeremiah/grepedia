import { z } from "zod";

import { defaultResponse } from "../default-response.js";
import { objectIdSchema } from "../object-id.js";

export const moderatorGetUserQuerySchema = z.object({
  username: z.string().min(1),
});

export type ModeratorGetUserQuery = z.infer<typeof moderatorGetUserQuerySchema>;

export const moderatorGetUserResponseSchemas = {
  200: z.object({
    data: z.object({
      user: z.object({
        contributions: z.object({
          toolComments: z.int(),
          toolReactions: z.int(),
          toolsAdded: z.int(),
          toolsOwned: z.int(),
          toolsUpdated: z.int(),
          total: z.int(),
        }),
        id: z.string(),
        role: z.enum(["member", "contributor", "moderator"]),
        status: z.enum(["active", "flagged", "suspended", "deactivated"]),
        trustProfile: z
          .object({
            lastEvaluatedAt: z.iso.datetime(),
            reasons: z.array(z.string()).max(10),
            recommendations: z.object({
              role: z.enum(["member", "contributor", "moderator"]),
              status: z.enum(["active", "flagged", "suspended", "deactivated"]),
            }),
            riskLevel: z.enum(["low", "medium", "high"]),
            roleAtEvaluation: z.enum(["member", "contributor", "moderator"]),
            scores: z.object({
              botRisk: z.number().min(0).max(100),
              trust: z.number().min(0).max(100),
            }),
            signals: z.object({
              accountAgeDays: z.int().min(0),
              duplicateRatioPercent: z.number().min(0).max(100),
              linksInRecentComments: z.int().min(0),
              recentActions1h: z.int().min(0),
              toolComments: z.int().min(0),
              toolsAdded: z.int().min(0),
              toolsUpdated: z.int().min(0),
            }),
            userId: objectIdSchema,
          })
          .optional(),
        username: z.string(),
      }),
    }),
    message: z.string(),
    success: z.boolean(),
  }),
  default: defaultResponse,
};
