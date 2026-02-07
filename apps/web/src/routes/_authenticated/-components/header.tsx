import GitHubLink from "@/components/github-link";
import ThemeSwitcher from "@/components/theme-switcher";
import UserProfile from "@/components/user-profile";
import { Link } from "@tanstack/react-router";

export default function Header() {
  return (
    <div className="sticky top-0 z-50 border-b bg-background p-4 sm:px-8 md:px-16">
      <header className="flex items-center justify-between gap-4">
        <Link to="/" className="shrink-0">
          <img
            src="/favicon.svg"
            alt="Grepedia"
            width={48}
            height={48}
            className="size-8"
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
