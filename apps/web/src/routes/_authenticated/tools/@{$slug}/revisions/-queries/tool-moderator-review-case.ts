import { useMutation } from "@tanstack/react-query";

import { moderatorReviewCase } from "@/services/moderation/moderator-review-case";

import { toolQueryOptions } from "../../-queries/tool";

export function useToolModeratorReviewCase(slug: string) {
  return useMutation({
    mutationFn: moderatorReviewCase,
    mutationKey: toolQueryOptions({ slug }).queryKey,
  });
}
