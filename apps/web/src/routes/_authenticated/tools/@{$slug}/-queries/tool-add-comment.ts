import type { AddToolCommentBody } from "@workspace/shared/schemas/tools/comments/add-tool-comment";

import { useMutation } from "@tanstack/react-query";

import { addToolComment } from "@/services/tools/add-tool-comment";

import { toolQueryOptions } from "./tool";

export function useToolAddComment(slug: string) {
  return useMutation({
    mutationFn: (body: AddToolCommentBody) =>
      addToolComment({ body, params: { slug } }),
    mutationKey: toolQueryOptions({ slug }).queryKey,
  });
}
