import { queryOptions, useQuery } from "@tanstack/react-query";
import { ModeratorGetToolQueryString } from "@workspace/shared/schemas/moderation/moderator-get-tool";

import { moderatorGetTool } from "@/services/moderation/moderator-get-tool";

export const moderatorGetToolQueryOptions = (
  queryString: ModeratorGetToolQueryString,
) => {
  return queryOptions({
    queryFn: () => moderatorGetTool(queryString.slug),
    queryKey: ["moderation", "tool", queryString.slug],
  });
};

export function useModeratorGetTool(queryString: ModeratorGetToolQueryString) {
  return useQuery({
    ...moderatorGetToolQueryOptions(queryString),
    enabled: false,
    select: (data) => data.data.tool,
  });
}
