import Tab from "./tab";

export const TABS = [
  { value: "all", label: "All" },
  { value: "popular", label: "Popular" },
  { value: "trending", label: "Trending" },
  { value: "verified", label: "Verified" },
  { value: "new", label: "New" },
] as const;

export type TabValue = (typeof TABS)[number]["value"];
export type TabLabel = (typeof TABS)[number]["label"];

export default function Tabs() {
  return (
    <ul className="relative no-scrollbar flex gap-6 overflow-x-auto scroll-smooth px-4 sm:px-8 md:px-16">
      {TABS.map((tab) => (
        <li key={tab.value}>
          <Tab value={tab.value} label={tab.label} />
        </li>
      ))}
    </ul>
  );
}
