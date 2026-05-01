import { useMutation } from "@tanstack/react-query";

import { deleteToolComment } from "@/services/tools/delete-tool-comment";

import { toolQueryOptions } from "./tool";

type MutationVariables = {
  commentId: string;
};

export function useToolDeleteComment(slug: string) {
  return useMutation({
    mutationFn: ({ commentId }: MutationVariables) =>
      deleteToolComment({ commentId, slug }),
    mutationKey: toolQueryOptions({ slug }).queryKey,
  });
}
