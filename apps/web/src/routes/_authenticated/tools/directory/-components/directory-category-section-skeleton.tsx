import { Skeleton } from "@workspace/ui/components/skeleton";
import { cn } from "@workspace/ui/utils/cn";

interface DirectoryCategorySectionSkeletonProps {
  withTopBorder?: boolean;
}

export default function DirectoryCategorySectionSkeleton({
  withTopBorder = false,
}: DirectoryCategorySectionSkeletonProps) {
  return (
    <section className={cn(withTopBorder && "border-t")}>
      <div className="flex items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2">
          <Skeleton className="size-4" />
          <Skeleton className="h-4 w-36" />
        </div>
        <Skeleton className="h-5 w-12 rounded-full" />
      </div>
    </section>
  );
}
