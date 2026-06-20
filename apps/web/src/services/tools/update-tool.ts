import {
  type UpdateToolBody,
  updateToolBodySchema,
  type UpdateToolParams,
  updateToolParamsSchema,
  updateToolResponseSchemas,
} from "@workspace/shared/schemas/tools/update-tool";

import { apiClient } from "@/lib/api-client";

type UpdateTool = {
  body: UpdateToolBody;
  params: UpdateToolParams;
};

export async function updateTool({ body, params }: UpdateTool) {
  const { slug } = updateToolParamsSchema.parse(params);
  const parsedBody = updateToolBodySchema.parse(body);

  const response = await apiClient
    .patch(`tools/${slug}`, { json: parsedBody })
    .json(updateToolResponseSchemas[202]);

  return response;
}
