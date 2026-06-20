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
import { Spinner } from "@workspace/ui/components/spinner";
import { cn } from "@workspace/ui/lib/cn";
import { SearchIcon, SearchXIcon, StarIcon, XIcon } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { useLists } from "../-queries/lists";
import { List } from "./list";

export function Lists() {
  const {
    data: lists,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useLists();

  const trackingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = trackingRef.current;
    if (!sentinel || !hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        if (entry.isIntersecting) fetchNextPage();
      },
      { rootMargin: "100px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const [searchQuery, setSearchQuery] = useState("");

  const officialLists = useMemo(
    () => lists.filter((list) => list.isOfficial),
    [lists],
  );

  const communityLists = useMemo(
    () => lists.filter((list) => !list.isOfficial),
    [lists],
  );

  const filteredCommunityLists = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return communityLists;

    return communityLists.filter((list) => {
      const searchableText = [list.title, list.description]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(query);
    });
  }, [communityLists, searchQuery]);

  return (
    <>
      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <StarIcon className="size-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
            Featured
          </h3>
        </div>
        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {officialLists.map((list) => (
            <li key={list._id}>
              <List {...list} />
            </li>
          ))}
        </ul>
      </section>
      <section className="flex flex-col gap-4">
        <h3 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
          Community
        </h3>
        <InputGroup>
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
          <InputGroupInput
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search lists by title or description..."
            value={searchQuery}
          />
          <InputGroupAddon align="inline-end">
            {filteredCommunityLists.length} results
          </InputGroupAddon>
        </InputGroup>
        {filteredCommunityLists.length > 0 ? (
          <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredCommunityLists.map((list) => (
              <li key={list._id}>
                <List {...list} />
              </li>
            ))}
          </ul>
        ) : (
          <Empty className="border border-dashed">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                {searchQuery.trim() ? (
                  <SearchXIcon className="text-muted-foreground" />
                ) : (
                  <XIcon className="text-muted-foreground" />
                )}
              </EmptyMedia>
              <EmptyTitle>
                {searchQuery.trim()
                  ? "No lists match your search."
                  : "No lists created by the community yet."}
              </EmptyTitle>
              <EmptyDescription>
                {searchQuery.trim()
                  ? "Try using different keywords in the title or description."
                  : "Create your first list to get started."}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </section>
      <div
        className={cn(
          "pointer-events-none fixed bottom-6 left-1/2 z-50 -translate-x-1/2 transition-opacity duration-200",
          isFetchingNextPage ? "opacity-100" : "opacity-0",
        )}
      >
        <div className="flex items-center justify-center border bg-background p-1">
          <Spinner className="size-5" />
        </div>
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none h-1"
        ref={trackingRef}
      />
    </>
  );
}
