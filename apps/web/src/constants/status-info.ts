import type { User } from "@workspace/shared/schemas/users/user";

export const statusInfo: Record<
  User["status"],
  { description: string; label: string; nextStep: string }
> = {
  active: {
    description: "Your account is in good standing with full access.",
    label: "Active",
    nextStep:
      "Keep contributing to maintain your standing and unlock new features.",
  },
  deactivated: {
    description: "Your account has been deactivated for policy violations.",
    label: "Deactivated",
    nextStep: "Contact support to appeal or request review.",
  },
  suspended: {
    description: "Your account has been temporarily suspended.",
    label: "Suspended",
    nextStep: "Contact support to resolve any issues and restore access.",
  },
};
