import type { ModeratorReviewCaseBody } from "@workspace/shared/schemas/moderation/moderator-review-case";

import {
  moderatorReviewCaseBodySchema,
  moderatorReviewCaseResponseSchemas,
} from "@workspace/shared/schemas/moderation/moderator-review-case";

import { apiClient } from "@/lib/api-client";

export async function moderatorReviewCase(body: ModeratorReviewCaseBody) {
  const parsedBody = moderatorReviewCaseBodySchema.parse(body);
  const response = await apiClient.post(`/moderation/cases/review`, parsedBody);
  return moderatorReviewCaseResponseSchemas[200].parse(response.data);
}
