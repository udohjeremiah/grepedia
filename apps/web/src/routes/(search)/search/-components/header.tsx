import GitHubLink from "@/components/github-link";
import ThemeSwitcher from "@/components/theme-switcher";
import { Link } from "@tanstack/react-router";
import Search from "./search";
import Tabs from "./tabs";
import UserProfile from "./user-profile";

export default function Header() {
  return (
    <div className="sticky top-0 z-50 space-y-4 border-b bg-background">
      <header className="flex items-center gap-4 px-4 pt-4 sm:px-8 md:px-16">
        <Link to="/" className="shrink-0">
          <img
            src="/favicon.svg"
            alt="Grepedia"
            width={48}
            height={48}
            className="size-8"
          />
        </Link>
        <Search />
        <div className="ms-auto flex items-center gap-1">
          <GitHubLink />
          <ThemeSwitcher />
          <UserProfile />
        </div>
      </header>
      <nav>
        <Tabs />
      </nav>
    </div>
  );
}
