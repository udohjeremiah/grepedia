import type {
  SetListReactionBody,
  SetListReactionParams,
} from "@workspace/shared/schemas/lists/reactions/set-list-reaction";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { setListReaction } from "@/services/lists/set-list-reaction";

import { listQueryOptions } from "./list";

type MutationVariables = {
  value: SetListReactionBody["value"];
};

export const useListSetReaction = (slug: string) => {
  const queryClient = useQueryClient();
  const params: SetListReactionParams = { slug };

  const listKey = listQueryOptions({ slug }).queryKey;

  return useMutation({
    mutationFn: ({ value }: MutationVariables) =>
      setListReaction({ body: { value }, params }),
    mutationKey: listKey,
    onError: (_error, _variables, context) => {
      if (!context) return;
      queryClient.setQueryData(context.listKey, context.previous);
    },
    onMutate: async ({ value }: MutationVariables) => {
      await queryClient.cancelQueries({ queryKey: listKey });

      const previous = queryClient.getQueryData(listKey);

      queryClient.setQueryData(listKey, (cached) => {
        if (!cached) return cached;

        const currentReaction = cached.data.list.relations?.reaction;

        let upvotes = cached.data.list.stats.upvotes;
        let downvotes = cached.data.list.stats.downvotes;

        const nextReaction = currentReaction === value ? undefined : value;

        if (currentReaction === 1) upvotes = Math.max(0, upvotes - 1);
        if (currentReaction === -1) downvotes = Math.max(0, downvotes - 1);
        if (nextReaction === 1) upvotes += 1;
        if (nextReaction === -1) downvotes += 1;

        return {
          ...cached,
          data: {
            ...cached.data,
            list: {
              ...cached.data.list,
              relations: { reaction: nextReaction },
              stats: {
                ...cached.data.list.stats,
                downvotes,
                upvotes,
              },
            },
          },
        };
      });

      return { listKey, previous };
    },
    onSettled: async () => {
      if (!listKey) return;
      queryClient.invalidateQueries({ queryKey: listKey });
    },
  });
};
