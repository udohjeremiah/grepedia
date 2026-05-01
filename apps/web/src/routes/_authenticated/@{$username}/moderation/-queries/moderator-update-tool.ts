import { useMutation } from "@tanstack/react-query";

import { moderatorUpdateTool } from "@/services/moderation/moderator-update-tool";

import { moderatorGetToolQueryOptions } from "./moderator-get-tool";

export function useModeratorUpdateTool(slug: string) {
  return useMutation({
    mutationFn: moderatorUpdateTool,
    mutationKey: moderatorGetToolQueryOptions({ slug }).queryKey,
  });
}
