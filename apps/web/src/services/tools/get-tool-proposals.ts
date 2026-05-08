import {
  type GetToolProposalsParams,
  getToolProposalsParamsSchema,
  getToolProposalsResponseSchemas,
} from "@workspace/shared/schemas/tools/proposals/get-tool-proposals";

import { apiClient } from "@/lib/api-client";

export async function getToolProposals(params: GetToolProposalsParams) {
  const { slug } = getToolProposalsParamsSchema.parse(params);

  const response = await apiClient
    .get(`tools/${slug}/proposals`)
    .json(getToolProposalsResponseSchemas[200]);

  return response;
}
