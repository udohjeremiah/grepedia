import type {
  SetToolReactionBody,
  SetToolReactionParams,
} from "@workspace/shared/schemas/tools/reactions/set-tool-reaction";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { userQueryOptions } from "@/routes/_authenticated/@{$username}/-queries/user";
import { setToolReaction } from "@/services/tools/set-tool-reaction";

import { toolQueryOptions } from "./tool";

type MutationVariables = {
  value: SetToolReactionBody["value"];
};

export function useToolSetReaction(slug: string, userId?: string) {
  const queryClient = useQueryClient();
  const params: SetToolReactionParams = { slug };

  const toolKey = toolQueryOptions({ slug }).queryKey;
  const userKey = userId ? userQueryOptions(userId).queryKey : undefined;

  return useMutation({
    mutationFn: ({ value }: MutationVariables) =>
      setToolReaction({ body: { value }, params }),
    mutationKey: toolKey,
    onError: (_error, _variables, context) => {
      if (!context) return;
      queryClient.setQueryData(context.toolKey, context.previous);
    },
    onMutate: async ({ value }: MutationVariables) => {
      await queryClient.cancelQueries({ queryKey: toolKey });

      const previous = queryClient.getQueryData(toolKey);

      queryClient.setQueryData(toolKey, (cached) => {
        if (!cached) return cached;

        const wasUpvoted = cached.data.tool.relations.upvoted;
        const wasDownvoted = cached.data.tool.relations.downvoted;

        let upvotes = cached.data.tool.stats.upvotes;
        let downvotes = cached.data.tool.stats.downvotes;

        const nextRelations = { ...cached.data.tool.relations };

        if (value === 1) {
          if (wasUpvoted) {
            nextRelations.upvoted = false;
            upvotes = Math.max(0, upvotes - 1);
          } else if (wasDownvoted) {
            nextRelations.downvoted = false;
            nextRelations.upvoted = true;
            downvotes = Math.max(0, downvotes - 1);
            upvotes += 1;
          } else {
            nextRelations.upvoted = true;
            upvotes += 1;
          }
        } else if (wasDownvoted) {
          nextRelations.downvoted = false;
          downvotes = Math.max(0, downvotes - 1);
        } else if (wasUpvoted) {
          nextRelations.upvoted = false;
          nextRelations.downvoted = true;
          upvotes = Math.max(0, upvotes - 1);
          downvotes += 1;
        } else {
          nextRelations.downvoted = true;
          downvotes += 1;
        }

        return {
          ...cached,
          data: {
            ...cached.data,
            tool: {
              ...cached.data.tool,
              relations: nextRelations,
              stats: {
                ...cached.data.tool.stats,
                downvotes,
                upvotes,
              },
            },
          },
        };
      });

      return { previous, toolKey };
    },
    onSettled: async () => {
      if (!userKey) return;
      queryClient.invalidateQueries({ queryKey: userKey });
    },
  });
}
