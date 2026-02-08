import { Link, useSearch } from "@tanstack/react-router";
import {
  BadgeCheckIcon,
  type LucideIcon,
  MessageCircleIcon,
  SearchIcon,
  SparklesIcon,
  StarIcon,
} from "lucide-react";

import type { TabLabel, TabValue } from "./tabs";

interface TabProps {
  label: TabLabel;
  value: TabValue;
}

export const TAB_ICONS: Record<TabValue, LucideIcon> = {
  all: SearchIcon,
  new: SparklesIcon,
  popular: StarIcon,
  trending: MessageCircleIcon,
  verified: BadgeCheckIcon,
};

export default function Tab({ label, value }: TabProps) {
  const searchParams = useSearch({ from: "/(search)/search/" });
  const Icon = TAB_ICONS[value];
  const isTabChange = value !== searchParams.tab;

  return (
    <Link
      activeProps={{
        className:
          "text-primary after:absolute after:bottom-0 after:h-0.5 after:w-full after:bg-primary",
      }}
      className="relative flex items-center gap-2 pb-2 text-sm font-medium text-muted-foreground hover:text-primary"
      onClick={() => {
        if (isTabChange) {
          window.scrollTo({ behavior: "smooth", top: 0 });
        }
      }}
      search={{ ...searchParams, limit: undefined, tab: value }}
      to="/search"
    >
      <Icon className="size-5" />
      {label}
    </Link>
  );
}
