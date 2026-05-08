import {
  type AddToolCommentBody,
  addToolCommentBodySchema,
  type AddToolCommentParams,
  addToolCommentParamsSchema,
  addToolCommentResponseSchemas,
} from "@workspace/shared/schemas/tools/comments/add-tool-comment";

import { apiClient } from "@/lib/api-client";

type AddToolComment = {
  body: AddToolCommentBody;
  params: AddToolCommentParams;
};

export async function addToolComment({ body, params }: AddToolComment) {
  const { slug } = addToolCommentParamsSchema.parse(params);
  const parsedBody = addToolCommentBodySchema.parse(body);

  const response = await apiClient
    .post(`tools/${slug}/comments`, { json: parsedBody })
    .json(addToolCommentResponseSchemas[201]);

  return response;
}
