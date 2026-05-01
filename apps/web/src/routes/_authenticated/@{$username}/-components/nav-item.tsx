import { Link, useLocation, useParams } from "@tanstack/react-router";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";

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

  const navItemPath = link.replace("{$username}", username);
  const isActive = pathname === navItemPath;

  return (
    <Button
      asChild
      className="w-full items-center justify-normal gap-2.5"
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
        {value === "sessions" && <SessionsCount isActive={isActive} />}
      </Link>
    </Button>
  );
}

function SessionsCount({ isActive }: { isActive: boolean }) {
  const { data: sessions } = auth.useListSessions();

  return (
    <>
      {sessions && (
        <Badge className="ml-auto" variant={isActive ? "default" : "secondary"}>
          {formatCompactNumber(sessions.length)}
        </Badge>
      )}
    </>
  );
}
