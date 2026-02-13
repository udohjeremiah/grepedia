import { useRouteContext } from "@tanstack/react-router";
import {
  ActivityIcon,
  BookmarkIcon,
  DatabaseIcon,
  MonitorIcon,
  ShieldIcon,
  UserIcon,
} from "lucide-react";

import { useUserSummary } from "../-queries/user-summary";
import NavItem from "./nav-item";

export const navItems = [
  { icon: UserIcon, label: "Profile", value: "profile" },
  { icon: ActivityIcon, label: "Activity", value: "activity" },
  { icon: ShieldIcon, label: "Security", value: "security" },
  { icon: MonitorIcon, label: "Sessions", value: "sessions" },
  { icon: BookmarkIcon, label: "Bookmarks", value: "bookmarks" },
  { icon: DatabaseIcon, label: "Data & Privacy", value: "data" },
] as const;

export type Nav = (typeof navItems)[number];

export default function Nav() {
  const { userId } = useRouteContext({ from: "/_authenticated" });
  const { data: userSummary } = useUserSummary({ id: userId });

  const countsByValue: Partial<Record<Nav["value"], number>> = {
    activity: userSummary?.activities,
    bookmarks: userSummary?.bookmarks,
    sessions: userSummary?.sessions,
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
