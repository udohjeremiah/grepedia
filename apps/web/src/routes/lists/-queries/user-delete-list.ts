import { useMutation } from "@tanstack/react-query";

import { deleteList } from "@/services/lists/delete-list";

import { listsQueryOptions } from "./lists";

export function useDeleteList() {
  return useMutation({
    mutationFn: deleteList,
    mutationKey: listsQueryOptions().queryKey,
  });
}
