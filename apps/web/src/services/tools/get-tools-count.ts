import { getToolsCount200ResponseSchema } from "@workspace/shared/schemas/get-tools-count";

import { apiClient } from "@/lib/api-client";

export async function getToolsCount() {
  const response = await apiClient.get("/tools/count");
  return getToolsCount200ResponseSchema.parse(response.data);
}
