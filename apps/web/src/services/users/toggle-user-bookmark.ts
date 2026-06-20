import {
  type ToggleUserBookmarkBody,
  toggleUserBookmarkBodySchema,
  type ToggleUserBookmarkParams,
  toggleUserBookmarkParamsSchema,
  toggleUserBookmarkResponseSchemas,
} from "@workspace/shared/schemas/users/bookmarks/toggle-user-bookmark";

import { apiClient } from "@/lib/api-client";

type ToggleUserBookmark = {
  body: ToggleUserBookmarkBody;
  params: ToggleUserBookmarkParams;
};

export async function toggleUserBookmark({ body, params }: ToggleUserBookmark) {
  const { userId } = toggleUserBookmarkParamsSchema.parse(params);
  const parsedBody = toggleUserBookmarkBodySchema.parse(body);

  const response = await apiClient
    .post(`users/${userId}/bookmarks`, { json: parsedBody })
    .json(toggleUserBookmarkResponseSchemas[200]);

  return response;
}
