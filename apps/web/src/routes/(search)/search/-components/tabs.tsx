import {
  BadgeCheckIcon,
  MessageCircleIcon,
  SearchIcon,
  SparklesIcon,
  StarIcon,
} from "lucide-react";

import Tab from "./tab";

export const tabs = [
  { icon: SearchIcon, label: "All", value: "all" },
  { icon: StarIcon, label: "Popular", value: "popular" },
  { icon: MessageCircleIcon, label: "Trending", value: "trending" },
  { icon: BadgeCheckIcon, label: "Verified", value: "verified" },
  { icon: SparklesIcon, label: "New", value: "new" },
] as const;

export type Tab = (typeof tabs)[number];

export default function Tabs() {
  return (
    <ul className="relative no-scrollbar flex gap-6 overflow-x-auto scroll-smooth px-4 sm:px-8 md:px-16">
      {tabs.map((tab) => (
        <li key={tab.value}>
          <Tab {...tab} />
        </li>
      ))}
    </ul>
  );
}
