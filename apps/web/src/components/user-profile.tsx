import { Link } from "@tanstack/react-router";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import { Button } from "@workspace/ui/components/button";
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
      <Button asChild size="sm">
        <Link to="/signin">Sign in</Link>
      </Button>
    );
  }

  return (
    <Link params={{ username: user.username }} to="/@{$username}">
      <Avatar>
        <AvatarImage alt={user.username} src={getUserAvatar(user.username)} />
        <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
      </Avatar>
    </Link>
  );
}
