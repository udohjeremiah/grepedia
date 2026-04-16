import { Link } from "@tanstack/react-router";

import DiscordLink from "@/components/discord-link";
import GitHubLink from "@/components/github-link";
import ThemeSwitcher from "@/components/theme-switcher";
import UserProfile from "@/components/user-profile";

import Search from "./search";
import Tabs from "./tabs";

export default function Header() {
  return (
    <div className="sticky top-0 z-50 space-y-4 border-b bg-background">
      <header className="flex items-center gap-4 px-4 pt-4 sm:px-8 md:px-16">
        <Link className="shrink-0" to="/">
          <img
            alt="Grepedia"
            className="size-8"
            height={48}
            src="/favicon.svg"
            width={48}
          />
        </Link>
        <Search />
        <div className="ms-auto flex items-center gap-2">
          <ThemeSwitcher />
          <GitHubLink />
          <DiscordLink />
          <UserProfile />
        </div>
      </header>
      <nav>
        <Tabs />
      </nav>
    </div>
  );
}
