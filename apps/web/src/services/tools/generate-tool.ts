import {
  type GenerateToolBody,
  generateToolBodySchema,
  generateToolResponseSchemas,
} from "@workspace/shared/schemas/tools/generate-tool";

import { apiClient } from "@/lib/api-client";

export async function generateTool(body: GenerateToolBody) {
  const parsedBody = generateToolBodySchema.parse(body);

  const response = await apiClient
    .post("tools/generate", { json: parsedBody, timeout: false })
    .json(generateToolResponseSchemas[200]);

  return response;
}
