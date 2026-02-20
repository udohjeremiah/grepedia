import {
  AddToolBody,
  addToolBodySchema,
  addToolResponseSchemas,
} from "@workspace/shared/schemas/tools/add-tool";

import { apiClient } from "@/lib/api-client";

export async function addTool(body: AddToolBody) {
  const parsedBody = addToolBodySchema.parse(body);
  const response = await apiClient.post("/tools", parsedBody);
  return addToolResponseSchemas[201].parse(response.data);
}
