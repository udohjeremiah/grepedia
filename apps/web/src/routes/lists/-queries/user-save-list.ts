import { useMutation } from "@tanstack/react-query";

import { saveList } from "@/services/lists/save-list";

import { listsQueryOptions } from "./lists";

export const useSaveList = () => {
  return useMutation({
    mutationFn: saveList,
    mutationKey: listsQueryOptions().queryKey,
  });
};
