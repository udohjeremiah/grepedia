import { Link } from "@tanstack/react-router";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { format } from "date-fns";
import { EyeIcon, StarIcon } from "lucide-react";

import { MarkdownPreview } from "@/components/markdown";

import { useLists } from "../-queries/lists";

type ListProps = ReturnType<typeof useLists>["data"][number];

const badgeVariant = {
  archived: "secondary",
  draft: "info",
  published: "success",
} as const;

export function List(list: ListProps) {
  const score = list.stats.upvotes - list.stats.downvotes;

  return (
    <article className="group flex h-full flex-col gap-3 border bg-background p-4 transition duration-200 hover:-translate-y-0.5 hover:border-foreground/30">
      <div className="flex flex-1 flex-col gap-2">
        <div className="flex items-center gap-2">
          <Badge variant={badgeVariant[list.status]}>{list.status}</Badge>
          <span className="text-xs text-muted-foreground">
            {list.toolCount} {list.toolCount === 1 ? "tool" : "tools"}
          </span>
        </div>
        <h4 className="text-lg font-semibold tracking-tight">{list.title}</h4>
        <MarkdownPreview
          className="line-clamp-3 text-sm text-muted-foreground"
          value={list.description}
        />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <StarIcon className="size-3.5" />
            {score}
          </span>
          <span className="flex items-center gap-1">
            <EyeIcon className="size-3.5" />
            {list.stats.views}
          </span>
          <span>
            {format(
              new Date(list.publishedAt ?? list.updatedAt ?? list.createdAt),
              "MMM d, yyyy",
            )}
          </span>
        </div>
        <Button asChild size="xs" variant="outline">
          <Link params={{ slug: list.slug }} to="/lists/$slug">
            Open
          </Link>
        </Button>
      </div>
    </article>
  );
}
