import {
  type DeleteListParams,
  deleteListParamsSchema,
  deleteListResponseSchemas,
} from "@workspace/shared/schemas/lists/delete-list";

import { apiClient } from "@/lib/api-client";

export async function deleteList(params: DeleteListParams) {
  const { slug } = deleteListParamsSchema.parse(params);

  const response = await apiClient
    .delete(`lists/${slug}`)
    .json(deleteListResponseSchemas[200]);

  return response;
}
