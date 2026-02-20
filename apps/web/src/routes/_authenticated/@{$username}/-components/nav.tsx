import { useRouteContext } from "@tanstack/react-router";
import {
  BookmarkIcon,
  DatabaseIcon,
  MonitorIcon,
  ShieldIcon,
  UserIcon,
  WrenchIcon,
} from "lucide-react";

import { useUserStats } from "../-queries/user-stats";
import NavItem from "./nav-item";

export const navItems = [
  { icon: UserIcon, label: "Profile", value: "profile" },
  { icon: WrenchIcon, label: "Tools", value: "tools" },
  { icon: ShieldIcon, label: "Security", value: "security" },
  { icon: MonitorIcon, label: "Sessions", value: "sessions" },
  { icon: BookmarkIcon, label: "Bookmarks", value: "bookmarks" },
  { icon: DatabaseIcon, label: "Data & Privacy", value: "data" },
] as const;

export type Nav = (typeof navItems)[number];

export default function Nav() {
  const { userId } = useRouteContext({ from: "/_authenticated" });
  const { data: userStats } = useUserStats({ userId });

  const countsByValue: Partial<Record<Nav["value"], number>> = {
    bookmarks: userStats?.bookmarks,
    sessions: userStats?.sessions,
    tools: userStats?.tools,
  };

  return (
    <nav>
      <ul className="no-scrollbar flex gap-1 overflow-x-auto border-b p-2 sm:px-6 md:flex-col md:border-none md:px-0 md:py-6">
        {navItems.map((item) => {
          return (
            <li key={item.value}>
              <NavItem {...item} count={countsByValue[item.value]} />
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
