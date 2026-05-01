import { Link, useSearch } from "@tanstack/react-router";

import type { Tab } from "./tabs";

export default function Tab({ icon: Icon, label, value }: Tab) {
  const searchParams = useSearch({ from: "/search/" });

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
