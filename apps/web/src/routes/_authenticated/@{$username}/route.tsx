import { createFileRoute, Outlet } from "@tanstack/react-router";
import {
  BookmarkIcon,
  DatabaseIcon,
  ListChecksIcon,
  MonitorIcon,
  ScaleIcon,
  ShieldIcon,
  UserIcon,
  WrenchIcon,
} from "lucide-react";

import { getSession } from "@/utils/get-session";

import { NavItem } from "./-components/nav-item";

const baseNavItems = [
  {
    icon: UserIcon,
    label: "Profile",
    link: "/@{$username}",
    value: "profile",
  },
  {
    icon: WrenchIcon,
    label: "Tools",
    link: "/@{$username}/tools",
    value: "tools",
  },
  {
    icon: BookmarkIcon,
    label: "Bookmarks",
    link: "/@{$username}/bookmarks",
    value: "bookmarks",
  },
  {
    icon: ListChecksIcon,
    label: "Lists",
    link: "/@{$username}/lists",
    value: "lists",
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
    icon: DatabaseIcon,
    label: "Data",
    link: "/@{$username}/data",
    value: "data",
  },
] as const;

const moderationNavItem = {
  icon: ScaleIcon,
  label: "Moderation",
  link: "/@{$username}/moderation",
  value: "moderation",
} as const;

export type Nav = (typeof baseNavItems)[number] | typeof moderationNavItem;

export const Route = createFileRoute("/_authenticated/@{$username}")({
  component: LayoutComponent,
  loader: async () => {
    const session = await getSession();
    const role = session?.user.role;
    const canModerate = role === "moderator";

    return { canModerate };
  },
  // eslint-disable-next-line perfectionist/sort-objects
  head: ({ params }) => ({
    meta: [
      { title: `@${params.username} • Grepedia` },
      {
        content: `View @${params.username}'s profile, tools, bookmarks, sessions, and account settings on Grepedia.`,
        name: "description",
      },
    ],
  }),
});

function LayoutComponent() {
  const { canModerate } = Route.useLoaderData();

  const navItems = canModerate
    ? [...baseNavItems, moderationNavItem]
    : baseNavItems;

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
