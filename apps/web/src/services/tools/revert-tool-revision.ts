import {
  type RevertToolRevisionBody,
  revertToolRevisionBodySchema,
  type RevertToolRevisionParams,
  revertToolRevisionParamsSchema,
  revertToolRevisionResponseSchemas,
} from "@workspace/shared/schemas/tools/revisions/revert-tool-revision";

import { apiClient } from "@/lib/api-client";

type RevertToolRevisionInput = {
  body: RevertToolRevisionBody;
  params: RevertToolRevisionParams;
};

export async function revertToolRevision({
  body,
  params,
}: RevertToolRevisionInput) {
  const { slug } = revertToolRevisionParamsSchema.parse(params);
  const parsedBody = revertToolRevisionBodySchema.parse(body);
  const response = await apiClient.post(`/tools/${slug}/revisions`, parsedBody);
  return revertToolRevisionResponseSchemas[200].parse(response.data);
}
