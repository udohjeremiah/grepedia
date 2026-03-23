import { Link, useLocation, useParams } from "@tanstack/react-router";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Skeleton } from "@workspace/ui/components/skeleton";

import { auth } from "@/hooks/auth";
import { formatCompactNumber } from "@/utils/format-compact-number";

import type { Nav } from "../route";

type NavItemProps = Nav;

export default function NavItem({
  icon: Icon,
  label,
  link,
  value,
}: NavItemProps) {
  const { username } = useParams({ from: "/_authenticated/@{$username}" });
  const pathname = useLocation({ select: (location) => location.pathname });

  const { data: sessions, isPending } = auth.useListSessions();

  const navItemPath = link.replace("{$username}", username);
  const isActive = pathname === navItemPath;

  return (
    <Button
      asChild
      className="w-full items-center justify-normal gap-2.5 rounded-lg py-2"
      variant="ghost"
    >
      <Link
        activeOptions={{ exact: true }}
        activeProps={{
          className: "bg-secondary text-foreground",
        }}
        inactiveProps={{
          className: "text-muted-foreground",
        }}
        params={{ username }}
        to={link}
      >
        <Icon />
        {label}
        {value === "sessions" && (
          <>
            {isPending && <Skeleton className="ml-auto h-5 w-6 rounded-4xl" />}
            {!isPending && sessions !== undefined && (
              <Badge
                className="ml-auto"
                variant={isActive ? "default" : "secondary"}
              >
                {formatCompactNumber(sessions.length)}
              </Badge>
            )}
          </>
        )}
      </Link>
    </Button>
  );
}
