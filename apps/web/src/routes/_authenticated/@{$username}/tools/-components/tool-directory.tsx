import { Link } from "@tanstack/react-router";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@workspace/ui/components/empty";
import {
  FileCode2Icon,
  FolderOpenIcon,
  MessageSquareIcon,
  SearchXIcon,
  ThumbsDownIcon,
  ThumbsUpIcon,
  XIcon,
} from "lucide-react";
import { Activity, useMemo, useState } from "react";

import { useMediaQuery } from "@/hooks/use-media-query";
import { formatCompactNumber } from "@/utils/format-compact-number";

import { useUserTools } from "../-queries/user-tools";

interface ToolDirectoryProps {
  searchQuery: string;
  tools: UserTool[];
}

type UserTool = ReturnType<typeof useUserTools>["data"]["tools"][number];

export function ToolDirectory({ searchQuery, tools }: ToolDirectoryProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>();
  const [isExpanded, setIsExpanded] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const groupedByCategory = useMemo(() => {
    const categoryMap = new Map<string, UserTool[]>();

    for (const tool of tools) {
      for (const category of tool.categories) {
        const current = categoryMap.get(category) ?? [];
        current.push(tool);
        categoryMap.set(category, current);
      }
    }

    return (
      [...categoryMap.entries()]
        .map(([category, categoryTools]) => ({
          category,
          tools: categoryTools,
        }))
        // eslint-disable-next-line unicorn/no-array-sort
        .sort((a, b) => a.category.localeCompare(b.category))
    );
  }, [tools]);

  const categories = groupedByCategory.map((group) => group.category);

  const safeCategory =
    selectedCategory && categories.includes(selectedCategory)
      ? selectedCategory
      : categories[0];

  const activeGroup = groupedByCategory.find(
    (group) => group.category === safeCategory,
  );

  if (groupedByCategory.length === 0) {
    return (
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
            {searchQuery.trim() ? "No tools match your search" : "No tools yet"}
          </EmptyTitle>
          <EmptyDescription>
            {searchQuery.trim()
              ? "Try a different keyword for tool names, descriptions, categories, or tags."
              : "Contribute to or interact with tools to find them quickly later."}
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="grid gap-4 md:max-h-140 md:grid-cols-[30%_minmax(0,1fr)] md:overflow-hidden">
      <aside className="flex flex-col overflow-hidden border">
        <div className="flex items-center gap-2 border-b px-3 py-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          <FolderOpenIcon className="size-3.5 text-chart-4" />
          Categories
        </div>
        <div className="px-3 py-2 md:hidden">
          <Button
            aria-expanded={isExpanded}
            className="w-full"
            onClick={() => setIsExpanded((previous) => !previous)}
            size="sm"
            variant="outline"
          >
            {isExpanded ? "Hide Categories" : "Show Categories"}
          </Button>
        </div>
        <Activity mode={isDesktop || isExpanded ? "visible" : "hidden"}>
          <div className="overflow-y-auto max-md:border-t">
            {groupedByCategory.map((group) => {
              const isActive = group.category === safeCategory;

              return (
                <Button
                  className="w-full gap-2.5 border-none text-start"
                  key={group.category}
                  onClick={() => {
                    setSelectedCategory(group.category);
                    setIsExpanded(false);
                  }}
                  variant={isActive ? "secondary" : "ghost"}
                >
                  <span className="flex-1 truncate">{group.category}</span>
                  <Badge className="ml-auto" variant="outline">
                    {formatCompactNumber(group.tools.length)}
                  </Badge>
                </Button>
              );
            })}
          </div>
        </Activity>
      </aside>
      <section className="flex flex-col overflow-hidden border">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-2.5">
          <div className="flex items-center gap-2">
            <FolderOpenIcon className="size-4 text-chart-4" />
            <span className="text-sm font-semibold">
              {activeGroup?.category ?? "Tools"}
            </span>
          </div>
          <span className="text-xs text-muted-foreground">
            {activeGroup?.tools.length ?? 0}{" "}
            {(activeGroup?.tools.length ?? 0) === 1 ? "tool" : "tools"}
          </span>
        </div>
        {(activeGroup?.tools.length ?? 0) > 0 ? (
          <div className="divide-y overflow-y-auto">
            {(activeGroup?.tools ?? []).map((tool) => (
              <Link
                className="flex w-full flex-wrap items-center gap-2.5 px-4 py-2.5 transition-all hover:bg-muted hover:text-foreground dark:hover:bg-muted/50"
                key={tool._id}
                params={{ slug: tool.slug }}
                to="/tools/@{$slug}"
              >
                <Avatar size="sm">
                  <AvatarImage
                    alt={tool.name}
                    src={`https://www.google.com/s2/favicons?domain=${tool.officialUrl}&sz=128`}
                  />
                  <AvatarFallback>
                    {tool.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="flex-1 truncate text-sm font-medium">
                  {tool.name}
                </span>
                <div className="flex items-center gap-3 text-[11px] text-muted-foreground/70">
                  <span className="flex items-center gap-1">
                    <ThumbsUpIcon className="size-3" />
                    {formatCompactNumber(tool.stats.upvotes)}
                  </span>
                  <span className="flex items-center gap-1">
                    <ThumbsDownIcon className="size-3" />
                    {formatCompactNumber(tool.stats.downvotes)}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquareIcon className="size-3" />
                    {formatCompactNumber(tool.stats.comments)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 px-4 py-8 text-center text-sm text-muted-foreground">
            <FileCode2Icon className="size-5" />
            No tools in this category yet.
          </div>
        )}
      </section>
    </div>
  );
}
