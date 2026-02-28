import {
  Link,
  useLocation,
  useParams,
  useRouteContext,
} from "@tanstack/react-router";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Skeleton } from "@workspace/ui/components/skeleton";

import { formatCompactNumber } from "@/utils/format-compact-number";

import type { Nav } from "../route";

import { useUserStats } from "../-queries/user-stats";

type NavItemProps = Nav;

const countValues = new Set<Nav["value"]>(["bookmarks", "sessions", "tools"]);

export default function NavItem({
  icon: Icon,
  label,
  link,
  value,
}: NavItemProps) {
  const { userId } = useRouteContext({ from: "/_authenticated" });
  const { username } = useParams({ from: "/_authenticated/@{$username}" });
  const pathname = useLocation({ select: (location) => location.pathname });

  const navItemPath = link.replace("{$username}", username);
  const isActive = pathname === navItemPath;

  const needsCount = countValues.has(value);

  const { data: stats, isPending } = useUserStats(
    { userId },
    { enabled: needsCount },
  );

  const getCountForValue = () => {
    if (value === "bookmarks") return stats?.bookmarks;
    if (value === "sessions") return stats?.sessions;
    if (value === "tools") return stats?.tools;
    // eslint-disable-next-line sonarjs/no-redundant-jump
    return;
  };

  const count = getCountForValue();

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
        {needsCount && (
          <>
            {isPending && <Skeleton className="ml-auto h-5 w-6 rounded-4xl" />}
            {!isPending && count !== undefined && (
              <Badge
                className="ml-auto"
                variant={isActive ? "default" : "secondary"}
              >
                {formatCompactNumber(count)}
              </Badge>
            )}
          </>
        )}
      </Link>
    </Button>
  );
}
