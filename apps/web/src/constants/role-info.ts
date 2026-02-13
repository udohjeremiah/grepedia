import type { User } from "@workspace/shared/schemas/users/user";

export const roleInfo: Record<
  User["role"],
  { description: string; label: string }
> = {
  contributor: {
    description: "Can submit tools and resources for the community.",
    label: "Contributor",
  },
  member: {
    description:
      "Standard account with access to browse, bookmark, and comment on tools.",
    label: "Member",
  },
  moderator: {
    description:
      "Can review, revert and moderate content and user submissions.",
    label: "Moderator",
  },
};
