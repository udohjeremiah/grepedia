import {
  GetToolParams,
  getToolParamsSchema,
  getToolResponseSchemas,
} from "@workspace/shared/schemas/tools/get-tool";

import { apiClient } from "@/lib/api-client";

export async function getTool(params: GetToolParams) {
  const { slug } = getToolParamsSchema.parse(params);

  const response = await apiClient
    .get(`tools/${slug}`)
    .json(getToolResponseSchemas[200]);

  return response;
}
