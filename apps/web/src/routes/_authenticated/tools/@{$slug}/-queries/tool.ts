import type { GetToolParams } from "@workspace/shared/schemas/tools/get-tool";

import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";

import { getTool } from "@/services/tools/get-tool";

export const toolQueryOptions = (params: GetToolParams) => {
  return queryOptions({
    queryFn: () => getTool(params),
    queryKey: ["tools", params.slug],
  });
};

export const useTool = (params: GetToolParams) => {
  return useSuspenseQuery({
    ...toolQueryOptions(params),
    select: (data) => data.data.tool,
  });
};
