import type { InfiniteData } from "@tanstack/react-query";
import type { SetToolCommentReactionBody } from "@workspace/shared/schemas/tools/set-tool-comment-reaction";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { getToolComments } from "@/services/tools/get-tool-comments";
import { setToolCommentReaction } from "@/services/tools/set-tool-comment-reaction";

import { userQueryOptions } from "../../../@{$username}/-queries/user";
import { toolCommentsQueryOptions } from "./tool-comments";

type GetToolCommentsResult = Awaited<ReturnType<typeof getToolComments>>;

type MutationVariables = {
  commentId: string;
  value: SetToolCommentReactionBody["value"];
};

type ToolCommentItem = GetToolCommentsResult["data"]["comments"][number];
type ToolCommentsInfiniteData = InfiniteData<GetToolCommentsResult>;

export function useToolSetCommentReaction(slug: string, userId: string) {
  const queryClient = useQueryClient();
  const commentsKey = toolCommentsQueryOptions({ slug }).queryKey;
  const userKey = userQueryOptions(userId).queryKey;

  return useMutation({
    mutationFn: ({ commentId, value }: MutationVariables) =>
      setToolCommentReaction({ body: { value }, params: { commentId, slug } }),
    mutationKey: commentsKey,
    onError: (_error, _variables, context) => {
      if (!context) return;
      queryClient.setQueryData(context.commentsKey, context.previousComments);
    },
    onMutate: async ({ commentId, value }: MutationVariables) => {
      await queryClient.cancelQueries({ queryKey: commentsKey });

      const previousComments = queryClient.getQueryData(commentsKey);

      queryClient.setQueryData(commentsKey, (cached) =>
        updateCommentsReaction(cached, commentId, value),
      );

      return { commentsKey, previousComments };
    },
    onSettled: async () => {
      queryClient.invalidateQueries({ queryKey: userKey });
    },
  });
}

function updateCommentReaction(
  comment: ToolCommentItem,
  commentId: string,
  value: -1 | 1,
): ToolCommentItem {
  if (comment._id !== commentId) return comment;

  const previousReaction = comment.viewerReaction;

  let nextReaction: -1 | 1 | undefined = value;
  let upvotes = comment.stats.upvotes;
  let downvotes = comment.stats.downvotes;

  if (previousReaction === value) {
    nextReaction = undefined;
    if (value === 1) upvotes = Math.max(0, upvotes - 1);
    if (value === -1) downvotes = Math.max(0, downvotes - 1);
  } else if (previousReaction === 1 && value === -1) {
    upvotes = Math.max(0, upvotes - 1);
    downvotes += 1;
  } else if (previousReaction === -1 && value === 1) {
    downvotes = Math.max(0, downvotes - 1);
    upvotes += 1;
  } else if (value === 1) {
    upvotes += 1;
  } else {
    downvotes += 1;
  }

  return {
    ...comment,
    stats: { ...comment.stats, downvotes, upvotes },
    viewerReaction: nextReaction,
  };
}

function updateCommentsReaction(
  cached: ToolCommentsInfiniteData | undefined,
  commentId: string,
  value: -1 | 1,
): ToolCommentsInfiniteData | undefined {
  if (!cached?.pages) return cached;

  const nextPages = cached.pages.map((page) => ({
    ...page,
    data: {
      ...page.data,
      comments: page.data.comments.map((comment) =>
        updateCommentReaction(comment, commentId, value),
      ),
    },
  }));

  return { ...cached, pages: nextPages };
}
