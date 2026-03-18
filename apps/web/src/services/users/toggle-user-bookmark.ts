import {
  type ToggleUserBookmarkBody,
  toggleUserBookmarkBodySchema,
  type ToggleUserBookmarkParams,
  toggleUserBookmarkParamsSchema,
  toggleUserBookmarkResponseSchemas,
} from "@workspace/shared/schemas/users/bookmarks/toggle-user-bookmark";

import { apiClient } from "@/lib/api-client";

type ToggleUserBookmarkInput = {
  body: ToggleUserBookmarkBody;
  params: ToggleUserBookmarkParams;
};

export async function toggleUserBookmark({
  body,
  params,
}: ToggleUserBookmarkInput) {
  const { userId } = toggleUserBookmarkParamsSchema.parse(params);
  const parsedBody = toggleUserBookmarkBodySchema.parse(body);
  const response = await apiClient.post(
    `/users/${userId}/bookmarks`,
    parsedBody,
  );
  return toggleUserBookmarkResponseSchemas[200].parse(response.data);
}
