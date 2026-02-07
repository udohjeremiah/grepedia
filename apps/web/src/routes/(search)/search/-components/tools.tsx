import { useItemsCount } from "@/hooks/use-items-count";
import { useSearch } from "@tanstack/react-router";
import { Spinner } from "@workspace/ui/components/spinner";
import { cn } from "@workspace/ui/lib/utils";
import { useEffect, useRef } from "react";
import { useSearchTools } from "../-queries/search";
import EmptyTools from "./empty-tools";
import Tool from "./tool";

export default function Tools() {
  const searchParams = useSearch({ from: "/(search)/search/" });
  const containerRef = useRef<HTMLElement>(null);
  const trackingRef = useRef<HTMLDivElement>(null);
  const limit = useItemsCount(containerRef, { rowHeight: 70, gap: 16 });

  const {
    data: tools,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useSearchTools({
    ...searchParams,
    limit,
  });

  useEffect(() => {
    const sentinel = trackingRef.current;
    if (!sentinel || !hasNextPage || isFetchingNextPage) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;

        const isInView = entry.isIntersecting;
        if (isInView) fetchNextPage();
      },
      { rootMargin: "100px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  return (
    <main
      ref={containerRef}
      className="relative flex flex-1 flex-col p-4 sm:px-8 md:px-16"
    >
      {tools.length > 0 ? (
        <ul className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {tools.map((tool) => (
            <li key={tool._id}>
              <Tool {...tool} />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyTools />
      )}
      <div
        className={cn(
          "pointer-events-none fixed bottom-6 left-1/2 z-50 -translate-x-1/2 transition-opacity duration-200",
          isFetchingNextPage ? "opacity-100" : "opacity-0",
        )}
      >
        <div className="flex items-center justify-center rounded-full border bg-background p-1">
          <Spinner className="size-5" />
        </div>
      </div>
      <div
        ref={trackingRef}
        aria-hidden="true"
        className="pointer-events-none h-1"
      />
    </main>
  );
}
