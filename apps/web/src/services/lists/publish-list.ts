import {
  type PublishListParams,
  publishListParamsSchema,
  publishListResponseSchemas,
} from "@workspace/shared/schemas/lists/publish-list";

import { apiClient } from "@/lib/api-client";

export async function publishList(params: PublishListParams) {
  const { slug } = publishListParamsSchema.parse(params);

  const response = await apiClient
    .post(`lists/${slug}`)
    .json(publishListResponseSchemas[200]);

  return response;
}
