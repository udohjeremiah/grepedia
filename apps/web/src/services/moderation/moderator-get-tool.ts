import {
  moderatorGetToolQuerySchema,
  moderatorGetToolResponseSchemas,
} from "@workspace/shared/schemas/moderation/moderator-get-tool";

import { apiClient } from "@/lib/api-client";

export async function moderatorGetTool(slug: string) {
  const parsedQueryString = moderatorGetToolQuerySchema.parse({ slug });
  const response = await apiClient.get("/moderation/tools/lookup", {
    params: parsedQueryString,
  });
  return moderatorGetToolResponseSchemas[200].parse(response.data);
}
