import { useMutation } from "@tanstack/react-query";

import { addTool } from "@/services/tools/add-tool";

import { userToolsQueryOptions } from "./user-tools";

export const useAddTool = (userId: string) => {
  return useMutation({
    mutationFn: addTool,
    mutationKey: userToolsQueryOptions({ userId }).queryKey,
  });
};
