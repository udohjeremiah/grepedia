import type { User } from "@workspace/shared/schemas/users/user";

import { cn } from "@workspace/ui/utils/cn";

import { roleConfig } from "@/constants/role";

interface UserContributionBadgeProps {
  className?: string;
  role: User["role"];
}

export default function UserContributionBadge({
  className,
  role,
}: UserContributionBadgeProps) {
  const config = roleConfig[role];
  const Icon = config.badgeIcon;

  return (
    <span
      aria-label={config.badgeLabel}
      className={cn(config.badgeClassName, className)}
      title={config.badgeLabel}
    >
      <Icon className="size-4" />
    </span>
  );
}
