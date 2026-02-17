import {
  GetUserBookmarksParams,
  getUserBookmarksParamsSchema,
  getUserBookmarksResponseSchemas,
} from "@workspace/shared/schemas/users/get-user-bookmarks";

import { apiClient, requestWithAuth } from "@/lib/api-client";

export async function getUserBookmarks(params: GetUserBookmarksParams) {
  const { userId } = getUserBookmarksParamsSchema.parse(params);
  const response = await apiClient.get(
    `/users/${userId}/bookmarks`,
    requestWithAuth(),
  );
  return getUserBookmarksResponseSchemas[200].parse(response.data);
}
