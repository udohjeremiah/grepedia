import { queryOptions, useQuery } from "@tanstack/react-query";
import { ModeratorGetUserQueryString } from "@workspace/shared/schemas/moderation/moderator-get-user";

import { moderatorGetUser } from "@/services/moderation/moderator-get-user";

export const moderatorGetUserQueryOptions = (
  queryString: ModeratorGetUserQueryString,
) => {
  return queryOptions({
    queryFn: () => moderatorGetUser(queryString.username),
    queryKey: ["moderation", "user", queryString.username],
  });
};

export function useModeratorGetUser(queryString: ModeratorGetUserQueryString) {
  return useQuery({
    ...moderatorGetUserQueryOptions(queryString),
    enabled: false,
    select: (data) => data.data.user,
  });
}
