import { createFileRoute, Outlet } from "@tanstack/react-router";
import {
  BookmarkIcon,
  DatabaseIcon,
  MonitorIcon,
  ShieldIcon,
  UserIcon,
  WrenchIcon,
} from "lucide-react";

import NavItem from "./-components/nav-item";
import { userStatQueryOptions } from "./-queries/user-stats";

export const navItems = [
  { icon: UserIcon, label: "Profile", link: "/@{$username}", value: "profile" },
  {
    icon: WrenchIcon,
    label: "Tools",
    link: "/@{$username}/tools",
    value: "tools",
  },
  {
    icon: ShieldIcon,
    label: "Security",
    link: "/@{$username}/security",
    value: "security",
  },
  {
    icon: MonitorIcon,
    label: "Sessions",
    link: "/@{$username}/sessions",
    value: "sessions",
  },
  {
    icon: BookmarkIcon,
    label: "Bookmarks",
    link: "/@{$username}/bookmarks",
    value: "bookmarks",
  },
  {
    icon: DatabaseIcon,
    label: "Data & Privacy",
    link: "/@{$username}/data",
    value: "data",
  },
] as const;

export type Nav = (typeof navItems)[number];

export const Route = createFileRoute("/_authenticated/@{$username}")({
  component: LayoutComponent,
  loader: ({ context }) => {
    context.queryClient.prefetchQuery(
      userStatQueryOptions({ userId: context.userId }),
    );
  },
  // eslint-disable-next-line perfectionist/sort-objects
  head: ({ params }) => ({
    meta: [
      { title: `@${params.username} — Grepedia` },
      {
        content: `View @${params.username}'s profile, tools, bookmarks, sessions, and account settings on Grepedia.`,
        name: "description",
      },
    ],
  }),
});

function LayoutComponent() {
  return (
    <div className="flex flex-1">
      <div className="grid flex-1 grid-cols-1 grid-rows-[auto_minmax(0,1fr)] md:grid-cols-[25%_minmax(0,1fr)] md:grid-rows-none md:gap-6 md:px-16 lg:gap-8 lg:px-32">
        <nav>
          <ul className="no-scrollbar flex gap-1 overflow-x-auto border-b p-2 sm:px-6 md:flex-col md:border-none md:px-0 md:py-6">
            {navItems.map((item) => {
              return (
                <li key={item.value}>
                  <NavItem {...item} />
                </li>
              );
            })}
          </ul>
        </nav>
        <Outlet />
      </div>
    </div>
  );
}
