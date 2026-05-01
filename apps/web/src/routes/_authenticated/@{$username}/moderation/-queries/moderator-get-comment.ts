import { queryOptions, useQuery } from "@tanstack/react-query";
import { ModeratorGetCommentQuery } from "@workspace/shared/schemas/moderation/moderator-get-comment";

import { moderatorGetComment } from "@/services/moderation/moderator-get-comment";

export const moderatorGetCommentQueryOptions = (
  params: ModeratorGetCommentQuery,
) => {
  return queryOptions({
    queryFn: () => moderatorGetComment(params.commentId),
    queryKey: ["moderation", "comment", params.commentId],
  });
};

export function useModeratorGetComment(params: ModeratorGetCommentQuery) {
  return useQuery({
    ...moderatorGetCommentQueryOptions(params),
    enabled: false,
    select: (data) => data.data.comment,
  });
}
