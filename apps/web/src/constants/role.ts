import type { User } from "@workspace/shared/schemas/users/user";

import { BadgeCheckIcon, ShieldCheckIcon, TrophyIcon } from "lucide-react";

export const roleConfig: Record<
  User["role"],
  {
    badgeClassName: string;
    badgeIcon: typeof BadgeCheckIcon;
    badgeLabel: string;
    description: string;
    label: string;
  }
> = {
  contributor: {
    badgeClassName: "text-sky-500",
    badgeIcon: BadgeCheckIcon,
    badgeLabel: "Verified contributor",
    description: "Can submit and update tools and resources for the community.",
    label: "Contributor",
  },
  member: {
    badgeClassName: "text-muted-foreground",
    badgeIcon: TrophyIcon,
    badgeLabel: "Member",
    description:
      "Standard account with access to browse, bookmark, and comment on tools.",
    label: "Member",
  },
  moderator: {
    badgeClassName: "text-indigo-500",
    badgeIcon: ShieldCheckIcon,
    badgeLabel: "Verified moderator",
    description:
      "Can review, revert and moderate content and user submissions.",
    label: "Moderator",
  },
} as const;

export const roleVariants: Record<
  User["role"],
  | "default"
  | "destructive"
  | "ghost"
  | "info"
  | "link"
  | "outline"
  | "secondary"
  | "success"
  | "warning"
> = {
  contributor: "warning",
  member: "secondary",
  moderator: "default",
} as const;
