import { useMutation } from "@tanstack/react-query";

import { publishList } from "@/services/lists/publish-list";

import { listsQueryOptions } from "./lists";

export const usePublishList = () => {
  return useMutation({
    mutationFn: publishList,
    mutationKey: listsQueryOptions().queryKey,
  });
};
