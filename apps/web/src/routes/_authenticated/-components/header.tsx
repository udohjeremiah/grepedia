import { Link } from "@tanstack/react-router";

import GitHubLink from "@/components/github-link";
import ThemeSwitcher from "@/components/theme-switcher";
import UserProfile from "@/components/user-profile";

export default function Header() {
  return (
    <div className="sticky top-0 z-50 border-b bg-background p-4 sm:px-8 md:px-16">
      <header className="flex items-center justify-between gap-4">
        <Link className="shrink-0" to="/">
          <img
            alt="Grepedia"
            className="size-8"
            height={48}
            src="/favicon.svg"
            width={48}
          />
        </Link>
        <div className="flex items-center gap-1">
          <GitHubLink />
          <ThemeSwitcher />
          <UserProfile />
        </div>
      </header>
    </div>
  );
}
