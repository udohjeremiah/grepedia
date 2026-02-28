import { mutationOptions, useMutation } from "@tanstack/react-query";

import { addTool } from "@/services/tools/add-tool";

import { userToolsQueryOptions } from "./user-tools";

export const userAddToolMutationOptions = (userId: string) => {
  return mutationOptions({
    mutationFn: addTool,
    mutationKey: userToolsQueryOptions({ userId }).queryKey,
  });
};

export const useAddTool = (userId: string) => {
  return useMutation({
    ...userAddToolMutationOptions(userId),
  });
};
