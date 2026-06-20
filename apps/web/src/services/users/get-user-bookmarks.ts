import type {
  GetUserBookmarksParams,
  GetUserBookmarksQueryString,
} from "@workspace/shared/schemas/users/bookmarks/get-user-bookmarks";

import {
  getUserBookmarksParamsSchema,
  getUserBookmarksQueryStringSchema,
  getUserBookmarksResponseSchemas,
} from "@workspace/shared/schemas/users/bookmarks/get-user-bookmarks";

import { apiClient } from "@/lib/api-client";

type GetUserBookmarks = {
  params: GetUserBookmarksParams;
  queryString: GetUserBookmarksQueryString;
};

export async function getUserBookmarks({
  params,
  queryString = {},
}: GetUserBookmarks) {
  const { userId } = getUserBookmarksParamsSchema.parse(params);
  const parsedQueryString =
    getUserBookmarksQueryStringSchema.parse(queryString);

  const response = await apiClient
    .get(`users/${userId}/bookmarks`, { searchParams: parsedQueryString })
    .json(getUserBookmarksResponseSchemas[200]);

  return response;
}
