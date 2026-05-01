import { Link, useParams } from "@tanstack/react-router";
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
import { cn } from "@workspace/ui/lib/cn";
import {
  BookmarkIcon,
  CheckIcon,
  ExternalLinkIcon,
  FlagIcon,
  Share2Icon,
  ThumbsDownIcon,
  ThumbsUpIcon,
} from "lucide-react";

import { BadgeIcon } from "@/components/badge-icon";
import { env } from "@/env";
import { auth } from "@/hooks/auth";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { globalBannerStore } from "@/lib/global-banner-store";
import { getInitials } from "@/utils/get-initials";

import { useTool } from "../-queries/tool";
import { useToolSetReaction } from "../-queries/tool-set-reaction";
import { useToolToggleBookmark } from "../-queries/tool-toggle-bookmark";
import { UpdateToolDialog } from "./update-tool-dialog";

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

const tiers: { color: string; label: string; minScore: number }[] = [
  {
    color: "text-violet-500",
    label: "Elite · 250+ score",
    minScore: 250,
  },
  {
    color: "text-indigo-500",
    label: "Established · 100-249 score",
    minScore: 100,
  },
  {
    color: "text-blue-500",
    label: "Trending · 50-99 score",
    minScore: 50,
  },
  {
    color: "text-green-500",
    label: "Notable · 10-49 score",
    minScore: 10,
  },
  {
    color: "text-yellow-500",
    label: "Rising · 1-9 score",
    minScore: 1,
  },
  {
    color: "text-muted-foreground",
    label: "Live · Just getting started",
    minScore: 0,
  },
  {
    color: "text-red-500",
    label: "Controversial · Negative score",
    minScore: -Infinity,
  },
];

export function ToolHeader() {
  const { slug } = useParams({ from: "/tools/@{$slug}" });
  const { user } = auth.useSession();

  const { data: tool } = useTool({ slug });
  const { isPending: isSettingToolReaction, mutate: setToolReaction } =
    useToolSetReaction(slug, user?.id);
  const { isPending: isTogglingBookmark, mutate: toggleToolBookmark } =
    useToolToggleBookmark(slug, user?.id);

  const { copied, copyToClipboard } = useCopyToClipboard();
  const { copyToClipboard: copyReportDetails } = useCopyToClipboard();

  const status = statusConfig[tool.status];
  const score = tool.stats.upvotes - tool.stats.downvotes;
  const tier = tiers.find(({ minScore }) => score >= minScore)!;

  const hasBookmarked = tool.relations.bookmarked;
  const hasDownvoted = tool.relations.downvoted;
  const hasUpvoted = tool.relations.upvoted;

  const handleToggleBookmark = () => {
    if (!user?.id) return globalThis.location.assign("/signin");
    toggleToolBookmark();
  };

  const handleSetToolReaction = (value: -1 | 1) => {
    if (!user?.id) return globalThis.location.assign("/signin");
    setToolReaction({ value });
  };

  const handleReportTool = async () => {
    const toolLink = globalThis.location.href;
    const reportDetails = [
      `Tool Name: ${tool.name}`,
      `Tool Slug: ${slug}`,
      `Tool Link: ${toolLink}`,
      `Reported By: @${user?.username ?? "anonymous"}`,
    ].join("\n");

    const copiedReport = await copyReportDetails(reportDetails);

    globalBannerStore.add({
      autoDismiss: false,
      description: copiedReport
        ? "Tool report details copied to your clipboard. Paste them in Grepedia's Discord server to submit your report."
        : "Failed to copy the report details. Please try again.",
      title: copiedReport ? "Copied successfully" : "Copy failed",
      variant: copiedReport ? "success" : "destructive",
    });

    if (copiedReport) {
      globalThis.open(env.VITE_REPORT_TOOL_URL, "_blank", "noreferrer");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4 max-lg:flex-col">
        <div className="flex gap-4">
          <Link params={{ slug }} to="/tools/@{$slug}">
            <Avatar className="size-15 after:border-none">
              <AvatarImage
                alt={tool.name}
                className="rounded-none"
                src={`https://www.google.com/s2/favicons?domain=${tool.officialUrl}&sz=128`}
              />
              <AvatarFallback className="rounded-none text-base">
                {getInitials(tool.name)}
              </AvatarFallback>
            </Avatar>
          </Link>
          <div className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center gap-1">
              <h2 className="text-2xl font-bold tracking-tight text-balance">
                {tool.name}
              </h2>
              {tool.status === "published" ? (
                <Tooltip>
                  <TooltipTrigger>
                    <BadgeIcon
                      aria-label="Tier"
                      className={cn("size-6", tier.color)}
                    />
                  </TooltipTrigger>
                  <TooltipContent>{tier.label}</TooltipContent>
                </Tooltip>
              ) : (
                <Badge variant={status.variant}>{status.label}</Badge>
              )}
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
                onClick={handleToggleBookmark}
                size="icon-sm"
                variant="outline"
              >
                <BookmarkIcon className={cn(hasBookmarked && "fill-primary")} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {hasBookmarked ? "Bookmarked" : "Bookmark"}
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={async () =>
                  await copyToClipboard(globalThis.location.href)
                }
                size="icon-sm"
                variant="outline"
              >
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
      <div className="flex flex-wrap items-center gap-4 border px-4 py-3">
        <div className="flex items-center gap-1">
          <Button
            className={cn(
              "gap-1.5 px-2 text-muted-foreground",
              hasUpvoted && "text-info",
            )}
            disabled={isSettingToolReaction}
            onClick={() => handleSetToolReaction(1)}
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
            onClick={() => handleSetToolReaction(-1)}
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
            className="gap-1.5 px-2"
            onClick={handleReportTool}
            size="sm"
            variant="destructive"
          >
            <FlagIcon className="size-3.5" />
            <span className="text-xs">Report</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
