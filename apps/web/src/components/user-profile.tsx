import { Link } from "@tanstack/react-router";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";

import { auth } from "@/hooks/auth";
import { getAvatar } from "@/utils/get-avatar";
import { getInitials } from "@/utils/get-initials";

export default function UserProfile() {
  const { user } = auth.useSession();

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
      <Avatar>
        <AvatarImage alt={user.username} src={getAvatar(user.username)} />
        <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
      </Avatar>
    </Link>
  );
}
