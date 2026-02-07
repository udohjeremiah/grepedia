import { getToolsCount } from "@/services/tools/get-tools-count";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";

export const toolsCountQueryOptions = () => {
  return queryOptions({
    queryKey: ["tools", "count"],
    queryFn: getToolsCount,
  });
};

export const useToolsCount = () => {
  return useSuspenseQuery({
    ...toolsCountQueryOptions(),
    select: (data) => data.data,
  });
};
