import { queryOptions, useQuery } from "@tanstack/react-query";
import { ModeratorGetUserQuery } from "@workspace/shared/schemas/moderation/moderator-get-user";

import { moderatorGetUser } from "@/services/moderation/moderator-get-user";

export const moderatorGetUserQueryOptions = (params: ModeratorGetUserQuery) => {
  return queryOptions({
    queryFn: () => moderatorGetUser(params.username),
    queryKey: ["moderation", "user", params.username],
  });
};

export function useModeratorGetUser(params: ModeratorGetUserQuery) {
  return useQuery({
    ...moderatorGetUserQueryOptions(params),
    enabled: false,
    select: (data) => data.data.user,
  });
}
