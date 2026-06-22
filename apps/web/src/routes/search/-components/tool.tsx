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
  CalendarIcon,
  SearchIcon,
  StarIcon,
} from "lucide-react";

import { MarkdownPreview } from "@/components/markdown";
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
} as const;

export function Tool(tool: ToolProps) {
  const searchParams = useSearch({ from: "/search/" });

  const tab = searchParams.tab ?? "all";
  const statConfig = statConfigByTab[tab];
  const stat = { ...statConfig, value: statConfig.getValue(tool) };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button className="size-full gap-2 p-2" variant="outline">
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
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <div className="text-start">
              <h3 className="truncate tracking-tight">{tool.name}</h3>
              <p className="truncate text-muted-foreground">
                {tool.shortDescription}
              </p>
            </div>
            <Badge variant="secondary">
              <stat.icon data-icon="inline-start" />
              {stat.value}
            </Badge>
          </div>
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader className="flex-row gap-3 px-4">
          <Avatar className="after:border-none" size="lg">
            <AvatarImage
              alt={tool.name}
              className="rounded-none"
              src={`https://www.google.com/s2/favicons?domain=${tool.officialUrl}&sz=128`}
            />
            <AvatarFallback className="rounded-none">
              {getInitials(tool.name)}
            </AvatarFallback>
          </Avatar>
          <hgroup>
            <SheetTitle>{tool.name}</SheetTitle>
            <SheetDescription>{tool.shortDescription}</SheetDescription>
          </hgroup>
        </SheetHeader>
        <div className="no-scrollbar flex-1 overflow-y-auto border-y p-4">
          <MarkdownPreview className="prose-sm" value={tool.longDescription} />
        </div>
        <SheetFooter>
          <Button asChild>
            <Link params={{ slug: tool.slug }} to="/tools/@{$slug}">
              Visit
            </Link>
          </Button>
          <SheetClose asChild>
            <Button variant="outline">Close</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
