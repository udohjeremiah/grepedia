import {
  type GetListsQueryString,
  getListsQueryStringSchema,
  getListsResponseSchemas,
} from "@workspace/shared/schemas/lists/get-lists";

import { apiClient } from "@/lib/api-client";

export async function getLists(queryString: GetListsQueryString = {}) {
  const parsedQueryString = getListsQueryStringSchema.parse(queryString);

  const response = await apiClient
    .get("lists", { searchParams: parsedQueryString })
    .json(getListsResponseSchemas[200]);

  return response;
}
