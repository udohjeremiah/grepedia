import { queryOptions, useQuery } from "@tanstack/react-query";
import { ModeratorGetCommentQueryString } from "@workspace/shared/schemas/moderation/moderator-get-comment";

import { moderatorGetComment } from "@/services/moderation/moderator-get-comment";

export const moderatorGetCommentQueryOptions = (
  queryString: ModeratorGetCommentQueryString,
) => {
  return queryOptions({
    queryFn: () => moderatorGetComment(queryString.commentId),
    queryKey: ["moderation", "comment", queryString.commentId],
  });
};

export function useModeratorGetComment(
  queryString: ModeratorGetCommentQueryString,
) {
  return useQuery({
    ...moderatorGetCommentQueryOptions(queryString),
    enabled: false,
    select: (data) => data.data.comment,
  });
}
