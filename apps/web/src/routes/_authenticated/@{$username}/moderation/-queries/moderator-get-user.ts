import { queryOptions, useQuery } from "@tanstack/react-query";
import { ModeratorGetUserQuery } from "@workspace/shared/schemas/moderation/moderator-get-user";

import { moderatorGetUser } from "@/services/moderation/moderator-get-user";

export const moderatorGetUserQueryOptions = (params: ModeratorGetUserQuery) => {
  return queryOptions({
    queryFn: () => moderatorGetUser(params.username),
    queryKey: ["moderation", params.username],
  });
};

export function useModeratorGetUser(
  params: ModeratorGetUserQuery,
  enabled: boolean,
) {
  return useQuery({
    ...moderatorGetUserQueryOptions(params),
    enabled,
    select: (data) => data.data.user,
  });
}
