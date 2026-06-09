import type { GetListParams } from "@workspace/shared/schemas/lists/get-list";

import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";

import { getList } from "@/services/lists/get-list";

import { listsQueryOptions } from "../../-queries/lists";

export const listQueryOptions = (params: GetListParams) =>
  queryOptions({
    queryFn: () => getList(params),
    queryKey: [...listsQueryOptions().queryKey, params.slug],
  });

export const useList = (params: GetListParams) => {
  return useSuspenseQuery({
    ...listQueryOptions(params),
    select: (data) => data.data.list,
  });
};
