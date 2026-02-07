import { getInitials } from "@/utils/get-initials";
import { Link, useSearch } from "@tanstack/react-router";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import { Badge } from "@workspace/ui/components/badge";
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
import {
  BadgeCheckIcon,
  CalendarIcon,
  CheckIcon,
  EllipsisVerticalIcon,
  MessageCircleIcon,
  SearchIcon,
  StarIcon,
} from "lucide-react";
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
  all: {
    icon: SearchIcon,
    getValue: () => "All",
  },
  popular: {
    icon: StarIcon,
    getValue: (tool: ToolProps) => tool.stats.upvotes - tool.stats.downvotes,
  },
  trending: {
    icon: MessageCircleIcon,
    getValue: (tool: ToolProps) => tool.stats.comments,
  },
  verified: {
    icon: BadgeCheckIcon,
    getValue: () => "verified",
  },
  new: {
    icon: CalendarIcon,
    getValue: (tool: ToolProps) => formatReleasedAt(tool.released_at),
  },
} as const;

export default function Tool(tool: ToolProps) {
  const searchParams = useSearch({ from: "/(search)/search/" });

  const tab = searchParams.tab ?? "all";
  const statConfig = statConfigByTab[tab];
  const stat = { ...statConfig, value: statConfig.getValue(tool) };

  return (
    <Button
      asChild
      variant="outline"
      className="size-full gap-3 rounded-2xl p-2"
    >
      <div>
        <Avatar className="size-15 rounded-2xl">
          <AvatarImage
            src={tool.image ?? ""}
            alt={tool.name}
            className="rounded-2xl"
          />
          <AvatarFallback className="rounded-2xl text-base">
            {getInitials(tool.name)}
          </AvatarFallback>
        </Avatar>
        <div className="flex min-w-0 flex-1 flex-col">
          <Link to="/tools/@{$slug}" params={{ slug: tool.slug }}>
            <hgroup className="flex flex-col">
              <h3 className="truncate tracking-tight">{tool.name}</h3>
              <p className="truncate text-muted-foreground">
                {tool.short_description}
              </p>
            </hgroup>
          </Link>
          <div className="flex items-center justify-between gap-4">
            <Badge variant="secondary">
              <stat.icon data-icon="inline-start" />
              {stat.value}
            </Badge>
            <MoreInfoSheet {...tool} />
          </div>
        </div>
      </div>
    </Button>
  );
}

function MoreInfoSheet(tool: ToolProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    try {
      const url = `${window.location.origin}/tools/@${tool.slug}`;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (error) {
      console.error("Failed to copy link:", error);
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="secondary" size="icon-xs">
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
              <Link to="/tools/@{$slug}" params={{ slug: tool.slug }}>
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
            remove it, you can create an account and submit an edit request for
            review.
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
  );
}
