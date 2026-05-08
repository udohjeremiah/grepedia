import {
  type SearchQueryString,
  searchQueryStringSchema,
  searchResponseSchemas,
} from "@workspace/shared/schemas/search/search";

import { apiClient } from "@/lib/api-client";

export async function search(queryString: SearchQueryString) {
  const parsedQueryString = searchQueryStringSchema.parse(queryString);

  const response = await apiClient
    .get("search", { searchParams: parsedQueryString })
    .json(searchResponseSchemas[200]);

  return response;
}
