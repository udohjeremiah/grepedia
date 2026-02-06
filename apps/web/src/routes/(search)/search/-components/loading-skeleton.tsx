import { useItemsCount } from "@/hooks/use-items-count";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { useRef } from "react";

export default function LoadingSkeleton() {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemsCount = useItemsCount(containerRef, { rowHeight: 56, gap: 24 });

  return (
    <div
      ref={containerRef}
      className="grid flex-1 grid-cols-1 gap-6 overflow-hidden p-4 sm:p-8 md:grid-cols-2 md:px-16 lg:grid-cols-3 2xl:grid-cols-4"
    >
      {Array.from({ length: itemsCount }).map((_, index) => (
        <div key={index} className="flex items-center gap-3">
          <Skeleton className="size-10 shrink-0 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-56" />
          </div>
          <div className="ms-auto">
            <Skeleton className="h-6 w-1.5" />
          </div>
        </div>
      ))}
    </div>
  );
}
