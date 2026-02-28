import {
  type SetToolCommentReactionBody,
  setToolCommentReactionBodySchema,
  type SetToolCommentReactionParams,
  setToolCommentReactionParamsSchema,
  setToolCommentReactionResponseSchemas,
} from "@workspace/shared/schemas/tools/set-tool-comment-reaction";

import { apiClient } from "@/lib/api-client";

type SetToolCommentReaction = {
  body: SetToolCommentReactionBody;
  params: SetToolCommentReactionParams;
};

export async function setToolCommentReaction({
  body,
  params,
}: SetToolCommentReaction) {
  const { commentId, slug } = setToolCommentReactionParamsSchema.parse(params);
  const parsedBody = setToolCommentReactionBodySchema.parse(body);
  const response = await apiClient.post(
    `/tools/${slug}/comments/${commentId}/reaction`,
    parsedBody,
  );
  return setToolCommentReactionResponseSchemas[200].parse(response.data);
}
