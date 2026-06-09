import {
  type SetListReactionBody,
  setListReactionBodySchema,
  type SetListReactionParams,
  setListReactionParamsSchema,
  setListReactionResponseSchemas,
} from "@workspace/shared/schemas/lists/reactions/set-list-reaction";

import { apiClient } from "@/lib/api-client";

type SetListReaction = {
  body: SetListReactionBody;
  params: SetListReactionParams;
};

export async function setListReaction({ body, params }: SetListReaction) {
  const { slug } = setListReactionParamsSchema.parse(params);
  const parsedBody = setListReactionBodySchema.parse(body);

  const response = await apiClient
    .post(`lists/${slug}/reaction`, { json: parsedBody })
    .json(setListReactionResponseSchemas[200]);

  return response;
}
