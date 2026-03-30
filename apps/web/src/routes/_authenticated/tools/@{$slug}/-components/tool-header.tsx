import { Link, useParams, useRouteContext } from "@tanstack/react-router";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Separator } from "@workspace/ui/components/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";
import { cn } from "@workspace/ui/utils/cn";
import {
  BookmarkIcon,
  CheckIcon,
  ExternalLinkIcon,
  FlagIcon,
  Share2Icon,
  ThumbsDownIcon,
  ThumbsUpIcon,
} from "lucide-react";

import { env } from "@/env";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { getInitials } from "@/utils/get-initials";

import { useTool } from "../-queries/tool";
import { useToolSetReaction } from "../-queries/tool-set-reaction";
import { useToolToggleBookmark } from "../-queries/tool-toggle-bookmark";
import UpdateToolDialog from "./update-tool-dialog";

type Tool = ReturnType<typeof useTool>["data"];

const statusConfig: Record<
  Tool["status"],
  {
    label: "Archived" | "Flagged" | "Pending" | "Published";
    variant: "default" | "destructive" | "warning";
  }
> = {
  archived: {
    label: "Archived",
    variant: "warning",
  },
  flagged: {
    label: "Flagged",
    variant: "destructive",
  },
  pending: {
    label: "Pending",
    variant: "warning",
  },
  published: {
    label: "Published",
    variant: "default",
  },
};

export default function ToolHeader() {
  const { userId } = useRouteContext({ from: "/_authenticated" });
  const { slug } = useParams({ from: "/_authenticated/tools/@{$slug}" });

  const { data: tool } = useTool({ slug });
  const { isPending: isSettingToolReaction, mutate: setToolReaction } =
    useToolSetReaction(slug, userId);
  const { isPending: isTogglingBookmark, mutate: toggleToolBookmark } =
    useToolToggleBookmark(slug, userId);

  const { copied, copyToClipboard } = useCopyToClipboard();

  const status = statusConfig[tool.status];
  const score = tool.stats.upvotes - tool.stats.downvotes;

  const hasBookmarked = tool.relations.bookmarked;
  const hasDownvoted = tool.relations.downvoted;
  const hasUpvoted = tool.relations.upvoted;

  const handleShare = async () => {
    await copyToClipboard(globalThis.location.href);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4 max-lg:flex-col">
        <div className="flex gap-4">
          <Link params={{ slug }} to="/tools/@{$slug}">
            <Avatar className="size-15">
              <AvatarImage
                alt={tool.name}
                src={
                  tool.image ??
                  `https://www.google.com/s2/favicons?domain=${tool.officialUrl}&sz=128`
                }
              />
              <AvatarFallback className="text-base">
                {getInitials(tool.name)}
              </AvatarFallback>
            </Avatar>
          </Link>
          <div className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <h2 className="text-2xl font-bold tracking-tight text-balance">
                {tool.name}
              </h2>
              <Badge variant={status.variant}>{status.label}</Badge>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {tool.shortDescription}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                disabled={isTogglingBookmark}
                onClick={() => toggleToolBookmark()}
                size="icon-sm"
                variant="outline"
              >
                <BookmarkIcon className={cn(hasBookmarked && "fill-primary")} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {hasBookmarked ? "Bookmarked" : "Not bookmarked"}
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button onClick={handleShare} size="icon-sm" variant="outline">
                {copied ? (
                  <CheckIcon className="text-primary" />
                ) : (
                  <Share2Icon />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {copied ? "Link copied!" : "Copy link"}
            </TooltipContent>
          </Tooltip>
          <Button asChild className="gap-2" size="sm">
            <a href={tool.officialUrl} rel="noreferrer" target="_blank">
              <ExternalLinkIcon className="size-3.5" />
              Visit Site
            </a>
          </Button>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-4 rounded-lg border px-4 py-3">
        <div className="flex items-center gap-1">
          <Button
            className={cn(
              "gap-1.5 px-2 text-muted-foreground",
              hasUpvoted && "text-info",
            )}
            disabled={isSettingToolReaction}
            onClick={() => setToolReaction({ value: 1 })}
            size="sm"
            variant="ghost"
          >
            <ThumbsUpIcon
              className={cn("size-3.5", hasUpvoted && "fill-current")}
            />
            <span className="text-xs font-semibold">{tool.stats.upvotes}</span>
          </Button>
          <Button
            className={cn(
              "gap-1.5 px-2 text-muted-foreground",
              hasDownvoted && "text-destructive",
            )}
            disabled={isSettingToolReaction}
            onClick={() => setToolReaction({ value: -1 })}
            size="sm"
            variant="ghost"
          >
            <ThumbsDownIcon
              className={cn("size-3.5", hasDownvoted && "fill-current")}
            />
            <span className="text-xs font-semibold">
              {tool.stats.downvotes}
            </span>
          </Button>
        </div>
        <Separator orientation="vertical" />
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground">Score</span>
          <span
            className={cn(
              "text-sm font-semibold text-muted-foreground",
              score > 0 && "text-primary",
              score < 0 && "text-destructive",
            )}
          >
            {score}
          </span>
        </div>
        <Separator orientation="vertical" />
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground">Comments</span>
          <span
            className={cn(
              "text-sm font-semibold text-muted-foreground",
              tool.stats.comments > 0 && "text-foreground",
            )}
          >
            {tool.stats.comments}
          </span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <UpdateToolDialog />
          <Button
            asChild
            className="gap-1.5 px-2"
            size="sm"
            variant="destructive"
          >
            <a href={env.VITE_REPORT_TOOL_URL} rel="noreferrer" target="_blank">
              <FlagIcon className="size-3.5" />
              <span className="text-xs">Report</span>
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
