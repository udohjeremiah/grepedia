import { Skeleton } from "@workspace/ui/components/skeleton";

import DirectoryCategorySectionSkeleton from "./directory-category-section-skeleton";

export default function DirectorySkeleton() {
  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="space-y-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-4 w-52" />
      </div>
      <div className="overflow-hidden rounded-lg border">
        <DirectoryCategorySectionSkeleton />
        <DirectoryCategorySectionSkeleton withTopBorder />
      </div>
    </div>
  );
}
