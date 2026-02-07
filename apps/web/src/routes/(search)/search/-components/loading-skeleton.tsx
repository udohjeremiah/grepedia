import { useItemsCount } from "@/hooks/use-items-count";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { useRef } from "react";

export default function LoadingSkeleton() {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemsCount = useItemsCount(containerRef, { rowHeight: 70, gap: 16 });

  return (
    <div
      ref={containerRef}
      className="grid flex-1 grid-cols-1 gap-4 overflow-hidden p-4 sm:px-8 md:grid-cols-2 md:px-16 lg:grid-cols-3 2xl:grid-cols-4"
    >
      {Array.from({ length: itemsCount }).map((_, index) => (
        <div key={index} className="flex items-center gap-3">
          <Skeleton className="size-15 shrink-0 rounded-2xl" />
          <div className="flex-1 space-y-1">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-56" />
            <div className="flex items-center justify-between gap-4">
              <Skeleton className="h-4 w-8" />
              <Skeleton className="h-4 w-1.5" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
