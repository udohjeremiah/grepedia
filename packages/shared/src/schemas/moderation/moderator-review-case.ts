import { z } from "zod";

import { defaultResponse } from "../default-response.js";
import { objectIdSchema } from "../object-id.js";
import { moderationCaseStatusSchema } from "./moderation-case.js";

export const moderatorReviewCaseBodySchema = z
  .object({
    caseId: objectIdSchema,
    decision: z.enum(["under_review", "approve", "reject"]),
    decisionSummary: z.string().min(20).max(1000).optional(),
    decisionTitle: z.string().min(8).max(50).optional(),
  })
  .superRefine(({ decision, decisionSummary, decisionTitle }, context) => {
    if (["approve", "reject"].includes(decision)) {
      if (!decisionTitle || !decisionTitle.trim()) {
        context.addIssue({
          code: "custom",
          message: "Decision title is required when approving or rejecting.",
          path: ["decisionTitle"],
        });
      }

      if (!decisionSummary || !decisionSummary.trim()) {
        context.addIssue({
          code: "custom",
          message: "Decision summary is required when approving or rejecting.",
          path: ["decisionSummary"],
        });
      }
    }
  });

export type ModeratorReviewCaseBody = z.infer<
  typeof moderatorReviewCaseBodySchema
>;

export const moderatorReviewCaseResponseSchemas = {
  200: z.object({
    data: z.object({
      caseId: objectIdSchema,
      status: moderationCaseStatusSchema,
    }),
    message: z.string(),
    success: z.boolean(),
  }),
  default: defaultResponse,
};
