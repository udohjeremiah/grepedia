import Tab from "./tab";

export const TABS = [
  { label: "All", value: "all" },
  { label: "Popular", value: "popular" },
  { label: "Trending", value: "trending" },
  { label: "Verified", value: "verified" },
  { label: "New", value: "new" },
] as const;

export type TabLabel = (typeof TABS)[number]["label"];
export type TabValue = (typeof TABS)[number]["value"];

export default function Tabs() {
  return (
    <ul className="relative no-scrollbar flex gap-6 overflow-x-auto scroll-smooth px-4 sm:px-8 md:px-16">
      {TABS.map((tab) => (
        <li key={tab.value}>
          <Tab label={tab.label} value={tab.value} />
        </li>
      ))}
    </ul>
  );
}
