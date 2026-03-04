import { Link } from "@tanstack/react-router";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/utils/cn";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  FileCode2Icon,
  FolderIcon,
  FolderOpenIcon,
  MessageSquareIcon,
  ThumbsDownIcon,
  ThumbsUpIcon,
} from "lucide-react";
import { useEffect, useState } from "react";

import { formatCompactNumber } from "@/utils/format-compact-number";

import { useToolsDirectory } from "../-queries/tools-directory";

interface DirectoryCategorySectionProps {
  category: string;
  count: number;
  defaultExpanded?: boolean;
  withTopBorder?: boolean;
}

export default function DirectoryCategorySection({
  category,
  count,
  defaultExpanded = false,
  withTopBorder = false,
}: DirectoryCategorySectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useToolsDirectory({ category, limit: 8 });

  useEffect(() => {
    if (defaultExpanded) {
      setIsExpanded(true);
    }
  }, [defaultExpanded]);

  return (
    <section className={cn(withTopBorder && "border-t")}>
      <button
        className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left transition-colors hover:bg-secondary/50"
        onClick={() => setIsExpanded((previous) => !previous)}
      >
        {isExpanded ? (
          <>
            <ChevronDownIcon className="size-3.5 text-muted-foreground" />
            <FolderOpenIcon className="size-4 text-info" />
          </>
        ) : (
          <>
            <ChevronRightIcon className="size-3.5 text-muted-foreground" />
            <FolderIcon className="size-4 text-info" />
          </>
        )}
        <span className="text-sm font-medium">{category}</span>
        <Badge className="ml-auto" variant="secondary">
          {count}
        </Badge>
      </button>
      {isExpanded && (
        <div className="border-t">
          {data.tools.length === 0 ? (
            <p className="px-4 py-3 pl-11 text-sm text-muted-foreground">
              No tools found in this category.
            </p>
          ) : (
            <ul>
              {data.tools.map((tool, index) => (
                <li
                  className={cn("border-muted/50", index > 0 && "border-t")}
                  key={tool._id}
                >
                  <Link
                    className="flex items-center gap-2 px-4 py-2 pl-11 transition-colors hover:bg-secondary/40"
                    params={{ slug: tool.slug }}
                    to="/tools/@{$slug}"
                  >
                    <FileCode2Icon className="size-3.5 shrink-0 text-muted-foreground" />
                    <span className="flex-1 truncate text-sm">{tool.name}</span>
                    <div className="ml-auto flex items-center gap-2 text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <ThumbsUpIcon className="size-3.5" />
                        {formatCompactNumber(tool.stats.upvotes)}
                      </span>
                      <span className="flex items-center gap-1">
                        <ThumbsDownIcon className="size-3.5" />
                        {formatCompactNumber(tool.stats.downvotes)}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquareIcon className="size-3.5" />
                        {formatCompactNumber(tool.stats.comments)}
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          {hasNextPage && (
            <div className="border-t px-4 py-3 pl-11">
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
        </div>
      )}
    </section>
  );
}
