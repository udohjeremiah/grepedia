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
import { SearchIcon, SearchXIcon, XIcon } from "lucide-react";
import { useMemo, useState } from "react";

import { useLists } from "../-queries/lists";
import { List } from "./list";

export function Lists() {
  const { data: lists } = useLists();

  const [searchQuery, setSearchQuery] = useState("");

  const filteredLists = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return lists;

    return lists.filter((list) => {
      const searchableText = [list.title, list.description]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(query);
    });
  }, [lists, searchQuery]);

  return (
    <>
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
          {filteredLists.length} results
        </InputGroupAddon>
      </InputGroup>
      {filteredLists.length > 0 ? (
        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredLists.map((list) => (
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
                : "No lists yet."}
            </EmptyTitle>
            <EmptyDescription>
              {searchQuery.trim()
                ? "Try using different keywords in the title or description."
                : "Create your first list to get started."}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </>
  );
}
