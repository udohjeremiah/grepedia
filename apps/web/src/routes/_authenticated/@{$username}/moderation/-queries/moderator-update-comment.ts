import { useMutation } from "@tanstack/react-query";

import { moderatorUpdateComment } from "@/services/moderation/moderator-update-comment";

import { moderatorGetCommentQueryOptions } from "./moderator-get-comment";

export function useModeratorUpdateComment(commentId: string) {
  return useMutation({
    mutationFn: moderatorUpdateComment,
    mutationKey: moderatorGetCommentQueryOptions({ commentId }).queryKey,
  });
}
