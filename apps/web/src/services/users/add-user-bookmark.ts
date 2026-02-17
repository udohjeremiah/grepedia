import {
  AddUserBookmarkBody,
  addUserBookmarkBodySchema,
  AddUserBookmarkParams,
  addUserBookmarkParamsSchema,
  addUserBookmarkResponseSchemas,
} from "@workspace/shared/schemas/users/add-user-bookmark";

import { apiClient, requestWithAuth } from "@/lib/api-client";

type AddUserBookmark = {
  body: AddUserBookmarkBody;
  params: AddUserBookmarkParams;
};

export async function addUserBookmark({ body, params }: AddUserBookmark) {
  const { userId } = addUserBookmarkParamsSchema.parse(params);
  const parsedBody = addUserBookmarkBodySchema.parse(body);

  const response = await apiClient.post(
    `/users/${userId}/bookmarks`,
    parsedBody,
    requestWithAuth(),
  );

  return addUserBookmarkResponseSchemas[201].parse(response.data);
}
