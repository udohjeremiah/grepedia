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
  value: TabValue;
  label: TabLabel;
}

export const TAB_ICONS: Record<TabValue, LucideIcon> = {
  all: SearchIcon,
  popular: StarIcon,
  trending: MessageCircleIcon,
  verified: BadgeCheckIcon,
  new: SparklesIcon,
};

export default function Tab({ value, label }: TabProps) {
  const searchParams = useSearch({ from: "/(search)/search/" });
  const Icon = TAB_ICONS[value];
  const isTabChange = value !== searchParams.tab;

  return (
    <Link
      to="/search"
      search={{ ...searchParams, tab: value, limit: undefined }}
      onClick={() => {
        if (isTabChange) {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      }}
      activeProps={{
        className:
          "text-primary after:absolute after:bottom-0 after:h-0.5 after:w-full after:bg-primary",
      }}
      className="relative flex items-center gap-2 pb-2 text-sm font-medium text-muted-foreground hover:text-primary"
    >
      <Icon className="size-5" />
      {label}
    </Link>
  );
}
