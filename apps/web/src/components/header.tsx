import type { ReactNode } from "react";

import { Link } from "@tanstack/react-router";
import { Separator } from "@workspace/ui/components/separator";
import { cn } from "@workspace/ui/lib/cn";

import { GitHubLink } from "@/components/github-link";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { UserProfile } from "@/components/user-profile";

interface HeaderProps {
  search?: ReactNode;
  tabs?: ReactNode;
}

export function Header({ search, tabs }: HeaderProps) {
  const hasSubNav = !!tabs;

  return (
    <div
      className={cn(
        "sticky top-0 z-50 border-b bg-background",
        hasSubNav ? "space-y-4" : "p-4 sm:px-8 md:px-16",
      )}
    >
      <header
        className={cn(
          "flex items-center gap-4",
          hasSubNav && "px-4 pt-4 sm:px-8 md:px-16",
        )}
      >
        <Link className="shrink-0" to="/">
          <img alt="Grepedia" className="size-8" src="/favicon.svg" />
        </Link>
        {search}
        <div className="ms-auto flex items-center gap-3">
          <UserProfile />
          <Separator orientation="vertical" />
          <ThemeSwitcher />
          <Separator orientation="vertical" />
          <GitHubLink />
        </div>
      </header>
      {tabs && <nav>{tabs}</nav>}
    </div>
  );
}
