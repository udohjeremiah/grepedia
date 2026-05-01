import type { GetToolProposalsParams } from "@workspace/shared/schemas/tools/proposals/get-tool-proposals";

import { queryOptions, useQuery } from "@tanstack/react-query";

import { getToolProposals } from "@/services/tools/get-tool-proposals";

import { toolQueryOptions } from "../../-queries/tool";

export const toolProposalsQueryOptions = (params: GetToolProposalsParams) =>
  queryOptions({
    queryFn: () => getToolProposals(params),
    queryKey: [
      ...toolQueryOptions({ slug: params.slug }).queryKey,
      "proposals",
    ],
  });

export function useToolProposals(params: GetToolProposalsParams) {
  return useQuery({
    ...toolProposalsQueryOptions(params),
    select: (data) => data.data,
  });
}
