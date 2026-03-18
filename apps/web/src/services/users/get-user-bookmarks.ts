import {
  GetUserBookmarksParams,
  getUserBookmarksParamsSchema,
  getUserBookmarksResponseSchemas,
} from "@workspace/shared/schemas/users/bookmarks/get-user-bookmarks";

import { apiClient } from "@/lib/api-client";

export async function getUserBookmarks(params: GetUserBookmarksParams) {
  const { userId } = getUserBookmarksParamsSchema.parse(params);
  const response = await apiClient.get(`/users/${userId}/bookmarks`);
  return getUserBookmarksResponseSchemas[200].parse(response.data);
}
