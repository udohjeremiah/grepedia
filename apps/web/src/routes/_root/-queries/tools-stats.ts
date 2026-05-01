import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";

import { getToolsStats } from "@/services/tools/get-tools-stats";

export const toolsStatsQueryOptions = () => {
  return queryOptions({
    queryFn: getToolsStats,
    queryKey: ["tools", "stats"],
  });
};

export const useToolsStats = () => {
  return useSuspenseQuery({
    ...toolsStatsQueryOptions(),
    select: (data) => data.data.stats,
  });
};
