import { useMutation } from "@tanstack/react-query";

import { recoverUserAccount } from "@/services/users/recover-user-account";

import { userRecoveryPackageQueryOptions } from "./user-recovery-package";

export const useUserRecoverAccount = (userId: string) => {
  return useMutation({
    mutationFn: recoverUserAccount,
    mutationKey: userRecoveryPackageQueryOptions({ userId }).queryKey,
  });
};
