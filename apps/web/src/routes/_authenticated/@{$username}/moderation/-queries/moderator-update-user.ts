import { useMutation } from "@tanstack/react-query";

import { moderatorUpdateUser } from "@/services/moderation/moderator-update-user";

import { moderatorGetUserQueryOptions } from "./moderator-get-user";

export function useModeratorUpdateUser(username: string) {
  return useMutation({
    mutationFn: moderatorUpdateUser,
    mutationKey: moderatorGetUserQueryOptions({ username }).queryKey,
  });
}
