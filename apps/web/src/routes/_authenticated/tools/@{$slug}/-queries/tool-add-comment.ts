import type { InfiniteData } from "@tanstack/react-query";
import type { AddToolCommentParams } from "@workspace/shared/schemas/tools/add-tool-comment";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { addToolComment } from "@/services/tools/add-tool-comment";
import { getTool } from "@/services/tools/get-tool";
import { getToolComments } from "@/services/tools/get-tool-comments";

import { toolQueryOptions } from "./tool";
import { toolCommentsQueryOptions } from "./tool-comments";

type AddCommentContext = {
  commentsKey: readonly unknown[];
  previousComments: ToolCommentsInfiniteData | undefined;
  previousTool: GetToolResult | undefined;
  toolKey: readonly unknown[];
};

type AddCommentVariables = {
  content: string;
  parentCommentId?: string;
  user: {
    _id: string;
    image?: string;
    name: string;
    username: string;
  };
};

type AddToolCommentResult = Awaited<ReturnType<typeof addToolComment>>;
type GetToolCommentsResult = Awaited<ReturnType<typeof getToolComments>>;
type GetToolResult = Awaited<ReturnType<typeof getTool>>;
type ToolCommentItem = GetToolCommentsResult["data"]["comments"][number];
type ToolCommentsInfiniteData = InfiniteData<GetToolCommentsResult>;

export function useToolAddComment(slug: string) {
  const queryClient = useQueryClient();
  const params: AddToolCommentParams = { slug };
  const toolKey = toolQueryOptions(params).queryKey;
  const commentsKey = toolCommentsQueryOptions(params).queryKey;

  return useMutation<
    AddToolCommentResult,
    unknown,
    AddCommentVariables,
    AddCommentContext
  >({
    mutationFn: ({ content, parentCommentId }: AddCommentVariables) =>
      addToolComment({ body: { content, parentCommentId }, params }),
    mutationKey: commentsKey,
    onError: (_error, _variables, context) => {
      if (!context) return;
      queryClient.setQueryData(context.toolKey, context.previousTool);
      queryClient.setQueryData(context.commentsKey, context.previousComments);
    },
    onMutate: async (variables) => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: toolKey }),
        queryClient.cancelQueries({ queryKey: commentsKey }),
      ]);

      const previousTool = queryClient.getQueryData(toolKey);
      const previousComments = queryClient.getQueryData(commentsKey);

      const now = new Date().toISOString();
      const optimisticId = `temp_${Date.now()}`;

      queryClient.setQueryData(toolKey, (cached) => {
        if (!cached) return cached;

        return {
          ...cached,
          data: {
            ...cached.data,
            tool: {
              ...cached.data.tool,
              relations: {
                ...cached.data.tool.relations,
                commented: true,
              },
              stats: {
                ...cached.data.tool.stats,
                comments: cached.data.tool.stats.comments + 1,
              },
            },
          },
        };
      });

      queryClient.setQueryData(
        commentsKey,
        (cached: ToolCommentsInfiniteData | undefined) => {
          const firstPage = cached?.pages[0];
          if (!cached || !firstPage) return cached;

          const nextPages = [...cached.pages];
          if (variables.parentCommentId) {
            nextPages[0] = {
              ...firstPage,
              data: {
                ...firstPage.data,
                comments: firstPage.data.comments.map((comment) =>
                  comment._id === variables.parentCommentId
                    ? { ...comment, replyCount: comment.replyCount + 1 }
                    : comment,
                ),
              },
            };
          } else {
            const optimisticComment: ToolCommentItem = {
              _id: optimisticId,
              content: variables.content,
              createdAt: now,
              parentCommentId: undefined,
              replyCount: 0,
              stats: { downvotes: 0, upvotes: 0 },
              updatedAt: now,
              user: variables.user,
              viewerReaction: undefined,
            };

            nextPages[0] = {
              ...firstPage,
              data: {
                ...firstPage.data,
                comments: [optimisticComment, ...firstPage.data.comments],
              },
            };
          }

          return { ...cached, pages: nextPages };
        },
      );

      return { commentsKey, previousComments, previousTool, toolKey };
    },
  });
}
