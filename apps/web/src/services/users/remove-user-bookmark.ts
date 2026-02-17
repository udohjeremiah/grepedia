import {
  RemoveUserBookmarkParams,
  removeUserBookmarkParamsSchema,
  removeUserBookmarkResponseSchemas,
} from "@workspace/shared/schemas/users/remove-user-bookmark";

import { apiClient, requestWithAuth } from "@/lib/api-client";

export async function removeUserBookmark(params: RemoveUserBookmarkParams) {
  const { bookmarkId, userId } = removeUserBookmarkParamsSchema.parse(params);
  const response = await apiClient.delete(
    `/users/${userId}/bookmarks/${bookmarkId}`,
    requestWithAuth(),
  );

  return removeUserBookmarkResponseSchemas[200].parse(response.data);
}
