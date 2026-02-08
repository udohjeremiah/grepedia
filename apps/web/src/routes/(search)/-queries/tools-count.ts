import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";

import { getToolsCount } from "@/services/tools/get-tools-count";

export const toolsCountQueryOptions = () => {
  return queryOptions({
    queryFn: getToolsCount,
    queryKey: ["tools", "count"],
  });
};

export const useToolsCount = () => {
  return useSuspenseQuery({
    ...toolsCountQueryOptions(),
    select: (data) => data.data,
  });
};
