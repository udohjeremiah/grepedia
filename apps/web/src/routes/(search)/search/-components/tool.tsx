import { getInitials } from "@/utils/get-initials";
import { Link, useSearch } from "@tanstack/react-router";
import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import { Button } from "@workspace/ui/components/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@workspace/ui/components/sheet";
import { BadgeCheckIcon, CheckIcon, EllipsisVerticalIcon } from "lucide-react";
import { useState } from "react";
import { useSearchTools } from "../-queries/search";

type ToolProps = ReturnType<typeof useSearchTools>["data"][number];

const formatReleasedAt = (releasedAt: string | null) =>
  releasedAt
    ? new Date(releasedAt).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : "New";

const statConfigByTab = {
  popular: {
    label: "score",
    getValue: (tool: ToolProps) => tool.stats.upvotes - tool.stats.downvotes,
  },
  trending: {
    label: "comments",
    getValue: (tool: ToolProps) => tool.stats.comments,
  },
  new: {
    label: null,
    getValue: (tool: ToolProps) => formatReleasedAt(tool.released_at),
  },
} as const;

export default function Tool(tool: ToolProps) {
  const searchParams = useSearch({ from: "/(search)/search/" });
  const [copied, setCopied] = useState(false);

  const tab = searchParams.tab;
  const statConfig =
    tab === "all" || tab === "verified" ? null : statConfigByTab[tab];
  const stat = statConfig
    ? { label: statConfig.label, value: statConfig.getValue(tool) }
    : null;

  const handleShare = async () => {
    try {
      const url = `${window.location.origin}/tools/${tool.slug}`;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (error) {
      console.error("Failed to copy link:", error);
    }
  };

  return (
    <Button
      asChild
      variant="outline"
      className="size-full justify-between gap-3 p-2"
    >
      <div>
        <Link
          to="/tools/$slug"
          params={{ slug: tool.slug }}
          className="flex min-w-0 items-start gap-3"
        >
          <Avatar size="lg">
            <AvatarImage src={tool.image ?? ""} alt={tool.name} />
            <AvatarFallback>{getInitials(tool.name)}</AvatarFallback>
            {tab === "verified" && (
              <AvatarBadge>
                <BadgeCheckIcon />
              </AvatarBadge>
            )}
          </Avatar>
          <hgroup className="flex min-w-0 flex-col">
            <h3 className="truncate tracking-tight">{tool.name}</h3>
            <p className="truncate text-muted-foreground">
              {tool.short_description}
            </p>
            {stat && (
              <div className="text-xs text-muted-foreground">
                <span>{stat.value}</span> <span>{stat.label}</span>
              </div>
            )}
          </hgroup>
        </Link>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon-sm">
              <EllipsisVerticalIcon />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader className="flex flex-row items-start gap-3">
              <Avatar size="lg">
                <AvatarImage src={tool.image ?? ""} alt={tool.name} />
                <AvatarFallback>{getInitials(tool.name)}</AvatarFallback>
              </Avatar>
              <hgroup>
                <SheetTitle>{tool.name}</SheetTitle>
                <SheetDescription>{tool.short_description}</SheetDescription>
              </hgroup>
            </SheetHeader>
            <div className="no-scrollbar space-y-4 overflow-y-auto px-4">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-base">{tool.name}</h3>
                <Button asChild size="sm">
                  <Link to="/tools/$slug" params={{ slug: tool.slug }}>
                    Learn More
                  </Link>
                </Button>
              </div>
              <p className="text-muted-foreground">{tool.long_description}</p>
            </div>
            <SheetFooter>
              <p className="text-muted-foreground">
                This is a search result, not an ad. If you are the owner or
                maintainer of this project and want to claim it, update it, or
                remove it, you can create an account and submit an edit request
                for review.
              </p>
              <Button disabled={copied} onClick={handleShare}>
                {copied ? (
                  <>
                    <CheckIcon />
                    Link copied
                  </>
                ) : (
                  "Share"
                )}
              </Button>
              <SheetClose asChild>
                <Button variant="outline">Close</Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
    </Button>
  );
}
