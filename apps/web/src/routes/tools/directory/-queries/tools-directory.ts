import type { GetToolsDirectoryQueryString } from "@workspace/shared/schemas/tools/directory/get-tools-directory";

import {
  infiniteQueryOptions,
  useSuspenseInfiniteQuery,
} from "@tanstack/react-query";
import { omitKeys } from "@workspace/shared/utils/omit-keys";

import { getToolsDirectory } from "@/services/tools/get-tools-directory";

export const toolsDirectoryQueryOptions = (
  params: GetToolsDirectoryQueryString,
) => {
  return infiniteQueryOptions({
    initialPageParam: "",
    queryFn: ({ pageParam }) =>
      getToolsDirectory({ ...params, cursor: pageParam }),
    queryKey: ["tools", "directory", omitKeys(params, ["cursor", "limit"])],
    // eslint-disable-next-line perfectionist/sort-objects
    getNextPageParam: (lastPage) => lastPage.data.nextCursor,
  });
};

export const useToolsDirectory = (params: GetToolsDirectoryQueryString) => {
  return useSuspenseInfiniteQuery({
    ...toolsDirectoryQueryOptions(params),
    select: (data) => ({
      category: data.pages[0]?.data.category ?? params.category,
      tools: data.pages.flatMap((page) => page.data.tools),
    }),
  });
};
