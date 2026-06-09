import {
  type ToggleArchiveListParams,
  toggleArchiveListParamsSchema,
  toggleArchiveListResponseSchemas,
} from "@workspace/shared/schemas/lists/toggle-archive-list";

import { apiClient } from "@/lib/api-client";

export async function toggleArchiveList(params: ToggleArchiveListParams) {
  const { slug } = toggleArchiveListParamsSchema.parse(params);

  const response = await apiClient
    .patch(`lists/${slug}`)
    .json(toggleArchiveListResponseSchemas[200]);

  return response;
}
