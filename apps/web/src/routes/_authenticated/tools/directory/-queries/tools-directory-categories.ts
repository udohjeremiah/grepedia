import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";

import { getToolsDirectoryCategories } from "@/services/tools/get-tools-directory-categories";

export const toolsDirectoryCategoriesQueryOptions = () => {
  return queryOptions({
    queryFn: getToolsDirectoryCategories,
    queryKey: ["tools", "directory", "categories"],
  });
};

export const useToolsDirectoryCategories = () => {
  return useSuspenseQuery({
    ...toolsDirectoryCategoriesQueryOptions(),
    select: (data) => data.data.categories,
  });
};
