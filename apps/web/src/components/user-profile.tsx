import { Link } from "@tanstack/react-router";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import { Skeleton } from "@workspace/ui/components/skeleton";

import { auth } from "@/hooks/auth";
import { getInitials } from "@/utils/get-initials";
import { getUserAvatar } from "@/utils/get-user-avatar";

export default function UserProfile() {
  const { isPending, user } = auth.useSession();

  if (isPending) {
    return <Skeleton className="size-8 rounded-full" />;
  }

  if (!user) {
    return (
      <Link
        className="text-sm font-medium text-muted-foreground transition-colors duration-200 hover:text-primary"
        to="/signin"
      >
        Sign in
      </Link>
    );
  }

  return (
    <Link params={{ username: user.username }} to="/@{$username}">
      <Avatar size="sm">
        <AvatarImage alt={user.username} src={getUserAvatar(user.username)} />
        <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
      </Avatar>
    </Link>
  );
}
