import type { ToggleToolBookmarkParams } from "@workspace/shared/schemas/tools/toggle-tool-bookmark";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { getTool } from "@/services/tools/get-tool";
import { toggleToolBookmark } from "@/services/tools/toggle-tool-bookmark";

import { userQueryOptions } from "../../../@{$username}/-queries/user";
import { toolQueryOptions } from "./tool";

type GetToolResult = Awaited<ReturnType<typeof getTool>>;

type ToggleBookmarkContext = {
  previous: GetToolResult | undefined;
  toolKey: readonly unknown[];
};

export function useToolToggleBookmark(slug: string, userId: string) {
  const queryClient = useQueryClient();
  const params: ToggleToolBookmarkParams = { slug };
  const toolKey = toolQueryOptions(params).queryKey;
  const userKey = userQueryOptions(userId).queryKey;

  return useMutation<unknown, unknown, void, ToggleBookmarkContext>({
    mutationFn: () => toggleToolBookmark(params),
    mutationKey: toolKey,
    onError: (_error, _variables, context) => {
      if (!context) return;
      queryClient.setQueryData(context.toolKey, context.previous);
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: toolKey });

      const previous = queryClient.getQueryData(toolKey);

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
                bookmarked: !cached.data.tool.relations.bookmarked,
              },
            },
          },
        };
      });

      return { previous, toolKey };
    },
    onSettled: async () => {
      queryClient.invalidateQueries({ queryKey: userKey });
    },
  });
}
