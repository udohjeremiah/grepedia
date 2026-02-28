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
import { format } from "date-fns";
import {
  BadgeCheckIcon,
  CalendarIcon,
  CheckIcon,
  EllipsisVerticalIcon,
  MessageSquareIcon,
  SearchIcon,
  StarIcon,
} from "lucide-react";

import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { formatCompactNumber } from "@/utils/format-compact-number";
import { getInitials } from "@/utils/get-initials";

import { useSearchTools } from "../-queries/search";

type ToolProps = ReturnType<typeof useSearchTools>["data"][number];

const statConfigByTab = {
  all: {
    getValue: () => "All",
    icon: SearchIcon,
  },
  new: {
    getValue: (tool: ToolProps) =>
      tool.releasedAt ? format(new Date(tool.releasedAt), "MMM yyyy") : "New",
    icon: CalendarIcon,
  },
  popular: {
    getValue: (tool: ToolProps) =>
      formatCompactNumber(tool.stats.upvotes - tool.stats.downvotes),
    icon: StarIcon,
  },
  trending: {
    getValue: (tool: ToolProps) => formatCompactNumber(tool.stats.comments),
    icon: MessageSquareIcon,
  },
  verified: {
    getValue: () => "verified",
    icon: BadgeCheckIcon,
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
      className="size-full gap-3 rounded-2xl p-2"
      variant="outline"
    >
      <div>
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
        <div className="flex min-w-0 flex-1 flex-col">
          <Link params={{ slug: tool.slug }} to="/tools/@{$slug}">
            <hgroup className="flex flex-col">
              <h3 className="truncate tracking-tight">{tool.name}</h3>
              <p className="truncate text-muted-foreground">
                {tool.shortDescription}
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
  const { copied, copyToClipboard } = useCopyToClipboard();

  const handleShare = async () => {
    const url = `${globalThis.location.origin}/tools/@${tool.slug}`;
    await copyToClipboard(url);
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button size="icon-xs" variant="secondary">
          <EllipsisVerticalIcon />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader className="flex flex-row items-start gap-3">
          <Avatar size="lg">
            <AvatarImage
              alt={tool.name}
              src={
                tool.image ??
                `https://www.google.com/s2/favicons?domain=${tool.officialUrl}&sz=128`
              }
            />
            <AvatarFallback>{getInitials(tool.name)}</AvatarFallback>
          </Avatar>
          <hgroup>
            <SheetTitle>{tool.name}</SheetTitle>
            <SheetDescription>{tool.shortDescription}</SheetDescription>
          </hgroup>
        </SheetHeader>
        <div className="no-scrollbar space-y-4 overflow-y-auto px-4">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-base">{tool.name}</h3>
            <Button asChild size="sm">
              <Link params={{ slug: tool.slug }} to="/tools/@{$slug}">
                Learn More
              </Link>
            </Button>
          </div>
          <p className="text-muted-foreground">{tool.longDescription}</p>
        </div>
        <SheetFooter>
          <p className="text-muted-foreground">
            This is a search result, not an ad. If you are the owner or
            maintainer of this tool and want to claim or update it, you can
            create an account and submit an edit request for review.
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
