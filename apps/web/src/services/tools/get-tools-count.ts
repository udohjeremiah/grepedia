import { apiClient } from "@/lib/api-client";
import { getToolsCount200ResponseSchema } from "@workspace/shared/schemas/get-tools-count";

export async function getToolsCount() {
  const response = await apiClient.get("/tools/count");
  return getToolsCount200ResponseSchema.parse(response.data);
}
