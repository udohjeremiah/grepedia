import { queryOptions, useQuery } from "@tanstack/react-query";
import { ModeratorGetToolQuery } from "@workspace/shared/schemas/moderation/moderator-get-tool";

import { moderatorGetTool } from "@/services/moderation/moderator-get-tool";

export const moderatorGetToolQueryOptions = (params: ModeratorGetToolQuery) => {
  return queryOptions({
    queryFn: () => moderatorGetTool(params.slug),
    queryKey: ["moderation", "tool", params.slug],
  });
};

export function useModeratorGetTool(params: ModeratorGetToolQuery) {
  return useQuery({
    ...moderatorGetToolQueryOptions(params),
    enabled: false,
    select: (data) => data.data.tool,
  });
}
