import type {
  GetToolCommentsParams,
  GetToolCommentsQueryString,
} from "@workspace/shared/schemas/tools/comments/get-tool-comments";

import {
  infiniteQueryOptions,
  useSuspenseInfiniteQuery,
} from "@tanstack/react-query";

import { getToolComments } from "@/services/tools/get-tool-comments";

import { toolQueryOptions } from "./tool";

type ToolCommentsQuery = {
  params: GetToolCommentsParams;
  queryString?: Omit<GetToolCommentsQueryString, "cursor">;
};

export const toolCommentsQueryOptions = ({
  params,
  queryString,
}: ToolCommentsQuery) => {
  const sort = queryString?.sort ?? "top";

  return infiniteQueryOptions({
    initialPageParam: "",
    queryFn: ({ pageParam }) =>
      getToolComments({
        params,
        queryString: { ...queryString, cursor: pageParam, sort },
      }),
    queryKey: [
      ...toolQueryOptions({ slug: params.slug }).queryKey,
      "comments",
      sort,
    ],
    // eslint-disable-next-line perfectionist/sort-objects
    getNextPageParam: (lastPage) => lastPage.data.nextCursor,
  });
};

export const useToolComments = (
  params: ToolCommentsQuery["params"],
  queryString?: ToolCommentsQuery["queryString"],
) => {
  return useSuspenseInfiniteQuery({
    ...toolCommentsQueryOptions({ params, queryString }),
    select: (data) => data.pages.flatMap((page) => page.data.comments),
  });
};
