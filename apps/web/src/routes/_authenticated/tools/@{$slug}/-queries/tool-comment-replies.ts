import type { GetToolCommentRepliesParams } from "@workspace/shared/schemas/tools/get-tool-comment-replies";

import { infiniteQueryOptions, useInfiniteQuery } from "@tanstack/react-query";

import { getToolCommentReplies } from "@/services/tools/get-tool-comment-replies";

import { toolCommentsQueryOptions } from "./tool-comments";

export const toolCommentRepliesQueryOptions = (
  params: GetToolCommentRepliesParams,
) => {
  return infiniteQueryOptions({
    initialPageParam: "",
    queryFn: ({ pageParam }) =>
      getToolCommentReplies(params, { cursor: pageParam }),
    queryKey: [
      ...toolCommentsQueryOptions({ slug: params.slug }).queryKey,
      params.commentId,
      "replies",
    ],
    // eslint-disable-next-line perfectionist/sort-objects
    getNextPageParam: (lastPage) => lastPage.data.nextCursor,
  });
};

export const useToolCommentReplies = (
  params: GetToolCommentRepliesParams,
  enabled: boolean,
) => {
  return useInfiniteQuery({
    ...toolCommentRepliesQueryOptions(params),
    enabled,
    select: (data) => data.pages.flatMap((page) => page.data.replies),
  });
};
