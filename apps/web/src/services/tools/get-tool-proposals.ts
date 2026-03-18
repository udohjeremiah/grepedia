import {
  type GetToolProposalsParams,
  getToolProposalsParamsSchema,
  getToolProposalsResponseSchemas,
} from "@workspace/shared/schemas/tools/proposals/get-tool-proposals";

import { apiClient } from "@/lib/api-client";

export async function getToolProposals(params: GetToolProposalsParams) {
  const { slug } = getToolProposalsParamsSchema.parse(params);
  const response = await apiClient.get(`/tools/${slug}/proposals`);
  return getToolProposalsResponseSchemas[200].parse(response.data);
}
