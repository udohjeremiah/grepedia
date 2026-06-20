import {
  type GetListParams,
  getListParamsSchema,
  type GetListQueryString,
  getListQueryStringSchema,
  getListResponseSchemas,
} from "@workspace/shared/schemas/lists/get-list";

import { apiClient } from "@/lib/api-client";

type GetList = {
  params: GetListParams;
  queryString: GetListQueryString;
};

export async function getList({ params, queryString = {} }: GetList) {
  const { slug } = getListParamsSchema.parse(params);
  const parsedQueryString = getListQueryStringSchema.parse(queryString);

  const response = await apiClient
    .get(`lists/${slug}`, { searchParams: parsedQueryString })
    .json(getListResponseSchemas[200]);

  return response;
}
