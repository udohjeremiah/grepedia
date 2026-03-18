import type { InfiniteData } from "@tanstack/react-query";
import type { SetToolCommentReactionBody } from "@workspace/shared/schemas/tools/comments/set-tool-comment-reaction";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { getToolCommentReplies } from "@/services/tools/get-tool-comment-replies";
import { getToolComments } from "@/services/tools/get-tool-comments";
import { setToolCommentReaction } from "@/services/tools/set-tool-comment-reaction";

import { toolCommentRepliesQueryOptions } from "./tool-comment-replies";
import { toolCommentsQueryOptions } from "./tool-comments";

type GetToolCommentRepliesResult = Awaited<
  ReturnType<typeof getToolCommentReplies>
>;

type GetToolCommentsResult = Awaited<ReturnType<typeof getToolComments>>;

type MutationVariables = {
  commentId: string;
  value: SetToolCommentReactionBody["value"];
};

type ReactionContext = {
  previousBottomComments: ToolCommentsInfiniteData | undefined;
  previousNewestComments: ToolCommentsInfiniteData | undefined;
  previousReplies: ToolRepliesInfiniteData | undefined;
  previousTopComments: ToolCommentsInfiniteData | undefined;
  repliesKey?: readonly unknown[];
};

type ToolCommentItem = GetToolCommentsResult["data"]["comments"][number];
type ToolCommentsInfiniteData = InfiniteData<GetToolCommentsResult>;
type ToolRepliesInfiniteData = InfiniteData<GetToolCommentRepliesResult>;

export function useToolSetCommentReaction(
  slug: string,
  parentCommentId?: string,
) {
  const queryClient = useQueryClient();
  const params = { slug };

  const topKey = toolCommentsQueryOptions({
    params,
    queryString: { sort: "top" },
  }).queryKey;
  const bottomKey = toolCommentsQueryOptions({
    params,
    queryString: { sort: "bottom" },
  }).queryKey;
  const newestKey = toolCommentsQueryOptions({
    params,
    queryString: { sort: "newest" },
  }).queryKey;
  const repliesKey = parentCommentId
    ? toolCommentRepliesQueryOptions({
        commentId: parentCommentId,
        slug,
      }).queryKey
    : undefined;

  return useMutation<unknown, unknown, MutationVariables, ReactionContext>({
    mutationFn: ({ commentId, value }: MutationVariables) =>
      setToolCommentReaction({ body: { value }, params: { commentId, slug } }),
    mutationKey: ["tools", slug, "comment-reactions"],
    onError: (_error, _variables, context) => {
      if (!context) return;
      queryClient.setQueryData(topKey, context.previousTopComments);
      queryClient.setQueryData(bottomKey, context.previousBottomComments);
      queryClient.setQueryData(newestKey, context.previousNewestComments);
      if (context.repliesKey) {
        queryClient.setQueryData(context.repliesKey, context.previousReplies);
      }
    },
    onMutate: async ({ commentId, value }: MutationVariables) => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: topKey }),
        queryClient.cancelQueries({ queryKey: bottomKey }),
        queryClient.cancelQueries({ queryKey: newestKey }),
        ...(repliesKey
          ? [queryClient.cancelQueries({ queryKey: repliesKey })]
          : []),
      ]);

      const previousTopComments = queryClient.getQueryData(topKey);
      const previousBottomComments = queryClient.getQueryData(bottomKey);
      const previousNewestComments = queryClient.getQueryData(newestKey);
      const previousReplies = repliesKey
        ? queryClient.getQueryData<ToolRepliesInfiniteData | undefined>(
            repliesKey,
          )
        : undefined;

      const update = (cached: ToolCommentsInfiniteData | undefined) =>
        updateCommentsReaction(cached, commentId, value);
      const updateReplies = (cached: ToolRepliesInfiniteData | undefined) =>
        updateRepliesReaction(cached, commentId, value);

      queryClient.setQueryData(topKey, update);
      queryClient.setQueryData(bottomKey, update);
      queryClient.setQueryData(newestKey, update);
      if (repliesKey) {
        queryClient.setQueryData(repliesKey, updateReplies);
      }

      return {
        previousBottomComments,
        previousNewestComments,
        previousReplies,
        previousTopComments,
        repliesKey,
      };
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

function updateRepliesReaction(
  cached: ToolRepliesInfiniteData | undefined,
  commentId: string,
  value: -1 | 1,
): ToolRepliesInfiniteData | undefined {
  if (!cached?.pages) return cached;

  const nextPages = cached.pages.map((page) => ({
    ...page,
    data: {
      ...page.data,
      replies: page.data.replies.map((comment) =>
        updateCommentReaction(comment, commentId, value),
      ),
    },
  }));

  return { ...cached, pages: nextPages };
}
