import { useMutation } from "@tanstack/react-query";

import { toggleArchiveList } from "@/services/lists/toggle-archive-list";

import { listsQueryOptions } from "./lists";

export const useToggleArchiveList = () => {
  return useMutation({
    mutationFn: toggleArchiveList,
    mutationKey: listsQueryOptions().queryKey,
  });
};
