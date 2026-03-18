import type { GetToolRevisionsParams } from "@workspace/shared/schemas/tools/revisions/get-tool-revisions";

import {
  infiniteQueryOptions,
  useSuspenseInfiniteQuery,
} from "@tanstack/react-query";

import { getToolRevisions } from "@/services/tools/get-tool-revisions";

import { toolQueryOptions } from "../../-queries/tool";

export const toolRevisionsQueryOptions = (params: GetToolRevisionsParams) => {
  return infiniteQueryOptions({
    initialPageParam: "",
    queryFn: ({ pageParam }) =>
      getToolRevisions({ params, queryString: { cursor: pageParam } }),
    queryKey: [
      ...toolQueryOptions({ slug: params.slug }).queryKey,
      "revisions",
    ],
    // eslint-disable-next-line perfectionist/sort-objects
    getNextPageParam: (lastPage) => lastPage.data.nextCursor,
  });
};

export const useToolRevisions = (params: GetToolRevisionsParams) => {
  return useSuspenseInfiniteQuery({
    ...toolRevisionsQueryOptions(params),
    select: (data) => data.pages.flatMap((page) => page.data.revisions),
  });
};
