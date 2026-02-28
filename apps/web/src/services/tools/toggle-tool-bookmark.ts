import {
  type ToggleToolBookmarkParams,
  toggleToolBookmarkParamsSchema,
  toggleToolBookmarkResponseSchemas,
} from "@workspace/shared/schemas/tools/toggle-tool-bookmark";

import { apiClient } from "@/lib/api-client";

export async function toggleToolBookmark(params: ToggleToolBookmarkParams) {
  const { slug } = toggleToolBookmarkParamsSchema.parse(params);
  const response = await apiClient.post(`/tools/${slug}/bookmark`);
  return toggleToolBookmarkResponseSchemas[200].parse(response.data);
}
