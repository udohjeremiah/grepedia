import { Skeleton } from "@workspace/ui/components/skeleton";
import { useRef } from "react";

import { useItemsCount } from "@/hooks/use-items-count";

export default function ToolsSkeleton() {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemsCount = useItemsCount(containerRef, { gap: 16, rowHeight: 70 });

  return (
    <div
      className="grid flex-1 grid-cols-1 gap-4 overflow-hidden p-4 sm:px-8 md:grid-cols-2 md:px-16 lg:grid-cols-3 2xl:grid-cols-4"
      ref={containerRef}
    >
      {Array.from({ length: itemsCount }).map((_, index) => (
        <div className="rounded-2xl border p-2" key={index}>
          <div className="flex items-center gap-3">
            <Skeleton className="size-15 shrink-0 rounded-full" />
            <div className="min-w-0 flex-1 space-y-1.5">
              <Skeleton className="h-4 w-32 max-w-[70%]" />
              <Skeleton className="h-4 w-full max-w-[90%]" />
              <div className="flex items-center justify-between gap-4">
                <Skeleton className="h-5 w-20 rounded-4xl" />
                <Skeleton className="size-6 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
