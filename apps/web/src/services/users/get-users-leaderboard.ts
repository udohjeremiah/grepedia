import {
  type GetUsersLeaderboardQueryString,
  getUsersLeaderboardQueryStringSchema,
  getUsersLeaderboardResponseSchemas,
} from "@workspace/shared/schemas/users/get-users-leaderboard";

import { apiClient } from "@/lib/api-client";

export async function getUsersLeaderboard(
  queryString: GetUsersLeaderboardQueryString,
) {
  const parsedQueryString =
    getUsersLeaderboardQueryStringSchema.parse(queryString);
  const response = await apiClient.get("/users/leaderboard", {
    params: parsedQueryString,
  });
  return getUsersLeaderboardResponseSchemas[200].parse(response.data);
}
