import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@workspace/ui/components/empty";
import { FolderTreeIcon } from "lucide-react";
import { Suspense, useState } from "react";

import { useToolsDirectoryCategories } from "../-queries/tools-directory-categories";
import { Categories } from "./categories";
import { Tools } from "./tools";

export function Directory() {
  const { data: categories } = useToolsDirectoryCategories();
  const [selectedCategory, setSelectedCategory] = useState<string>();

  const safeCategory =
    selectedCategory && categories.some((c) => c.name === selectedCategory)
      ? selectedCategory
      : (categories[0]?.name ?? "");

  const activeCategory = categories.find(
    (category) => category.name === safeCategory,
  );

  if (categories.length === 0) {
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
    <div className="size-full space-y-4 md:grid md:h-[calc(100vh-9.25rem)] md:grid-cols-[25%_minmax(0,1fr)] md:gap-4 md:overflow-hidden">
      <Suspense>
        <Categories
          categories={categories}
          onSelect={setSelectedCategory}
          selectedCategory={safeCategory}
        />
      </Suspense>
      <Suspense>
        <Tools
          categoryCount={activeCategory?.count}
          categoryName={safeCategory}
        />
      </Suspense>
    </div>
  );
}
