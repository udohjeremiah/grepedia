import { Link } from "@tanstack/react-router";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { FolderOpenIcon, TrophyIcon } from "lucide-react";
import { Activity, useState } from "react";

import { useMediaQuery } from "@/hooks/use-media-query";
import { formatCompactNumber } from "@/utils/format-compact-number";

import { useToolsDirectoryCategories } from "../-queries/tools-directory-categories";

interface CategoriesProps {
  categories: ReturnType<typeof useToolsDirectoryCategories>["data"];
  onSelect: (category: string) => void;
  selectedCategory?: string;
}

export function Categories({
  categories,
  onSelect,
  selectedCategory,
}: CategoriesProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  return (
    <aside className="h-full overflow-hidden border">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b px-3 py-2">
        <h3 className="flex items-center gap-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          <FolderOpenIcon className="size-3.5 text-chart-4" />
          Categories
        </h3>
        <Button asChild className="text-chart-2" size="xs" variant="outline">
          <Link to="/leaderboard">
            <TrophyIcon /> Leaderboard
          </Link>
        </Button>
      </div>
      <div className="px-3 py-2 md:hidden">
        <Button
          aria-expanded={isExpanded}
          className="w-full"
          onClick={() => setIsExpanded((previous) => !previous)}
          size="sm"
          variant="outline"
        >
          {isExpanded ? "Hide Categories" : "Show Categories"}
        </Button>
      </div>
      <Activity mode={isDesktop || isExpanded ? "visible" : "hidden"}>
        <div className="h-full overflow-y-auto max-md:border-t">
          {categories.map((category) => {
            const isActive = category.name === selectedCategory;

            return (
              <Button
                className="w-full gap-2.5 border-none text-start"
                key={category.name}
                onClick={() => {
                  onSelect(category.name);
                  setIsExpanded(false);
                }}
                variant={isActive ? "secondary" : "ghost"}
              >
                <span className="flex-1 truncate">{category.name}</span>
                <Badge className="ml-auto" variant="outline">
                  {formatCompactNumber(category.count)}
                </Badge>
              </Button>
            );
          })}
        </div>
      </Activity>
    </aside>
  );
}
