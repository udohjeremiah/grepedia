import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@workspace/ui/components/empty";
import { FolderTreeIcon } from "lucide-react";
import { Suspense, useEffect, useMemo, useState } from "react";

import { useToolsDirectoryCategories } from "../-queries/tools-directory-categories";
import Categories from "./categories";
import CategoriesSkeleton from "./categories-skeleton";
import Tools from "./tools";
import ToolsSkeleton from "./tools-skeleton";

export default function Directory() {
  const { data: categories } = useToolsDirectoryCategories();
  const [selectedCategory, setSelectedCategory] = useState<string>();

  const list = useMemo(() => categories, [categories]);

  useEffect(() => {
    if (!selectedCategory || !list.some((c) => c.name === selectedCategory)) {
      setSelectedCategory(list[0]?.name);
    }
  }, [list, selectedCategory]);

  const safeCategory = selectedCategory ?? list[0]?.name ?? "";
  const activeCategory = list.find(
    (category) => category.name === safeCategory,
  );

  if (list.length === 0) {
    return (
      <Empty className="border border-dashed">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FolderTreeIcon className="text-muted-foreground" />
          </EmptyMedia>
          <EmptyTitle>No categories yet</EmptyTitle>
          <EmptyDescription>
            Tools will appear here once published categories are available.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="grid flex-1 gap-4 md:grid-cols-[25%_minmax(0,1fr)]">
      <Suspense fallback={<CategoriesSkeleton />}>
        <Categories
          categories={list}
          onSelect={setSelectedCategory}
          selectedCategory={selectedCategory}
        />
      </Suspense>
      <Suspense fallback={<ToolsSkeleton />}>
        <Tools
          categoryCount={activeCategory?.count}
          categoryName={safeCategory}
        />
      </Suspense>
    </div>
  );
}
