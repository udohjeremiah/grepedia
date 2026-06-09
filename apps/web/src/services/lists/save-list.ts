import {
  type SaveListBody,
  saveListBodySchema,
  saveListResponseSchemas,
} from "@workspace/shared/schemas/lists/save-list";

import { apiClient } from "@/lib/api-client";

export async function saveList(body: SaveListBody) {
  const parsedBody = saveListBodySchema.parse(body);

  const response = await apiClient
    .post("lists", { json: parsedBody })
    .json(saveListResponseSchemas[201]);

  return response;
}
