import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@workspace/ui/components/empty";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@workspace/ui/components/input-group";
import { FolderTreeIcon, SearchIcon } from "lucide-react";
import { Suspense, useMemo, useState } from "react";

import { useToolsDirectoryCategories } from "../-queries/tools-directory-categories";
import DirectoryCategorySection from "./directory-category-section";
import DirectoryCategorySectionSkeleton from "./directory-category-section-skeleton";

export default function Directory() {
  const { data: categories } = useToolsDirectoryCategories();
  const [categoryQuery, setCategoryQuery] = useState("");

  const filteredCategories = useMemo(() => {
    const query = categoryQuery.trim().toLowerCase();
    if (!query) return categories;

    return categories.filter((category) =>
      category.name.toLowerCase().includes(query),
    );
  }, [categories, categoryQuery]);

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
    <>
      <div className="space-y-2">
        <InputGroup>
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
          <InputGroupInput
            onChange={(event) => setCategoryQuery(event.target.value)}
            placeholder="Filter categories..."
            value={categoryQuery}
          />
        </InputGroup>
        <p className="text-xs text-muted-foreground">
          Showing {filteredCategories.length} of {categories.length} categories
        </p>
      </div>
      {filteredCategories.length === 0 && (
        <Empty className="border border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <SearchIcon className="text-muted-foreground" />
            </EmptyMedia>
            <EmptyTitle>No categories match your filter</EmptyTitle>
            <EmptyDescription>
              Try a different keyword to find a category.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
      {filteredCategories.length > 0 && (
        <div className="overflow-hidden rounded-lg border">
          {filteredCategories.map((category, index) => (
            <Suspense
              fallback={
                <DirectoryCategorySectionSkeleton withTopBorder={index > 0} />
              }
              key={category.name}
            >
              <DirectoryCategorySection
                category={category.name}
                count={category.count}
                defaultExpanded={categoryQuery.trim().length > 0}
                withTopBorder={index > 0}
              />
            </Suspense>
          ))}
        </div>
      )}
    </>
  );
}
