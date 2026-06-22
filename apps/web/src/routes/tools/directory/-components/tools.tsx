import { Link } from "@tanstack/react-router";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import { Button } from "@workspace/ui/components/button";
import {
  FileCode2Icon,
  FolderOpenIcon,
  ThumbsDownIcon,
  ThumbsUpIcon,
} from "lucide-react";

import { formatCompactNumber } from "@/utils/format-compact-number";

import { useToolsDirectory } from "../-queries/tools-directory";

interface ToolsProps {
  categoryCount?: number;
  categoryName?: string;
}

export function Tools({ categoryCount, categoryName }: ToolsProps) {
  const {
    data: { tools },
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useToolsDirectory({ category: categoryName ?? "" });

  return (
    <section className="flex flex-col overflow-hidden border">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b px-4 py-2.5">
        <div className="flex items-center gap-2">
          <FolderOpenIcon className="size-4 text-chart-4" />
          <span className="text-sm font-semibold">
            {categoryName ?? "Tools"}
          </span>
        </div>
        <span className="text-xs text-muted-foreground">
          {categoryCount ?? 0} {(categoryCount ?? 0) === 1 ? "tool" : "tools"}
        </span>
      </div>
      {tools.length > 0 ? (
        <div className="divide-y overflow-y-auto">
          {tools.map((tool) => (
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
      {hasNextPage && (
        <div className="border-t px-4 py-3">
          <Button
            disabled={isFetchingNextPage}
            onClick={() => fetchNextPage()}
            size="sm"
            variant="outline"
          >
            {isFetchingNextPage ? "Loading..." : "Load More"}
          </Button>
        </div>
      )}
    </section>
  );
}
