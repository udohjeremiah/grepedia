import {
  RemoveUserBookmarkParams,
  removeUserBookmarkParamsSchema,
  removeUserBookmarkResponseSchemas,
} from "@workspace/shared/schemas/users/bookmarks/remove-user-bookmark";

import { apiClient } from "@/lib/api-client";

export async function removeUserBookmark(params: RemoveUserBookmarkParams) {
  const { bookmarkId, userId } = removeUserBookmarkParamsSchema.parse(params);

  const response = await apiClient
    .delete(`users/${userId}/bookmarks/${bookmarkId}`)
    .json(removeUserBookmarkResponseSchemas[200]);

  return response;
}
