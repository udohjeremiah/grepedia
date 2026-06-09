import {
  type GetListParams,
  getListParamsSchema,
  getListResponseSchemas,
} from "@workspace/shared/schemas/lists/get-list";

import { apiClient } from "@/lib/api-client";

export async function getList(params: GetListParams) {
  const { slug } = getListParamsSchema.parse(params);

  const response = await apiClient
    .get(`lists/${slug}`)
    .json(getListResponseSchemas[200]);

  return response;
}
