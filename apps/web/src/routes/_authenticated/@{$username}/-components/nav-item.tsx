import { Link, useLocation, useParams } from "@tanstack/react-router";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";

import type { Nav } from "./nav";

const navRoutes: Record<Nav["value"], string> = {
  bookmarks: "/@{$username}/bookmarks",
  data: "/@{$username}/data",
  profile: "/@{$username}",
  security: "/@{$username}/security",
  sessions: "/@{$username}/sessions",
  tools: "/@{$username}/tools",
} as const;

type NavItemProps = Nav & { count: number | undefined };

export default function NavItem({
  count,
  icon: Icon,
  label,
  value,
}: NavItemProps) {
  const { username } = useParams({ from: "/_authenticated/@{$username}" });
  const pathname = useLocation({ select: (location) => location.pathname });
  const navItemPath = navRoutes[value].replace("{$username}", username);
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
        to={navRoutes[value]}
      >
        <Icon />
        {label}
        {count !== undefined && (
          <Badge
            className="ml-auto"
            variant={isActive ? "default" : "secondary"}
          >
            {count}
          </Badge>
        )}
      </Link>
    </Button>
  );
}
