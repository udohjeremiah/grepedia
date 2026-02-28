import type { GetToolCommentsParams } from "@workspace/shared/schemas/tools/get-tool-comments";

import {
  infiniteQueryOptions,
  useSuspenseInfiniteQuery,
} from "@tanstack/react-query";

import { getToolComments } from "@/services/tools/get-tool-comments";

import { toolQueryOptions } from "./tool";

export const toolCommentsQueryOptions = (params: GetToolCommentsParams) => {
  return infiniteQueryOptions({
    initialPageParam: "",
    queryFn: ({ pageParam }) =>
      getToolComments({ slug: params.slug }, { cursor: pageParam }),
    queryKey: [...toolQueryOptions({ slug: params.slug }).queryKey, "comments"],
    // eslint-disable-next-line perfectionist/sort-objects
    getNextPageParam: (lastPage) => lastPage.data.nextCursor,
  });
};

export const useToolComments = (params: GetToolCommentsParams) => {
  return useSuspenseInfiniteQuery({
    ...toolCommentsQueryOptions(params),
    select: (data) => data.pages.flatMap((page) => page.data.comments),
  });
};
