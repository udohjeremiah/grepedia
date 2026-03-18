import { useMutation } from "@tanstack/react-query";

import { updateToolComment } from "@/services/tools/update-tool-comment";

import { toolQueryOptions } from "./tool";

type MutationVariables = {
  commentId: string;
  content: string;
};

export function useToolUpdateComment(slug: string) {
  return useMutation({
    mutationFn: ({ commentId, content }: MutationVariables) =>
      updateToolComment({ body: { content }, params: { commentId, slug } }),
    mutationKey: toolQueryOptions({ slug }).queryKey,
  });
}
