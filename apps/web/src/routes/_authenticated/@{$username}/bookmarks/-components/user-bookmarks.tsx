import { Link, useRouteContext } from "@tanstack/react-router";
import { Button } from "@workspace/ui/components/button";
import {
  Empty,
  EmptyContent,
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
import { BookmarkIcon, SearchIcon, XIcon } from "lucide-react";
import { useMemo, useState } from "react";

import { useUserBookmarks } from "../-queries/user-bookmarks";
import UserBookmark from "./user-bookmark";

export default function UserBookmarks() {
  const { userId } = useRouteContext({ from: "/_authenticated" });
  const { data: userBookmarks } = useUserBookmarks({ userId });
  const [searchQuery, setSearchQuery] = useState("");

  const filteredBookmarks = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return userBookmarks;

    return userBookmarks.filter((bookmark) => {
      const searchableText = [
        bookmark.name,
        bookmark.shortDescription,
        bookmark.slug,
        ...bookmark.categories,
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(query);
    });
  }, [searchQuery, userBookmarks]);

  return (
    <div className="flex flex-1 flex-col gap-6 rounded-lg border p-6">
      <div className="flex gap-4 border-b pb-6">
        <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <BookmarkIcon className="size-5" />
        </div>
        <div className="flex flex-col gap-1">
          <h3 className="font-semibold text-foreground">Bookmarked Tools</h3>
          <p className="text-sm text-muted-foreground">
            {userBookmarks.length}{" "}
            {userBookmarks.length === 1 ? "tool" : "tools"} saved to your
            bookmarks.
          </p>
        </div>
      </div>
      <InputGroup>
        <InputGroupAddon>
          <SearchIcon />
        </InputGroupAddon>
        <InputGroupInput
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search bookmarks..."
          value={searchQuery}
        />
        <InputGroupAddon align="inline-end">
          {filteredBookmarks.length} results
        </InputGroupAddon>
      </InputGroup>
      {filteredBookmarks.length > 0 ? (
        <ul className="flex flex-col gap-4">
          {filteredBookmarks.map((bookmark) => (
            <li key={bookmark._id}>
              <UserBookmark {...bookmark} />
            </li>
          ))}
        </ul>
      ) : (
        <Empty className="border border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              {searchQuery.trim() ? (
                <SearchIcon className="text-muted-foreground" />
              ) : (
                <XIcon className="text-muted-foreground" />
              )}
            </EmptyMedia>
            <EmptyTitle>
              {searchQuery.trim()
                ? "No bookmarks match your search"
                : "No bookmarks yet"}
            </EmptyTitle>
            <EmptyDescription>
              {searchQuery.trim()
                ? "Try a different keyword for tool name, description, or category."
                : "Save tools to your bookmarks to find them quickly later."}
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent className="flex-row flex-wrap justify-center gap-2">
            <Button asChild>
              <Link to="/tools/directory">Browse Tool Directory</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/">Search for Tools</Link>
            </Button>
          </EmptyContent>
        </Empty>
      )}
    </div>
  );
}
