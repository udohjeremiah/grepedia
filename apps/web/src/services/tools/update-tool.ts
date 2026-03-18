import {
  type UpdateToolBody,
  updateToolBodySchema,
  type UpdateToolParams,
  updateToolParamsSchema,
  updateToolResponseSchemas,
} from "@workspace/shared/schemas/tools/update-tool";

import { apiClient } from "@/lib/api-client";

type UpdateToolInput = {
  body: UpdateToolBody;
  params: UpdateToolParams;
};

export async function updateTool({ body, params }: UpdateToolInput) {
  const { slug } = updateToolParamsSchema.parse(params);
  const parsedBody = updateToolBodySchema.parse(body);
  const response = await apiClient.patch(`/tools/${slug}`, parsedBody);
  return updateToolResponseSchemas[202].parse(response.data);
}
