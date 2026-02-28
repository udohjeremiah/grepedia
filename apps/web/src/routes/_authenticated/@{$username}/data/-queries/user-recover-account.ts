import { mutationOptions, useMutation } from "@tanstack/react-query";

import { recoverUserAccount } from "@/services/users/recover-user-account";

import { userRecoveryPackageQueryOptions } from "./user-recovery-package";

export const userRecoverAccountMutationOptions = (userId: string) => {
  return mutationOptions({
    mutationFn: recoverUserAccount,
    mutationKey: userRecoveryPackageQueryOptions({ userId }).queryKey,
  });
};

export const useUserRecoverAccount = (userId: string) => {
  return useMutation({
    ...userRecoverAccountMutationOptions(userId),
  });
};
