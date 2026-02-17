import { mutationOptions, useMutation } from "@tanstack/react-query";

import { recoverUserAccount } from "@/services/users/recover-user-account";

import { userRecoveryPackageQueryOptions } from "./user-recovery-package";

export const userRecoverAccountMutationOptions = (userId: string) =>
  mutationOptions({
    mutationFn: recoverUserAccount,
    mutationKey: userRecoveryPackageQueryOptions({ id: userId }).queryKey,
  });

export const useUserRecoverAccount = (userId: string) => {
  return useMutation({
    ...userRecoverAccountMutationOptions(userId),
  });
};
