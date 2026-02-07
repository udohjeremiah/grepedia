import { auth } from "@/hooks/auth";
import { getInitials } from "@/utils/get-initials";
import { Link } from "@tanstack/react-router";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import { Button } from "@workspace/ui/components/button";
import { Skeleton } from "@workspace/ui/components/skeleton";

export default function UserProfile() {
  const { isPending, data: sessionData } = auth.useSession();

  if (isPending) {
    return <Skeleton className="size-8 rounded-full" />;
  }

  if (!sessionData) {
    return (
      <Button asChild size="sm">
        <Link to="/signin">Sign in</Link>
      </Button>
    );
  }

  const username = sessionData.user.username;
  const image = sessionData.user.image ?? "";
  const fullName = sessionData.user.name;

  return (
    <Link to="/@{$username}" params={{ username }}>
      <Avatar>
        <AvatarImage src={image} alt={username} />
        <AvatarFallback>{getInitials(fullName)}</AvatarFallback>
      </Avatar>
    </Link>
  );
}
