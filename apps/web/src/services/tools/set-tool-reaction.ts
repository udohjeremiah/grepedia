import {
  type SetToolReactionBody,
  setToolReactionBodySchema,
  type SetToolReactionParams,
  setToolReactionParamsSchema,
  setToolReactionResponseSchemas,
} from "@workspace/shared/schemas/tools/reactions/set-tool-reaction";

import { apiClient } from "@/lib/api-client";

type SetToolReaction = {
  body: SetToolReactionBody;
  params: SetToolReactionParams;
};

export async function setToolReaction({ body, params }: SetToolReaction) {
  const { slug } = setToolReactionParamsSchema.parse(params);
  const parsedBody = setToolReactionBodySchema.parse(body);

  const response = await apiClient
    .post(`tools/${slug}/reaction`, { json: parsedBody })
    .json(setToolReactionResponseSchemas[200]);

  return response;
}
