import { queryOptions } from "@tanstack/react-query";

export const userQueryOptions = (userId: string) => {
  return queryOptions({
    queryKey: ["user", userId],
  });
};
