import { Link } from "@tanstack/react-router";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { FolderOpenIcon, TrophyIcon } from "lucide-react";

import { formatCompactNumber } from "@/utils/format-compact-number";

import { useToolsDirectoryCategories } from "../-queries/tools-directory-categories";

interface CategoriesProps {
  categories: ReturnType<typeof useToolsDirectoryCategories>["data"];
  onSelect: (category: string) => void;
  selectedCategory?: string;
}

export default function Categories({
  categories,
  onSelect,
  selectedCategory,
}: CategoriesProps) {
  return (
    <aside className="overflow-hidden rounded-lg border md:sticky md:top-4 md:self-start">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b px-3 py-2">
        <h3 className="flex items-center gap-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          <FolderOpenIcon className="size-3.5 text-info" />
          Categories
        </h3>
        <Button asChild className="text-warning" size="xs" variant="outline">
          <Link to="/leaderboard">
            <TrophyIcon /> Leaderboard
          </Link>
        </Button>
      </div>
      <div className="max-h-140 overflow-y-auto">
        {categories.map((category) => {
          const isActive = category.name === selectedCategory;

          return (
            <Button
              className="w-full gap-2.5 rounded-none border-none text-start"
              key={category.name}
              onClick={() => onSelect(category.name)}
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
    </aside>
  );
}
