import { moderationCaseSchema } from "@workspace/shared/schemas/moderation-case/moderation-case";
import { ObjectId } from "mongodb";
import { z } from "zod";

const resolutionSchema = z
  .object({
    note: z.string().optional(),
    resolvedAt: z.date(),
    resolvedBy: z.instanceof(ObjectId),
  })
  .optional();

const toolClaimCase = moderationCaseSchema.options[0].extend({
  _id: z.instanceof(ObjectId).optional(),
  createdAt: z.date(),
  createdBy: z.instanceof(ObjectId),
  resolution: resolutionSchema,
  toolId: z.instanceof(ObjectId),
  updatedAt: z.date(),
});

const toolUpdateCase = moderationCaseSchema.options[1].extend({
  _id: z.instanceof(ObjectId).optional(),
  createdAt: z.date(),
  createdBy: z.instanceof(ObjectId),
  resolution: resolutionSchema,
  toolId: z.instanceof(ObjectId),
  updatedAt: z.date(),
});

export const moderationCaseWithObjectIdsSchema = z.discriminatedUnion("type", [
  toolClaimCase,
  toolUpdateCase,
]);

export type ModerationCaseWithObjectIds = z.infer<
  typeof moderationCaseWithObjectIdsSchema
>;
